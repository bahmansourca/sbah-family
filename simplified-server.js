const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9090; // Nouveau port pour éviter les conflits
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

// Serveur HTTP ultra-simple
const server = http.createServer((req, res) => {
  // Réduire les logs pour améliorer les performances
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
      // Configuration optimale des en-têtes pour le debug
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff'
      });
      
      res.end(content, 'utf-8');
    }
  });
});

// Démarrage du serveur
server.listen(PORT, () => {
  console.log(`======================================================`);
  console.log(`Serveur simplifié lancé sur: http://localhost:${PORT}`);
  console.log(`Serveur les fichiers depuis: ${APP_DIR}`);
  console.log(`======================================================`);
  console.log(`VERSION OPTIMISÉE - PROBLÈMES RÉSOLUS:`);
  console.log(`1. Scripts de synchronisation désactivés (causes des blocages)`);
  console.log(`2. Notifications simplifiées (utilise des alertes standards)`);
  console.log(`3. Performance améliorée (pas de boucles infinies)`);
  console.log(`======================================================`);
  console.log(`INFORMATIONS DE CONNEXION:`);
  console.log(`Email: admin@sbahfamily.com`);
  console.log(`Mot de passe: admin123`);
  console.log(`======================================================`);
});
