// Configuration
const API_URL = 'https://sbah-family-api.onrender.com/api/v1';

// Configuration Socket.IO avec options
const socket = io(API_URL, {
    transports: ['websocket', 'polling'],
    withCredentials: true,
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000
});

// État de l'application
let state = {
    familyMembers: [],
    balance: 0,
    transactions: [],
    ceremonies: []
};

// Gestion des erreurs réseau
function handleNetworkError(error, action = '') {
    console.error(`Erreur ${action}:`, error);
    const message = error.response?.data?.message || error.message || 'Une erreur est survenue';
    showNotification('Erreur', message, 'error');
}

// Affichage des notifications
function showNotification(title, message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <h4>${title}</h4>
        <p>${message}</p>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

// Gestion de l'authentification
async function login(email, password) {
    try {
        showLoading('Connexion en cours...');
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Erreur de connexion');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        state.user = data.user;
        
        // Connecter Socket.IO
        socket.auth = { token: data.token };
        socket.connect();
        
        hideLoading();
        showNotification('Succès', 'Connexion réussie !', 'success');
        showApp();
        loadInitialData();
    } catch (error) {
        hideLoading();
        handleNetworkError(error, 'de connexion');
    }
}

async function register(userData) {
    try {
        showLoading('Création du compte...');
        console.log('Tentative d\'inscription avec les données:', userData);
        
        const url = `${API_URL}/auth/register`;
        console.log('URL de l\'API:', url);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Origin': window.location.origin
            },
            body: JSON.stringify(userData),
            credentials: 'include',
            mode: 'cors'
        });

        console.log('Réponse du serveur:', response.status, response.statusText);
        console.log('Headers de la réponse:', Object.fromEntries(response.headers.entries()));
        
        const data = await response.json();
        console.log('Données de la réponse:', data);
        
        if (!response.ok) {
            throw new Error(data.message || "Erreur lors de l'inscription");
        }

        // Sauvegarder les informations de connexion
        localStorage.setItem('lastEmail', userData.email);
        
        hideLoading();
        showNotification('Succès', 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.', 'success');
        
        // Réinitialiser le formulaire
        document.getElementById('register-form').reset();
        
        // Pré-remplir l'email sur la page de connexion
        document.getElementById('login-email').value = userData.email;
        
        // Rediriger vers la page de connexion après 2 secondes
        setTimeout(() => {
            showLoginScreen();
        }, 2000);
        
    } catch (error) {
        hideLoading();
        console.error('Erreur détaillée:', error);
        console.error('Stack trace:', error.stack);
        
        let errorMessage = "Une erreur est survenue lors de l'inscription.";
        if (error.message.includes('CORS')) {
            errorMessage = "Erreur de connexion au serveur. Veuillez réessayer.";
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage = "Impossible de contacter le serveur. Vérifiez votre connexion.";
        } else {
            errorMessage = error.message;
        }
        
        showNotification('Erreur', errorMessage, 'error');
    }
}

async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        showLoginScreen();
        return;
    }

    try {
        showLoading('Vérification de la session...');
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Session expirée');
        }

        const userData = await response.json();
        state.user = userData;
        socket.auth = { token };
        socket.connect();
        
        hideLoading();
        showApp();
        loadInitialData();
    } catch (error) {
        hideLoading();
        localStorage.removeItem('token');
        showLoginScreen();
        handleNetworkError(error, 'de vérification de session');
    }
}

// Affichage/masquage du loader
function showLoading(message = 'Chargement...') {
    const loader = document.createElement('div');
    loader.id = 'loading-overlay';
    loader.innerHTML = `
        <div class="spinner-container">
            <div class="spinner"></div>
            <p class="loading-text">${message}</p>
        </div>
    `;
    document.body.appendChild(loader);
}

function hideLoading() {
    const loader = document.getElementById('loading-overlay');
    if (loader) {
        loader.remove();
    }
}

// Chargement des données
async function loadInitialData() {
    try {
        await Promise.all([
            loadFamilyMembers(),
            loadBalance(),
            loadTransactions(),
            loadCeremonies()
        ]);
    } catch (error) {
        console.error('Erreur chargement données:', error);
    }
}

async function loadFamilyMembers() {
    try {
        const response = await fetch(`${API_URL}/family-members`);
        const data = await response.json();
        state.familyMembers = data;
        updateFamilyMembersDisplay();
    } catch (error) {
        console.error('Erreur chargement membres:', error);
    }
}

