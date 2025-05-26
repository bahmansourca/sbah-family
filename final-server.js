const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8888; // Utilisation d'un port différent (8888)
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

// Création d'un serveur HTTP très simple
const server = http.createServer((req, res) => {
  console.log(`Requête reçue: ${req.url}`);
  
  // Suppression des paramètres de requête pour les URL avec ?
  let urlPath = req.url.split('?')[0];
  
  // Gestion de l'URL racine
  let filePath = urlPath === '/' ? 
    path.join(APP_DIR, 'index.html') : 
    path.join(APP_DIR, urlPath);
  
  // Vérification de l'extension du fichier
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
      console.log(`Fichier servi avec succès: ${filePath}`);
      
      // Configuration des en-têtes pour éviter les problèmes de cache
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

// Lancement du serveur
server.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
  console.log(`Serveur les fichiers depuis: ${APP_DIR}`);
  console.log(`===================================================`);
  console.log(`IMPORTANT: Pour tester l'application correctement:`);
  console.log(`1. Ouvrez votre navigateur à l'adresse: http://localhost:${PORT}`);
  console.log(`2. N'utilisez PAS l'aperçu intégré de VS Code qui a des limitations`);
  console.log(`===================================================`);
});
