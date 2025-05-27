const express = require('express');
const router = express.Router();
const Ceremony = require('../models/Ceremony');
const NotificationService = require('../services/NotificationService');

// Obtenir toutes les cérémonies
router.get('/', async (req, res) => {
    try {
        const ceremonies = await Ceremony.find()
            .sort({ date: 1 })
            .populate('organizer', 'name');

        res.json(ceremonies);
    } catch (error) {
        console.error('Erreur liste cérémonies:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des cérémonies' });
    }
});

// Obtenir une cérémonie spécifique
router.get('/:id', async (req, res) => {
    try {
        const ceremony = await Ceremony.findById(req.params.id)
            .populate('organizer', 'name email phone')
            .populate('participants.user', 'name country');

        if (!ceremony) {
            return res.status(404).json({ message: 'Cérémonie non trouvée' });
        }

        res.json(ceremony);
    } catch (error) {
        console.error('Erreur détails cérémonie:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération de la cérémonie' });
    }
});

// Créer une nouvelle cérémonie
router.post('/', async (req, res) => {
    try {
        const ceremony = new Ceremony({
            ...req.body,
            organizer: req.user._id
        });

        await ceremony.save();

        // Notifier tous les utilisateurs
        await NotificationService.notifyNewCeremony(ceremony);

        res.status(201).json(ceremony);
    } catch (error) {
        console.error('Erreur création cérémonie:', error);
        res.status(500).json({ message: 'Erreur lors de la création de la cérémonie' });
    }
});

// Mettre à jour une cérémonie
router.put('/:id', async (req, res) => {
    try {
        const ceremony = await Ceremony.findById(req.params.id);

        if (!ceremony) {
            return res.status(404).json({ message: 'Cérémonie non trouvée' });
        }

        // Vérifier que l'utilisateur est l'organisateur
        if (ceremony.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Non autorisé' });
        }

        Object.assign(ceremony, req.body);
        await ceremony.save();

        res.json(ceremony);
    } catch (error) {
        console.error('Erreur mise à jour cérémonie:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour de la cérémonie' });
    }
});

// Ajouter un participant
router.post('/:id/participants', async (req, res) => {
    try {
        const ceremony = await Ceremony.findById(req.params.id);

        if (!ceremony) {
            return res.status(404).json({ message: 'Cérémonie non trouvée' });
        }

        ceremony.participants.push({
            user: req.user._id,
            role: req.body.role || 'guest'
        });

        await ceremony.save();
        res.json(ceremony);
    } catch (error) {
        console.error('Erreur ajout participant:', error);
        res.status(500).json({ message: 'Erreur lors de l\'ajout du participant' });
    }
});

module.exports = router; 