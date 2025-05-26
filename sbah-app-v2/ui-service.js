// Service de gestion de l'interface utilisateur
const UIService = {
    currentScreen: null,

    init() {
        this.setupEventListeners();
        this.showScreen('login-screen');
    },

    setupEventListeners() {
        // Login & Register
        document.getElementById('login-btn')?.addEventListener('click', this.handleLogin.bind(this));
        document.getElementById('register-btn')?.addEventListener('click', this.handleRegister.bind(this));
        document.getElementById('register-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showScreen('register-screen');
        });
        document.getElementById('login-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showScreen('login-screen');
        });

        // Navigation
        document.getElementById('nav-home')?.addEventListener('click', () => this.showScreen('home-screen'));
        document.getElementById('nav-deposit')?.addEventListener('click', () => this.showScreen('deposit-screen'));
        document.getElementById('nav-history')?.addEventListener('click', () => this.showScreen('history-screen'));
        document.getElementById('nav-ceremonies')?.addEventListener('click', () => this.showScreen('ceremonies-screen'));

        // Back buttons
        const backButtons = document.querySelectorAll('.back-btn');
        backButtons.forEach(btn => {
            btn.addEventListener('click', () => this.showScreen('home-screen'));
        });
    },

    showScreen(screenId) {
        // Masquer tous les écrans
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });

        // Afficher l'écran demandé
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.remove('hidden');
            this.currentScreen = screenId;

            // Si c'est l'écran principal, s'assurer que main-app est visible
            if (screenId !== 'login-screen' && screenId !== 'register-screen') {
                document.getElementById('main-app')?.classList.remove('hidden');
            }

            // Mettre à jour la navigation active
            this.updateNavigation(screenId);
        }
    },

    updateNavigation(screenId) {
        // Retirer la classe active de tous les éléments de navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Ajouter la classe active à l'élément correspondant
        switch (screenId) {
            case 'home-screen':
                document.getElementById('nav-home')?.classList.add('active');
                break;
            case 'deposit-screen':
                document.getElementById('nav-deposit')?.classList.add('active');
                break;
            case 'history-screen':
                document.getElementById('nav-history')?.classList.add('active');
                break;
            case 'ceremonies-screen':
                document.getElementById('nav-ceremonies')?.classList.add('active');
                break;
        }
    },

    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // TODO: Implémenter la logique de connexion
        console.log('Tentative de connexion avec:', { email, password });
    },

    handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const phone = document.getElementById('reg-phone').value;
        const country = document.getElementById('reg-country').value;
        const city = document.getElementById('reg-city').value;
        const password = document.getElementById('reg-password').value;

        // TODO: Implémenter la logique d'inscription
        console.log('Tentative d\'inscription avec:', { name, email, phone, country, city, password });
    },

    showLoading() {
        document.getElementById('loading-overlay')?.classList.remove('hidden');
    },

    hideLoading() {
        document.getElementById('loading-overlay')?.classList.add('hidden');
    },

    updateBalance(amount) {
        const balanceElement = document.getElementById('total-balance');
        if (balanceElement) {
            balanceElement.textContent = this.formatAmount(amount) + ' GNF';
        }
    },

    formatAmount(amount) {
        return new Intl.NumberFormat('fr-FR').format(amount);
    },

    updateUserInfo(user) {
        if (user) {
            document.getElementById('profile-name').textContent = user.name;
            document.getElementById('profile-email').textContent = user.email;
            document.getElementById('profile-phone').textContent = user.phone || 'Non renseigné';
            document.getElementById('profile-country').textContent = user.country || 'Non renseigné';
            document.getElementById('profile-city').textContent = user.city || 'Non renseigné';
        }
    }
}; 