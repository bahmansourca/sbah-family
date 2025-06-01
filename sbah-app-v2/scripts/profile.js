// Initialisation des services
const authService = new AuthService();
const syncService = new SyncService();
const avatarService = new AvatarService();
const uiService = new UIService();

// État de l'application
const state = {
    user: null,
    isEditing: false,
    originalValues: {},
    preferences: {
        notifications: false,
        darkMode: false,
        twoFactor: false
    }
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
    document.getElementById('avatar-wrapper').innerHTML = avatarHtml;
}

// Mise à jour des informations utilisateur
function updateUserInfo() {
    document.getElementById('user-name').textContent = state.user.name;
    document.getElementById('user-role').textContent = state.user.role;
    document.getElementById('full-name').textContent = state.user.name;
    document.getElementById('email').textContent = state.user.email;
    document.getElementById('phone').textContent = state.user.phone || 'Non renseigné';
    document.getElementById('role').textContent = state.user.role;
    document.getElementById('last-password-change').textContent = 
        state.user.lastPasswordChange ? formatDate(state.user.lastPasswordChange) : 'Jamais';
}

// Chargement des données
async function loadData() {
    try {
        // Chargement des préférences
        const preferences = await syncService.getUserPreferences(state.user.id);
        state.preferences = preferences;
        
        // Mise à jour des toggles
        document.getElementById('notifications-toggle').checked = preferences.notifications;
        document.getElementById('dark-mode-toggle').checked = preferences.darkMode;
        document.getElementById('2fa-toggle').checked = preferences.twoFactor;
        
        // Application du thème sombre si activé
        if (preferences.darkMode) {
            document.body.classList.add('dark-mode');
        }
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        uiService.showNotification('Erreur lors du chargement des données', 'error');
    }
}

// Configuration des écouteurs d'événements
function initializeEventListeners() {
    // Régénération de l'avatar
    document.getElementById('regenerate-avatar').addEventListener('click', async () => {
        try {
            const newAvatar = avatarService.generateAvatar(state.user.name);
            document.getElementById('avatar-wrapper').innerHTML = newAvatar;
            document.getElementById('user-avatar').innerHTML = newAvatar;
            
            // Synchronisation avec le serveur
            await syncService.updateUserAvatar(state.user.id, newAvatar);
            uiService.showNotification('Avatar mis à jour', 'success');
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'avatar:', error);
            uiService.showNotification('Erreur lors de la mise à jour de l\'avatar', 'error');
        }
    });

    // Édition des informations
    document.getElementById('edit-info').addEventListener('click', toggleEditMode);

    // Changement de mot de passe
    document.getElementById('change-password').addEventListener('click', () => {
        document.getElementById('password-modal').classList.add('active');
    });

    // Fermeture des modals
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('active');
            });
        });
    });

    // Formulaire de changement de mot de passe
    document.getElementById('password-form').addEventListener('submit', handlePasswordChange);

    // Toggles de préférences
    document.getElementById('notifications-toggle').addEventListener('change', async (e) => {
        await updatePreference('notifications', e.target.checked);
    });

    document.getElementById('dark-mode-toggle').addEventListener('change', async (e) => {
        await updatePreference('darkMode', e.target.checked);
        document.body.classList.toggle('dark-mode', e.target.checked);
    });

    document.getElementById('2fa-toggle').addEventListener('change', async (e) => {
        await updatePreference('twoFactor', e.target.checked);
    });

    // Inputs d'édition
    document.querySelectorAll('.info-input').forEach(input => {
        input.addEventListener('change', async (e) => {
            const field = e.target.id.replace('-input', '');
            await updateUserField(field, e.target.value);
        });
    });
}

// Basculement du mode édition
function toggleEditMode() {
    state.isEditing = !state.isEditing;
    const button = document.getElementById('edit-info');
    const icon = button.querySelector('i');

    if (state.isEditing) {
        // Sauvegarde des valeurs originales
        state.originalValues = {
            name: document.getElementById('full-name').textContent,
            email: document.getElementById('email').textContent,
            phone: document.getElementById('phone').textContent,
            role: document.getElementById('role').textContent
        };

        // Affichage des inputs
        document.querySelectorAll('.info-value').forEach(value => {
            value.style.display = 'none';
        });
        document.querySelectorAll('.info-input').forEach(input => {
            input.style.display = 'block';
            input.value = state.originalValues[input.id.replace('-input', '')];
        });

        icon.className = 'fas fa-save';
    } else {
        // Restauration des valeurs originales
        document.querySelectorAll('.info-value').forEach(value => {
            value.style.display = 'block';
        });
        document.querySelectorAll('.info-input').forEach(input => {
            input.style.display = 'none';
        });

        icon.className = 'fas fa-edit';
    }
}

// Mise à jour d'un champ utilisateur
async function updateUserField(field, value) {
    try {
        await syncService.updateUserField(state.user.id, field, value);
        state.user[field] = value;
        document.getElementById(field).textContent = value;
        uiService.showNotification('Information mise à jour', 'success');
    } catch (error) {
        console.error(`Erreur lors de la mise à jour du champ ${field}:`, error);
        uiService.showNotification('Erreur lors de la mise à jour', 'error');
    }
}

// Mise à jour d'une préférence
async function updatePreference(preference, value) {
    try {
        await syncService.updateUserPreference(state.user.id, preference, value);
        state.preferences[preference] = value;
        uiService.showNotification('Préférence mise à jour', 'success');
    } catch (error) {
        console.error(`Erreur lors de la mise à jour de la préférence ${preference}:`, error);
        uiService.showNotification('Erreur lors de la mise à jour', 'error');
    }
}

// Gestion du changement de mot de passe
async function handlePasswordChange(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
        uiService.showNotification('Les mots de passe ne correspondent pas', 'error');
        return;
    }

    try {
        await syncService.updatePassword(state.user.id, currentPassword, newPassword);
        document.getElementById('password-modal').classList.remove('active');
        document.getElementById('password-form').reset();
        uiService.showNotification('Mot de passe mis à jour', 'success');
    } catch (error) {
        console.error('Erreur lors du changement de mot de passe:', error);
        uiService.showNotification('Erreur lors du changement de mot de passe', 'error');
    }
}

// Formatage de la date
function formatDate(date) {
    return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
} 