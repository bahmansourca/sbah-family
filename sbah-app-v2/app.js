// Configuration
const CONFIG = {
    API_URL: 'http://localhost:3000',
    PAYMENT_AMOUNTS: {
        1: 300000,  // 1 mois
        3: 900000,  // 3 mois
        6: 1800000, // 6 mois
        12: 3600000 // 12 mois
    },
    MIN_PAYMENT: 300000,
    PAYMENT_STEP: 10000
};

// État de l'application
const state = {
    currentUser: null,
    balance: 0,
    notifications: [],
    members: [],
    events: [],
    payments: [],
    isAdmin: false
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Vérification de l'authentification
    if (!authService.isAuthenticated()) {
        window.location.href = 'auth.html';
        return;
    }

    // Initialisation des services
    initializeServices();
    
    // Initialisation des écouteurs d'événements
    initializeEventListeners();
    
    // Chargement des données initiales
    loadInitialData();
});

// Initialisation des services
function initializeServices() {
    // Initialisation du service de synchronisation
    syncService.initialize();
    
    // Initialisation du gestionnaire de paiement
    paymentHandler.initialize();
}

// Initialisation des écouteurs d'événements
function initializeEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const screen = item.dataset.screen;
            showScreen(`${screen}-screen`);
        });
    });

    // Boutons d'action
    document.getElementById('pay-btn').addEventListener('click', () => showScreen('payment-screen'));
    document.getElementById('events-btn').addEventListener('click', () => showScreen('events-screen'));
    document.getElementById('members-btn').addEventListener('click', () => showScreen('members-screen'));
    document.getElementById('history-btn').addEventListener('click', () => showScreen('history-screen'));

    // Boutons de retour
    document.getElementById('payment-back-btn').addEventListener('click', () => showScreen('home-screen'));
    document.getElementById('events-back-btn').addEventListener('click', () => showScreen('home-screen'));
    document.getElementById('members-back-btn').addEventListener('click', () => showScreen('home-screen'));
    document.getElementById('history-back-btn').addEventListener('click', () => showScreen('home-screen'));
    document.getElementById('profile-back-btn').addEventListener('click', () => showScreen('home-screen'));

    // Options de montant
    document.querySelectorAll('.amount-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.amount-option').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            const amount = option.dataset.amount;
            if (amount === 'custom') {
                document.querySelector('.custom-amount-group').classList.remove('hidden');
            } else {
                document.querySelector('.custom-amount-group').classList.add('hidden');
            }
        });
    });

    // Méthodes de paiement
    document.querySelectorAll('.payment-method').forEach(method => {
        method.addEventListener('click', () => {
            document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
            method.classList.add('selected');
            
            const paymentType = method.dataset.method;
            if (paymentType === 'cash') {
                document.getElementById('cash-payment-info').classList.remove('hidden');
            } else {
                document.getElementById('cash-payment-info').classList.add('hidden');
            }
        });
    });

    // Soumission du paiement
    document.getElementById('submit-deposit-btn').addEventListener('click', handleDeposit);

    // Ajout d'événement
    document.getElementById('add-event-btn').addEventListener('click', () => {
        document.getElementById('add-event-modal').classList.remove('hidden');
    });

    document.getElementById('cancel-event-btn').addEventListener('click', () => {
        document.getElementById('add-event-modal').classList.add('hidden');
    });

    document.getElementById('add-event-form').addEventListener('submit', handleAddEvent);

    // Filtres d'historique
    document.getElementById('history-filter').addEventListener('change', handleHistoryFilter);

    // Actions du profil
    document.getElementById('edit-profile-btn').addEventListener('click', handleEditProfile);
    document.getElementById('change-password-btn').addEventListener('click', handleChangePassword);
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
}

// Chargement des données initiales
async function loadInitialData() {
    try {
        // Chargement du solde
        const balance = await syncService.getBalance();
        updateBalanceDisplay(balance);

        // Chargement des dépôts récents
        const recentDeposits = await syncService.getRecentDeposits();
        updateRecentDeposits(recentDeposits);

        // Chargement des événements à venir
        const upcomingEvents = await syncService.getUpcomingEvents();
        updateUpcomingEvents(upcomingEvents);

        // Chargement des membres
        const members = await syncService.getMembers();
        updateMembersList(members);

        // Chargement de l'historique
        const transactions = await syncService.getTransactions();
        updateTransactionsList(transactions);

        // Chargement du profil
        const profile = await syncService.getProfile();
        updateProfileDisplay(profile);

    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        uiService.showError('Erreur lors du chargement des données');
    }
}

// Gestion de l'affichage des écrans
function showScreen(screenId) {
    // Masquer tous les écrans
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // Afficher l'écran demandé
    document.getElementById(screenId).classList.add('active');

    // Mettre à jour la navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.screen === screenId.replace('-screen', '')) {
            item.classList.add('active');
        }
    });
}

// Mise à jour de l'affichage du solde
function updateBalanceDisplay(balance) {
    const balanceElement = document.getElementById('total-balance');
    balanceElement.textContent = uiService.formatCurrency(balance);
}

