// Base de données simulée avec localStorage
const DB = {
    // Initialiser la base de données avec l'administrateur par défaut
    init: function() {
        if (!localStorage.getItem('sbahFamilyUsers')) {
            localStorage.setItem('sbahFamilyUsers', JSON.stringify([
                {
                    id: 1,
                    name: 'Thierno Sadou Bah',
                    email: 'admin@sbahfamily.com',
                    phone: '622538185',
                    country: 'Guinée',
                    city: 'Conakry',
                    password: 'admin123',
                    role: 'admin',
                    orangeMoneyAccount: '622538185'
                }
            ]));
        }
        
        if (!localStorage.getItem('sbahFamilyTransactions')) {
            localStorage.setItem('sbahFamilyTransactions', JSON.stringify([
                {
                    id: 1,
                    type: 'deposit',
                    userId: 2,
                    userName: 'Khadija Bah',
                    userCountry: 'Canada',
                    amount: 300000,
                    date: '2025-04-25T10:30:00',
                    description: 'Versement mensuel'
                },
                {
                    id: 2,
                    type: 'deposit',
                    userId: 3,
                    userName: 'Ibrahim Bah',
                    userCountry: 'USA',
                    amount: 300000,
                    date: '2025-04-20T14:45:00',
                    description: 'Versement mensuel'
                }
            ]));
        }
        
        if (!localStorage.getItem('sbahFamilyCeremonies')) {
            localStorage.setItem('sbahFamilyCeremonies', JSON.stringify([
                {
                    id: 1,
                    title: 'Mariage de Fanta',
                    date: '2025-06-15',
                    amount: 2000000,
                    description: 'Mariage de notre soeur Fanta',
                    status: 'upcoming',
                    icon: 'ring'
                },
                {
                    id: 2,
                    title: "Funérailles d'Alpha",
                    date: '2025-02-05',
                    amount: 1000000,
                    description: "Cérémonie de funérailles pour notre oncle Alpha",
                    status: 'completed',
                    icon: 'pray'
                }
            ]));
        }
        
        if (!localStorage.getItem('sbahFamilyBalance')) {
            localStorage.setItem('sbahFamilyBalance', JSON.stringify({
                total: 10000000
            }));
        }

        // Ajouter quelques utilisateurs de démonstration si la base est vide
        const users = JSON.parse(localStorage.getItem('sbahFamilyUsers'));
        if (users.length === 1) {
            users.push(
                {
                    id: 2,
                    name: 'Khadija Bah',
                    email: 'khadija@example.com',
                    phone: '+1234567890',
                    country: 'Canada',
                    city: 'Montreal',
                    password: 'password',
                    role: 'member'
                },
                {
                    id: 3,
                    name: 'Ibrahim Bah',
                    email: 'ibrahim@example.com',
                    phone: '+1987654321',
                    country: 'USA',
                    city: 'New York',
                    password: 'password',
                    role: 'member'
                },
                {
                    id: 4,
                    name: 'Aissatou Bah',
                    email: 'aissatou@example.com',
                    phone: '+3312345678',
                    country: 'Europe',
                    city: 'Paris',
                    password: 'password',
                    role: 'member'
                }
            );
            localStorage.setItem('sbahFamilyUsers', JSON.stringify(users));
        }
    },
    
    // Méthodes pour les utilisateurs
    users: {
        getAll: function() {
            return JSON.parse(localStorage.getItem('sbahFamilyUsers') || '[]');
        },
        getById: function(id) {
            const users = this.getAll();
            return users.find(user => user.id === id);
        },
        getByEmail: function(email) {
            const users = this.getAll();
            return users.find(user => user.email.toLowerCase() === email.toLowerCase());
        },
        add: function(user) {
            const users = this.getAll();
            user.id = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
            users.push(user);
            localStorage.setItem('sbahFamilyUsers', JSON.stringify(users));
            return user;
        },
        update: function(updatedUser) {
            const users = this.getAll();
            const index = users.findIndex(user => user.id === updatedUser.id);
            if (index !== -1) {
                users[index] = { ...users[index], ...updatedUser };
                localStorage.setItem('sbahFamilyUsers', JSON.stringify(users));
                return true;
            }
            return false;
        }
    },
    
    // Méthodes pour les transactions
    transactions: {
        getAll: function() {
            return JSON.parse(localStorage.getItem('sbahFamilyTransactions') || '[]');
        },
        getById: function(id) {
            const transactions = this.getAll();
            return transactions.find(tx => tx.id === id);
        },
        getByType: function(type) {
            const transactions = this.getAll();
            return transactions.filter(tx => tx.type === type);
        },
        getByUserId: function(userId) {
            const transactions = this.getAll();
            return transactions.filter(tx => tx.userId === userId);
        },
        add: function(transaction) {
            const transactions = this.getAll();
            transaction.id = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;
            transactions.push(transaction);
            localStorage.setItem('sbahFamilyTransactions', JSON.stringify(transactions));
            
            // Mettre à jour le solde
            const balance = this.getBalance();
            if (transaction.type === 'deposit') {
                balance.total += transaction.amount;
            } else if (transaction.type === 'withdrawal') {
                balance.total -= transaction.amount;
            }
            localStorage.setItem('sbahFamilyBalance', JSON.stringify(balance));
            
            return transaction;
        },
        getBalance: function() {
            return JSON.parse(localStorage.getItem('sbahFamilyBalance') || '{"total": 0}');
        }
    },
    
    // Méthodes pour les cérémonies
    ceremonies: {
        getAll: function() {
            return JSON.parse(localStorage.getItem('sbahFamilyCeremonies') || '[]');
        },
        getById: function(id) {
            const ceremonies = this.getAll();
            return ceremonies.find(c => c.id === id);
        },
        getByStatus: function(status) {
            const ceremonies = this.getAll();
            return ceremonies.filter(c => c.status === status);
        },
        add: function(ceremony) {
            const ceremonies = this.getAll();
            ceremony.id = ceremonies.length > 0 ? Math.max(...ceremonies.map(c => c.id)) + 1 : 1;
            ceremonies.push(ceremony);
            localStorage.setItem('sbahFamilyCeremonies', JSON.stringify(ceremonies));
            return ceremony;
        },
        update: function(updatedCeremony) {
            const ceremonies = this.getAll();
            const index = ceremonies.findIndex(c => c.id === updatedCeremony.id);
            if (index !== -1) {
                ceremonies[index] = { ...ceremonies[index], ...updatedCeremony };
                localStorage.setItem('sbahFamilyCeremonies', JSON.stringify(ceremonies));
                return true;
            }
            return false;
        }
    }
};

