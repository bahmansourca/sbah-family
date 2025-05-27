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
app.use(cors({
    origin: function(origin, callback) {
        const allowedOrigins = [
            'https://sbah-family.onrender.com',
            'https://sbah-family-frontend.onrender.com',
            'http://localhost:3000'
        ];
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 heures
}));

// Configuration de Socket.IO avec CORS
const io = socketIO(server, {
    cors: {
        origin: function(origin, callback) {
            const allowedOrigins = [
                'https://sbah-family.onrender.com',
                'https://sbah-family-frontend.onrender.com',
                'http://localhost:3000'
            ];
            if (!origin || allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ["GET", "POST"],
        allowedHeaders: ["Authorization"],
        credentials: true
    },
    transports: ['websocket', 'polling']
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

// Middleware pour les logs
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
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
    console.error('Erreur:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Une erreur est survenue !',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Route de test pour vérifier que le serveur fonctionne
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API SBah Family en ligne !',
        version: '1.0.0'
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
