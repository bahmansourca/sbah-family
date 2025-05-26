/**
 * Gestionnaire de paiement pour SBah Family
 * Intègre PayDunya pour les paiements réels
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les événements de paiement
    initPaymentEvents();
    
    // Vérifier si l'utilisateur revient d'une redirection PayDunya
    checkPaymentReturn();
});

/**
 * Initialise tous les événements liés au paiement
 */
function initPaymentEvents() {
    // Gestion des options de montant
    const amountOptions = document.querySelectorAll('.amount-option');
    const customAmountGroup = document.querySelector('.custom-amount-group');
    
    amountOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Désactiver toutes les options
            amountOptions.forEach(opt => opt.classList.remove('active'));
            
            // Activer l'option cliquée
            this.classList.add('active');
            
            // Afficher/masquer le champ de montant personnalisé
            if (this.getAttribute('data-amount') === 'custom') {
                customAmountGroup.classList.remove('hidden');
                document.getElementById('deposit-amount').focus();
            } else {
                customAmountGroup.classList.add('hidden');
            }
        });
    });
    
    // Gestion des méthodes de paiement
    const paymentMethods = document.querySelectorAll('.payment-method');
    const cashPaymentInfo = document.getElementById('cash-payment-info');
    
    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            // Désactiver toutes les méthodes
            paymentMethods.forEach(m => m.classList.remove('active'));
            
            // Activer la méthode cliquée
            this.classList.add('active');
            
            // Afficher/masquer les informations de paiement en espèces
            const methodType = this.getAttribute('data-method');
            if (methodType === 'cash' && isUserAdmin()) {
                cashPaymentInfo.classList.remove('hidden');
                
                // Charger la liste des utilisateurs pour le paiement cash
                loadUsersForCashPayment();
            } else {
                cashPaymentInfo.classList.add('hidden');
            }
        });
    });
    
    // Masquer l'option de paiement en espèces pour les non-admins
    if (!isUserAdmin()) {
        const cashMethod = document.querySelector('.payment-method[data-method="cash"]');
        if (cashMethod) {
            cashMethod.classList.add('hidden');
        }
    }
    
    // Événement du bouton de paiement
    const submitDepositBtn = document.getElementById('submit-deposit-btn');
    if (submitDepositBtn) {
        submitDepositBtn.addEventListener('click', handlePayment);
    }
}

/**
 * Vérifie si l'utilisateur actuel est administrateur
 */
function isUserAdmin() {
    return currentUser && currentUser.role === 'admin';
}

/**
 * Charge la liste des utilisateurs pour le paiement en espèces
 */
function loadUsersForCashPayment() {
    const cashUserSelect = document.getElementById('cash-user');
    if (!cashUserSelect) return;
    
    // Vider le select sauf la première option
    while (cashUserSelect.options.length > 1) {
        cashUserSelect.remove(1);
    }
    
    // Récupérer tous les utilisateurs
    const users = DB.users.getAll();
    
    // Ajouter chaque utilisateur au select
    users.forEach(user => {
        if (user.id !== currentUser.id) {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.name;
            cashUserSelect.appendChild(option);
        }
    });
}

/**
 * Gère le processus de paiement selon la méthode choisie
 */
async function handlePayment() {
    // Récupérer le montant
    let amount;
    const activeAmountOption = document.querySelector('.amount-option.active');
    
    if (activeAmountOption.getAttribute('data-amount') === 'custom') {
        amount = parseInt(document.getElementById('deposit-amount').value);
        
        if (!amount || isNaN(amount) || amount < 1000) {
            notifications.error('Erreur', 'Veuillez entrer un montant valide (minimum 1000 GNF)');
            return;
        }
    } else {
        amount = parseInt(activeAmountOption.getAttribute('data-amount'));
    }
    
    // Récupérer la méthode de paiement
    const paymentMethod = document.querySelector('.payment-method.active').getAttribute('data-method');
    
    // Traiter selon la méthode
    if (paymentMethod === 'cash') {
        // Vérifier que l'utilisateur est admin
        if (!isUserAdmin()) {
            notifications.error('Erreur', 'Seuls les administrateurs peuvent enregistrer des paiements en espèces');
            return;
        }
        
        // Récupérer l'utilisateur qui a payé
        const cashUserId = document.getElementById('cash-user').value;
        if (!cashUserId) {
            notifications.error('Erreur', 'Veuillez sélectionner le membre qui a payé');
            return;
        }
        
        // Récupérer les informations de l'utilisateur
        const cashUser = DB.users.getById(parseInt(cashUserId));
        if (!cashUser) {
            notifications.error('Erreur', 'Membre non trouvé');
            return;
        }
        
        // Récupérer le numéro de reçu (optionnel)
        const receiptNumber = document.getElementById('cash-receipt').value || '';
        
        // Créer la transaction
        const cashDeposit = {
            type: 'deposit',
            userId: cashUser.id,
            userName: cashUser.name,
            userCountry: cashUser.country,
            amount: amount,
            date: new Date().toISOString(),
            description: 'Versement en espèces',
            paymentDetails: {
                method: 'cash',
                receiptNumber: receiptNumber,
                recordedBy: currentUser.name
            }
        };
        
        // Enregistrer la transaction
        showLoading();
        setTimeout(() => {
            DB.transactions.add(cashDeposit);
            hideLoading();
            notifications.success('Paiement enregistré', `Le paiement en espèces de ${formatCurrency(amount)} GNF pour ${cashUser.name} a été enregistré avec succès.`);
            showHomeScreen();
        }, 1000);
    } else {
        // Pour Orange Money ou Carte bancaire, utiliser PayDunya
        const paymentData = {
            userId: currentUser.id,
            userName: currentUser.name,
            userCountry: currentUser.country,
            amount: amount,
            method: paymentMethod,
            callbackUrl: "https://serene-daffodil-eae953.netlify.app/.netlify/functions/paydunya-webhook" // URL du webhook sur votre site Netlify
        };
        
        // Appeler le service PayDunya
        const result = await PayDunyaService.initiatePayment(paymentData);
        
        // Le service gère déjà l'affichage des erreurs et le chargement
        if (!result.success) {
            console.error('Erreur de paiement PayDunya:', result.error);
        }
        // Si success=true, l'utilisateur sera redirigé vers la page de paiement PayDunya
    }
}

/**
 * Vérifie si l'utilisateur revient d'une redirection de paiement
 */
function checkPaymentReturn() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const status = urlParams.get('status');
    
    if (token) {
        // L'utilisateur revient d'un paiement PayDunya
        if (status === 'completed' || status === 'successful') {
            // Le paiement a réussi, vérifier et finaliser
            PayDunyaService.handlePaymentReturn();
        } else if (status === 'cancelled') {
            notifications.warning('Paiement annulé', 'Votre paiement a été annulé.');
        } else if (status === 'failed') {
            notifications.error('Paiement échoué', 'Votre paiement a échoué. Veuillez réessayer.');
        }
        
        // Nettoyer l'URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

/**
 * Configuration du webhook pour la production
 */
function getWebhookUrl() {
    // Si en production (sur Netlify), utiliser l'URL de fonction Netlify
    if (window.location.hostname.includes('netlify.app') || window.location.hostname.includes('sbahfamily.com')) {
        return `${window.location.origin}/.netlify/functions/paydunya-webhook`;
    }
    
    // Sinon, en développement local, utiliser un webhook public comme webhook.site
    // ou configurer ngrok pour les tests
    return "https://serene-daffodil-eae953.netlify.app/.netlify/functions/paydunya-webhook";
}
