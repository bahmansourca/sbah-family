const express = require('express');
const router = express.Router();
const PaydunyaService = require('../services/PaydunyaService');

// Initialiser un paiement
router.post('/initialize', async (req, res) => {
    try {
        const { amount, description } = req.body;
        const user = req.user; // Ajouté par le middleware d'authentification

        const payment = await PaydunyaService.initializePayment({
            amount,
            user,
            description: description || 'Contribution SBah Family'
        });

        res.json(payment);
    } catch (error) {
        console.error('Erreur initialisation paiement:', error);
        res.status(500).json({ message: 'Erreur lors de l\'initialisation du paiement' });
    }
});

// Webhook PayDunya
router.post('/webhook', async (req, res) => {
    try {
        const transaction = await PaydunyaService.handleWebhook(req.body);
        res.json({ success: true, transaction });
    } catch (error) {
        console.error('Erreur webhook PayDunya:', error);
        res.status(500).json({ message: 'Erreur lors du traitement du webhook' });
    }
});

// Vérifier le statut d'une transaction
router.get('/status/:token', async (req, res) => {
    try {
        const status = await PaydunyaService.checkTransactionStatus(req.params.token);
        res.json(status);
    } catch (error) {
        console.error('Erreur vérification statut:', error);
        res.status(500).json({ message: 'Erreur lors de la vérification du statut' });
    }
});

module.exports = router; 