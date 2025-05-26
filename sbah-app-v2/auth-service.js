// Service d'authentification
const AuthService = {
    currentUser: null,

    init() {
        // Vérifier s'il y a un utilisateur en session
        const userJson = localStorage.getItem('sbahFamilyUser');
        if (userJson) {
            this.currentUser = JSON.parse(userJson);
            return true;
        }
        return false;
    },

    async login(email, password) {
        try {
            // Récupérer les utilisateurs
            const users = JSON.parse(localStorage.getItem('sbahFamilyUsers') || '[]');
            
            // Rechercher l'utilisateur
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                this.currentUser = user;
                localStorage.setItem('sbahFamilyUser', JSON.stringify(user));
                return { success: true, user };
            } else {
                return { success: false, error: 'Email ou mot de passe incorrect' };
            }
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            return { success: false, error: 'Une erreur est survenue lors de la connexion' };
        }
    },

    async register(userData) {
        try {
            // Récupérer les utilisateurs existants
            const users = JSON.parse(localStorage.getItem('sbahFamilyUsers') || '[]');
            
            // Vérifier si l'email existe déjà
            if (users.some(u => u.email === userData.email)) {
                return { success: false, error: 'Cet email est déjà utilisé' };
            }
            
            // Créer le nouvel utilisateur
            const newUser = {
                id: 'user_' + Date.now(),
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                country: userData.country,
                city: userData.city,
                password: userData.password,
                role: users.length === 0 ? 'admin' : 'member', // Premier utilisateur = admin
                createdAt: new Date().toISOString()
            };
            
            // Ajouter l'utilisateur
            users.push(newUser);
            localStorage.setItem('sbahFamilyUsers', JSON.stringify(users));
            
            // Connecter l'utilisateur
            this.currentUser = newUser;
            localStorage.setItem('sbahFamilyUser', JSON.stringify(newUser));
            
            return { success: true, user: newUser };
        } catch (error) {
            console.error('Erreur lors de l\'inscription:', error);
            return { success: false, error: 'Une erreur est survenue lors de l\'inscription' };
        }
    },

    logout() {
        this.currentUser = null;
        localStorage.removeItem('sbahFamilyUser');
        return true;
    },

    isAuthenticated() {
        return this.currentUser !== null;
    },

    isAdmin() {
        return this.currentUser?.role === 'admin';
    },

    getCurrentUser() {
        return this.currentUser;
    },

    updateUser(userData) {
        try {
            // Mettre à jour l'utilisateur dans la liste
            const users = JSON.parse(localStorage.getItem('sbahFamilyUsers') || '[]');
            const index = users.findIndex(u => u.id === this.currentUser.id);
            
            if (index >= 0) {
                // Mettre à jour les champs modifiables
                users[index] = {
                    ...users[index],
                    name: userData.name,
                    phone: userData.phone,
                    country: userData.country,
                    city: userData.city,
                    updatedAt: new Date().toISOString()
                };
                
                // Sauvegarder les modifications
                localStorage.setItem('sbahFamilyUsers', JSON.stringify(users));
                
                // Mettre à jour l'utilisateur courant
                this.currentUser = users[index];
                localStorage.setItem('sbahFamilyUser', JSON.stringify(users[index]));
                
                return { success: true, user: users[index] };
            }
            
            return { success: false, error: 'Utilisateur non trouvé' };
        } catch (error) {
            console.error('Erreur lors de la mise à jour du profil:', error);
            return { success: false, error: 'Une erreur est survenue lors de la mise à jour du profil' };
        }
    }
}; 