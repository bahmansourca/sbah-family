// Fonction Netlify pour traiter les webhooks PayDunya
exports.handler = async function(event, context) {
  try {
    // Vérifier que c'est une requête POST
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Méthode non autorisée' })
      };
    }

    // Analyser le corps de la requête
    const payload = JSON.parse(event.body);
    
    // Vérifier que c'est bien une notification PayDunya
    if (!payload.token || !payload.status) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Données PayDunya invalides' })
      };
    }

    console.log('PayDunya webhook reçu:', JSON.stringify(payload));

    // Traiter le statut du paiement
    if (payload.status === 'completed') {
      // Stocker les informations de la transaction dans une base de données
      // (Vous pourriez utiliser Fauna, Supabase, ou une autre BDD)
      
      // Pour la démo, on retourne simplement un succès
      // Dans une implémentation réelle, vous enregistreriez la transaction dans une base de données
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          message: 'Paiement confirmé', 
          transaction: {
            token: payload.token,
            amount: payload.invoice.total_amount,
            date: new Date().toISOString(),
            status: 'completed'
          }
        })
      };
    } else {
      // Paiement non complété
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          message: 'Paiement non complété', 
          status: payload.status 
        })
      };
    }
  } catch (error) {
    console.error('Erreur webhook PayDunya:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erreur serveur' })
    };
  }
};