// Initialiser la base de données
DB.init();

// DOM Elements
// Login & Register
const loginScreen = document.getElementById('login-screen');
const registerScreen = document.getElementById('register-screen');
const mainApp = document.getElementById('main-app');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const registerLink = document.getElementById('register-link');
const loginLink = document.getElementById('login-link');

// Main Navigation
const navHome = document.getElementById('nav-home');
const navDeposit = document.getElementById('nav-deposit');
const navHistory = document.getElementById('nav-history');
const navCeremonies = document.getElementById('nav-ceremonies');

// Screens
const homeScreen = document.getElementById('home-screen');
const depositScreen = document.getElementById('deposit-screen');
const withdrawScreen = document.getElementById('withdraw-screen');
const historyScreen = document.getElementById('history-screen');
const ceremoniesScreen = document.getElementById('ceremonies-screen');
const addCeremonyScreen = document.getElementById('add-ceremony-screen');
const profileScreen = document.getElementById('profile-screen');
const editProfileScreen = document.getElementById('edit-profile-screen');
const membersScreen = document.getElementById('members-screen');

// Home Screen Elements
const depositAction = document.getElementById('deposit-action');
const historyAction = document.getElementById('history-action');
const ceremoniesAction = document.getElementById('ceremonies-action');
const withdrawAction = document.getElementById('withdraw-action');
const profileIcon = document.getElementById('profile-icon');
const totalBalance = document.getElementById('total-balance');
const recentDeposits = document.getElementById('recent-deposits');
const upcomingCeremonies = document.getElementById('upcoming-ceremonies');

// Back Buttons
const depositBack = document.getElementById('deposit-back');
const withdrawBack = document.getElementById('withdraw-back');
const historyBack = document.getElementById('history-back');
const ceremoniesBack = document.getElementById('ceremonies-back');
const addCeremonyBack = document.getElementById('add-ceremony-back');
const profileBack = document.getElementById('profile-back');
const editProfileBack = document.getElementById('edit-profile-back');
const membersBack = document.getElementById('members-back');

// History Tabs
const depositsTab = document.getElementById('deposits-tab');
const withdrawalsTab = document.getElementById('withdrawals-tab');
const depositsContent = document.getElementById('deposits-content');
const withdrawalsContent = document.getElementById('withdrawals-content');

