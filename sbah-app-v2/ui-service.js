// Service de gestion de l'interface utilisateur
const UIService = {
    currentScreen: null,

    init() {
        this.setupEventListeners();
        this.showScreen('login-screen');
    },

    setupEventListeners() {
        // Navigation principale
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const screenId = e.currentTarget.id.replace('nav-', '');
                this.showScreen(`${screenId}-screen`);
            });
        });

        // Boutons retour
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showScreen('home-screen');
            });
        });
    },

    showScreen(screenId) {
        // Cacher tous les écrans
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });

        // Afficher l'écran demandé
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.remove('hidden');
            this.currentScreen = screenId;

            // Mettre à jour la navigation
            this.updateNavigation(screenId);
        }
    },

    updateNavigation(screenId) {
        // Mettre à jour les items de navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.id === `nav-${screenId.replace('-screen', '')}`) {
                item.classList.add('active');
            }
        });
    },

    showLoading() {
        document.getElementById('loading-overlay').classList.remove('hidden');
    },

    hideLoading() {
        document.getElementById('loading-overlay').classList.add('hidden');
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