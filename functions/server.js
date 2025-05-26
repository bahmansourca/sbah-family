// Serveur Express pour les webhooks PayDunya sur Render
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

// Configuration de base
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route de santé pour vérifier que le serveur fonctionne
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'SBah Family API server is running' });
});

// Webhook PayDunya
app.post('/paydunya-webhook', async (req, res) => {
  try {
    // Vérification des données du webhook
    const payload = req.body;
    
    console.log('PayDunya webhook reçu:', JSON.stringify(payload));
    
    // Vérification de base des données
    if (!payload || !payload.token || !payload.status) {
      return res.status(400).json({ error: 'Données PayDunya invalides' });
    }
    
    // Traitement selon le statut
    if (payload.status === 'completed') {
      // Transaction réussie
      console.log(`Paiement réussi - Token: ${payload.token}, Montant: ${payload.invoice?.total_amount}`);
      
      // Dans une version complète, vous enregistreriez cette transaction dans une base de données
      // Exemple: await saveTransactionToDatabase(payload);
      
      return res.status(200).json({
        success: true,
        message: 'Paiement confirmé',
        data: {
          token: payload.token,
          amount: payload.invoice?.total_amount,
          date: new Date().toISOString(),
          status: 'completed'
        }
      });
    } else if (payload.status === 'cancelled') {
      // Transaction annulée
      console.log(`Paiement annulé - Token: ${payload.token}`);
      return res.status(200).json({
        success: true,
        message: 'Paiement annulé',
        status: payload.status
      });
    } else if (payload.status === 'failed') {
      // Transaction échouée
      console.log(`Paiement échoué - Token: ${payload.token}`);
      return res.status(200).json({
        success: true,
        message: 'Paiement échoué',
        status: payload.status
      });
    } else {
      // Autre statut
      console.log(`Paiement avec statut ${payload.status} - Token: ${payload.token}`);
      return res.status(200).json({
        success: true,
        message: `Paiement avec statut: ${payload.status}`,
        status: payload.status
      });
    }
  } catch (error) {
    console.error('Erreur lors du traitement du webhook PayDunya:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`SBah Family API Server running on port ${PORT}`);
  console.log(`PayDunya webhook URL: /paydunya-webhook`);
});