// Profile Elements
const editProfileBtn = document.getElementById('edit-profile-btn');
const changePasswordBtn = document.getElementById('change-password-btn');
const membersListBtn = document.getElementById('members-list-btn');
const logoutBtn = document.getElementById('logout-btn');

// Ceremony Elements
const addCeremonyBtn = document.getElementById('add-ceremony-btn');
const saveCeremonyBtn = document.getElementById('save-ceremony-btn');
const ceremoniesList = document.getElementById('ceremonies-list');

// Loading Overlay
const loadingOverlay = document.getElementById('loading-overlay');

// Current User Data
let currentUser = null;

// Vérifier si l'utilisateur est déjà connecté
function checkLoggedInUser() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        loginScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
        showHomeScreen();
        updateUIForRole(currentUser.role);
        updateProfileInfo();
    }
}

// Auth Functions
function showLogin() {
    loginScreen.classList.remove('hidden');
    registerScreen.classList.add('hidden');
    mainApp.classList.add('hidden');
}

function showRegister() {
    console.log("Fonction showRegister() appelée");
    console.log("État avant changement :", {
        loginScreen: loginScreen ? loginScreen.className : 'null',
        registerScreen: registerScreen ? registerScreen.className : 'null',
        mainApp: mainApp ? mainApp.className : 'null'
    });
    
    loginScreen.classList.add('hidden');
    registerScreen.classList.remove('hidden');
    mainApp.classList.add('hidden');
    
    console.log("État après changement :", {
        loginScreen: loginScreen.className,
        registerScreen: registerScreen.className,
        mainApp: mainApp.className
    });
}

function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    console.log("Tentative de connexion avec:", email);
    
    // Réinitialiser localStorage pour s'assurer que nous avons les données correctes
    console.log("Réinitialisation de la base de données...");
    localStorage.clear();
    DB.init();
    
    console.log("Utilisateurs disponibles:", DB.users.getAll());
    
    if (email && password) {
        showLoading();
        
        try {
            // Simuler un délai réseau court
            setTimeout(() => {
                try {
                    // Trouver l'utilisateur dans la base de données
                    const user = DB.users.getByEmail(email);
                    console.log("Utilisateur trouvé:", user);
                    
                    if (user && user.password === password) {
                        currentUser = user;
                        localStorage.setItem('currentUser', JSON.stringify(user));
                        
                        loginScreen.classList.add('hidden');
                        mainApp.classList.remove('hidden');
                        showHomeScreen();
                        
                        // Mettre à jour l'interface selon le rôle
                        updateUIForRole(user.role);
                        updateProfileInfo();
                        console.log("Connexion réussie!");
                    } else {
                        alert('Email ou mot de passe incorrect');
                        console.log("Identifiants incorrects!");
                    }
                } catch (error) {
                    console.error("Erreur lors de la connexion:", error);
                    alert('Une erreur est survenue lors de la connexion. Veuillez réessayer.');
                } finally {
                    // Toujours masquer le chargement, même en cas d'erreur
                    hideLoading();
                }
            }, 500); // Réduire le délai pour une meilleure expérience
        } catch (error) {
            console.error("Erreur critique:", error);
            hideLoading();
            alert('Une erreur critique est survenue. Veuillez actualiser la page.');
        }
    } else {
        alert('Veuillez remplir tous les champs');
    }
}

function register() {
    console.log("Fonction register() appelée");
    
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const phone = document.getElementById('reg-phone').value;
    const country = document.getElementById('reg-country').value;
    const city = document.getElementById('reg-city').value;
    const password = document.getElementById('reg-password').value;
    
    console.log("Valeurs du formulaire:", { name, email, phone, country, city });
    
    if (name && email && phone && country && city && password) {
        console.log("Validation OK, traitement en cours...");
        showLoading();
        
        // Simuler un délai réseau
        setTimeout(() => {
            // Vérifier si l'utilisateur existe déjà
            const existingUser = DB.users.getByEmail(email);
            
            if (existingUser) {
                alert('Cet email est déjà utilisé');
                hideLoading();
                return;
            }
            
            // Créer un nouvel utilisateur
            const newUser = {
                name,
                email,
                phone,
                country,
                city,
                password,
                role: 'member'
            };
            
            const user = DB.users.add(newUser);
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            registerScreen.classList.add('hidden');
            mainApp.classList.remove('hidden');
            showHomeScreen();
            updateUIForRole(user.role);
            updateProfileInfo();
            
            hideLoading();
        }, 1000);
    } else {
        alert('Veuillez remplir tous les champs');
    }
}

