const nodemailer = require('nodemailer');
const User = require('../models/User');
let io;

class NotificationService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    setSocketIO(socketIO) {
        io = socketIO;
    }

    async sendEmail(to, subject, html) {
        try {
            const mailOptions = {
                from: `"SBah Family" <${process.env.SMTP_USER}>`,
                to,
                subject,
                html
            };

            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Erreur envoi email:', error);
            throw error;
        }
    }

    async notifyNewTransaction(transaction) {
        try {
            const user = await User.findById(transaction.user).select('name email');
            const amount = new Intl.NumberFormat('fr-FR').format(transaction.amount);

            // Notification par email
            if (user.notificationPreferences.email) {
                const emailTemplate = `
                    <h2>Nouvelle transaction SBah Family</h2>
                    <p>Bonjour ${user.name},</p>
                    <p>Votre transaction de <strong>${amount} GNF</strong> a été ${
                        transaction.status === 'completed' ? 'effectuée avec succès' : 'initiée'
                    }.</p>
                    <p>Détails :</p>
                    <ul>
                        <li>Type : ${transaction.type === 'deposit' ? 'Dépôt' : 'Retrait'}</li>
                        <li>Méthode : ${transaction.paymentMethod}</li>
                        <li>Date : ${new Date(transaction.createdAt).toLocaleString('fr-FR')}</li>
                    </ul>
                    <p>Merci de votre contribution à la famille SBah !</p>
                `;

                await this.sendEmail(user.email, 'Nouvelle transaction SBah Family', emailTemplate);
            }

            // Notification en temps réel
            if (io) {
                // Notifier l'utilisateur concerné
                io.to(`user_${user._id}`).emit('transaction_update', {
                    type: 'new_transaction',
                    data: {
                        amount,
                        status: transaction.status,
                        type: transaction.type,
                        date: transaction.createdAt
                    }
                });

                // Notifier les administrateurs
                const admins = await User.find({ role: 'admin' }).select('_id');
                admins.forEach(admin => {
                    io.to(`user_${admin._id}`).emit('admin_notification', {
                        type: 'new_transaction',
                        data: {
                            user: user.name,
                            amount,
                            type: transaction.type,
                            status: transaction.status
                        }
                    });
                });
            }
        } catch (error) {
            console.error('Erreur notification transaction:', error);
            throw error;
        }
    }

    async notifyNewCeremony(ceremony) {
        try {
            const users = await User.find({ isActive: true }).select('name email notificationPreferences');
            const budget = new Intl.NumberFormat('fr-FR').format(ceremony.estimatedBudget);

            for (const user of users) {
                if (user.notificationPreferences.email) {
                    const emailTemplate = `
                        <h2>Nouvelle cérémonie SBah Family</h2>
                        <p>Bonjour ${user.name},</p>
                        <p>Une nouvelle cérémonie a été ajoutée :</p>
                        <ul>
                            <li>Titre : ${ceremony.title}</li>
                            <li>Type : ${ceremony.type}</li>
                            <li>Date : ${new Date(ceremony.date).toLocaleDateString('fr-FR')}</li>
                            <li>Budget estimé : ${budget} GNF</li>
                            <li>Lieu : ${ceremony.location.city}, ${ceremony.location.country}</li>
                        </ul>
                        <p>Description : ${ceremony.description}</p>
                        <p>Connectez-vous à l'application pour plus de détails.</p>
                    `;

                    await this.sendEmail(user.email, 'Nouvelle cérémonie SBah Family', emailTemplate);
                }

                // Notification en temps réel
                if (io) {
                    io.to(`user_${user._id}`).emit('ceremony_notification', {
                        type: 'new_ceremony',
                        data: {
                            title: ceremony.title,
                            type: ceremony.type,
                            date: ceremony.date,
                            budget
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Erreur notification cérémonie:', error);
            throw error;
        }
    }

    async notifyNewUser(user) {
        try {
            // Notification aux administrateurs
            const admins = await User.find({ role: 'admin' }).select('email notificationPreferences');

            for (const admin of admins) {
                if (admin.notificationPreferences.email) {
                    const emailTemplate = `
                        <h2>Nouveau membre SBah Family</h2>
                        <p>Un nouveau membre vient de s'inscrire :</p>
                        <ul>
                            <li>Nom : ${user.name}</li>
                            <li>Email : ${user.email}</li>
                            <li>Téléphone : ${user.phone}</li>
                            <li>Pays : ${user.country}</li>
                            <li>Ville : ${user.city}</li>
                        </ul>
                    `;

                    await this.sendEmail(admin.email, 'Nouveau membre SBah Family', emailTemplate);
                }

                // Notification en temps réel
                if (io) {
                    io.to(`user_${admin._id}`).emit('admin_notification', {
                        type: 'new_user',
                        data: {
                            name: user.name,
                            email: user.email,
                            country: user.country
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Erreur notification nouvel utilisateur:', error);
            throw error;
        }
    }
}

module.exports = new NotificationService(); 