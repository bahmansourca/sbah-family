// Initialisation des services
const authService = new AuthService();
const syncService = new SyncService();
const avatarService = new AvatarService();
const uiService = new UIService();

// État de l'application
const state = {
    selectedAmount: null,
    selectedMethod: null,
    isCustomAmount: false,
    customAmount: null,
    isAdmin: false
};

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    // Vérification de l'authentification
    if (!authService.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    // Initialisation des composants
    await initializeComponents();
    
    // Chargement des données
    await loadData();
    
    // Configuration des écouteurs d'événements
    initializeEventListeners();
});

// Initialisation des composants
async function initializeComponents() {
    // Initialisation de l'avatar et des informations utilisateur
    const user = authService.getCurrentUser();
    if (user) {
        document.getElementById('user-avatar').innerHTML = avatarService.generateAvatar(user.name);
        document.getElementById('user-name').textContent = user.name;
        document.getElementById('user-role').textContent = user.role;
        state.isAdmin = user.role === 'admin';
    }

    // Initialisation du sélecteur de membres pour le paiement en espèces
    if (state.isAdmin) {
        const members = await syncService.getMembers();
        const cashUserSelect = document.getElementById('cash-user');
        members.forEach(member => {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = member.name;
            cashUserSelect.appendChild(option);
        });
    }
}

// Chargement des données
async function loadData() {
    try {
        // Chargement des données nécessaires
        const balance = await syncService.getBalance();
        const recentPayments = await syncService.getRecentPayments();
        
        // Mise à jour de l'interface
        updateUI(balance, recentPayments);
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        uiService.showNotification('Erreur lors du chargement des données', 'error');
    }
}

// Mise à jour de l'interface
function updateUI(balance, recentPayments) {
    // Mise à jour du solde si nécessaire
    if (balance) {
        // Mise à jour des éléments d'interface liés au solde
    }

    // Mise à jour des paiements récents si nécessaire
    if (recentPayments) {
        // Mise à jour des éléments d'interface liés aux paiements récents
    }
}

// Configuration des écouteurs d'événements
function initializeEventListeners() {
    // Sélection des options de paiement
    document.querySelectorAll('.option-card').forEach(card => {
        card.addEventListener('click', () => handleOptionSelection(card));
    });

    // Montant personnalisé
    const customAmountInput = document.getElementById('custom-amount');
    const customAmountBtn = document.getElementById('custom-amount-btn');
    
    customAmountInput.addEventListener('input', debounce(() => {
        const amount = parseInt(customAmountInput.value);
        if (amount >= 300000) {
            state.customAmount = amount;
            customAmountBtn.disabled = false;
        } else {
            state.customAmount = null;
            customAmountBtn.disabled = true;
        }
    }, 300));

    customAmountBtn.addEventListener('click', () => {
        if (state.customAmount) {
            state.selectedAmount = state.customAmount;
            state.isCustomAmount = true;
            updateSelectedAmount();
        }
    });

    // Sélection des méthodes de paiement
    document.querySelectorAll('.payment-method-card').forEach(card => {
        card.addEventListener('click', () => handlePaymentMethodSelection(card));
    });

    // Bouton de paiement
    document.getElementById('submit-payment-btn').addEventListener('click', handlePaymentSubmission);

    // Modal de confirmation
    document.getElementById('cancel-payment').addEventListener('click', closeConfirmationModal);
    document.getElementById('confirm-payment').addEventListener('click', processPayment);
    document.querySelector('.close-modal').addEventListener('click', closeConfirmationModal);
}

// Gestion de la sélection d'une option
function handleOptionSelection(card) {
    // Désélectionner toutes les options
    document.querySelectorAll('.option-card').forEach(c => {
        c.classList.remove('selected');
    });

    // Sélectionner l'option choisie
    card.classList.add('selected');
    state.selectedAmount = parseInt(card.dataset.amount);
    state.isCustomAmount = false;
    updateSelectedAmount();
}

// Gestion de la sélection d'une méthode de paiement
function handlePaymentMethodSelection(card) {
    // Désélectionner toutes les méthodes
    document.querySelectorAll('.payment-method-card').forEach(c => {
        c.classList.remove('selected');
    });

    // Sélectionner la méthode choisie
    card.classList.add('selected');
    state.selectedMethod = card.dataset.method;

    // Afficher/masquer les informations de paiement en espèces
    const cashPaymentInfo = document.querySelector('.cash-payment-info');
    if (state.selectedMethod === 'cash') {
        cashPaymentInfo.classList.remove('hidden');
    } else {
        cashPaymentInfo.classList.add('hidden');
    }
}

// Mise à jour de l'affichage du montant sélectionné
function updateSelectedAmount() {
    const submitBtn = document.getElementById('submit-payment-btn');
    if (state.selectedAmount) {
        submitBtn.disabled = false;
        submitBtn.textContent = `Payer ${uiService.formatCurrency(state.selectedAmount)}`;
    } else {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sélectionnez un montant';
    }
}

// Gestion de la soumission du paiement
function handlePaymentSubmission() {
    if (!state.selectedAmount || !state.selectedMethod) {
        uiService.showNotification('Veuillez sélectionner un montant et une méthode de paiement', 'warning');
        return;
    }

    // Vérification supplémentaire pour le paiement en espèces
    if (state.selectedMethod === 'cash') {
        const cashUser = document.getElementById('cash-user').value;
        if (!cashUser) {
            uiService.showNotification('Veuillez sélectionner le membre qui a effectué le paiement', 'warning');
            return;
        }
    }

    // Afficher le modal de confirmation
    showConfirmationModal();
}

// Affichage du modal de confirmation
function showConfirmationModal() {
    const modal = document.getElementById('confirmation-modal');
    const amountElement = document.getElementById('confirmation-amount');
    const methodElement = document.getElementById('confirmation-method');
    const dateElement = document.getElementById('confirmation-date');

    // Mise à jour des informations
    amountElement.textContent = uiService.formatCurrency(state.selectedAmount);
    methodElement.textContent = getPaymentMethodName(state.selectedMethod);
    dateElement.textContent = new Date().toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Afficher le modal
    modal.classList.add('active');
}

// Fermeture du modal de confirmation
function closeConfirmationModal() {
    const modal = document.getElementById('confirmation-modal');
    modal.classList.remove('active');
}

// Traitement du paiement
async function processPayment() {
    try {
        // Préparation des données du paiement
        const paymentData = {
            amount: state.selectedAmount,
            method: state.selectedMethod,
            date: new Date().toISOString(),
            status: 'pending'
        };

        // Ajout des informations spécifiques pour le paiement en espèces
        if (state.selectedMethod === 'cash') {
            paymentData.cashUser = document.getElementById('cash-user').value;
            paymentData.receiptNumber = document.getElementById('cash-receipt').value;
        }

        // Envoi du paiement
        const result = await syncService.processPayment(paymentData);

        if (result.success) {
            uiService.showNotification('Paiement effectué avec succès', 'success');
            closeConfirmationModal();
            // Redirection vers la page de confirmation ou l'historique
            window.location.href = 'history.html';
        } else {
            throw new Error(result.message || 'Erreur lors du traitement du paiement');
        }
    } catch (error) {
        console.error('Erreur lors du traitement du paiement:', error);
        uiService.showNotification(error.message || 'Erreur lors du traitement du paiement', 'error');
    }
}

// Utilitaires
function getPaymentMethodName(method) {
    const methods = {
        'orange-money': 'Orange Money',
        'visa': 'Carte bancaire',
        'cash': 'Espèces'
    };
    return methods[method] || method;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
} 