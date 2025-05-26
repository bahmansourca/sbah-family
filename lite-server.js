const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const APP_DIR = path.join(__dirname, 'sbah-app-v2');

// Cache pour les fichiers statiques (réduction de la charge sur le système de fichiers)
const fileCache = {};

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

// Types de fichiers à mettre en cache
const CACHEABLE_TYPES = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico'];

// Serveur HTTP ultra-léger
const server = http.createServer((req, res) => {
  // Réduire les logs pour améliorer les performances
  if (req.url === '/') {
    console.log('Page d\'accueil demandée');
  }
  
  // Suppression des paramètres de requête
  let urlPath = req.url.split('?')[0];
  
  // Traitement de l'URL racine
  let filePath = urlPath === '/' ? 
    path.join(APP_DIR, 'index.html') : 
    path.join(APP_DIR, urlPath);
  
  // Extension et type de contenu
  const extname = path.extname(filePath);
  const contentType = mimeTypes[extname] || 'application/octet-stream';
  
  // Vérifier si le fichier est en cache et est de type cacheable
  const isCacheable = CACHEABLE_TYPES.includes(extname);
  
  if (isCacheable && fileCache[filePath]) {
    // Servir depuis le cache
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(fileCache[filePath], 'utf-8');
    return;
  }
  
  // Lecture et envoi du fichier
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('Fichier non trouvé');
      } else {
        res.writeHead(500);
        res.end(`Erreur serveur: ${err.code}`);
      }
    } else {
      // Mettre en cache les ressources statiques
      if (isCacheable) {
        fileCache[filePath] = content;
      }
      
      // En-têtes optimisés
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Démarrage du serveur
server.listen(PORT, () => {
  console.log(`======================================================`);
  console.log(`Serveur léger lancé sur: http://localhost:${PORT}`);
  console.log(`Serveur les fichiers depuis: ${APP_DIR}`);
  console.log(`======================================================`);
  console.log(`APPLICATION SBAH FAMILY - INSTRUCTIONS:`);
  console.log(`1. N'utilisez PAS l'aperçu du navigateur intégré`);
  console.log(`2. Ouvrez Chrome ou Firefox et allez à: http://localhost:${PORT}`);
  console.log(`3. Utilisez: admin@sbahfamily.com / admin123`);
  console.log(`======================================================`);
});
