const paydunya = require('paydunya');
const Transaction = require('../models/Transaction');

class PaydunyaService {
    constructor() {
        // Configuration de PayDunya
        this.setup = new paydunya.Setup({
            masterKey: process.env.PAYDUNYA_MASTER_KEY,
            privateKey: process.env.PAYDUNYA_PRIVATE_KEY,
            publicKey: process.env.PAYDUNYA_PUBLIC_KEY,
            token: process.env.PAYDUNYA_TOKEN,
            mode: process.env.PAYDUNYA_MODE // 'test' ou 'live'
        });

        this.store = {
            name: "SBah Family",
            tagline: "Application de gestion financière familiale",
            phoneNumber: "622538185",
            postalAddress: "Conakry, Guinée"
        };
    }

    async initializePayment(transactionData) {
        try {
            const { amount, user, description } = transactionData;

            // Créer une nouvelle instance de paiement
            const invoice = new paydunya.CheckoutInvoice(this.setup, this.store);

            // Configurer le paiement
            invoice.addItem('Contribution SBah Family', 1, amount, amount, description);
            invoice.setTotalAmount(amount);

            // Ajouter les informations du client
            invoice.setCustomerInfo({
                name: user.name,
                email: user.email,
                phone: user.phone
            });

            // Ajouter les URLs de callback
            invoice.setReturnUrl(`${process.env.APP_URL}/payment/success`);
            invoice.setCancelUrl(`${process.env.APP_URL}/payment/cancel`);
            invoice.setCallbackUrl(`${process.env.API_URL}/api/payments/webhook`);

            // Créer la transaction en attente
            const transaction = await Transaction.create({
                user: user._id,
                type: 'deposit',
                amount,
                paymentMethod: 'orange_money',
                status: 'pending',
                description
            });

            // Créer le paiement sur PayDunya
            const response = await invoice.create();

            if (response.status === 'success') {
                // Mettre à jour la transaction avec la référence PayDunya
                transaction.paydunyaReference = response.token;
                transaction.metadata.paydunyaResponse = response;
                await transaction.save();

                return {
                    success: true,
                    paymentUrl: response.url,
                    token: response.token,
                    transaction: transaction._id
                };
            } else {
                // En cas d'échec, marquer la transaction comme échouée
                transaction.status = 'failed';
                transaction.metadata.paydunyaResponse = response;
                await transaction.save();

                throw new Error('Échec de l\'initialisation du paiement');
            }
        } catch (error) {
            console.error('Erreur PayDunya:', error);
            throw error;
        }
    }

    async handleWebhook(payload) {
        try {
            const { status, token } = payload;

            // Trouver la transaction correspondante
            const transaction = await Transaction.findOne({ paydunyaReference: token });
            if (!transaction) {
                throw new Error('Transaction non trouvée');
            }

            // Mettre à jour le statut de la transaction
            if (status === 'completed') {
                transaction.status = 'completed';
                
                // Si la transaction est liée à une cérémonie, mettre à jour le total collecté
                if (transaction.ceremony) {
                    const Ceremony = require('../models/Ceremony');
                    const ceremony = await Ceremony.findById(transaction.ceremony);
                    if (ceremony) {
                        await ceremony.updateTotalCollected();
                    }
                }
            } else if (status === 'cancelled') {
                transaction.status = 'failed';
            }

            transaction.metadata.paydunyaResponse = payload;
            await transaction.save();

            return transaction;
        } catch (error) {
            console.error('Erreur webhook PayDunya:', error);
            throw error;
        }
    }

    async checkTransactionStatus(token) {
        try {
            const invoice = new paydunya.CheckoutInvoice(this.setup, this.store);
            const status = await invoice.confirm(token);

            return status;
        } catch (error) {
            console.error('Erreur vérification statut:', error);
            throw error;
        }
    }
}

module.exports = new PaydunyaService(); 