function logout() {
    showLoading();
    
    setTimeout(() => {
        currentUser = null;
        localStorage.removeItem('currentUser');
        showLogin();
        hideLoading();
    }, 500);
}

// Navigation Functions
function showHomeScreen() {
    homeScreen.classList.remove('hidden');
    depositScreen.classList.add('hidden');
    withdrawScreen.classList.add('hidden');
    historyScreen.classList.add('hidden');
    ceremoniesScreen.classList.add('hidden');
    addCeremonyScreen.classList.add('hidden');
    profileScreen.classList.add('hidden');
    editProfileScreen.classList.add('hidden');
    membersScreen.classList.add('hidden');
    
    // Update navigation
    navHome.classList.add('active');
    navDeposit.classList.remove('active');
    navHistory.classList.remove('active');
    navCeremonies.classList.remove('active');
    
    // Update data
    updateBalanceDisplay();
    loadRecentDeposits();
    loadUpcomingCeremonies();
}

function showDepositScreen() {
    homeScreen.classList.add('hidden');
    depositScreen.classList.remove('hidden');
    withdrawScreen.classList.add('hidden');
    historyScreen.classList.add('hidden');
    ceremoniesScreen.classList.add('hidden');
    addCeremonyScreen.classList.add('hidden');
    profileScreen.classList.add('hidden');
    editProfileScreen.classList.add('hidden');
    membersScreen.classList.add('hidden');
    
    // Update navigation
    navHome.classList.remove('active');
    navDeposit.classList.add('active');
    navHistory.classList.remove('active');
    navCeremonies.classList.remove('active');
}

function showWithdrawScreen() {
    homeScreen.classList.add('hidden');
    depositScreen.classList.add('hidden');
    withdrawScreen.classList.remove('hidden');
    historyScreen.classList.add('hidden');
    ceremoniesScreen.classList.add('hidden');
    addCeremonyScreen.classList.add('hidden');
    profileScreen.classList.add('hidden');
    editProfileScreen.classList.add('hidden');
    membersScreen.classList.add('hidden');
    
    // Charger la liste des cérémonies pour le sélecteur
    loadCeremoniesForSelect();
}

function showHistoryScreen() {
    homeScreen.classList.add('hidden');
    depositScreen.classList.add('hidden');
    withdrawScreen.classList.add('hidden');
    historyScreen.classList.remove('hidden');
    ceremoniesScreen.classList.add('hidden');
    addCeremonyScreen.classList.add('hidden');
    profileScreen.classList.add('hidden');
    editProfileScreen.classList.add('hidden');
    membersScreen.classList.add('hidden');
    
    // Update navigation
    navHome.classList.remove('active');
    navDeposit.classList.remove('active');
    navHistory.classList.add('active');
    navCeremonies.classList.remove('active');
    
    // Load transactions
    loadTransactions();
    loadUsersForFilter();
}

function showCeremoniesScreen() {
    homeScreen.classList.add('hidden');
    depositScreen.classList.add('hidden');
    withdrawScreen.classList.add('hidden');
    historyScreen.classList.add('hidden');
    ceremoniesScreen.classList.remove('hidden');
    addCeremonyScreen.classList.add('hidden');
    profileScreen.classList.add('hidden');
    editProfileScreen.classList.add('hidden');
    membersScreen.classList.add('hidden');
    
    // Update navigation
    navHome.classList.remove('active');
    navDeposit.classList.remove('active');
    navHistory.classList.remove('active');
    navCeremonies.classList.add('active');
    
    // Load ceremonies
    loadCeremonies();
}

function showAddCeremonyScreen() {
    homeScreen.classList.add('hidden');
    depositScreen.classList.add('hidden');
    withdrawScreen.classList.add('hidden');
    historyScreen.classList.add('hidden');
    ceremoniesScreen.classList.add('hidden');
    addCeremonyScreen.classList.remove('hidden');
    profileScreen.classList.add('hidden');
    editProfileScreen.classList.add('hidden');
    membersScreen.classList.add('hidden');
}

function showProfileScreen() {
    homeScreen.classList.add('hidden');
    depositScreen.classList.add('hidden');
    withdrawScreen.classList.add('hidden');
    historyScreen.classList.add('hidden');
    ceremoniesScreen.classList.add('hidden');
    addCeremonyScreen.classList.add('hidden');
    profileScreen.classList.remove('hidden');
    editProfileScreen.classList.add('hidden');
    membersScreen.classList.add('hidden');
    
    // Update profile info
    updateProfileInfo();
}

