const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080; // Port standard souvent plus compatible
const APP_DIR = path.join(__dirname, 'sbah-app-v2');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Serveur HTTP minimal
const server = http.createServer((req, res) => {
  // Éviter les logs excessifs
  
  // Traitement du chemin de la requête
  let urlPath = req.url.split('?')[0];
  let filePath = urlPath === '/' ? 
    path.join(APP_DIR, 'index.html') : 
    path.join(APP_DIR, urlPath);
  
  // Extension et type de contenu
  const extname = path.extname(filePath);
  const contentType = mimeTypes[extname] || 'application/octet-stream';
  
  // Lecture et envoi du fichier
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Fichier non trouvé');
      return;
    }
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content, 'utf-8');
  });
});

// Démarrage du serveur
server.listen(PORT, () => {
  console.log(`======================================================`);
  console.log(`Serveur minimal lancé sur: http://localhost:${PORT}`);
  console.log(`Serveur les fichiers depuis: ${APP_DIR}`);
  console.log(`======================================================`);
});
