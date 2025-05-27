// Configuration
const API_URL = 'https://sbah-family-api.onrender.com';
const socket = io(API_URL);

// État de l'application
let state = {
    user: null,
    balance: 0,
    transactions: [],
    ceremonies: []
};

// Gestion de l'authentification
async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }

        localStorage.setItem('token', data.token);
        state.user = data.user;
        
        // Connecter Socket.IO
        socket.emit('authenticate', { token: data.token, userId: data.user.id });
        
        showApp();
        loadInitialData();
    } catch (error) {
        alert(error.message);
    }
}

async function register(userData) {
    try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }

        localStorage.setItem('token', data.token);
        state.user = data.user;
        
        // Connecter Socket.IO
        socket.emit('authenticate', { token: data.token, userId: data.user.id });
        
        showApp();
        loadInitialData();
    } catch (error) {
        alert(error.message);
    }
}

async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        showLoginScreen();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Session expirée');
        }

        state.user = await response.json();
        socket.emit('authenticate', { token, userId: state.user._id });
        
        showApp();
        loadInitialData();
    } catch (error) {
        localStorage.removeItem('token');
        showLoginScreen();
    }
}

// Chargement des données
async function loadInitialData() {
    try {
        await Promise.all([
            loadBalance(),
            loadTransactions(),
            loadCeremonies()
        ]);
    } catch (error) {
        console.error('Erreur chargement données:', error);
    }
}

async function loadBalance() {
    try {
        const response = await fetch(`${API_URL}/api/transactions/balance`, {
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
        const response = await fetch(`${API_URL}/api/transactions/recent`, {
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
        const response = await fetch(`${API_URL}/api/ceremonies`, {
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
    const container = document.querySelector('.deposits-container');
    if (!container) return;

    container.innerHTML = state.transactions.map(transaction => `
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
    `).join('');
}

function updateCeremoniesDisplay() {
    const container = document.querySelector('.ceremonies-container');
    if (!container) return;

    container.innerHTML = state.ceremonies.map(ceremony => `
        <div class="ceremony-card">
            <img src="${ceremony.images[0]?.url || 'images/default-ceremony.jpg'}" 
                 alt="${ceremony.title}" 
                 class="ceremony-image">
            <h3 class="ceremony-title">${ceremony.title}</h3>
            <p class="ceremony-amount">${new Intl.NumberFormat('fr-FR').format(ceremony.estimatedBudget)} GNF</p>
        </div>
    `).join('');
}

// Navigation
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.getElementById(`nav-${screenId.replace('-screen', '')}`).classList.add('active');
}

function showLoginScreen() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('register-screen').classList.add('hidden');
    document.getElementById('app').classList.add('hidden');
}

function showRegisterScreen() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('register-screen').classList.remove('hidden');
    document.getElementById('app').classList.add('hidden');
}

function showApp() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('register-screen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    document.getElementById('user-name').textContent = state.user.name;
    showScreen('home-screen');
}

// Gestion des paiements
async function initializePayment(amount) {
    try {
        const response = await fetch(`${API_URL}/api/payments/initialize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ amount })
        });

        const data = await response.json();
        if (data.success) {
            window.location.href = data.paymentUrl;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        alert('Erreur lors de l\'initialisation du paiement: ' + error.message);
    }
}

// Écouteurs d'événements
document.addEventListener('DOMContentLoaded', () => {
    // Formulaire de connexion
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        login(email, password);
    });

    // Formulaire d'inscription
    document.getElementById('register-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const userData = {
            name: document.getElementById('register-name').value,
            email: document.getElementById('register-email').value,
            password: document.getElementById('register-password').value,
            phone: document.getElementById('register-phone').value,
            country: document.getElementById('register-country').value,
            city: document.getElementById('register-city').value
        };
        register(userData);
    });

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const screenId = item.id.replace('nav-', '') + '-screen';
            showScreen(screenId);
        });
    });

    // Boutons retour
    document.querySelectorAll('.back-button').forEach(button => {
        button.addEventListener('click', () => showScreen('home-screen'));
    });

    // Déconnexion
    document.getElementById('logout-button').addEventListener('click', () => {
        localStorage.removeItem('token');
        state = {
            user: null,
            balance: 0,
            transactions: [],
            ceremonies: []
        };
        showLoginScreen();
    });

    // Paiement
    document.querySelector('.submit-button')?.addEventListener('click', () => {
        const amount = parseInt(document.querySelector('.amount-input').value);
        if (amount && amount >= 1000) {
            initializePayment(amount);
        } else {
            alert('Veuillez entrer un montant valide (minimum 1000 GNF)');
        }
    });

    // Liens d'authentification
    document.getElementById('show-register').addEventListener('click', (e) => {
        e.preventDefault();
        showRegisterScreen();
    });

    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        showLoginScreen();
    });

    // Socket.IO
    socket.on('transaction_update', (data) => {
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

    // Vérifier l'authentification au chargement
    checkAuth();
}); 