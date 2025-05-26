// Service de notifications
const NotificationService = {
    notifications: [],

    show(message, type = 'info') {
        const notification = {
            id: Date.now(),
            message,
            type,
            timestamp: new Date()
        };

        // Ajouter la notification à la liste
        this.notifications.push(notification);

        // Créer l'élément de notification
        const notifElement = document.createElement('div');
        notifElement.className = `notification notification-${type}`;
        notifElement.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Ajouter au DOM
        document.body.appendChild(notifElement);

        // Animer l'entrée
        setTimeout(() => {
            notifElement.classList.add('show');
        }, 100);

        // Supprimer après 3 secondes
        setTimeout(() => {
            notifElement.classList.remove('show');
            setTimeout(() => {
                notifElement.remove();
            }, 300);
        }, 3000);
    },

    getIcon(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'warning': return 'fa-exclamation-triangle';
            default: return 'fa-info-circle';
        }
    },

    success(message) {
        this.show(message, 'success');
    },

    error(message) {
        this.show(message, 'error');
    },

    warning(message) {
        this.show(message, 'warning');
    },

    info(message) {
        this.show(message, 'info');
    }
}; 