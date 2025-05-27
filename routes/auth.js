const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Route d'inscription
router.post('/register', async (req, res) => {
    try {
        console.log('Requête d\'inscription reçue:', req.body);
        
        const { name, email, password, phone, country, city } = req.body;

        // Vérification si l'utilisateur existe déjà
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: 'Un utilisateur avec cet email existe déjà'
            });
        }

        // Création du nouvel utilisateur
        user = new User({
            name,
            email,
            password,
            phone,
            country,
            city
        });

        // Hashage du mot de passe
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Sauvegarde de l'utilisateur
        await user.save();

        // Création du token JWT
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    success: true,
                    message: 'Inscription réussie',
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        country: user.country,
                        city: user.city
                    }
                });
            }
        );
    } catch (err) {
        console.error('Erreur lors de l\'inscription:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'inscription',
            error: err.message
        });
    }
});

// Route de connexion
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Vérification de l'utilisateur
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        // Vérification du mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        // Création du token JWT
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    success: true,
                    message: 'Connexion réussie',
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        country: user.country,
                        city: user.city
                    }
                });
            }
        );
    } catch (err) {
        console.error('Erreur lors de la connexion:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la connexion',
            error: err.message
        });
    }
});

// Route pour obtenir les informations de l'utilisateur connecté
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error('Erreur lors de la récupération du profil:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du profil',
            error: err.message
        });
    }
});

module.exports = router; 