function showEditProfileScreen() {
    homeScreen.classList.add('hidden');
    depositScreen.classList.add('hidden');
    withdrawScreen.classList.add('hidden');
    historyScreen.classList.add('hidden');
    ceremoniesScreen.classList.add('hidden');
    addCeremonyScreen.classList.add('hidden');
    profileScreen.classList.add('hidden');
    editProfileScreen.classList.remove('hidden');
    membersScreen.classList.add('hidden');
    
    // Fill form with current user data
    document.getElementById('edit-name').value = currentUser.name;
    document.getElementById('edit-phone').value = currentUser.phone;
    document.getElementById('edit-country').value = currentUser.country;
    document.getElementById('edit-city').value = currentUser.city;
}

function showMembersScreen() {
    homeScreen.classList.add('hidden');
    depositScreen.classList.add('hidden');
    withdrawScreen.classList.add('hidden');
    historyScreen.classList.add('hidden');
    ceremoniesScreen.classList.add('hidden');
    addCeremonyScreen.classList.add('hidden');
    profileScreen.classList.add('hidden');
    editProfileScreen.classList.add('hidden');
    membersScreen.classList.remove('hidden');
    
    // Load members
    loadMembers();
}

// History Tab Functions
function showDepositsTab() {
    depositsTab.classList.add('active');
    withdrawalsTab.classList.remove('active');
    depositsContent.classList.remove('hidden');
    withdrawalsContent.classList.add('hidden');
}

function showWithdrawalsTab() {
    depositsTab.classList.remove('active');
    withdrawalsTab.classList.add('active');
    depositsContent.classList.add('hidden');
    withdrawalsContent.classList.remove('hidden');
}

// Update UI for user role
function updateUIForRole(role) {
    const adminElements = document.querySelectorAll('.admin-only');
    
    if (role === 'admin') {
        // Afficher les éléments d'administration
        adminElements.forEach(el => el.classList.remove('hidden'));
    } else {
        // Cacher les éléments d'administration
        adminElements.forEach(el => el.classList.add('hidden'));
    }
}

// Update balance display
function updateBalanceDisplay() {
    const balance = DB.transactions.getBalance();
    totalBalance.textContent = formatCurrency(balance.total) + ' GNF';
}

// Load recent deposits
function loadRecentDeposits() {
    const transactions = DB.transactions.getAll()
        .filter(tx => tx.type === 'deposit')
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);
    
    recentDeposits.innerHTML = '';
    
    if (transactions.length === 0) {
        recentDeposits.innerHTML = '<p class="no-data">Aucun dépôt récent</p>';
        return;
    }
    
    transactions.forEach(tx => {
        const depositItem = document.createElement('div');
        depositItem.className = 'deposit-item';
        depositItem.innerHTML = `
            <div class="user-info">
                <div class="user-avatar">${tx.userName ? tx.userName[0] : 'U'}</div>
                <div class="user-details">
                    <p class="user-name">${tx.userName || 'Utilisateur'}</p>
                    <p class="user-location">${tx.userCountry || ''}</p>
                </div>
            </div>
            <div class="deposit-details">
                <p class="deposit-amount">${formatCurrency(tx.amount)} GNF</p>
                <p class="deposit-date">${formatDate(tx.date)}</p>
            </div>
        `;
        recentDeposits.appendChild(depositItem);
    });
}

// Load upcoming ceremonies
function loadUpcomingCeremonies() {
    const ceremonies = DB.ceremonies.getAll()
        .filter(c => c.status === 'upcoming')
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 2);
    
    upcomingCeremonies.innerHTML = '';
    
    if (ceremonies.length === 0) {
        upcomingCeremonies.innerHTML = '<p class="no-data">Aucune cérémonie à venir</p>';
        return;
    }
    
    ceremonies.forEach(ceremony => {
        const ceremonyItem = document.createElement('div');
        ceremonyItem.className = 'ceremony-item';
        ceremonyItem.innerHTML = `
            <div class="event-info">
                <div class="event-icon">
                    <i class="fas fa-${ceremony.icon || 'calendar'}"></i>
                </div>
                <div class="event-details">
                    <p class="event-name">${ceremony.title}</p>
                    <p class="event-date">${formatDateFull(ceremony.date)}</p>
                </div>
            </div>
            <div class="ceremony-amount">
                <p>${formatCurrency(ceremony.amount)} GNF</p>
            </div>
        `;
        upcomingCeremonies.appendChild(ceremonyItem);
    });
}

