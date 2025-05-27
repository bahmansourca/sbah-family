const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Obtenir tous les utilisateurs (admin seulement)
router.get('/', async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Non autorisé' });
        }

        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });

        res.json(users);
    } catch (error) {
        console.error('Erreur liste utilisateurs:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
    }
});

// Obtenir un utilisateur spécifique
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        res.json(user);
    } catch (error) {
        console.error('Erreur détails utilisateur:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur' });
    }
});

// Mettre à jour un utilisateur
router.put('/:id', async (req, res) => {
    try {
        // Vérifier que l'utilisateur modifie son propre profil ou est admin
        if (req.params.id !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Non autorisé' });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Ne pas permettre la modification du rôle sauf pour les admins
        if (req.body.role && req.user.role !== 'admin') {
            delete req.body.role;
        }

        // Ne pas permettre la modification du mot de passe via cette route
        delete req.body.password;

        Object.assign(user, req.body);
        await user.save();

        res.json(user);
    } catch (error) {
        console.error('Erreur mise à jour utilisateur:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur' });
    }
});

// Mettre à jour les préférences de notification
router.put('/:id/notifications', async (req, res) => {
    try {
        if (req.params.id !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Non autorisé' });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        user.notificationPreferences = {
            ...user.notificationPreferences,
            ...req.body
        };

        await user.save();
        res.json(user.notificationPreferences);
    } catch (error) {
        console.error('Erreur mise à jour préférences:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour des préférences' });
    }
});

module.exports = router; 