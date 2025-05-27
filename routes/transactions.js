const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const NotificationService = require('../services/NotificationService');

// Obtenir le solde total
router.get('/balance', async (req, res) => {
    try {
        const balance = await Transaction.calculateBalance();
        res.json({ balance });
    } catch (error) {
        console.error('Erreur calcul solde:', error);
        res.status(500).json({ message: 'Erreur lors du calcul du solde' });
    }
});

// Obtenir les transactions récentes
router.get('/recent', async (req, res) => {
    try {
        const transactions = await Transaction.find({ status: 'completed' })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('user', 'name country');

        res.json(transactions);
    } catch (error) {
        console.error('Erreur transactions récentes:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des transactions' });
    }
});

// Obtenir l'historique des transactions d'un utilisateur
router.get('/history', async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate('ceremony', 'title');

        res.json(transactions);
    } catch (error) {
        console.error('Erreur historique transactions:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération de l\'historique' });
    }
});

// Créer une nouvelle transaction
router.post('/', async (req, res) => {
    try {
        const { type, amount, paymentMethod, description, ceremony } = req.body;
        
        const transaction = new Transaction({
            user: req.user._id,
            type,
            amount,
            paymentMethod,
            description,
            ceremony,
            status: paymentMethod === 'orange_money' ? 'pending' : 'completed'
        });

        await transaction.save();

        // Si la transaction est complétée, envoyer une notification
        if (transaction.status === 'completed') {
            await NotificationService.notifyNewTransaction(transaction);
        }

        res.status(201).json(transaction);
    } catch (error) {
        console.error('Erreur création transaction:', error);
        res.status(500).json({ message: 'Erreur lors de la création de la transaction' });
    }
});

module.exports = router; 