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

3. Créez un fichier `.env` à la racine du projet :
```env
MONGODB_URI=votre-uri-mongodb
JWT_SECRET=votre-secret-jwt

# PayDunya
PAYDUNYA_MASTER_KEY=votre-master-key
PAYDUNYA_PUBLIC_KEY=votre-public-key
PAYDUNYA_PRIVATE_KEY=votre-private-key
PAYDUNYA_TOKEN=votre-token
PAYDUNYA_MODE=test

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app

# URLs
APP_URL=http://localhost:3000
API_URL=http://localhost:5000
```

4. Démarrez l'application :
```bash
# Mode développement
npm run dev

# Mode production
npm start
```

## Déploiement

L'application est configurée pour être déployée sur Render.com :

1. Frontend : Static Site
2. Backend : Web Service

### Variables d'environnement sur Render

Configurez les variables d'environnement suivantes dans les paramètres de votre service Render :

- `MONGODB_URI`
- `JWT_SECRET`
- `PAYDUNYA_MASTER_KEY`
- `PAYDUNYA_PUBLIC_KEY`
- `PAYDUNYA_PRIVATE_KEY`
- `PAYDUNYA_TOKEN`
- `PAYDUNYA_MODE`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `APP_URL`
- `API_URL`

## Structure du projet

```
sbah-family/
├── models/           # Modèles MongoDB
├── services/         # Services (PayDunya, Notifications)
├── routes/          # Routes API
├── middleware/      # Middleware Express
├── sbah-app-v2/     # Frontend
└── server.js        # Point d'entrée du serveur
```

## Contact

Pour toute question ou support, contactez :
- Email : contact@sbahfamily.com
- Téléphone : +224 622 53 81 85 