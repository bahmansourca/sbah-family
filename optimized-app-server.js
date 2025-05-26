const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5500; // Même port que l'original pour éviter la confusion
const APP_DIR = path.join(__dirname, 'sbah-app-v2');

// Cache pour les fichiers statiques
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

// Liste des types de fichiers à mettre en cache
const CACHEABLE_TYPES = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico'];

// Serveur HTTP optimisé
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
      
      // Headers adaptés selon le type de fichier
      const headers = { 'Content-Type': contentType };
      
      // Mettre en cache les ressources statiques côté client
      if (isCacheable) {
        headers['Cache-Control'] = 'public, max-age=86400'; // Cache d'un jour
      } else {
        // Pour les fichiers HTML, ne pas mettre en cache
        headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        headers['Pragma'] = 'no-cache';
        headers['Expires'] = '0';
      }
      
      res.writeHead(200, headers);
      res.end(content, 'utf-8');
    }
  });
});

// Démarrage du serveur
server.listen(PORT, () => {
  console.log(`======================================================`);
  console.log(`Serveur optimisé lancé sur: http://localhost:${PORT}`);
  console.log(`Serveur les fichiers depuis: ${APP_DIR}`);
  console.log(`======================================================`);
  console.log(`APPLICATION SBAH FAMILY`);
  console.log(`1. Ouvrez Chrome ou Firefox à l'adresse: http://localhost:${PORT}`);
  console.log(`2. Utilisez les identifiants suivants pour vous connecter:`);
  console.log(`   - Email: admin@sbahfamily.com`);
  console.log(`   - Mot de passe: admin123`);
  console.log(`======================================================`);
});