// Load all ceremonies
function loadCeremonies() {
    const ceremonies = DB.ceremonies.getAll()
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    ceremoniesList.innerHTML = '';
    
    if (ceremonies.length === 0) {
        ceremoniesList.innerHTML = '<p class="no-data">Aucune cérémonie</p>';
        return;
    }
    
    ceremonies.forEach(ceremony => {
        const ceremonyCard = document.createElement('div');
        ceremonyCard.className = 'ceremony-card';
        ceremonyCard.innerHTML = `
            <div class="ceremony-image">
                <i class="fas fa-${ceremony.icon || 'calendar'}"></i>
            </div>
            <h3 class="ceremony-title">${ceremony.title}</h3>
            <p class="ceremony-date">${formatDateFull(ceremony.date)}</p>
            <p class="ceremony-amount">${formatCurrency(ceremony.amount)} GNF</p>
            <div class="ceremony-actions">
                <button class="ceremony-action-btn view-ceremony" data-id="${ceremony.id}">
                    <i class="fas fa-eye"></i> Détails
                </button>
            </div>
        `;
        ceremoniesList.appendChild(ceremonyCard);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-ceremony').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            viewCeremonyDetails(id);
        });
    });
}

// Load ceremonies for select dropdown
function loadCeremoniesForSelect() {
    const selectElement = document.getElementById('withdraw-ceremony');
    const ceremonies = DB.ceremonies.getAll()
        .filter(c => c.status === 'upcoming')
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Clear options except the first one
    selectElement.innerHTML = '<option value="">-- Aucune cérémonie --</option>';
    
    ceremonies.forEach(ceremony => {
        const option = document.createElement('option');
        option.value = ceremony.id;
        option.textContent = `${ceremony.title} (${formatDateFull(ceremony.date)})`;
        selectElement.appendChild(option);
    });
}

// Load all transactions
function loadTransactions() {
    const deposits = DB.transactions.getAll()
        .filter(tx => tx.type === 'deposit')
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const withdrawals = DB.transactions.getAll()
        .filter(tx => tx.type === 'withdrawal')
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    depositsContent.innerHTML = '';
    withdrawalsContent.innerHTML = '';
    
    if (deposits.length === 0) {
        depositsContent.innerHTML = '<p class="no-data">Aucun dépôt</p>';
    } else {
        deposits.forEach(tx => {
            const transactionItem = document.createElement('div');
            transactionItem.className = 'transaction-item';
            transactionItem.innerHTML = `
                <div class="user-info">
                    <div class="user-avatar">${tx.userName ? tx.userName[0] : 'U'}</div>
                    <div class="user-details">
                        <p class="user-name">${tx.userName || 'Utilisateur'}</p>
                        <p class="user-location">${tx.userCountry || ''}</p>
                    </div>
                </div>
                <div class="transaction-details">
                    <p class="transaction-amount">${formatCurrency(tx.amount)} GNF</p>
                    <p class="transaction-date">${formatDate(tx.date)}</p>
                </div>
            `;
            depositsContent.appendChild(transactionItem);
        });
    }
    
    if (withdrawals.length === 0) {
        withdrawalsContent.innerHTML = '<p class="no-data">Aucun retrait</p>';
    } else {
        withdrawals.forEach(tx => {
            const transactionItem = document.createElement('div');
            transactionItem.className = 'transaction-item';
            transactionItem.innerHTML = `
                <div class="event-info">
                    <div class="event-icon">
                        <i class="fas fa-${tx.ceremonyIcon || 'money-bill-wave'}"></i>
                    </div>
                    <div class="event-details">
                        <p class="event-name">${tx.description}</p>
                        <p class="event-date">${formatDate(tx.date)}</p>
                    </div>
                </div>
                <div class="transaction-details">
                    <p class="transaction-amount withdrawal">-${formatCurrency(tx.amount)} GNF</p>
                    <p class="transaction-date">${formatDate(tx.date)}</p>
                </div>
            `;
            withdrawalsContent.appendChild(transactionItem);
        });
    }
}

// Load users for filter
function loadUsersForFilter() {
    const selectElement = document.getElementById('user-filter');
    const users = DB.users.getAll();
    
    // Clear options except the first one
    selectElement.innerHTML = '<option value="all">Tous les membres</option>';
    
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.name;
        selectElement.appendChild(option);
    });
}

