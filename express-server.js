const express = require('express');
const path = require('path');
const app = express();
const PORT = 3500;

// Servir les fichiers statiques du répertoire sbah-app-v2
app.use(express.static(path.join(__dirname, 'sbah-app-v2')));

// Route par défaut pour servir index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'sbah-app-v2', 'index.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`======================================================`);
  console.log(`Serveur Express lancé sur: http://localhost:${PORT}`);
  console.log(`Serveur les fichiers depuis: ${path.join(__dirname, 'sbah-app-v2')}`);
  console.log(`======================================================`);
  console.log(`1. Ouvrez Chrome ou Firefox à l'adresse: http://localhost:${PORT}`);
  console.log(`2. Utilisez les identifiants suivants pour vous connecter:`);
  console.log(`   - Email: admin@sbahfamily.com`);
  console.log(`   - Mot de passe: admin123`);
  console.log(`======================================================`);
});
