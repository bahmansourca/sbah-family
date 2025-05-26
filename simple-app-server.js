const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4000; // Port 4000 pour éviter les conflits
const APP_DIR = path.join(__dirname, 'sbah-app-simple');

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

// Serveur HTTP simple
const server = http.createServer((req, res) => {
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
      // Configuration des en-têtes sans cache
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      res.end(content, 'utf-8');
    }
  });
});

// Démarrage du serveur
server.listen(PORT, () => {
  console.log(`======================================================`);
  console.log(`Serveur lancé sur: http://localhost:${PORT}`);
  console.log(`Serveur les fichiers depuis: ${APP_DIR}`);
  console.log(`======================================================`);
  console.log(`INSTRUCTIONS POUR TESTER L'APPLICATION SBAH FAMILY:`);
  console.log(`1. Ouvrez votre navigateur à l'adresse: http://localhost:${PORT}`);
  console.log(`2. Utilisez les identifiants suivants pour vous connecter:`);
  console.log(`   - Email: admin@sbahfamily.com`);
  console.log(`   - Mot de passe: admin123`);
  console.log(`3. Ou créez un nouveau compte en cliquant sur "S'inscrire"`);
  console.log(`4. Testez les fonctionnalités de paiement via PayDunya`);
  console.log(`======================================================`);
});
