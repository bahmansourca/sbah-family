# SBah Family - Application de Gestion Financière Familiale

Application web pour gérer les contributions financières et les cérémonies de la famille SBah.

## Fonctionnalités

- 💰 Gestion des contributions financières
- 🎉 Organisation des cérémonies familiales
- 📱 Paiements via Orange Money (PayDunya)
- 📧 Notifications en temps réel
- 📊 Suivi des transactions
- 👥 Gestion des membres

## Technologies

- Frontend : HTML5, CSS3, JavaScript
- Backend : Node.js, Express
- Base de données : MongoDB
- Paiements : PayDunya
- Notifications : Socket.IO, Nodemailer

## Configuration

1. Clonez le repository :
```bash
git clone https://github.com/votre-username/sbah-family.git
cd sbah-family
```

2. Installez les dépendances :
```bash
npm install
```

3. Créez un fichier `.env` à la racine du projet avec les variables suivantes :
```env
# Configuration de l'application
PORT=5000
NODE_ENV=development

# Base de données MongoDB
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/sbah-family

# JWT
JWT_SECRET=your-jwt-secret

# PayDunya
PAYDUNYA_MASTER_KEY=your-master-key
PAYDUNYA_PUBLIC_KEY=your-public-key
PAYDUNYA_PRIVATE_KEY=your-private-key
PAYDUNYA_TOKEN=your-token
PAYDUNYA_MODE=test

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password

# URLs
APP_URL=https://sbah-family.onrender.com
API_URL=https://sbah-family-api.onrender.com
```

4. Démarrez le serveur de développement :
```bash
npm run dev
```

## Déploiement

L'application est déployée sur Render.com avec les configurations suivantes :

### Frontend (sbah-family.onrender.com)
- Build Command : `npm install`
- Start Command : `npm start`
- Auto-Deploy : Enabled

### Backend API (sbah-family-api.onrender.com)
- Build Command : `npm install`
- Start Command : `npm start`
- Auto-Deploy : Enabled
- Environment Variables : Configurées dans le dashboard Render

## Structure du projet

```
sbah-family/
├── frontend/           # Code frontend
│   ├── index.html     # Page principale
│   ├── styles.css     # Styles CSS
│   ├── app.js         # Logique JavaScript
│   └── images/        # Images et assets
├── backend/           # Code backend
│   ├── models/        # Modèles MongoDB
│   ├── routes/        # Routes API
│   ├── services/      # Services (PayDunya, Email)
│   └── middleware/    # Middleware (Auth)
└── README.md          # Documentation
```

## Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -m 'Ajout d'une nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

## Support

Pour toute question ou problème, veuillez ouvrir une issue sur GitHub.

## Contact

Pour toute question ou support, contactez :
- Email : contact@sbahfamily.com
- Téléphone : +224 622 53 81 85 