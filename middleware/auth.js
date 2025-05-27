const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    try {
        // Vérifier le header Authorization
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Authentification requise' });
        }

        // Vérifier le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Récupérer l'utilisateur
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({ message: 'Utilisateur non trouvé' });
        }

        // Vérifier si l'utilisateur est actif
        if (!user.isActive) {
            return res.status(401).json({ message: 'Compte désactivé' });
        }

        // Ajouter l'utilisateur à la requête
        req.user = user;
        next();
    } catch (error) {
        console.error('Erreur authentification:', error);
        res.status(401).json({ message: 'Token invalide' });
    }
}; 