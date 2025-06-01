// Initialisation des services
const authService = new AuthService();
const syncService = new SyncService();
const avatarService = new AvatarService();
const uiService = new UIService();

// État de l'application
const state = {
    members: [],
    filters: {
        search: '',
        role: 'all',
        status: 'all'
    },
    viewMode: 'grid',
    selectedMember: null
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
        // Chargement des membres
        const members = await syncService.getMembers();
        state.members = members;
        
        // Mise à jour des statistiques
        updateStats();
        
        // Mise à jour de l'affichage des membres
        updateMembersDisplay();
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        uiService.showNotification('Erreur lors du chargement des données', 'error');
    }
}

// Mise à jour des statistiques
function updateStats() {
    const totalMembers = state.members.length;
    const activeMembers = state.members.filter(member => member.status === 'active').length;
    const totalContributions = state.members.reduce((sum, member) => sum + (member.contributions || 0), 0);
    const totalEvents = state.members.reduce((sum, member) => sum + (member.events || 0), 0);

    document.getElementById('total-members').textContent = totalMembers;
    document.getElementById('active-members').textContent = activeMembers;
    document.getElementById('total-contributions').textContent = uiService.formatCurrency(totalContributions);
    document.getElementById('total-events').textContent = totalEvents;
}

// Mise à jour de l'affichage des membres
function updateMembersDisplay() {
    const container = document.getElementById('members-container');
    const filteredMembers = filterMembers();

    container.innerHTML = filteredMembers.map(member => `
        <div class="member-card" data-id="${member.id}">
            <div class="member-header">
                <div class="member-avatar">
                    ${avatarService.generateAvatar(member.name)}
                </div>
                <div class="member-info">
                    <h3>${member.name}</h3>
                    <p>${member.email}</p>
                    <span class="member-role">${getRoleName(member.role)}</span>
                </div>
            </div>
            <div class="member-content">
                <div class="member-stats">
                    <div class="stat-item">
                        <h4>Contributions</h4>
                        <p>${uiService.formatCurrency(member.contributions || 0)}</p>
                    </div>
                    <div class="stat-item">
                        <h4>Événements</h4>
                        <p>${member.events || 0}</p>
                    </div>
                </div>
            </div>
            <div class="member-footer">
                <span class="status-badge ${member.status}">${getStatusName(member.status)}</span>
                <button class="btn-icon view-member" title="Voir les détails">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    `).join('');

    // Ajouter les écouteurs d'événements pour les cartes
    document.querySelectorAll('.member-card').forEach(card => {
        card.addEventListener('click', () => {
            const memberId = card.dataset.id;
            const member = state.members.find(m => m.id === memberId);
            if (member) {
                showMemberDetails(member);
            }
        });
    });
}

// Filtrage des membres
function filterMembers() {
    return state.members.filter(member => {
        // Filtre de recherche
        if (state.filters.search && !member.name.toLowerCase().includes(state.filters.search.toLowerCase())) {
            return false;
        }

        // Filtre de rôle
        if (state.filters.role !== 'all' && member.role !== state.filters.role) {
            return false;
        }

        // Filtre de statut
        if (state.filters.status !== 'all' && member.status !== state.filters.status) {
            return false;
        }

        return true;
    });
}

// Configuration des écouteurs d'événements
function initializeEventListeners() {
    // Filtres
    document.getElementById('member-search').addEventListener('input', debounce((e) => {
        state.filters.search = e.target.value;
        updateMembersDisplay();
    }, 300));

    document.getElementById('role-filter').addEventListener('change', (e) => {
        state.filters.role = e.target.value;
        updateMembersDisplay();
    });

    document.getElementById('status-filter').addEventListener('change', (e) => {
        state.filters.status = e.target.value;
        updateMembersDisplay();
    });

    document.getElementById('reset-filters').addEventListener('click', () => {
        state.filters = {
            search: '',
            role: 'all',
            status: 'all'
        };
        document.getElementById('member-search').value = '';
        document.getElementById('role-filter').value = 'all';
        document.getElementById('status-filter').value = 'all';
        updateMembersDisplay();
    });

    // Mode d'affichage
    document.querySelectorAll('.view-options .btn-icon').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.view-options .btn-icon').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.viewMode = btn.dataset.view;
            document.getElementById('members-container').className = 
                `members-container ${state.viewMode}-view`;
        });
    });

    // Modal de création/édition de membre
    document.getElementById('new-member-btn').addEventListener('click', showMemberModal);
    document.getElementById('cancel-member').addEventListener('click', hideMemberModal);
    document.getElementById('member-form').addEventListener('submit', handleMemberSubmit);

    // Modal de détails
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('active');
            });
        });
    });

    // Actions sur les membres
    document.getElementById('edit-member').addEventListener('click', () => {
        if (state.selectedMember) {
            showMemberModal(state.selectedMember);
        }
    });

    document.getElementById('delete-member').addEventListener('click', () => {
        if (state.selectedMember) {
            handleMemberDelete(state.selectedMember);
        }
    });
}

