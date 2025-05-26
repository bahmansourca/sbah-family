// Gestionnaire d'interface pour la synchronisation en temps réel
// Gère les indicateurs visuels et les notifications de synchronisation

class SyncUI {
    constructor() {
        this.syncStatus = document.getElementById('sync-status');
        this.connectedDevices = document.getElementById('connected-devices');
        this.connectedClients = new Set();
        this.setupEventListeners();
        
        // Masquer les indicateurs au départ
        this.hideSyncStatus();
        
        console.log('SyncUI initialisé');
    }
    
    setupEventListeners() {
        // Écouter les événements de synchronisation
        if (window.syncService) {
            syncService.on('client_connected', (data) => {
                this.addConnectedClient(data.clientId || 'unknown');
                this.updateConnectedCount();
            });
            
            syncService.on('*', () => {
                this.showSyncingStatus();
                
                // Simuler une synchronisation réussie après un court délai
                setTimeout(() => {
                    this.showSyncedStatus();
                    
                    // Masquer après un délai
                    setTimeout(() => {
                        this.hideSyncStatus();
                    }, 2000);
                }, 800);
            });
        }
        
        // Écouter les changements de visibilité de la page
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                // La page est redevenue visible, demander les dernières données
                if (window.syncService) {
                    syncService.requestLatestData();
                    this.showSyncingStatus();
                }
            }
        });
    }
    
    addConnectedClient(clientId) {
        if (clientId && clientId !== 'unknown') {
            this.connectedClients.add(clientId);
        }
    }
    
    updateConnectedCount() {
        const count = Math.max(1, this.connectedClients.size);
        this.connectedDevices.textContent = count;
        
        // Afficher une notification si plus d'un appareil est connecté
        if (count > 1 && window.notifications) {
            notifications.info(
                'Synchronisation multi-appareils', 
                `${count} appareils sont maintenant connectés et synchronisés`
            );
        }
    }
    
    showSyncingStatus() {
        this.syncStatus.classList.add('active');
        this.syncStatus.classList.remove('success');
        this.syncStatus.querySelector('i').className = 'fas fa-sync-alt';
        this.syncStatus.querySelector('span').textContent = 'Synchronisation en cours...';
    }
    
    showSyncedStatus() {
        this.syncStatus.classList.add('active', 'success');
        this.syncStatus.querySelector('i').className = 'fas fa-check';
        this.syncStatus.querySelector('span').textContent = 'Synchronisation terminée';
    }
    
    hideSyncStatus() {
        this.syncStatus.classList.remove('active');
    }
    
    // Marquer un élément comme mis à jour en temps réel
    markAsUpdated(element) {
        if (!element) return;
        
        // Supprimer la classe si elle existe déjà
        element.classList.remove('realtime-update');
        
        // Forcer un reflow
        void element.offsetWidth;
        
        // Ajouter la classe pour l'animation
        element.classList.add('realtime-update');
    }
    
    // Ajouter un badge "Nouveau" à un élément
    addNewBadge(element, text = 'Nouveau') {
        if (!element) return;
        
        const badge = document.createElement('span');
        badge.className = 'new-badge';
        badge.textContent = text;
        
        // S'assurer que l'élément a une position relative
        const currentPosition = window.getComputedStyle(element).position;
        if (currentPosition === 'static') {
            element.style.position = 'relative';
        }
        
        element.appendChild(badge);
        
        // Supprimer le badge après un délai
        setTimeout(() => {
            if (badge.parentNode === element) {
                element.removeChild(badge);
            }
        }, 5000);
    }
}

// Améliorer le système de notification pour qu'il soit plus interactif
class EnhancedNotifications extends NotificationSystem {
    constructor() {
        super();
        this.notifications = [];
        this.maxNotifications = 3; // Limiter le nombre de notifications simultanées
    }
    
    show(title, message, type = 'info', duration = 5000) {
        // Limiter le nombre de notifications
        if (this.notifications.length >= this.maxNotifications) {
            // Supprimer la plus ancienne notification
            const oldest = this.notifications.shift();
            if (oldest && oldest.element && oldest.element.parentNode) {
                oldest.element.classList.remove('show');
                setTimeout(() => {
                    if (oldest.element.parentNode) {
                        oldest.element.parentNode.removeChild(oldest.element);
                    }
                }, 300);
            }
        }
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        notification.innerHTML = `
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        this.container.appendChild(notification);
        
        // Ajouter un bouton de fermeture
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                    // Supprimer de la liste des notifications
                    this.notifications = this.notifications.filter(n => n.element !== notification);
                }, 300);
            });
        }
        
        // Forcer un reflow pour permettre l'animation
        notification.offsetHeight;
        
        // Afficher la notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Créer un objet pour suivre cette notification
        const notificationObj = {
            element: notification,
            timeoutId: null
        };
        
        // Ajouter à la liste des notifications
        this.notifications.push(notificationObj);
        
        // Cacher la notification après un délai
        if (duration > 0) {
            notificationObj.timeoutId = setTimeout(() => {
                notification.classList.remove('show');
                
                // Supprimer du DOM après l'animation
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                    // Supprimer de la liste des notifications
                    this.notifications = this.notifications.filter(n => n.element !== notification);
                }, 300);
            }, duration);
        }
        
        return notification;
    }
}

// Amélioration du gestionnaire de dépôt pour prendre en charge les paiements par carte
function enhanceDepositForm() {
    const cardMethod = document.querySelector('.payment-method[data-method="card"]');
    const orangeMethod = document.querySelector('.payment-method[data-method="orange"]');
    const cardForm = document.getElementById('card-form');
    const orangeDetails = document.getElementById('orange-money-details');
    
    if (!cardMethod || !orangeMethod || !cardForm || !orangeDetails) return;
    
    // Formater le numéro de carte en ajoutant des espaces
    const cardNumber = document.getElementById('card-number');
    if (cardNumber) {
        cardNumber.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            let formattedValue = '';
            
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    formattedValue += ' ';
                }
                formattedValue += value[i];
            }
            
            e.target.value = formattedValue;
        });
    }
    
    // Formater la date d'expiration au format MM/AA
    const cardExpiry = document.getElementById('card-expiry');
    if (cardExpiry) {
        cardExpiry.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            let formattedValue = '';
            
            if (value.length > 0) {
                formattedValue = value.substring(0, Math.min(2, value.length));
                if (value.length > 2) {
                    formattedValue += '/' + value.substring(2, 4);
                }
            }
            
            e.target.value = formattedValue;
        });
    }
    
    // Limiter le CVV à 3 chiffres
    const cardCvv = document.getElementById('card-cvv');
    if (cardCvv) {
        cardCvv.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
        });
    }
    
    // Montrer le formulaire de carte bancaire quand la méthode carte est sélectionnée
    cardMethod.addEventListener('click', function() {
        cardMethod.classList.add('active');
        orangeMethod.classList.remove('active');
        cardForm.classList.remove('hidden');
        orangeDetails.classList.add('hidden');
    });
    
    // Montrer les détails Orange Money quand cette méthode est sélectionnée
    orangeMethod.addEventListener('click', function() {
        orangeMethod.classList.add('active');
        cardMethod.classList.remove('active');
        cardForm.classList.add('hidden');
        orangeDetails.classList.remove('hidden');
    });
}

// Initialisation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    // Remplacer le système de notification par la version améliorée
    window.notifications = new EnhancedNotifications();
    
    // Initialiser l'interface de synchronisation
    window.syncUI = new SyncUI();
    
    // Améliorer le formulaire de dépôt
    enhanceDepositForm();
    
    console.log('SyncUI et notifications améliorées initialisés');
});
