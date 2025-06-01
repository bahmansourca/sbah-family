// Initialisation des services
const authService = new AuthService();
const syncService = new SyncService();
const avatarService = new AvatarService();
const uiService = new UIService();

// État de l'application
const state = {
    activities: [],
    filters: {
        search: '',
        type: 'all',
        period: 'all'
    },
    viewMode: 'grid',
    selectedActivity: null
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
    const user = authService.getCurrentUser();
    if (user) {
        document.getElementById('user-avatar').innerHTML = avatarService.generateAvatar(user.name);
        document.getElementById('user-name').textContent = user.name;
        document.getElementById('user-role').textContent = user.role;
    }
}

// Chargement des données
async function loadData() {
    try {
        // Chargement des activités
        const activities = await syncService.getActivities();
        state.activities = activities;
        
        // Mise à jour des statistiques
        updateStats();
        
        // Mise à jour de l'affichage des activités
        updateActivitiesDisplay();
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        uiService.showNotification('Erreur lors du chargement des données', 'error');
    }
}

// Mise à jour des statistiques
function updateStats() {
    const totalPayments = state.activities
        .filter(activity => activity.type === 'payment')
        .reduce((sum, activity) => sum + (activity.amount || 0), 0);
    
    const totalEvents = state.activities
        .filter(activity => activity.type === 'event')
        .length;
    
    const newMembers = state.activities
        .filter(activity => activity.type === 'member' && activity.action === 'create')
        .length;
    
    const totalActivities = state.activities.length;

    document.getElementById('total-payments').textContent = uiService.formatCurrency(totalPayments);
    document.getElementById('total-events').textContent = totalEvents;
    document.getElementById('new-members').textContent = newMembers;
    document.getElementById('total-activities').textContent = totalActivities;
}

// Mise à jour de l'affichage des activités
function updateActivitiesDisplay() {
    const container = document.getElementById('timeline-container');
    const filteredActivities = filterActivities();

    container.innerHTML = filteredActivities.map(activity => `
        <div class="activity-card" data-id="${activity.id}">
            <div class="activity-header">
                <div class="activity-icon">
                    ${getActivityIcon(activity.type)}
                </div>
                <div class="activity-info">
                    <h3>${getActivityTitle(activity)}</h3>
                    <p>${getActivitySubtitle(activity)}</p>
                </div>
            </div>
            <div class="activity-content">
                <p class="activity-description">${activity.description}</p>
                <div class="activity-meta">
                    ${activity.amount ? `
                        <span class="activity-amount">${uiService.formatCurrency(activity.amount)}</span>
                    ` : ''}
                    <span class="activity-date">
                        <i class="fas fa-clock"></i>
                        ${formatDate(activity.date)}
                    </span>
                </div>
            </div>
        </div>
    `).join('');

    // Ajouter les écouteurs d'événements pour les cartes
    document.querySelectorAll('.activity-card').forEach(card => {
        card.addEventListener('click', () => {
            const activityId = card.dataset.id;
            const activity = state.activities.find(a => a.id === activityId);
            if (activity) {
                showActivityDetails(activity);
            }
        });
    });
}

// Filtrage des activités
function filterActivities() {
    return state.activities.filter(activity => {
        // Filtre de recherche
        if (state.filters.search && !activity.description.toLowerCase().includes(state.filters.search.toLowerCase())) {
            return false;
        }

        // Filtre de type
        if (state.filters.type !== 'all' && activity.type !== state.filters.type) {
            return false;
        }

        // Filtre de période
        if (state.filters.period !== 'all') {
            const activityDate = new Date(activity.date);
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const yearStart = new Date(now.getFullYear(), 0, 1);

            switch (state.filters.period) {
                case 'today':
                    if (activityDate < today) return false;
                    break;
                case 'week':
                    if (activityDate < weekStart) return false;
                    break;
                case 'month':
                    if (activityDate < monthStart) return false;
                    break;
                case 'year':
                    if (activityDate < yearStart) return false;
                    break;
            }
        }

        return true;
    });
}

