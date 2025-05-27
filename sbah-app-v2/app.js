// Configuration Socket.IO
const socket = io(process.env.API_URL);

// État global de l'application
const state = {
    user: null,
    balance: 0,
    transactions: [],
    ceremonies: []
};

// Gestion de l'authentification
async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch(`${process.env.API_URL}/api/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Non authentifié');
        }

        state.user = await response.json();
        socket.emit('authenticate', { token });
        
        // Charger les données initiales
        await Promise.all([
            loadBalance(),
            loadTransactions(),
            loadCeremonies()
        ]);
    } catch (error) {
        console.error('Erreur auth:', error);
        window.location.href = '/login.html';
    }
}

// Chargement des données
async function loadBalance() {
    try {
        const response = await fetch(`${process.env.API_URL}/api/transactions/balance`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        state.balance = data.balance;
        updateBalanceDisplay();
    } catch (error) {
        console.error('Erreur chargement solde:', error);
    }
}

async function loadTransactions() {
    try {
        const response = await fetch(`${process.env.API_URL}/api/transactions/recent`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        state.transactions = data;
        updateTransactionsDisplay();
    } catch (error) {
        console.error('Erreur chargement transactions:', error);
    }
}

async function loadCeremonies() {
    try {
        const response = await fetch(`${process.env.API_URL}/api/ceremonies`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        state.ceremonies = data;
        updateCeremoniesDisplay();
    } catch (error) {
        console.error('Erreur chargement cérémonies:', error);
    }
}

// Mise à jour de l'affichage
function updateBalanceDisplay() {
    const balanceElement = document.querySelector('.balance-amount');
    if (balanceElement) {
        balanceElement.textContent = new Intl.NumberFormat('fr-FR').format(state.balance) + ' GNF';
    }
}

function updateTransactionsDisplay() {
    const container = document.querySelector('.recent-deposits');
    if (!container) return;

    container.innerHTML = `
        <h3 class="section-title">Derniers dépôts</h3>
        ${state.transactions.map(transaction => `
            <div class="deposit-item">
                <div class="user-avatar">${transaction.user.name[0]}</div>
                <div class="user-info">
                    <p class="user-name">${transaction.user.name}</p>
                    <p class="user-location">${transaction.user.country}</p>
                </div>
                <div class="deposit-details">
                    <p class="deposit-amount">${new Intl.NumberFormat('fr-FR').format(transaction.amount)} GNF</p>
                    <p class="deposit-date">${new Date(transaction.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
            </div>
        `).join('')}
    `;
}

function updateCeremoniesDisplay() {
    const container = document.querySelector('#ceremonies-screen');
    if (!container) return;

    const ceremoniesHtml = state.ceremonies.map(ceremony => `
        <div class="ceremony-card">
            <img src="${ceremony.images[0]?.url || 'images/default-ceremony.jpg'}" 
                 alt="${ceremony.title}" 
                 class="ceremony-image">
            <h3 class="ceremony-title">${ceremony.title}</h3>
            <p class="ceremony-amount">${new Intl.NumberFormat('fr-FR').format(ceremony.estimatedBudget)} GNF</p>
        </div>
    `).join('');

    container.querySelector('.ceremonies-container').innerHTML = ceremoniesHtml;
}

// Gestion des paiements
async function initializePayment(amount) {
    try {
        const response = await fetch(`${process.env.API_URL}/api/payments/initialize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ amount })
        });

        const data = await response.json();
        if (data.success) {
            // Rediriger vers la page de paiement PayDunya
            window.location.href = data.paymentUrl;
        } else {
            alert('Erreur lors de l\'initialisation du paiement');
        }
    } catch (error) {
        console.error('Erreur paiement:', error);
        alert('Une erreur est survenue');
    }
}

// Gestion des notifications Socket.IO
socket.on('connect', () => {
    console.log('Connecté au serveur de notifications');
});

socket.on('transaction_update', (data) => {
    // Mettre à jour l'interface en temps réel
    if (data.type === 'new_transaction') {
        loadBalance();
        loadTransactions();
        showNotification('Nouvelle transaction', `Transaction de ${data.data.amount} GNF ${data.data.status}`);
    }
});

socket.on('ceremony_notification', (data) => {
    if (data.type === 'new_ceremony') {
        loadCeremonies();
        showNotification('Nouvelle cérémonie', `${data.data.title} - ${data.data.budget} GNF`);
    }
});

// Affichage des notifications
function showNotification(title, message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body: message });
    }
}

// Navigation
const screens = {
    home: document.getElementById('home-screen'),
    deposit: document.getElementById('deposit-screen'),
    history: document.getElementById('history-screen'),
    ceremonies: document.getElementById('ceremonies-screen')
};

const navItems = {
    home: document.getElementById('nav-home'),
    deposit: document.getElementById('nav-deposit'),
    history: document.getElementById('nav-history')
};

function showScreen(screenId) {
    // Cacher tous les écrans
    Object.values(screens).forEach(screen => screen.classList.add('hidden'));
    
    // Afficher l'écran demandé
    screens[screenId].classList.remove('hidden');
    
    // Mettre à jour la navigation
    Object.values(navItems).forEach(item => item.classList.remove('active'));
    if (navItems[screenId]) {
        navItems[screenId].classList.add('active');
    }
}

// Écouteurs d'événements pour la navigation
Object.entries(navItems).forEach(([screenId, element]) => {
    element.addEventListener('click', (e) => {
        e.preventDefault();
        showScreen(screenId);
    });
});

// Écouteurs pour les boutons retour
document.querySelectorAll('.back-button').forEach(button => {
    button.addEventListener('click', () => showScreen('home'));
});

// Gestion des paiements
document.querySelector('.submit-button')?.addEventListener('click', async () => {
    const amountInput = document.querySelector('.amount-input');
    const amount = parseInt(amountInput.value.replace(/[^0-9]/g, ''));
    
    if (amount && amount >= 1000) {
        await initializePayment(amount);
    } else {
        alert('Veuillez entrer un montant valide (minimum 1000 GNF)');
    }
});

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    showScreen('home');

    // Demander la permission pour les notifications
    if ('Notification' in window) {
        Notification.requestPermission();
    }
}); 