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
    recentActivities: []
};

// Vérifier l'authentification au chargement de la page
document.addEventListener('DOMContentLoaded', async () => {
    if (!authService.checkAuth()) return;
    
    state.user = authService.getCurrentUser();
    await initializeComponents();
    await loadData();
});

// Initialiser les composants
async function initializeComponents() {
    // Mettre à jour l'avatar et les informations utilisateur
    updateUserInfo();
    
    // Ajouter les écouteurs d'événements
    document.getElementById('refreshBalance').addEventListener('click', loadData);
}

// Charger les données
async function loadData() {
    try {
        const loadingModal = uiService.showLoadingModal('Chargement des données...');
        
        // Charger le solde
        state.balance = await syncService.getBalance();
        
        // Charger les statistiques
        state.stats = await syncService.getStats();
        
        // Charger les activités récentes
        state.recentActivities = await syncService.getRecentActivities();
        
        // Mettre à jour l'interface
        updateUI();
        
        uiService.hideLoadingModal(loadingModal);
    } catch (error) {
        uiService.showError('Erreur lors du chargement des données');
    }
}

// Mettre à jour les informations utilisateur
function updateUserInfo() {
    const userAvatar = document.querySelector('.profile-avatar');
    if (userAvatar) {
        const avatar = avatarService.generateAvatar(state.user.id);
        userAvatar.innerHTML = avatar.innerHTML;
        userAvatar.className = avatar.className;
    }
    
    const userName = document.querySelector('.profile-info h3');
    if (userName) {
        userName.textContent = state.user.name;
    }
    
    const userRole = document.querySelector('.profile-info p');
    if (userRole) {
        userRole.textContent = state.user.role;
    }
}

// Mettre à jour l'interface
function updateUI() {
    // Mettre à jour le solde
    const balanceElement = document.querySelector('.balance-amount');
    if (balanceElement) {
        balanceElement.textContent = uiService.formatAmount(state.balance);
    }
    
    // Mettre à jour les statistiques
    const statsElements = {
        activeMembers: document.querySelector('.stat-card:nth-child(1) .stat-value'),
        upcomingEvents: document.querySelector('.stat-card:nth-child(2) .stat-value'),
        monthlyPayments: document.querySelector('.stat-card:nth-child(3) .stat-value')
    };
    
    Object.entries(statsElements).forEach(([key, element]) => {
        if (element) {
            element.textContent = key === 'monthlyPayments' 
                ? uiService.formatAmount(state.stats[key])
                : state.stats[key];
        }
    });
    
    // Mettre à jour les activités récentes
    const activitiesList = document.querySelector('.activity-list');
    if (activitiesList) {
        activitiesList.innerHTML = state.recentActivities
            .map(activity => createActivityElement(activity))
            .join('');
    }
}

// Créer un élément d'activité
function createActivityElement(activity) {
    const icon = getActivityIcon(activity.type);
    const timeAgo = uiService.formatRelativeDate(activity.timestamp);
    
    return `
        <div class="activity-item">
            <div class="activity-icon ${activity.type}">
                <i class="${icon}"></i>
            </div>
            <div class="activity-content">
                <h4>${activity.title}</h4>
                <p>${activity.details}</p>
                <span class="activity-time">${timeAgo}</span>
            </div>
        </div>
    `;
}

// Obtenir l'icône correspondant au type d'activité
function getActivityIcon(type) {
    const icons = {
        payment: 'fas fa-money-bill-wave',
        event: 'fas fa-calendar-alt',
        member: 'fas fa-user-plus'
    };
    return icons[type] || 'fas fa-info-circle';
} 