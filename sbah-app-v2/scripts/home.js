// Initialisation des services
const authService = new AuthService();
const syncService = new SyncService();
const avatarService = new AvatarService();
const uiService = new UIService();

// État de l'application
const state = {
    user: null,
    balance: 0,
    stats: {
        activeMembers: 0,
        upcomingEvents: 0,
        monthlyPayments: 0
    },
    activities: []
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
    state.user = authService.getCurrentUser();
    if (state.user) {
        updateAvatar();
        updateUserInfo();
    }
}

// Mise à jour de l'avatar
function updateAvatar() {
    const avatarHtml = avatarService.generateAvatar(state.user.name);
    document.getElementById('user-avatar').innerHTML = avatarHtml;
}

// Mise à jour des informations utilisateur
function updateUserInfo() {
    document.getElementById('user-name').textContent = state.user.name;
    document.getElementById('user-role').textContent = state.user.role;
}

// Chargement des données
async function loadData() {
    try {
        // Chargement du solde
        const balance = await syncService.getBalance();
        state.balance = balance;
        updateBalance();

        // Chargement des statistiques
        const stats = await syncService.getStats();
        state.stats = stats;
        updateStats();

        // Chargement des activités récentes
        const activities = await syncService.getRecentActivities();
        state.activities = activities;
        updateActivities();

        // Mise à jour de la date de dernière mise à jour
        document.getElementById('last-update').textContent = formatDate(new Date());
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        uiService.showNotification('Erreur lors du chargement des données', 'error');
    }
}

// Mise à jour du solde
function updateBalance() {
    const balanceElement = document.getElementById('available-balance');
    balanceElement.textContent = formatCurrency(state.balance);
}

// Mise à jour des statistiques
function updateStats() {
    document.getElementById('active-members').textContent = state.stats.activeMembers;
    document.getElementById('upcoming-events').textContent = state.stats.upcomingEvents;
    document.getElementById('monthly-payments').textContent = formatCurrency(state.stats.monthlyPayments);
}

// Mise à jour des activités
function updateActivities() {
    const activitiesList = document.getElementById('activities-list');
    activitiesList.innerHTML = '';

    state.activities.forEach(activity => {
        const activityElement = createActivityElement(activity);
        activitiesList.appendChild(activityElement);
    });
}

// Création d'un élément d'activité
function createActivityElement(activity) {
    const div = document.createElement('div');
    div.className = 'activity-item';

    const iconClass = getActivityIconClass(activity.type);
    const icon = document.createElement('div');
    icon.className = `activity-icon ${iconClass}`;
    icon.innerHTML = `<i class="fas ${getActivityIcon(activity.type)}"></i>`;

    const info = document.createElement('div');
    info.className = 'activity-info';
    info.innerHTML = `
        <div class="activity-title">${activity.title}</div>
        <div class="activity-details">${activity.details}</div>
    `;

    const time = document.createElement('div');
    time.className = 'activity-time';
    time.textContent = formatTime(activity.timestamp);

    div.appendChild(icon);
    div.appendChild(info);
    div.appendChild(time);

    return div;
}

// Configuration des écouteurs d'événements
function initializeEventListeners() {
    // Actualisation du solde
    document.getElementById('refresh-balance').addEventListener('click', async () => {
        try {
            const balance = await syncService.getBalance();
            state.balance = balance;
            updateBalance();
            document.getElementById('last-update').textContent = formatDate(new Date());
            uiService.showNotification('Solde actualisé', 'success');
        } catch (error) {
            console.error('Erreur lors de l\'actualisation du solde:', error);
            uiService.showNotification('Erreur lors de l\'actualisation du solde', 'error');
        }
    });
}

// Utilitaires
function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'GNF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // Moins d'une heure
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }

    // Moins d'un jour
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    }

    // Moins d'une semaine
    if (diff < 604800000) {
        const days = Math.floor(diff / 86400000);
        return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    }

    // Sinon, date complète
    return formatDate(date);
}

function getActivityIcon(type) {
    switch (type) {
        case 'payment':
            return 'fa-money-bill-wave';
        case 'event':
            return 'fa-calendar-alt';
        case 'member':
            return 'fa-user';
        default:
            return 'fa-info-circle';
    }
}

function getActivityIconClass(type) {
    switch (type) {
        case 'payment':
            return 'payment';
        case 'event':
            return 'event';
        case 'member':
            return 'member';
        default:
            return '';
    }
} 