// Load all members (admin only)
function loadMembers() {
    const membersList = document.getElementById('members-list');
    const users = DB.users.getAll();
    
    membersList.innerHTML = '';
    
    users.forEach(user => {
        const memberItem = document.createElement('div');
        memberItem.className = 'member-item';
        memberItem.innerHTML = `
            <div class="user-info">
                <div class="user-avatar">${user.name ? user.name[0] : 'U'}</div>
                <div class="user-details">
                    <p class="user-name">${user.name}</p>
                    <p class="user-location">${user.country} - ${user.city}</p>
                </div>
            </div>
            <div class="user-role">
                <span class="badge ${user.role === 'admin' ? 'admin-badge' : 'member-badge'}">
                    ${user.role === 'admin' ? 'Admin' : 'Membre'}
                </span>
            </div>
        `;
        membersList.appendChild(memberItem);
    });
}

// Update profile info
function updateProfileInfo() {
    if (!currentUser) return;
    
    document.getElementById('profile-avatar').textContent = currentUser.name ? currentUser.name[0] : 'U';
    document.getElementById('profile-name').textContent = currentUser.name;
    document.getElementById('profile-role').textContent = currentUser.role === 'admin' ? 'Administrateur' : 'Membre';
    document.getElementById('profile-email').textContent = currentUser.email;
    document.getElementById('profile-phone').textContent = currentUser.phone;
    document.getElementById('profile-country').textContent = currentUser.country;
    document.getElementById('profile-city').textContent = currentUser.city;
}

// Save profile changes
function saveProfileChanges() {
    const name = document.getElementById('edit-name').value;
    const phone = document.getElementById('edit-phone').value;
    const country = document.getElementById('edit-country').value;
    const city = document.getElementById('edit-city').value;
    
    if (name && phone && country && city) {
        showLoading();
        
        setTimeout(() => {
            const updatedUser = {
                ...currentUser,
                name,
                phone,
                country,
                city
            };
            
            const success = DB.users.update(updatedUser);
            
            if (success) {
                currentUser = updatedUser;
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                showProfileScreen();
                alert('Profil mis à jour avec succès');
            } else {
                alert('Erreur lors de la mise à jour du profil');
            }
            
            hideLoading();
        }, 800);
    } else {
        alert('Veuillez remplir tous les champs');
    }
}

// Submit deposit
function submitDeposit() {
    const amount = parseInt(document.getElementById('deposit-amount').value);
    const selectedMethod = document.querySelector('.payment-method.active').getAttribute('data-method');
    
    if (amount < 300000) {
        alert('Le montant minimum est de 300 000 GNF');
        return;
    }
    
    showLoading();
    
    // Simuler une transaction Orange Money
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
                description: 'Versement mensuel'
            };
            
            DB.transactions.add(deposit);
            
            alert(`Dépôt de ${formatCurrency(amount)} GNF effectué avec succès sur le compte Orange Money de Thierno Sadou Bah (622538185)`);
            showHomeScreen();
        } else {
            alert('Le paiement par carte bancaire n\'est pas encore disponible. Veuillez utiliser Orange Money.');
        }
        
        hideLoading();
    }, 1500);
}

// Submit withdrawal (admin only)
function submitWithdrawal() {
    const amount = parseInt(document.getElementById('withdraw-amount').value);
    const reason = document.getElementById('withdraw-reason').value;
    const ceremonyId = document.getElementById('withdraw-ceremony').value;
    
    if (!amount || !reason) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    showLoading();
    
    setTimeout(() => {
        // Vérifier le solde
        const balance = DB.transactions.getBalance();
        if (amount > balance.total) {
            alert('Solde insuffisant pour effectuer ce retrait');
            hideLoading();
            return;
        }
        
        // Trouver la cérémonie si sélectionnée
        let ceremony = null;
        let ceremonyIcon = 'money-bill-wave';
        if (ceremonyId) {
            ceremony = DB.ceremonies.getById(parseInt(ceremonyId));
            if (ceremony) {
                ceremonyIcon = ceremony.icon || 'calendar';
            }
        }
        
        // Ajouter la transaction
        const withdrawal = {
            type: 'withdrawal',
            userId: currentUser.id,
            userName: currentUser.name,
            userCountry: currentUser.country,
            amount: amount,
            date: new Date().toISOString(),
            description: reason,
            ceremonyId: ceremony ? ceremony.id : null,
            ceremonyTitle: ceremony ? ceremony.title : null,
            ceremonyIcon: ceremonyIcon
        };
        
        DB.transactions.add(withdrawal);
        alert('Retrait effectué avec succès');
        showHomeScreen();
        
        hideLoading();
    }, 1000);
}

