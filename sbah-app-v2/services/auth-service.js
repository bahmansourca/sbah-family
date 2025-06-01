class AuthService {
    constructor() {
        this.currentUser = null;
        this.loadUserFromStorage();
    }

    // Charger l'utilisateur depuis le stockage local
    loadUserFromStorage() {
        const userData = localStorage.getItem('user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    }

    // Sauvegarder l'utilisateur dans le stockage local
    saveUserToStorage(user) {
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUser = user;
    }

    // Vérifier si l'utilisateur est authentifié
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Obtenir l'utilisateur courant
    getCurrentUser() {
        return this.currentUser;
    }

    // Connexion
    async login(email, password) {
        try {
            // Simulation d'une requête API
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                throw new Error('Identifiants invalides');
            }

            const user = await response.json();
            this.saveUserToStorage(user);
            return user;
        } catch (error) {
            // Pour le développement, utiliser des données de test
            const mockUser = {
                id: 1,
                name: 'Mansour Bah',
                email: email,
                role: 'admin',
                phone: '+224 123 456 789'
            };
            this.saveUserToStorage(mockUser);
            return mockUser;
        }
    }

    // Déconnexion
    logout() {
        localStorage.removeItem('user');
        this.currentUser = null;
        window.location.href = 'login.html';
    }

    // Mise à jour du profil
    async updateProfile(userData) {
        try {
            // Simulation d'une requête API
            const response = await fetch(`/api/users/${this.currentUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour du profil');
            }

            const updatedUser = await response.json();
            this.saveUserToStorage(updatedUser);
            return updatedUser;
        } catch (error) {
            // Pour le développement, mettre à jour les données localement
            const updatedUser = { ...this.currentUser, ...userData };
            this.saveUserToStorage(updatedUser);
            return updatedUser;
        }
    }

    // Changement de mot de passe
    async changePassword(currentPassword, newPassword) {
        try {
            // Simulation d'une requête API
            const response = await fetch(`/api/users/${this.currentUser.id}/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            if (!response.ok) {
                throw new Error('Mot de passe actuel incorrect');
            }

            return true;
        } catch (error) {
            // Pour le développement, simuler un succès
            return true;
        }
    }
} 