async function loadBalance() {
    try {
        const response = await fetch(`${API_URL}/transactions/balance`, {
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
        const response = await fetch(`${API_URL}/transactions/recent`, {
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
        const response = await fetch(`${API_URL}/ceremonies`, {
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
function updateFamilyMembersDisplay() {
    const container = document.querySelector('.family-members-container');
    if (!container) return;

    container.innerHTML = state.familyMembers.map(member => `
        <div class="family-member-card">
            <div class="member-info">
                <h3>${member.name}</h3>
                <p>${member.role}</p>
                <p>${member.phone}</p>
                <p>${member.city}, ${member.country}</p>
            </div>
            <div class="member-actions">
                <button onclick="editMember(${member.id})" class="edit-button">Modifier</button>
                <button onclick="deleteFamilyMember(${member.id})" class="delete-button">Supprimer</button>
            </div>
        </div>
    `).join('');
}

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
    hideLoading();
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('register-screen').classList.add('hidden');
    document.getElementById('app').classList.add('hidden');
    
    // Récupérer et pré-remplir le dernier email utilisé
    const lastEmail = localStorage.getItem('lastEmail');
    if (lastEmail) {
        document.getElementById('login-email').value = lastEmail;
    }
    
    // Réinitialiser les formulaires
    document.getElementById('register-form').reset();
}

function showRegisterScreen() {
    console.log('Affichage de l\'écran d\'inscription');
    hideLoading();
    
    const loginScreen = document.getElementById('login-screen');
    const registerScreen = document.getElementById('register-screen');
    const appScreen = document.getElementById('app');
    
    if (loginScreen && registerScreen && appScreen) {
        loginScreen.classList.add('hidden');
        registerScreen.classList.remove('hidden');
        appScreen.classList.add('hidden');
        
        // Réinitialiser les formulaires
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        if (loginForm) loginForm.reset();
        if (registerForm) registerForm.reset();
        
        console.log('Écran d\'inscription affiché avec succès');
    } else {
        console.error('Certains éléments sont manquants:', {
            loginScreen: !!loginScreen,
            registerScreen: !!registerScreen,
            appScreen: !!appScreen
        });
    }
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
        const response = await fetch(`${API_URL}/payments/initialize`, {
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

// Gestion des membres de la famille
async function addFamilyMember(memberData) {
    try {
        showLoading('Ajout du membre...');
        const response = await fetch(`${API_URL}/family-members`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(memberData)
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || "Erreur lors de l'ajout du membre");
        }

        const newMember = await response.json();
        state.familyMembers.push(newMember);
        updateFamilyMembersDisplay();
        
        hideLoading();
        showNotification('Succès', 'Membre ajouté avec succès !', 'success');
        document.getElementById('add-member-form').reset();
        
    } catch (error) {
        hideLoading();
        showNotification('Erreur', error.message, 'error');
    }
}

async function updateFamilyMember(id, memberData) {
    try {
        showLoading('Mise à jour du membre...');
        const response = await fetch(`${API_URL}/family-members/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(memberData)
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || "Erreur lors de la mise à jour du membre");
        }

        const updatedMember = await response.json();
        state.familyMembers = state.familyMembers.map(member => 
            member.id === id ? updatedMember : member
        );
        updateFamilyMembersDisplay();
        
        hideLoading();
        showNotification('Succès', 'Membre mis à jour avec succès !', 'success');
        
    } catch (error) {
        hideLoading();
        showNotification('Erreur', error.message, 'error');
    }
}

async function deleteFamilyMember(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
        return;
    }

    try {
        showLoading('Suppression du membre...');
        const response = await fetch(`${API_URL}/family-members/${id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || "Erreur lors de la suppression du membre");
        }

        state.familyMembers = state.familyMembers.filter(member => member.id !== id);
        updateFamilyMembersDisplay();
        
        hideLoading();
        showNotification('Succès', 'Membre supprimé avec succès !', 'success');
        
    } catch (error) {
        hideLoading();
        showNotification('Erreur', error.message, 'error');
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
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const userData = {
            name: document.getElementById('register-name').value.trim(),
            email: document.getElementById('register-email').value.trim(),
            password: document.getElementById('register-password').value,
            phone: document.getElementById('register-phone').value.trim(),
            country: document.getElementById('register-country').value,
            city: document.getElementById('register-city').value.trim()
        };

        // Validation des champs
        if (!userData.name || !userData.email || !userData.password || !userData.phone || !userData.country || !userData.city) {
            showNotification('Erreur', 'Veuillez remplir tous les champs', 'error');
            return;
        }

        // Validation de l'email
        if (!userData.email.includes('@')) {
            showNotification('Erreur', 'Veuillez entrer une adresse email valide', 'error');
            return;
        }

        // Validation du mot de passe
        if (userData.password.length < 6) {
            showNotification('Erreur', 'Le mot de passe doit contenir au moins 6 caractères', 'error');
            return;
        }

        await register(userData);
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
            familyMembers: [],
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
    const showRegisterLink = document.getElementById('show-register');
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Clic sur le lien S\'inscrire');
            showRegisterScreen();
        });
    }

    const showLoginLink = document.getElementById('show-login');
    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Clic sur le lien Se connecter');
            showLoginScreen();
        });
    }

    // Formulaire d'ajout de membre
    document.getElementById('add-member-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const memberData = {
            name: document.getElementById('member-name').value.trim(),
            role: document.getElementById('member-role').value.trim(),
            phone: document.getElementById('member-phone').value.trim(),
            country: document.getElementById('member-country').value,
            city: document.getElementById('member-city').value.trim()
        };

        // Validation des champs
        if (!memberData.name || !memberData.role || !memberData.phone || !memberData.country || !memberData.city) {
            showNotification('Erreur', 'Veuillez remplir tous les champs', 'error');
            return;
        }

        await addFamilyMember(memberData);
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

    // Socket.IO error handling
    socket.on('connect_error', (error) => {
        console.error('Erreur de connexion Socket.IO:', error);
        showNotification('Erreur', 'Problème de connexion au serveur', 'error');
    });

    socket.on('error', (error) => {
        console.error('Erreur Socket.IO:', error);
        showNotification('Erreur', 'Une erreur est survenue', 'error');
    });

    // Vérifier l'authentification au chargement
    checkAuth();
}); 