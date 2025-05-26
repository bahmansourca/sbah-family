// Service de synchronisation cross-browser pour SBah Family
// Compatible avec Safari, Chrome, Firefox et autres navigateurs modernes

class CrossBrowserSyncService {
    constructor() {
        this.listeners = {};
        this.clientId = this.generateClientId();
        this.storageKey = 'sbahFamilySync';
        this.lastProcessedTimestamp = Date.now();
        this.syncInterval = null;
        
        // Stocker l'ID client
        localStorage.setItem('sbahFamilyClientId', this.clientId);
        
        // Initialiser le service
        this.init();
        
        console.log(`Service de synchronisation cross-browser initialisé: ${this.clientId}`);
    }
    
    // Générer un ID client unique
    generateClientId() {
        return 'client_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    }
    
    // Initialiser le service
    init() {
        // Configurer l'écouteur de localStorage pour la communication inter-onglets
        window.addEventListener('storage', this.handleStorageEvent.bind(this));
        
        // Vérifier régulièrement les mises à jour
        this.setupSyncInterval();
        
        // Envoyer un événement de connexion
        this.broadcast('client_connected', { 
            timestamp: new Date().toISOString(),
            browser: this.detectBrowser()
        });
        
        // Nettoyer les anciens messages
        this.cleanupOldMessages();
    }
    
    // Configurer l'intervalle de synchronisation
    setupSyncInterval() {
        // Vérifier toutes les 2 secondes s'il y a des nouvelles données
        this.syncInterval = setInterval(() => {
            // Diffuser un ping pour maintenir la connexion et savoir quels clients sont actifs
            this.broadcast('ping', { timestamp: new Date().toISOString() });
            
            // Récupérer et nettoyer les clients inactifs
            this.cleanupInactiveClients();
        }, 2000);
    }
    
    // Gérer les événements de storage
    handleStorageEvent(event) {
        if (event.key === this.storageKey) {
            try {
                const data = JSON.parse(event.newValue);
                
                // Ignorer les messages déjà traités ou provenant de ce client
                if (data.sender === this.clientId) return;
                if (new Date(data.timestamp).getTime() <= this.lastProcessedTimestamp) return;
                
                // Mettre à jour le dernier timestamp traité
                this.lastProcessedTimestamp = new Date(data.timestamp).getTime();
                
                console.log(`Message reçu de ${data.sender}:`, data);
                
                // Déclencher les écouteurs pour ce type d'événement
                if (this.listeners[data.type]) {
                    this.listeners[data.type].forEach(callback => callback(data.data));
                }
                
                // Déclencher les écouteurs pour tous les événements
                if (this.listeners['*']) {
                    this.listeners['*'].forEach(callback => callback({ type: data.type, data: data.data }));
                }
            } catch (error) {
                console.error('Erreur lors du traitement du message:', error);
            }
        }
    }
    
    // Diffuser un événement à tous les clients
    broadcast(type, data) {
        const message = {
            type: type,
            data: data,
            sender: this.clientId,
            timestamp: new Date().toISOString()
        };
        
        // Stocker dans localStorage pour diffuser aux autres onglets/navigateurs
        localStorage.setItem(this.storageKey, JSON.stringify(message));
        
        // Stocker l'historique des messages pour la synchronisation entre navigateurs
        this.storeMessageHistory(message);
        
        return message;
    }
    
    // Stocker l'historique des messages pour la synchronisation entre navigateurs
    storeMessageHistory(message) {
        // Récupérer l'historique existant
        let history = JSON.parse(localStorage.getItem('sbahFamilySyncHistory') || '[]');
        
        // Ajouter le nouveau message
        history.push(message);
        
        // Limiter la taille de l'historique (garder les 50 derniers messages)
        if (history.length > 50) {
            history = history.slice(history.length - 50);
        }
        
        // Enregistrer l'historique mis à jour
        localStorage.setItem('sbahFamilySyncHistory', JSON.stringify(history));
    }
    
    // Nettoyer les anciens messages
    cleanupOldMessages() {
        let history = JSON.parse(localStorage.getItem('sbahFamilySyncHistory') || '[]');
        
        // Supprimer les messages de plus de 5 minutes
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        history = history.filter(msg => new Date(msg.timestamp).getTime() > fiveMinutesAgo);
        
        localStorage.setItem('sbahFamilySyncHistory', JSON.stringify(history));
    }
    
    // S'abonner à un événement
    on(eventType, callback) {
        if (!this.listeners[eventType]) {
            this.listeners[eventType] = [];
        }
        
        this.listeners[eventType].push(callback);
        
        return () => {
            this.off(eventType, callback);
        };
    }
    
    // Se désabonner d'un événement
    off(eventType, callback) {
        if (!this.listeners[eventType]) return;
        
        this.listeners[eventType] = this.listeners[eventType].filter(cb => cb !== callback);
        
        if (this.listeners[eventType].length === 0) {
            delete this.listeners[eventType];
        }
    }
    
    // Synchroniser l'état de l'application
    syncState(type, data) {
        // Diffuser l'état à tous les clients
        return this.broadcast('sync_' + type, data);
    }
    
    // Demander des données à jour
    requestLatestData() {
        return this.broadcast('request_latest_data', {
            clientId: this.clientId,
            timestamp: new Date().toISOString()
        });
    }
    
    // Répondre à une demande de données
    respondToDataRequest(requesterId) {
        // Récupérer toutes les données actuelles
        const allData = {
            users: JSON.parse(localStorage.getItem('sbahFamilyUsers') || '[]'),
            transactions: JSON.parse(localStorage.getItem('sbahFamilyTransactions') || '[]'),
            ceremonies: JSON.parse(localStorage.getItem('sbahFamilyCeremonies') || '[]'),
            balance: JSON.parse(localStorage.getItem('sbahFamilyBalance') || '0')
        };
        
        // Envoyer les données au client demandeur
        return this.broadcast('latest_data_response', {
            requesterId: requesterId,
            data: allData,
            timestamp: new Date().toISOString()
        });
    }
    
    // Détecter le navigateur utilisé
    detectBrowser() {
        const userAgent = navigator.userAgent;
        let browserName;
        
        if (userAgent.match(/chrome|chromium|crios/i)) {
            browserName = "Chrome";
        } else if (userAgent.match(/firefox|fxios/i)) {
            browserName = "Firefox";
        } else if (userAgent.match(/safari/i)) {
            browserName = "Safari";
        } else if (userAgent.match(/opr\//i)) {
            browserName = "Opera";
        } else if (userAgent.match(/edg/i)) {
            browserName = "Edge";
        } else {
            browserName = "Unknown";
        }
        
        return browserName;
    }
    
    // Récupérer les clients connectés
    getConnectedClients() {
        const activeClients = JSON.parse(localStorage.getItem('sbahFamilyActiveClients') || '{}');
        return activeClients;
    }
    
    // Mettre à jour le statut de ce client
    updateClientStatus() {
        const activeClients = this.getConnectedClients();
        
        // Mettre à jour ce client
        activeClients[this.clientId] = {
            lastSeen: new Date().toISOString(),
            browser: this.detectBrowser()
        };
        
        localStorage.setItem('sbahFamilyActiveClients', JSON.stringify(activeClients));
    }
    
    // Nettoyer les clients inactifs (plus de 10 secondes sans activité)
    cleanupInactiveClients() {
        const activeClients = this.getConnectedClients();
        const now = Date.now();
        let updated = false;
        
        // Mettre à jour ce client
        this.updateClientStatus();
        
        // Supprimer les clients inactifs
        Object.keys(activeClients).forEach(clientId => {
            const lastSeen = new Date(activeClients[clientId].lastSeen).getTime();
            if (now - lastSeen > 10000) { // 10 secondes
                delete activeClients[clientId];
                updated = true;
            }
        });
        
        if (updated) {
            localStorage.setItem('sbahFamilyActiveClients', JSON.stringify(activeClients));
        }
        
        // Mettre à jour le compteur de clients connectés dans l'interface
        if (window.syncUI) {
            syncUI.updateConnectedCount(Object.keys(activeClients).length);
        }
        
        return Object.keys(activeClients).length;
    }
    
    // Synchroniser une collection spécifique
    forceSyncCollection(collectionName) {
        const data = JSON.parse(localStorage.getItem(`sbahFamily${collectionName}`) || '[]');
        return this.syncState(collectionName.toLowerCase(), data);
    }
    
    // Synchroniser toutes les collections
    forceSyncAll() {
        this.forceSyncCollection('Users');
        this.forceSyncCollection('Transactions');
        this.forceSyncCollection('Ceremonies');
        
        const balance = JSON.parse(localStorage.getItem('sbahFamilyBalance') || '0');
        this.syncState('balance', balance);
        
        return true;
    }
}

// Créer une instance du service de synchronisation
const crossBrowserSync = new CrossBrowserSyncService();

// Remplacer l'instance originale par la nouvelle, compatible avec tous les navigateurs
window.syncService = crossBrowserSync;

// Écouter les événements de visibilité pour synchroniser les données quand l'utilisateur revient sur la page
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // La page est redevenue visible, forcer une synchronisation complète
        crossBrowserSync.forceSyncAll();
        
        // Mettre à jour le statut de ce client
        crossBrowserSync.updateClientStatus();
    }
});

// Synchroniser toutes les données au chargement de la page
window.addEventListener('load', () => {
    // Attendre un court instant pour s'assurer que tout est chargé
    setTimeout(() => {
        crossBrowserSync.requestLatestData();
        
        // Forcer une synchronisation toutes les 5 secondes
        setInterval(() => {
            crossBrowserSync.forceSyncAll();
        }, 5000);
    }, 1000);
});
