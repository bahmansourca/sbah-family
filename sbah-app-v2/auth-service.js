// Service d'authentification
const AuthService = {
    currentUser: null,
    isAuthenticated: false,

    async login(email, password) {
        try {
            // Simulation d'une authentification réussie
            this.currentUser = {
                id: 'user123',
                name: 'Utilisateur Test',
                email: email,
                role: 'member'
            };
            this.isAuthenticated = true;
            return { success: true, user: this.currentUser };
        } catch (error) {
            console.error('Erreur de connexion:', error);
            return { success: false, error: 'Erreur de connexion' };
        }
    },

    async register(userData) {
        try {
            // Simulation d'un enregistrement réussi
            this.currentUser = {
                id: 'user' + Date.now(),
                ...userData,
                role: 'member'
            };
            this.isAuthenticated = true;
            return { success: true, user: this.currentUser };
        } catch (error) {
            console.error('Erreur d\'enregistrement:', error);
            return { success: false, error: 'Erreur d\'enregistrement' };
        }
    },

    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
    },

    isAdmin() {
        return this.currentUser?.role === 'admin';
    }
}; 