// Affichage du modal de création/édition de membre
function showMemberModal(member = null) {
    const modal = document.getElementById('member-modal');
    const form = document.getElementById('member-form');
    const title = document.getElementById('modal-title');

    if (member) {
        title.textContent = 'Modifier le membre';
        form.elements['member-name'].value = member.name;
        form.elements['member-email'].value = member.email;
        form.elements['member-phone'].value = member.phone;
        form.elements['member-role'].value = member.role;
        form.elements['member-status'].value = member.status;
    } else {
        title.textContent = 'Nouveau membre';
        form.reset();
    }

    state.selectedMember = member;
    modal.classList.add('active');
}

// Masquage du modal de création/édition de membre
function hideMemberModal() {
    const modal = document.getElementById('member-modal');
    modal.classList.remove('active');
    document.getElementById('member-form').reset();
    state.selectedMember = null;
}

// Gestion de la soumission du formulaire de membre
async function handleMemberSubmit(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('member-name').value,
        email: document.getElementById('member-email').value,
        phone: document.getElementById('member-phone').value,
        role: document.getElementById('member-role').value,
        status: document.getElementById('member-status').value
    };

    try {
        let result;
        if (state.selectedMember) {
            result = await syncService.updateMember(state.selectedMember.id, formData);
        } else {
            result = await syncService.createMember(formData);
        }

        if (result.success) {
            uiService.showNotification(
                state.selectedMember ? 'Membre mis à jour avec succès' : 'Membre créé avec succès',
                'success'
            );
            hideMemberModal();
            await loadData();
        } else {
            throw new Error(result.message || 'Erreur lors de l\'opération');
        }
    } catch (error) {
        console.error('Erreur lors de l\'opération:', error);
        uiService.showNotification(error.message || 'Erreur lors de l\'opération', 'error');
    }
}

// Affichage des détails d'un membre
function showMemberDetails(member) {
    state.selectedMember = member;
    const modal = document.getElementById('member-details-modal');

    // Mise à jour des informations
    document.getElementById('member-details-name').textContent = member.name;
    document.getElementById('member-details-role').textContent = getRoleName(member.role);
    document.getElementById('member-details-status').textContent = getStatusName(member.status);
    document.getElementById('member-details-email').textContent = member.email;
    document.getElementById('member-details-phone').textContent = member.phone;
    document.getElementById('member-details-joined').textContent = new Date(member.joinedAt).toLocaleDateString('fr-FR');
    document.getElementById('member-details-contributions').textContent = uiService.formatCurrency(member.contributions || 0);
    document.getElementById('member-details-events').textContent = member.events || 0;
    document.getElementById('member-details-last-activity').textContent = member.lastActivity ? 
        new Date(member.lastActivity).toLocaleDateString('fr-FR') : 'Jamais';

    // Mise à jour de l'avatar
    document.getElementById('member-details-avatar').innerHTML = avatarService.generateAvatar(member.name);

    // Afficher le modal
    modal.classList.add('active');
}

// Gestion de la suppression d'un membre
async function handleMemberDelete(member) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le membre ${member.name} ?`)) {
        try {
            const result = await syncService.deleteMember(member.id);
            if (result.success) {
                uiService.showNotification('Membre supprimé avec succès', 'success');
                document.getElementById('member-details-modal').classList.remove('active');
                await loadData();
            } else {
                throw new Error(result.message || 'Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            uiService.showNotification(error.message || 'Erreur lors de la suppression', 'error');
        }
    }
}

// Utilitaires
function getRoleName(role) {
    const roles = {
        admin: 'Administrateur',
        member: 'Membre'
    };
    return roles[role] || role;
}

function getStatusName(status) {
    const statuses = {
        active: 'Actif',
        inactive: 'Inactif'
    };
    return statuses[status] || status;
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