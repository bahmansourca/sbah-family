const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const NotificationService = require('./services/NotificationService');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Configuration CORS pour Express
const corsOptions = {
    origin: ['https://sbah-family.onrender.com', 'https://sbah-family-frontend.onrender.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 heures
};

app.use(cors(corsOptions));

// Configuration de Socket.IO avec CORS
const io = socketIO(server, {
    cors: {
        origin: ['https://sbah-family.onrender.com', 'https://sbah-family-frontend.onrender.com'],
        methods: ["GET", "POST"],
        allowedHeaders: ["Authorization"],
        credentials: true
    }
});

// Middleware
app.use(express.json());

// Configuration de Socket.IO
NotificationService.setSocketIO(io);

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connecté à MongoDB');
}).catch(err => {
    console.error('Erreur de connexion MongoDB:', err);
});

// Routes API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/ceremonies', require('./routes/ceremonies'));
app.use('/api/payments', require('./routes/payments'));

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
    console.log('Nouveau client connecté');

    socket.on('authenticate', (data) => {
        if (data.token) {
            // Ajouter le socket à une room spécifique à l'utilisateur
            socket.join(`user_${data.userId}`);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client déconnecté');
    });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Une erreur est survenue !');
});

// Route de test pour vérifier que le serveur fonctionne
app.get('/', (req, res) => {
    res.send('API SBah Family en ligne !');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
