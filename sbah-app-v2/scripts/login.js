// Initialisation des services
const authService = new AuthService();
const uiService = new UIService();

// Vérifier si l'utilisateur est déjà connecté
document.addEventListener('DOMContentLoaded', () => {
    if (authService.isAuthenticated()) {
        window.location.href = 'home.html';
    }
});

// Gérer la soumission du formulaire
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;

    try {
        // Afficher le modal de chargement
        const loadingModal = uiService.showLoadingModal('Connexion en cours...');

        // Tenter la connexion
        const user = await authService.login(email, password);

        // Masquer le modal de chargement
        uiService.hideLoadingModal(loadingModal);

        // Afficher un message de succès
        uiService.showSuccess('Connexion réussie !');

        // Rediriger vers la page d'accueil
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 1000);
    } catch (error) {
        // Afficher un message d'erreur
        uiService.showError(error.message || 'Erreur lors de la connexion');
    }
}); 