// Mise à jour des dépôts récents
function updateRecentDeposits(deposits) {
    const container = document.getElementById('recent-deposits');
    container.innerHTML = deposits.map(deposit => `
        <div class="payment-item">
            <div class="payment-icon ${deposit.method}">
                <i class="fas fa-${uiService.getPaymentIcon(deposit.method)}"></i>
            </div>
            <div class="payment-info">
                <h4>${deposit.user.name}</h4>
                <p>${uiService.formatCurrency(deposit.amount)}</p>
                <small>${uiService.formatDateTime(deposit.date)}</small>
            </div>
            <div class="payment-status">
                ${uiService.createBadge(deposit.status)}
            </div>
        </div>
    `).join('');
}

// Mise à jour des événements à venir
function updateUpcomingEvents(events) {
    const container = document.getElementById('upcoming-events');
    container.innerHTML = events.map(event => `
        <div class="event-item">
            <div class="event-icon ${event.type}">
                <i class="fas fa-${uiService.getEventIcon(event.type)}"></i>
            </div>
            <div class="event-info">
                <h4>${event.title}</h4>
                <p>${event.description}</p>
                <small>${uiService.formatDateTime(event.date)}</small>
            </div>
            ${event.amount ? `
                <div class="event-amount">
                    <p>${uiService.formatCurrency(event.amount)}</p>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Mise à jour de la liste des membres
function updateMembersList(members) {
    const container = document.getElementById('members-list');
    container.innerHTML = members.map(member => `
        <div class="member-item">
            <div class="member-avatar">
                <i class="fas fa-${uiService.getAvatarIcon(member.role)}"></i>
            </div>
            <div class="member-info">
                <h4>${member.name}</h4>
                <p>${member.role}</p>
                <small>${member.city}, ${member.country}</small>
            </div>
            <div class="member-status">
                ${uiService.createBadge(member.status)}
            </div>
        </div>
    `).join('');
}

// Mise à jour de la liste des transactions
function updateTransactionsList(transactions) {
    const container = document.getElementById('transactions-list');
    container.innerHTML = transactions.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-icon ${transaction.type}">
                <i class="fas fa-${transaction.type === 'deposit' ? 'arrow-down' : 'arrow-up'}"></i>
            </div>
            <div class="transaction-info">
                <h4>${transaction.description}</h4>
                <p>${uiService.formatCurrency(transaction.amount)}</p>
                <small>${uiService.formatDateTime(transaction.date)}</small>
            </div>
            <div class="transaction-status">
                ${uiService.createBadge(transaction.status)}
            </div>
        </div>
    `).join('');
}

// Mise à jour de l'affichage du profil
function updateProfileDisplay(profile) {
    document.getElementById('profile-name').textContent = profile.name;
    document.getElementById('profile-email').textContent = profile.email;
    document.getElementById('profile-phone').textContent = profile.phone;
    document.getElementById('profile-country').textContent = profile.country;
    document.getElementById('profile-city').textContent = profile.city;
    document.getElementById('payment-status').textContent = profile.paymentStatus;
}

// Gestion du dépôt
async function handleDeposit() {
    try {
        const selectedAmount = document.querySelector('.amount-option.active').dataset.amount;
        const amount = selectedAmount === 'custom' 
            ? parseInt(document.getElementById('deposit-amount').value)
            : parseInt(selectedAmount);

        const selectedMethod = document.querySelector('.payment-method.selected').dataset.method;

        if (selectedMethod === 'cash') {
            const userId = document.getElementById('cash-user').value;
            const receipt = document.getElementById('cash-receipt').value;
            
            await paymentHandler.processCashPayment(amount, userId, receipt);
        } else {
            await paymentHandler.processOnlinePayment(amount, selectedMethod);
        }

        showScreen('home-screen');
        uiService.showSuccess('Paiement effectué avec succès');
        
    } catch (error) {
        console.error('Erreur lors du paiement:', error);
        uiService.showError('Erreur lors du paiement');
    }
}

// Gestion de l'ajout d'événement
async function handleAddEvent(event) {
    event.preventDefault();
    
    try {
        const eventData = {
            type: document.getElementById('event-type').value,
            title: document.getElementById('event-title').value,
            description: document.getElementById('event-description').value,
            date: document.getElementById('event-date').value,
            amount: document.getElementById('event-amount').value || null
        };

        await syncService.createEvent(eventData);
        
        document.getElementById('add-event-modal').classList.add('hidden');
        uiService.showSuccess('Événement créé avec succès');
        
    } catch (error) {
        console.error('Erreur lors de la création de l\'événement:', error);
        uiService.showError('Erreur lors de la création de l\'événement');
    }
}

// Gestion du filtre d'historique
function handleHistoryFilter(event) {
    const filter = event.target.value;
    syncService.getTransactions(filter).then(updateTransactionsList);
}

// Gestion de la modification du profil
function handleEditProfile() {
    // À implémenter
    uiService.showInfo('Fonctionnalité à venir');
}

// Gestion du changement de mot de passe
function handleChangePassword() {
    // À implémenter
    uiService.showInfo('Fonctionnalité à venir');
}

// Gestion de la déconnexion
function handleLogout() {
    authService.logout();
    window.location.href = 'auth.html';
} 