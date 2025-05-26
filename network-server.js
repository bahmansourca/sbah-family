const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 3000;
const APP_DIR = path.join(__dirname, 'sbah-app-v2');

// Obtenir les interfaces réseau pour afficher les adresses IP
const networkInterfaces = os.networkInterfaces();
const addresses = [];
Object.keys(networkInterfaces).forEach(interfaceName => {
  networkInterfaces[interfaceName].forEach(iface => {
    // Ignorer les adresses loopback et non IPv4
    if (iface.family === 'IPv4' && !iface.internal) {
      addresses.push(iface.address);
    }
  });
});

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

// Serveur HTTP simple sans cache pour tester l'accès
const server = http.createServer((req, res) => {
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
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content, 'utf-8');
    }
  });
});

// Écouter sur toutes les interfaces
server.listen(PORT, '0.0.0.0', () => {
  console.log(`======================================================`);
  console.log(`Serveur réseau lancé sur le port: ${PORT}`);
  console.log(`Serveur les fichiers depuis: ${APP_DIR}`);
  console.log(`======================================================`);
  console.log(`Adresses IP disponibles:`);
  console.log(`- http://localhost:${PORT} (local)`);
  addresses.forEach(addr => {
    console.log(`- http://${addr}:${PORT} (réseau)`);
  });
  console.log(`======================================================`);
  console.log(`Identifiants: admin@sbahfamily.com / admin123`);
  console.log(`======================================================`);
});