// Save new ceremony
function saveCeremony() {
    const title = document.getElementById('ceremony-title').value;
    const date = document.getElementById('ceremony-date').value;
    const amount = parseInt(document.getElementById('ceremony-amount').value);
    const description = document.getElementById('ceremony-description').value;
    
    if (!title || !date || !amount) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    showLoading();
    
    setTimeout(() => {
        // Déterminer l'icône en fonction du titre
        let icon = 'calendar';
        if (title.toLowerCase().includes('mariage')) {
            icon = 'ring';
        } else if (title.toLowerCase().includes('funérailles') || title.toLowerCase().includes('funerailles')) {
            icon = 'pray';
        } else if (title.toLowerCase().includes('naissance')) {
            icon = 'baby';
        } else if (title.toLowerCase().includes('anniversaire')) {
            icon = 'birthday-cake';
        }
        
        // Déterminer le statut en fonction de la date
        const ceremonyDate = new Date(date);
        const today = new Date();
        const status = ceremonyDate > today ? 'upcoming' : 'completed';
        
        // Créer la cérémonie
        const ceremony = {
            title,
            date,
            amount,
            description,
            status,
            icon
        };
        
        DB.ceremonies.add(ceremony);
        alert('Cérémonie ajoutée avec succès');
        showCeremoniesScreen();
        
        hideLoading();
    }, 800);
}

// View ceremony details
function viewCeremonyDetails(id) {
    const ceremony = DB.ceremonies.getById(id);
    
    if (!ceremony) {
        alert('Cérémonie non trouvée');
        return;
    }
    
    alert(`
        Titre: ${ceremony.title}
        Date: ${formatDateFull(ceremony.date)}
        Montant: ${formatCurrency(ceremony.amount)} GNF
        Description: ${ceremony.description || 'Aucune description'}
        Statut: ${ceremony.status === 'upcoming' ? 'À venir' : 'Terminée'}
    `);
}

// Loading overlay functions - version simplifiée et renforcée
function showLoading() {
    console.log('Affichage de l\'overlay de chargement');
    // Assurer que l'overlay est visible
    document.getElementById('loading-overlay').classList.remove('hidden');
}

function hideLoading() {
    console.log('Masquage de l\'overlay de chargement');
    // Masquer l'overlay
    document.getElementById('loading-overlay').classList.add('hidden');
}

// Utility functions
function formatCurrency(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
}

function formatDateFull(dateString) {
    const date = new Date(dateString);
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
}

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation de l\'application...');
    
    // Initialiser la base de données
    DB.init();
    
    // Initialiser les services
    if (typeof AuthService !== 'undefined') {
        AuthService.init();
    }
    
    if (typeof UIService !== 'undefined') {
        UIService.init();
    }
    
    // Vérifier si l'utilisateur est connecté
    const isLoggedIn = localStorage.getItem('sbahFamilyUser');
    console.log('État de connexion:', isLoggedIn ? 'Connecté' : 'Non connecté');
    
    // Masquer tous les écrans par défaut
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    
    // Afficher l'écran approprié
    if (isLoggedIn) {
        console.log('Affichage de l\'écran principal');
        document.getElementById('main-app').classList.remove('hidden');
        document.getElementById('home-screen').classList.remove('hidden');
        updateUIForRole(JSON.parse(isLoggedIn).role);
    } else {
        console.log('Affichage de l\'écran de connexion');
        document.getElementById('login-screen').classList.remove('hidden');
    }
    
    // Mettre à jour les compteurs du footer
    updateFooterCounters();
});

// Fonction pour mettre à jour les compteurs du footer
function updateFooterCounters() {
    // Récupérer les données depuis le localStorage
    const users = JSON.parse(localStorage.getItem('sbahFamilyUsers') || '[]');
    const transactions = JSON.parse(localStorage.getItem('sbahFamilyTransactions') || '[]');
    const ceremonies = JSON.parse(localStorage.getItem('sbahFamilyCeremonies') || '[]');
    
    // Mettre à jour les compteurs
    document.getElementById('members-count').textContent = users.length;
    document.getElementById('transactions-count').textContent = transactions.length;
    document.getElementById('ceremonies-count').textContent = ceremonies.length;
}
