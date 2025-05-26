const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000; // Utilisation d'un port différent (5000)
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
  
  // Gestion de l'URL racine
  let filePath = req.url === '/' ? 
    path.join(APP_DIR, 'index.html') : 
    path.join(APP_DIR, req.url);
  
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
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Lancement du serveur
server.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
  console.log(`Serveur les fichiers depuis: ${APP_DIR}`);
  console.log(`Ouvrez votre navigateur à l'adresse: http://localhost:${PORT}`);
});
