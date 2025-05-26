/**
 * Service d'intégration PayDunya pour SBah Family
 * Permet de traiter les paiements réels via Orange Money et cartes bancaires
 */

const PayDunyaService = {
    // Configuration de PayDunya
    config: {
        // En mode production, utilisez les clés réelles
        mode: 'live', // 'test' ou 'live'
        
        // Clés de test 
        test: {
            masterKey: 'mGi7bt8Q-fedc-ufiw-tLX2-Uxlmt44LN0Jd',
            publicKey: 'test_public_AudCFZhVEQVb0wzQq4mNZZuk1kK',
            privateKey: 'test_private_ZxuM9bG1WL4h0g2Ms1h1Q315Ypo',
            token: 'S3IZv3JG9sF3L87IzP8Q'
        },
        
        // Clés de production réelles
        live: {
            masterKey: 'mGi7bt8Q-fedc-ufiw-tLX2-Uxlmt44LN0Jd',
            publicKey: 'live_public_LEhuhSWIWhx4CVqt5Mm8xY8jenn',
            privateKey: 'live_private_GiMnIMdIvIHIcvxhUaTqfa7z5hr',
            token: 'EXMUPUCqqqkZdci6a30A'
        },
        
        // Informations du compte bénéficiaire
        beneficiary: {
            name: 'Thierno Sadou Bah',
            orangeMoneyNumber: '622538185'
        }
    },
    
    /**
     * Initialise une transaction de paiement avec PayDunya
     * @param {Object} paymentData - Les données du paiement
     * @returns {Promise} - Promise avec le résultat de l'initialisation
     */
    initiatePayment: async function(paymentData) {
        try {
            showLoading();
            
            const keys = this.config.mode === 'live' ? this.config.live : this.config.test;
            
            // Création de l'objet de paiement
            const paymentRequest = {
                invoice: {
                    items: {
                        item_0: {
                            name: "Contribution SBah Family",
                            quantity: 1,
                            unit_price: paymentData.amount,
                            total_price: paymentData.amount,
                            description: "Contribution mensuelle à la caisse familiale SBah"
                        }
                    },
                    total_amount: paymentData.amount,
                    description: "Paiement de contribution mensuelle SBah Family"
                },
                store: {
                    name: "SBah Family",
                    tagline: "Caisse familiale SBah",
                    phone: this.config.beneficiary.orangeMoneyNumber,
                    postal_address: "Conakry, Guinée",
                    logo_url: window.location.origin + "/images/sbah-logo.png"
                },
                custom_data: {
                    user_id: paymentData.userId,
                    user_name: paymentData.userName,
                    user_country: paymentData.userCountry,
                    payment_method: paymentData.method
                },
                actions: {
                    cancel_url: window.location.origin,
                    return_url: window.location.origin,
                    callback_url: paymentData.callbackUrl
                }
            };
            
            // Configuration de la requête
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'PAYDUNYA-MASTER-KEY': keys.masterKey,
                    'PAYDUNYA-PRIVATE-KEY': keys.privateKey,
                    'PAYDUNYA-PUBLIC-KEY': keys.publicKey,
                    'PAYDUNYA-TOKEN': keys.token
                },
                body: JSON.stringify(paymentRequest)
            };
            
            // Endpoint de l'API PayDunya
            const apiUrl = 'https://app.paydunya.com/api/v1/checkout-invoice/create';
            
            // Envoi de la requête
            const response = await fetch(apiUrl, requestOptions);
            const data = await response.json();
            
            hideLoading();
            
            if (data.response_code === "00") {
                // Sauvegarde temporaire de la transaction en attente
                this.savePendingTransaction(data.token, paymentData);
                
                // Redirection vers la page de paiement PayDunya
                window.location.href = data.response_text;
                return { success: true, data };
            } else {
                notifications.error('Erreur de paiement', data.response_text || 'Une erreur est survenue lors de l\'initialisation du paiement.');
                return { success: false, error: data.response_text };
            }
        } catch (error) {
            hideLoading();
            notifications.error('Erreur', 'Une erreur est survenue lors de la connexion à PayDunya. Veuillez réessayer.');
            console.error('PayDunya Error:', error);
            return { success: false, error: error.message };
        }
    },
    
    /**
     * Vérifie le statut d'une transaction PayDunya
     * @param {string} token - Token de la transaction
     * @returns {Promise} - Promise avec le statut de la transaction
     */
    checkTransactionStatus: async function(token) {
        try {
            const keys = this.config.mode === 'live' ? this.config.live : this.config.test;
            
            const requestOptions = {
                method: 'GET',
                headers: {
                    'PAYDUNYA-MASTER-KEY': keys.masterKey,
                    'PAYDUNYA-PRIVATE-KEY': keys.privateKey,
                    'PAYDUNYA-PUBLIC-KEY': keys.publicKey,
                    'PAYDUNYA-TOKEN': keys.token
                }
            };
            
            const apiUrl = `https://app.paydunya.com/api/v1/checkout-invoice/confirm/${token}`;
            
            const response = await fetch(apiUrl, requestOptions);
            const data = await response.json();
            
            return { success: true, data };
        } catch (error) {
            console.error('PayDunya Status Check Error:', error);
            return { success: false, error: error.message };
        }
    },
    
    /**
     * Sauvegarde une transaction en attente dans le localStorage
     * @param {string} token - Token de la transaction PayDunya
     * @param {Object} paymentData - Données du paiement
     */
    savePendingTransaction: function(token, paymentData) {
        const pendingTransactions = JSON.parse(localStorage.getItem('sbahFamilyPendingTransactions') || '[]');
        
        pendingTransactions.push({
            token,
            userId: paymentData.userId,
            userName: paymentData.userName,
            userCountry: paymentData.userCountry,
            amount: paymentData.amount,
            method: paymentData.method,
            date: new Date().toISOString(),
            status: 'pending'
        });
        
        localStorage.setItem('sbahFamilyPendingTransactions', JSON.stringify(pendingTransactions));
    },
    
    /**
     * Finalise une transaction réussie
     * @param {string} token - Token de la transaction PayDunya
     * @param {Object} transactionData - Données de la transaction confirmée
     */
    finalizeTransaction: function(token, transactionData) {
        // Récupérer les transactions en attente
        const pendingTransactions = JSON.parse(localStorage.getItem('sbahFamilyPendingTransactions') || '[]');
        
        // Trouver la transaction correspondante
        const pendingIndex = pendingTransactions.findIndex(tx => tx.token === token);
        
        if (pendingIndex >= 0) {
            const pendingTx = pendingTransactions[pendingIndex];
            
            // Créer une transaction confirmée
            const confirmedTransaction = {
                type: 'deposit',
                userId: pendingTx.userId,
                userName: pendingTx.userName,
                userCountry: pendingTx.userCountry,
                amount: pendingTx.amount,
                date: new Date().toISOString(),
                description: `Versement via ${pendingTx.method === 'orange' ? 'Orange Money' : 'Carte Bancaire'}`,
                paymentDetails: {
                    receiptUrl: transactionData.receipt_url,
                    paydunyaToken: token,
                    paymentMethod: pendingTx.method
                }
            };
            
            // Ajouter à la base de données
            DB.transactions.add(confirmedTransaction);
            
            // Supprimer de la liste des transactions en attente
            pendingTransactions.splice(pendingIndex, 1);
            localStorage.setItem('sbahFamilyPendingTransactions', JSON.stringify(pendingTransactions));
            
            // Notification de succès
            notifications.success('Paiement confirmé', `Votre paiement de ${formatCurrency(confirmedTransaction.amount)} GNF a été confirmé.`);
        }
    },
    
    /**
     * Traite le retour de PayDunya (appelé après redirection de PayDunya)
     */
    handlePaymentReturn: async function() {
        // Récupérer le token dans l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (token) {
            // Vérifier le statut de la transaction
            const statusResult = await this.checkTransactionStatus(token);
            
            if (statusResult.success && statusResult.data.status === 'completed') {
                // Finaliser la transaction
                this.finalizeTransaction(token, statusResult.data);
                
                // Rediriger vers la page d'accueil
                showHomeScreen();
            }
        }
    },
    
    /**
     * Point d'entrée pour le webhook de PayDunya
     * Cette fonction serait appelée par votre serveur backend qui reçoit les notifications PayDunya
     * @param {Object} webhookData - Données reçues du webhook
     */
    processWebhook: function(webhookData) {
        if (webhookData.status === 'completed') {
            this.finalizeTransaction(webhookData.token, webhookData);
        }
    }
};

// Vérifier le retour de paiement au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    PayDunyaService.handlePaymentReturn();
});
