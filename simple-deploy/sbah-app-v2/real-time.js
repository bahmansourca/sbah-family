// Fonctionnalités en temps réel et améliorations modernes pour SBah Family

// Système de notification
class NotificationSystem {
    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        document.body.appendChild(this.container);
    }

    show(title, message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        notification.innerHTML = `
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        `;
        
        this.container.appendChild(notification);
        
        // Force reflow pour permettre l'animation
        notification.offsetHeight;
        
        // Afficher la notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Cacher la notification après un délai
        setTimeout(() => {
            notification.classList.remove('show');
            
            // Supprimer du DOM après l'animation
            setTimeout(() => {
                notification.remove();
            }, 400);
        }, duration);
        
        return notification;
    }
    
    info(title, message, duration) {
        return this.show(title, message, 'info', duration);
    }
    
    success(title, message, duration) {
        return this.show(title, message, 'success', duration);
    }
    
    warning(title, message, duration) {
        return this.show(title, message, 'warning', duration);
    }
    
    error(title, message, duration) {
        return this.show(title, message, 'error', duration);
    }
}

// Initialiser le système de notification
const notifications = new NotificationSystem();

// Gestionnaire pour le formulaire de carte bancaire
function setupCardForm() {
    const cardMethod = document.querySelector('.payment-method[data-method="card"]');
    const orangeMethod = document.querySelector('.payment-method[data-method="orange"]');
    const cardForm = document.getElementById('card-form');
    const orangeDetails = document.getElementById('orange-money-details');
    
    if (!cardMethod || !orangeMethod || !cardForm) return;
    
    // Formater le numéro de carte
    const cardNumber = document.getElementById('card-number');
    if (cardNumber) {
        cardNumber.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            let formattedValue = '';
            
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    formattedValue += ' ';
                }
                formattedValue += value[i];
            }
            
            e.target.value = formattedValue;
        });
    }
    
    // Formater la date d'expiration
    const cardExpiry = document.getElementById('card-expiry');
    if (cardExpiry) {
        cardExpiry.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            let formattedValue = '';
            
            if (value.length > 0) {
                formattedValue = value.substring(0, Math.min(2, value.length));
                if (value.length > 2) {
                    formattedValue += '/' + value.substring(2, 4);
                }
            }
            
            e.target.value = formattedValue;
        });
    }
    
    // Limiter le CVV à 3 chiffres
    const cardCvv = document.getElementById('card-cvv');
    if (cardCvv) {
        cardCvv.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
        });
    }
    
    // Afficher/masquer le formulaire selon la méthode sélectionnée
    cardMethod.addEventListener('click', function() {
        cardMethod.classList.add('active');
        orangeMethod.classList.remove('active');
        cardForm.classList.remove('hidden');
        if (orangeDetails) orangeDetails.classList.add('hidden');
    });
    
    orangeMethod.addEventListener('click', function() {
        orangeMethod.classList.add('active');
        cardMethod.classList.remove('active');
        cardForm.classList.add('hidden');
        if (orangeDetails) orangeDetails.classList.remove('hidden');
    });
}

// Simule une mise à jour en temps réel pour les nouveaux utilisateurs
function setupRealTimeUpdates() {
    // Simuler un nouvel événement toutes les 30 secondes
    const events = [
        { type: 'new_user', name: 'Mohammed Camara', country: 'Guinée', city: 'Conakry' },
        { type: 'deposit', name: 'Aissatou Bah', country: 'Europe', amount: 300000 },
        { type: 'ceremony', title: 'Anniversaire de Fanta', date: '2025-08-15' }
    ];
    
    let eventIndex = 0;
    
    function simulateEvent() {
        const event = events[eventIndex];
        
        switch(event.type) {
            case 'new_user':
                notifications.info('Nouvel utilisateur', `${event.name} de ${event.country}, ${event.city} vient de rejoindre SBah Family!`);
                // Mettre à jour la liste des membres si nous sommes sur cette page
                if (document.getElementById('members-list') && !document.getElementById('members-list').classList.contains('hidden')) {
                    const newUser = {
                        id: Math.floor(Math.random() * 1000) + 10,
                        name: event.name,
                        country: event.country,
                        city: event.city,
                        role: 'member'
                    };
                    
                    // Ajouter à la base de données
                    DB.users.add(newUser);
                    
                    // Mettre à jour l'interface
                    loadMembers();
                    
                    // Marquer le nouvel utilisateur
                    setTimeout(() => {
                        const memberItems = document.querySelectorAll('.member-item');
                        memberItems[memberItems.length - 1].classList.add('new-item');
                    }, 100);
                }
                break;
                
            case 'deposit':
                notifications.success('Nouveau dépôt', `${event.name} de ${event.country} vient d'effectuer un dépôt de ${formatCurrency(event.amount)} GNF`);
                // Si nous sommes sur la page d'accueil, mettre à jour les dépôts récents
                if (!homeScreen.classList.contains('hidden')) {
                    // Simuler un nouveau dépôt
                    const deposit = {
                        type: 'deposit',
                        userId: Math.floor(Math.random() * 5) + 1,
                        userName: event.name,
                        userCountry: event.country,
                        amount: event.amount,
                        date: new Date().toISOString(),
                        description: 'Versement mensuel'
                    };
                    
                    // Ajouter à la base de données
                    DB.transactions.add(deposit);
                    
                    // Mettre à jour l'interface
                    loadRecentDeposits();
                    updateBalanceDisplay();
                    
                    // Animer le nouveau dépôt
                    setTimeout(() => {
                        const depositItems = document.querySelectorAll('.deposit-item');
                        depositItems[0].classList.add('new-item');
                    }, 100);
                }
                break;
                
            case 'ceremony':
                notifications.warning('Nouvelle cérémonie', `Une cérémonie "${event.title}" a été planifiée pour le ${formatDateFull(event.date)}`);
                break;
        }
        
        // Passer à l'événement suivant
        eventIndex = (eventIndex + 1) % events.length;
        
        // Planifier le prochain événement
        setTimeout(simulateEvent, Math.random() * 30000 + 20000); // Entre 20 et 50 secondes
    }
    
    // Démarrer la simulation après un délai initial
    setTimeout(simulateEvent, 10000);
}