// Configuration des écouteurs d'événements
function initializeEventListeners() {
    // Filtres
    document.getElementById('history-search').addEventListener('input', debounce((e) => {
        state.filters.search = e.target.value;
        updateActivitiesDisplay();
    }, 300));

    document.getElementById('type-filter').addEventListener('change', (e) => {
        state.filters.type = e.target.value;
        updateActivitiesDisplay();
    });

    document.getElementById('period-filter').addEventListener('change', (e) => {
        state.filters.period = e.target.value;
        updateActivitiesDisplay();
    });

    document.getElementById('reset-filters').addEventListener('click', () => {
        state.filters = {
            search: '',
            type: 'all',
            period: 'all'
        };
        document.getElementById('history-search').value = '';
        document.getElementById('type-filter').value = 'all';
        document.getElementById('period-filter').value = 'all';
        updateActivitiesDisplay();
    });

    // Mode d'affichage
    document.getElementById('timeline-view-toggle').addEventListener('click', () => {
        const container = document.getElementById('timeline-container');
        const isListView = container.classList.contains('list-view');
        container.classList.toggle('list-view');
        document.getElementById('timeline-view-toggle').querySelector('i').className = 
            isListView ? 'fas fa-th-large' : 'fas fa-list';
    });

    // Export
    document.getElementById('export-history').addEventListener('click', exportHistory);

    // Modal de détails
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('active');
            });
        });
    });
}

// Affichage des détails d'une activité
function showActivityDetails(activity) {
    state.selectedActivity = activity;
    const modal = document.getElementById('activity-details-modal');

    // Mise à jour des informations
    document.getElementById('activity-title').textContent = getActivityTitle(activity);
    document.getElementById('activity-type').textContent = getActivityTypeName(activity.type);
    document.getElementById('activity-date').textContent = formatDate(activity.date);
    document.getElementById('activity-user').textContent = activity.user;
    document.getElementById('activity-description').textContent = activity.description;
    
    // Mise à jour de l'icône
    document.getElementById('activity-icon').innerHTML = getActivityIcon(activity.type);

    // Affichage conditionnel du montant
    const amountContainer = document.getElementById('activity-amount-container');
    const amountElement = document.getElementById('activity-amount');
    if (activity.amount) {
        amountElement.textContent = uiService.formatCurrency(activity.amount);
        amountContainer.style.display = 'flex';
    } else {
        amountContainer.style.display = 'none';
    }

    // Afficher le modal
    modal.classList.add('active');
}

// Export de l'historique
async function exportHistory() {
    try {
        const filteredActivities = filterActivities();
        const csv = convertToCSV(filteredActivities);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `historique_${formatDate(new Date())}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        uiService.showNotification('Export réussi', 'success');
    } catch (error) {
        console.error('Erreur lors de l\'export:', error);
        uiService.showNotification('Erreur lors de l\'export', 'error');
    }
}

// Utilitaires
function getActivityIcon(type) {
    const icons = {
        payment: '<i class="fas fa-money-bill-wave"></i>',
        event: '<i class="fas fa-calendar-alt"></i>',
        member: '<i class="fas fa-user"></i>'
    };
    return icons[type] || '<i class="fas fa-info-circle"></i>';
}

function getActivityTitle(activity) {
    switch (activity.type) {
        case 'payment':
            return `Paiement de ${uiService.formatCurrency(activity.amount)}`;
        case 'event':
            return `Événement : ${activity.title}`;
        case 'member':
            return `${activity.action === 'create' ? 'Nouveau membre' : 'Mise à jour membre'} : ${activity.user}`;
        default:
            return activity.title || 'Activité';
    }
}

function getActivitySubtitle(activity) {
    switch (activity.type) {
        case 'payment':
            return `Par ${activity.user}`;
        case 'event':
            return `Créé par ${activity.user}`;
        case 'member':
            return activity.action === 'create' ? 'Inscription' : 'Modification';
        default:
            return activity.user;
    }
}

function getActivityTypeName(type) {
    const types = {
        payment: 'Paiement',
        event: 'Événement',
        member: 'Membre'
    };
    return types[type] || type;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function convertToCSV(activities) {
    const headers = ['Date', 'Type', 'Utilisateur', 'Description', 'Montant'];
    const rows = activities.map(activity => [
        formatDate(activity.date),
        getActivityTypeName(activity.type),
        activity.user,
        activity.description,
        activity.amount ? uiService.formatCurrency(activity.amount) : ''
    ]);
    
    return [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
} 