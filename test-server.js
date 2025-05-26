const http = require('http');
const fs = require('fs');
const path = require('path');

// Utilisation d'un port très différent (7777)
const PORT = 7777;

// Création d'un serveur HTTP très simple
const server = http.createServer((req, res) => {
  console.log(`Requête reçue: ${req.url}`);
  
  // Servir uniquement notre page de test
  if (req.url === '/' || req.url.includes('?')) {
    fs.readFile(path.join(__dirname, 'test.html'), (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end(`Erreur: ${err.code}`);
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content, 'utf-8');
      }
    });
  } else {
    res.writeHead(404);
    res.end("Page non trouvée");
  }
});

// Lancement du serveur
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`Serveur de TEST lancé sur: http://localhost:${PORT}`);
  console.log(`IMPORTANT:`);
  console.log(`1. Ouvrez Chrome ou Firefox à l'adresse: http://localhost:${PORT}`);
  console.log(`2. Testez si les boutons et le formulaire fonctionnent`);
  console.log(`3. Vérifiez si vous pouvez interagir avec cette page simple`);
  console.log(`=======================================================`);
});
