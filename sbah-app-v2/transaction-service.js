// Service de gestion des transactions
const TransactionService = {
    transactions: [],

    async getTransactions() {
        try {
            // Simulation de transactions
            return [
                {
                    id: 'tx1',
                    type: 'deposit',
                    amount: 300000,
                    date: new Date(),
                    status: 'completed',
                    user: 'Utilisateur Test'
                }
            ];
        } catch (error) {
            console.error('Erreur de récupération des transactions:', error);
            return [];
        }
    },

    async addDeposit(amount, paymentMethod) {
        try {
            const newDeposit = {
                id: 'tx' + Date.now(),
                type: 'deposit',
                amount: amount,
                date: new Date(),
                status: 'pending',
                paymentMethod: paymentMethod,
                user: AuthService.currentUser?.name
            };
            this.transactions.push(newDeposit);
            return { success: true, transaction: newDeposit };
        } catch (error) {
            console.error('Erreur d\'ajout de dépôt:', error);
            return { success: false, error: 'Erreur d\'ajout de dépôt' };
        }
    },

    async getBalance() {
        try {
            const deposits = this.transactions
                .filter(tx => tx.type === 'deposit' && tx.status === 'completed')
                .reduce((sum, tx) => sum + tx.amount, 0);
            
            const withdrawals = this.transactions
                .filter(tx => tx.type === 'withdrawal' && tx.status === 'completed')
                .reduce((sum, tx) => sum + tx.amount, 0);

            return deposits - withdrawals;
        } catch (error) {
            console.error('Erreur de calcul du solde:', error);
            return 0;
        }
    }
}; 