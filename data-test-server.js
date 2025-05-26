const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9000; // Port différent pour éviter les conflits
const APP_DIR = path.join(__dirname, 'sbah-app-v2');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Serveur HTTP pour tester la sauvegarde des données
const server = http.createServer((req, res) => {
  console.log(`Requête: ${req.method} ${req.url}`);
  
  // Suppression des paramètres de requête
  let urlPath = req.url.split('?')[0];
  
  // Traitement de l'URL racine
  let filePath = urlPath === '/' ? 
    path.join(APP_DIR, 'index.html') : 
    path.join(APP_DIR, urlPath);
  
  // Extension et type de contenu
  const extname = path.extname(filePath);
  const contentType = mimeTypes[extname] || 'application/octet-stream';
  
  // Lecture et envoi du fichier
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.log(`Fichier non trouvé: ${filePath}`);
        res.writeHead(404);
        res.end('Fichier non trouvé');
      } else {
        console.log(`Erreur serveur: ${err.code}`);
        res.writeHead(500);
        res.end(`Erreur serveur: ${err.code}`);
      }
    } else {
      // Configuration des en-têtes optimaux pour tester le localStorage
      const headers = { 
        'Content-Type': contentType,
        'Cache-Control': 'no-store',  // Empêche la mise en cache des données
        'Cross-Origin-Embedder-Policy': 'require-corp', // Pour améliorer la sécurité et le stockage local
        'Cross-Origin-Opener-Policy': 'same-origin'
      };
      
      res.writeHead(200, headers);
      res.end(content, 'utf-8');
    }
  });
});

// Moniteur de localStorage pour vérifier les sauvegardes
let dataMonitorActive = false;

// Démarrage du serveur
server.listen(PORT, () => {
  console.log(`======================================================`);
  console.log(`Serveur de test lancé sur: http://localhost:${PORT}`);
  console.log(`Servir les fichiers depuis: ${APP_DIR}`);
  console.log(`======================================================`);
  console.log(`INSTRUCTIONS POUR TESTER LA SAUVEGARDE DES DONNÉES:`);
  console.log(`1. Ouvrez Chrome ou Firefox à l'adresse: http://localhost:${PORT}`);
  console.log(`2. Connectez-vous avec: admin@sbahfamily.com / admin123`);
  console.log(`3. Testez les opérations suivantes:`);
  console.log(`   - Ajouter un paiement en espèces (en tant qu'admin)`);
  console.log(`   - Ajouter une cérémonie`);
  console.log(`   - Modifier votre profil`);
  console.log(`4. Rafraîchissez la page pour vérifier que les données sont sauvegardées`);
  console.log(`======================================================`);
  console.log(`Pour vérifier que PayDunya est correctement configuré:`);
  console.log(`1. Allez à la page de dépôt et choisissez Orange Money`);
  console.log(`2. Vous devriez voir l'écran de paiement avec le montant standard de 300 000 GNF`);
  console.log(`3. Essayez aussi un montant personnalisé pour vérifier cette fonctionnalité`);
  console.log(`======================================================`);
});
