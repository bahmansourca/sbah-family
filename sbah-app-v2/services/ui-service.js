class UIService {
    constructor() {
        this.notificationContainer = null;
        this.initializeNotificationContainer();
    }

    // Initialiser le conteneur de notifications
    initializeNotificationContainer() {
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.className = 'notification-container';
        document.body.appendChild(this.notificationContainer);
    }

    // Afficher une notification
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        this.notificationContainer.appendChild(notification);

        // Animation d'entrée
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Supprimer la notification après la durée spécifiée
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, duration);
    }

    // Afficher une notification de succès
    showSuccess(message, duration) {
        this.showNotification(message, 'success', duration);
    }

    // Afficher une notification d'erreur
    showError(message, duration) {
        this.showNotification(message, 'error', duration);
    }

    // Afficher une notification d'avertissement
    showWarning(message, duration) {
        this.showNotification(message, 'warning', duration);
    }

    // Afficher une notification d'information
    showInfo(message, duration) {
        this.showNotification(message, 'info', duration);
    }

    // Afficher un modal de confirmation
    showConfirmModal(message, onConfirm, onCancel) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Confirmation</h3>
                <p>${message}</p>
                <div class="modal-actions">
                    <button class="btn btn-secondary" data-action="cancel">Annuler</button>
                    <button class="btn btn-primary" data-action="confirm">Confirmer</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Gérer les clics sur les boutons
        modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
            modal.remove();
            if (onConfirm) onConfirm();
        });

        modal.querySelector('[data-action="cancel"]').addEventListener('click', () => {
            modal.remove();
            if (onCancel) onCancel();
        });
    }

    // Afficher un modal de chargement
    showLoadingModal(message = 'Chargement...') {
        const modal = document.createElement('div');
        modal.className = 'modal loading-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;

        document.body.appendChild(modal);
        return modal;
    }

    // Masquer le modal de chargement
    hideLoadingModal(modal) {
        if (modal) {
            modal.remove();
        }
    }

    // Formater un montant en GNF
    formatAmount(amount) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'GNF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    // Formater une date
    formatDate(date) {
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }

    // Formater une date relative
    formatRelativeDate(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `il y a ${days} jour${days > 1 ? 's' : ''}`;
        if (hours > 0) return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
        if (minutes > 0) return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
        return 'à l\'instant';
    }
} 