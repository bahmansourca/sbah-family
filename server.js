const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const NotificationService = require('./services/NotificationService');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Middleware pour les logs
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Configuration CORS
const allowedOrigins = [
    'https://sbah-family.onrender.com',
    'https://sbah-family-frontend.onrender.com',
    'http://localhost:3000',
    'http://localhost:5000'
];

// Middleware pour gérer les en-têtes CORS manuellement
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
    next();
});

// Middleware pour gérer les requêtes OPTIONS
app.options('*', (req, res) => {
    console.log('Requête OPTIONS reçue pour:', req.url);
    res.status(200).end();
});

// Middleware pour parser le JSON
app.use(express.json());

// Routes API
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const transactionsRoutes = require('./routes/transactions');
const ceremoniesRoutes = require('./routes/ceremonies');
const paymentsRoutes = require('./routes/payments');

// Application des routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/ceremonies', ceremoniesRoutes);
app.use('/api/payments', paymentsRoutes);

// Configuration de Socket.IO
const io = socketIO(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        allowedHeaders: ["Authorization"],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

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

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
    console.log('Nouveau client connecté');

    socket.on('authenticate', (data) => {
        if (data.token) {
            socket.join(`user_${data.userId}`);
            console.log(`User ${data.userId} authentifié`);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client déconnecté');
    });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error('Erreur:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Une erreur est survenue !',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Route de test pour vérifier que le serveur fonctionne
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API SBah Family en ligne !',
        version: '1.0.0',
        environment: process.env.NODE_ENV
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT} en mode ${process.env.NODE_ENV}`);
});
