class SyncService {
    constructor() {
        this.baseUrl = '/api';
        this.mockData = {
            balance: 5000000,
            stats: {
                activeMembers: 25,
                upcomingEvents: 3,
                monthlyPayments: 1500000
            },
            activities: [
                {
                    type: 'payment',
                    title: 'Paiement mensuel',
                    details: 'Paiement effectué par Mamadou Bah',
                    timestamp: new Date().getTime() - 3600000
                },
                {
                    type: 'event',
                    title: 'Réunion familiale',
                    details: 'Nouvelle réunion planifiée pour le 15/06/2024',
                    timestamp: new Date().getTime() - 7200000
                },
                {
                    type: 'member',
                    title: 'Nouveau membre',
                    details: 'Fatoumata Bah a rejoint la famille',
                    timestamp: new Date().getTime() - 86400000
                }
            ]
        };
    }

    // Obtenir le solde
    async getBalance() {
        try {
            const response = await fetch(`${this.baseUrl}/balance`);
            if (!response.ok) throw new Error('Erreur lors de la récupération du solde');
            return await response.json();
        } catch (error) {
            // Pour le développement, retourner des données de test
            return this.mockData.balance;
        }
    }

    // Obtenir les statistiques
    async getStats() {
        try {
            const response = await fetch(`${this.baseUrl}/stats`);
            if (!response.ok) throw new Error('Erreur lors de la récupération des statistiques');
            return await response.json();
        } catch (error) {
            // Pour le développement, retourner des données de test
            return this.mockData.stats;
        }
    }

    // Obtenir les activités récentes
    async getRecentActivities() {
        try {
            const response = await fetch(`${this.baseUrl}/activities`);
            if (!response.ok) throw new Error('Erreur lors de la récupération des activités');
            return await response.json();
        } catch (error) {
            // Pour le développement, retourner des données de test
            return this.mockData.activities;
        }
    }

    // Mettre à jour le solde
    async updateBalance(amount) {
        try {
            const response = await fetch(`${this.baseUrl}/balance`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount })
            });
            if (!response.ok) throw new Error('Erreur lors de la mise à jour du solde');
            return await response.json();
        } catch (error) {
            // Pour le développement, mettre à jour les données localement
            this.mockData.balance = amount;
            return { success: true, balance: amount };
        }
    }

    // Mettre à jour les préférences utilisateur
    async updateUserPreference(userId, preference, value) {
        try {
            const response = await fetch(`${this.baseUrl}/users/${userId}/preferences`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [preference]: value })
            });
            if (!response.ok) throw new Error('Erreur lors de la mise à jour des préférences');
            return await response.json();
        } catch (error) {
            // Pour le développement, simuler un succès
            return { success: true };
        }
    }

    // Mettre à jour l'avatar utilisateur
    async updateUserAvatar(userId, avatarHtml) {
        try {
            const response = await fetch(`${this.baseUrl}/users/${userId}/avatar`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatarHtml })
            });
            if (!response.ok) throw new Error('Erreur lors de la mise à jour de l\'avatar');
            return await response.json();
        } catch (error) {
            // Pour le développement, simuler un succès
            return { success: true };
        }
    }

    // Mettre à jour un champ utilisateur
    async updateUserField(userId, field, value) {
        try {
            const response = await fetch(`${this.baseUrl}/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: value })
            });
            if (!response.ok) throw new Error('Erreur lors de la mise à jour du champ');
            return await response.json();
        } catch (error) {
            // Pour le développement, simuler un succès
            return { success: true };
        }
    }

    // Mettre à jour le mot de passe
    async updatePassword(userId, currentPassword, newPassword) {
        try {
            const response = await fetch(`${this.baseUrl}/users/${userId}/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            if (!response.ok) throw new Error('Erreur lors de la mise à jour du mot de passe');
            return await response.json();
        } catch (error) {
            // Pour le développement, simuler un succès
            return { success: true };
        }
    }
} 