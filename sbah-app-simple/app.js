// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', function() {
    console.log('Application SBah Family initialisée');
    
    // Base de données simulée avec localStorage
    const DB = {
        // Initialiser la base de données
        init: function() {
            // Utilisateurs
            if (!localStorage.getItem('sbahUsers')) {
                localStorage.setItem('sbahUsers', JSON.stringify([
                    {
                        id: 1,
                        name: 'Thierno Sadou Bah',
                        email: 'admin@sbahfamily.com',
                        phone: '622538185',
                        country: 'Guinée',
                        city: 'Conakry',
                        password: 'admin123',
                        role: 'admin'
                    }
                ]));
            }
            
            // Transactions
            if (!localStorage.getItem('sbahTransactions')) {
                localStorage.setItem('sbahTransactions', JSON.stringify([
                    {
                        id: 1,
                        type: 'deposit',
                        userId: 1,
                        userName: 'Thierno Sadou Bah',
                        amount: 300000,
                        date: '2025-05-01T10:30:00',
                        paymentMethod: 'orange',
                        status: 'completed'
                    }
                ]));
            }
        },
        
        // Fonctions pour les utilisateurs
        users: {
            getAll: function() {
                return JSON.parse(localStorage.getItem('sbahUsers') || '[]');
            },
            getById: function(id) {
                const users = this.getAll();
                return users.find(user => user.id === id);
            },
            getByEmail: function(email) {
                const users = this.getAll();
                return users.find(user => user.email === email);
            },
            getByPhone: function(phone) {
                const users = this.getAll();
                return users.find(user => user.phone === phone);
            },
            add: function(user) {
                const users = this.getAll();
                const newUser = {
                    ...user,
                    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1
                };
                users.push(newUser);
                localStorage.setItem('sbahUsers', JSON.stringify(users));
                return newUser;
            }
        },
        
        // Fonctions pour les transactions
        transactions: {
            getAll: function() {
                return JSON.parse(localStorage.getItem('sbahTransactions') || '[]');
            },
            getById: function(id) {
                const transactions = this.getAll();
                return transactions.find(tx => tx.id === id);
            },
            getByUserId: function(userId) {
                const transactions = this.getAll();
                return transactions.filter(tx => tx.userId === userId);
            },
            add: function(transaction) {
                const transactions = this.getAll();
                const newTransaction = {
                    ...transaction,
                    id: transactions.length > 0 ? Math.max(...transactions.map(tx => tx.id)) + 1 : 1,
                    date: new Date().toISOString()
                };
                transactions.push(newTransaction);
                localStorage.setItem('sbahTransactions', JSON.stringify(transactions));
                return newTransaction;
            },
            getTotalBalance: function() {
                const transactions = this.getAll();
                let total = 0;
                transactions.forEach(tx => {
                    if (tx.type === 'deposit' && tx.status === 'completed') {
                        total += tx.amount;
                    } else if (tx.type === 'withdraw' && tx.status === 'completed') {
                        total -= tx.amount;
                    }
                });
                return total;
            }
        }
    };
    
    // Initialiser la base de données
    DB.init();
    
    // État global de l'application
    let currentUser = null;
    let selectedAmount = 300000;
    let selectedPaymentMethod = 'orange';

    // Référencer les éléments DOM
    const elements = {
        // Écrans
        loginScreen: document.getElementById('login-screen'),
        registerScreen: document.getElementById('register-screen'),
        mainApp: document.getElementById('main-app'),
        homeScreen: document.getElementById('home-screen'),
        depositScreen: document.getElementById('deposit-screen'),
        historyScreen: document.getElementById('history-screen'),
        loadingOverlay: document.getElementById('loading-overlay'),
        
        // Formulaire de connexion
        loginForm: {
            email: document.getElementById('email'),
            password: document.getElementById('password'),
            loginBtn: document.getElementById('login-btn'),
            registerLink: document.getElementById('register-link')
        },
        
        // Formulaire d'inscription
        registerForm: {
            name: document.getElementById('reg-name'),
            email: document.getElementById('reg-email'),
            phone: document.getElementById('reg-phone'),
            country: document.getElementById('reg-country'),
            city: document.getElementById('reg-city'),
            password: document.getElementById('reg-password'),
            registerBtn: document.getElementById('register-btn'),
            loginLink: document.getElementById('login-link')
        },
        
        // Écran d'accueil
        homeScreen: {
            userName: document.getElementById('user-name'),
            userCountry: document.getElementById('user-country'),
            totalBalance: document.getElementById('total-balance'),
            depositBtn: document.getElementById('deposit-btn'),
            historyBtn: document.getElementById('history-btn'),
            logoutBtn: document.getElementById('logout-btn'),
            recentDeposits: document.getElementById('recent-deposits')
        },
        
        // Écran de dépôt
        depositScreen: {
            backBtn: document.getElementById('deposit-back-btn'),
            amountOptions: document.querySelectorAll('.amount-option'),
            customAmountGroup: document.querySelector('.custom-amount-group'),
            customAmount: document.getElementById('custom-amount'),
            paymentMethods: document.querySelectorAll('.payment-method'),
            proceedBtn: document.getElementById('proceed-payment-btn')
        },
        
        // Écran d'historique
        historyScreen: {
            backBtn: document.getElementById('history-back-btn'),
            transactionsList: document.getElementById('transactions-list')
        }
    };

    // Fonctions utilitaires
    const utils = {
        // Formater un montant en GNF
        formatAmount: function(amount) {
            return new Intl.NumberFormat('fr-FR').format(amount) + ' GNF';
        },
        
        // Formater une date
        formatDate: function(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        },
        
        // Afficher un message d'alerte
        showAlert: function(message) {
            alert(message);
        },
        
        // Afficher le loader
        showLoading: function() {
            elements.loadingOverlay.classList.remove('hidden');
        },
        
        // Cacher le loader
        hideLoading: function() {
            elements.loadingOverlay.classList.add('hidden');
        }
    };

    // Fonctions de navigation
    const navigation = {
        // Afficher l'écran de connexion
        showLoginScreen: function() {
            elements.loginScreen.classList.remove('hidden');
            elements.registerScreen.classList.add('hidden');
            elements.mainApp.classList.add('hidden');
        },
        
        // Afficher l'écran d'inscription
        showRegisterScreen: function() {
            elements.loginScreen.classList.add('hidden');
            elements.registerScreen.classList.remove('hidden');
            elements.mainApp.classList.add('hidden');
        },
        
        // Afficher l'application principale
        showMainApp: function() {
            elements.loginScreen.classList.add('hidden');
            elements.registerScreen.classList.add('hidden');
            elements.mainApp.classList.remove('hidden');
            elements.homeScreen.classList.remove('hidden');
            elements.depositScreen.classList.add('hidden');
            elements.historyScreen.classList.add('hidden');
        },
        
        // Afficher l'écran d'accueil
        showHomeScreen: function() {
            elements.homeScreen.classList.remove('hidden');
            elements.depositScreen.classList.add('hidden');
            elements.historyScreen.classList.add('hidden');
            
            // Mettre à jour le solde total
            elements.homeScreen.totalBalance.textContent = utils.formatAmount(DB.transactions.getTotalBalance());
            
            // Charger les transactions récentes
            app.loadRecentTransactions();
        },
        
        // Afficher l'écran de dépôt
        showDepositScreen: function() {
            elements.homeScreen.classList.add('hidden');
            elements.depositScreen.classList.remove('hidden');
            elements.historyScreen.classList.add('hidden');
        },
        
        // Afficher l'écran d'historique
        showHistoryScreen: function() {
            elements.homeScreen.classList.add('hidden');
            elements.depositScreen.classList.add('hidden');
            elements.historyScreen.classList.remove('hidden');
            
            // Charger toutes les transactions
            app.loadAllTransactions();
        }
    };

    // Fonctions principales de l'application
    const app = {
        // Initialiser l'application
        init: function() {
            // Vérifier si un utilisateur est déjà connecté
            const savedUser = localStorage.getItem('currentUser');
            if (savedUser) {
                currentUser = JSON.parse(savedUser);
                this.updateUserInfo();
                navigation.showMainApp();
            } else {
                navigation.showLoginScreen();
            }
            
            // Attacher les événements
            this.attachEvents();
        },
        
        // Attacher les gestionnaires d'événements
        attachEvents: function() {
            // Événements de connexion et inscription
            elements.loginForm.loginBtn.addEventListener('click', this.login.bind(this));
            elements.registerForm.registerBtn.addEventListener('click', this.register.bind(this));
            elements.loginForm.registerLink.addEventListener('click', navigation.showRegisterScreen);
            elements.registerForm.loginLink.addEventListener('click', navigation.showLoginScreen);
            
            // Événements de navigation
            elements.homeScreen.depositBtn.addEventListener('click', navigation.showDepositScreen);
            elements.homeScreen.historyBtn.addEventListener('click', navigation.showHistoryScreen);
            elements.depositScreen.backBtn.addEventListener('click', navigation.showHomeScreen);
            elements.historyScreen.backBtn.addEventListener('click', navigation.showHomeScreen);
            elements.homeScreen.logoutBtn.addEventListener('click', this.logout.bind(this));
            
            // Événements de l'écran de dépôt
            elements.depositScreen.amountOptions.forEach(option => {
                option.addEventListener('click', this.selectAmount.bind(this));
            });
            
            elements.depositScreen.paymentMethods.forEach(method => {
                method.addEventListener('click', this.selectPaymentMethod.bind(this));
            });
            
            elements.depositScreen.proceedBtn.addEventListener('click', this.proceedPayment.bind(this));
        },
        
        // Mettre à jour les informations de l'utilisateur
        updateUserInfo: function() {
            if (currentUser) {
                // Mettre à jour le nom et le pays
                elements.homeScreen.userName.textContent = currentUser.name;
                elements.homeScreen.userCountry.textContent = currentUser.country;
                
                // Mettre à jour les initiales de l'avatar
                const initials = document.getElementById('user-initials');
                if (initials) {
                    const nameParts = currentUser.name.split(' ');
                    if (nameParts.length >= 2) {
                        initials.textContent = nameParts[0][0] + nameParts[1][0];
                    } else if (nameParts.length === 1) {
                        initials.textContent = nameParts[0][0];
                    }
                }
                
                // Afficher ou masquer les éléments réservés aux administrateurs
                const adminElements = document.querySelectorAll('.admin-only');
                adminElements.forEach(el => {
                    if (currentUser.role === 'admin') {
                        el.classList.remove('hidden');
                        
                        // Ajouter un badge admin près du nom si ce n'est pas déjà fait
                        if (!document.querySelector('.admin-badge')) {
                            const badge = document.createElement('span');
                            badge.className = 'admin-badge';
                            badge.textContent = 'Admin';
                            elements.homeScreen.userName.appendChild(badge);
                        }
                    } else {
                        el.classList.add('hidden');
                    }
                });
                
                // Ajouter une animation de fade-in pour indiquer que le chargement est terminé
                elements.homeScreen.userName.classList.add('fade-in');
                elements.homeScreen.userCountry.classList.add('fade-in');
            }
        },
        
        // Charger les transactions récentes
        loadRecentTransactions: function() {
            const recentTransactions = DB.transactions.getAll()
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5);
                
            elements.homeScreen.recentDeposits.innerHTML = '';
            
            if (recentTransactions.length === 0) {
                elements.homeScreen.recentDeposits.innerHTML = '<p class="empty-message">Aucune transaction récente</p>';
                return;
            }
            
            recentTransactions.forEach(tx => {
                const item = document.createElement('div');
                item.className = 'transaction-item';
                item.innerHTML = `
                    <div class="transaction-info">
                        <h4>${tx.userName}</h4>
                        <p>${utils.formatDate(tx.date)}</p>
                    </div>
                    <div class="transaction-amount">${utils.formatAmount(tx.amount)}</div>
                `;
                elements.homeScreen.recentDeposits.appendChild(item);
            });
        },
        
        // Charger toutes les transactions
        loadAllTransactions: function() {
            const allTransactions = DB.transactions.getAll()
                .sort((a, b) => new Date(b.date) - new Date(a.date));
                
            elements.historyScreen.transactionsList.innerHTML = '';
            
            if (allTransactions.length === 0) {
                elements.historyScreen.transactionsList.innerHTML = '<p class="empty-message">Aucune transaction</p>';
                return;
            }
            
            allTransactions.forEach(tx => {
                const item = document.createElement('div');
                item.className = 'transaction-item';
                item.innerHTML = `
                    <div class="transaction-info">
                        <h4>${tx.userName}</h4>
                        <p>${utils.formatDate(tx.date)}</p>
                    </div>
                    <div class="transaction-amount">${utils.formatAmount(tx.amount)}</div>
                `;
                elements.historyScreen.transactionsList.appendChild(item);
            });
        },
        
        // Se connecter
        login: function() {
            const emailOrPhone = elements.loginForm.email.value.trim();
            const password = elements.loginForm.password.value.trim();
            
            if (!emailOrPhone || !password) {
                utils.showAlert('Veuillez remplir tous les champs');
                return;
            }
            
            utils.showLoading();
            console.log("Tentative de connexion avec:", emailOrPhone, password);
            
            // Simuler un délai réseau court
            setTimeout(() => {
                console.log("Utilisateurs disponibles:", DB.users.getAll());
                
                let user = DB.users.getByEmail(emailOrPhone);
                if (!user) {
                    user = DB.users.getByPhone(emailOrPhone);
                }
                
                console.log("Utilisateur trouvé:", user);
                
                if (!user || user.password !== password) {
                    utils.hideLoading();
                    utils.showAlert('Identifiants incorrects');
                    return;
                }
                
                currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                // S'assurer que le DOM est mis à jour
                this.updateUserInfo();
                
                // Mettre à jour l'interface
                navigation.showMainApp();
                
                // Masquer le loader
                utils.hideLoading();
                
                console.log("Connexion réussie, utilisateur:", currentUser);
            }, 500); // Réduire le délai
        },
        
        // S'inscrire
        register: function() {
            const name = elements.registerForm.name.value.trim();
            const email = elements.registerForm.email.value.trim();
            const phone = elements.registerForm.phone.value.trim();
            const country = elements.registerForm.country.value;
            const city = elements.registerForm.city.value.trim();
            const password = elements.registerForm.password.value.trim();
            
            if (!name || !email || !phone || !country || !city || !password) {
                utils.showAlert('Veuillez remplir tous les champs');
                return;
            }
            
            // Vérifier si l'email ou le téléphone existe déjà
            if (DB.users.getByEmail(email)) {
                utils.showAlert('Cet email est déjà utilisé');
                return;
            }
            
            if (DB.users.getByPhone(phone)) {
                utils.showAlert('Ce numéro de téléphone est déjà utilisé');
                return;
            }
            
            utils.showLoading();
            
            // Simuler un délai réseau
            setTimeout(() => {
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
                
                this.updateUserInfo();
                navigation.showMainApp();
                
                utils.hideLoading();
            }, 1000);
        },
        
        // Se déconnecter
        logout: function() {
            currentUser = null;
            localStorage.removeItem('currentUser');
            navigation.showLoginScreen();
        },
        
        // Sélectionner un montant
        selectAmount: function(event) {
            const option = event.currentTarget;
            
            // Désélectionner toutes les options
            elements.depositScreen.amountOptions.forEach(opt => {
                opt.classList.remove('active');
            });
            
            // Sélectionner l'option cliquée
            option.classList.add('active');
            
            const amount = option.getAttribute('data-amount');
            
            if (amount === 'custom') {
                elements.depositScreen.customAmountGroup.classList.remove('hidden');
                selectedAmount = parseInt(elements.depositScreen.customAmount.value) || 0;
            } else {
                elements.depositScreen.customAmountGroup.classList.add('hidden');
                selectedAmount = parseInt(amount);
            }
        },
        
        // Mettre à jour le montant personnalisé
        updateCustomAmount: function() {
            selectedAmount = parseInt(elements.depositScreen.customAmount.value) || 0;
        },
        
        // Sélectionner une méthode de paiement
        selectPaymentMethod: function(event) {
            const method = event.currentTarget;
            
            // Désélectionner toutes les méthodes
            elements.depositScreen.paymentMethods.forEach(m => {
                m.classList.remove('active');
            });
            
            // Sélectionner la méthode cliquée
            method.classList.add('active');
            
            selectedPaymentMethod = method.getAttribute('data-method');
        },
        
        // Procéder au paiement
        proceedPayment: function() {
            // Vérifier si un montant valide est sélectionné
            if (selectedAmount <= 0) {
                utils.showAlert('Veuillez sélectionner un montant valide');
                return;
            }
            
            utils.showLoading();
            
            // Si c'est un montant personnalisé, prendre la valeur du champ
            if (document.querySelector('.amount-option.active').getAttribute('data-amount') === 'custom') {
                selectedAmount = parseInt(elements.depositScreen.customAmount.value) || 0;
                
                if (selectedAmount <= 0) {
                    utils.hideLoading();
                    utils.showAlert('Veuillez entrer un montant valide');
                    return;
                }
            }
            
            // Créer l'objet de paiement pour PayDunya
            const paymentData = {
                amount: selectedAmount,
                method: selectedPaymentMethod,
                userId: currentUser.id,
                userName: currentUser.name,
                userEmail: currentUser.email,
                userPhone: currentUser.phone
            };
            
            // Utiliser le service PayDunya
            PayDunyaService.initiatePayment(paymentData)
                .then(result => {
                    utils.hideLoading();
                    
                    // Pour la démonstration, simuler un paiement réussi
                    const transaction = {
                        type: 'deposit',
                        userId: currentUser.id,
                        userName: currentUser.name,
                        amount: selectedAmount,
                        paymentMethod: selectedPaymentMethod,
                        status: 'completed'
                    };
                    
                    DB.transactions.add(transaction);
                    
                    utils.showAlert('Paiement effectué avec succès !');
                    navigation.showHomeScreen();
                })
                .catch(error => {
                    utils.hideLoading();
                    utils.showAlert('Erreur lors du paiement : ' + error.message);
                });
        }
    };

    // Ajouter un écouteur pour le champ de montant personnalisé
    if (elements.depositScreen.customAmount) {
        elements.depositScreen.customAmount.addEventListener('input', app.updateCustomAmount.bind(app));
    }

    // Initialiser l'application
    app.init();
});