// Améliorer le visuel du solde total
function enhanceTotalBalanceCard() {
    const balanceCard = document.querySelector('.total-balance');
    if (!balanceCard) return;
    
    // Transformer en carte visuelle moderne
    balanceCard.className = 'total-balance-card';
    balanceCard.innerHTML = `
        <p class="balance-label">Solde Total</p>
        <p class="balance-amount">${balanceCard.textContent}</p>
    `;
}

// Améliorer les icônes des boutons d'action
function enhanceActionButtons() {
    const actionBtns = document.querySelectorAll('.action-btn');
    
    actionBtns.forEach(btn => {
        const icon = btn.querySelector('i');
        const text = btn.querySelector('span').textContent;
        
        if (icon) {
            // Créer un conteneur pour l'icône
            const iconContainer = document.createElement('div');
            iconContainer.className = 'action-icon';
            iconContainer.appendChild(icon.cloneNode(true));
            
            // Remplacer le contenu du bouton
            btn.innerHTML = '';
            btn.appendChild(iconContainer);
            
            const label = document.createElement('span');
            label.className = 'action-label';
            label.textContent = text;
            btn.appendChild(label);
        }
    });
}

// Améliorer l'apparence des dépôts récents
function enhanceRecentItems() {
    // Ajouter une animation subtile
    const depositItems = document.querySelectorAll('.deposit-item');
    const ceremonyItems = document.querySelectorAll('.ceremony-item');
    
    [...depositItems, ...ceremonyItems].forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
        item.style.opacity = '0';
        
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.animation = 'fadeIn 0.5s ease forwards';
        }, 100);
    });
}

// Initialiser les améliorations UI lorsque l'application est chargée
function initUIEnhancements() {
    // Initialiser le formulaire de carte
    setupCardForm();
    
    // Initialiser les mises à jour en temps réel
    setupRealTimeUpdates();
    
    // Améliorer l'interface utilisateur
    document.addEventListener('DOMContentLoaded', function() {
        enhanceTotalBalanceCard();
        enhanceActionButtons();
        enhanceRecentItems();
    });
    
    // Écouter les changements d'écran pour appliquer les améliorations
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
                const element = mutation.target;
                if (!element.classList.contains('hidden') && element.classList.contains('screen')) {
                    setTimeout(() => {
                        enhanceTotalBalanceCard();
                        enhanceActionButtons();
                        enhanceRecentItems();
                    }, 100);
                }
            }
        });
    });
    
    // Observer tous les écrans
    document.querySelectorAll('.screen').forEach(screen => {
        observer.observe(screen, { attributes: true });
    });
}

// Remplacer la fonction submitDeposit pour prendre en charge les paiements par carte
function submitDepositEnhanced() {
    const amount = parseInt(document.getElementById('deposit-amount').value);
    const selectedMethod = document.querySelector('.payment-method.active').getAttribute('data-method');
    
    if (!amount || amount < 300000) {
        notifications.error('Erreur', 'Le montant minimum est de 300 000 GNF');
        return;
    }
    
    showLoading();
    
    // Simuler un délai réseau
    setTimeout(() => {
        if (selectedMethod === 'orange') {
            // Ajouter la transaction
            const deposit = {
                type: 'deposit',
                userId: currentUser.id,
                userName: currentUser.name,
                userCountry: currentUser.country,
                amount: amount,
                date: new Date().toISOString(),
                description: 'Versement mensuel via Orange Money'
            };
            
            DB.transactions.add(deposit);
            
            hideLoading();
            notifications.success('Dépôt effectué', `Votre dépôt de ${formatCurrency(amount)} GNF a été effectué avec succès via Orange Money.`);
            showHomeScreen();
        } else if (selectedMethod === 'card') {
            const cardNumber = document.getElementById('card-number').value;
            const cardExpiry = document.getElementById('card-expiry').value;
            const cardCvv = document.getElementById('card-cvv').value;
            const cardName = document.getElementById('card-name').value;
            
            if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
                hideLoading();
                notifications.error('Erreur', 'Veuillez remplir tous les champs de la carte bancaire');
                return;
            }
            
            // Simuler la validation de la carte
            setTimeout(() => {
                // Ajouter la transaction
                const deposit = {
                    type: 'deposit',
                    userId: currentUser.id,
                    userName: currentUser.name,
                    userCountry: currentUser.country,
                    amount: amount,
                    date: new Date().toISOString(),
                    description: 'Versement mensuel via Carte Bancaire'
                };
                
                DB.transactions.add(deposit);
                
                hideLoading();
                notifications.success('Dépôt effectué', `Votre dépôt de ${formatCurrency(amount)} GNF a été effectué avec succès via Carte Bancaire.`);
                showHomeScreen();
            }, 1000);
        }
    }, 1500);
}

// Ajouter un conteneur pour les notifications
document.addEventListener('DOMContentLoaded', function() {
    const notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    document.body.appendChild(notificationContainer);
    
    // Initialiser les améliorations de l'interface
    initUIEnhancements();
    
    // Remplacer la fonction de soumission de dépôt originale
    const submitDepositBtn = document.getElementById('submit-deposit');
    if (submitDepositBtn) {
        submitDepositBtn.removeEventListener('click', submitDeposit);
        submitDepositBtn.addEventListener('click', submitDepositEnhanced);
    }
});
