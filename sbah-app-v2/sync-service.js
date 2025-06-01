// Service de synchronisation en temps réel pour SBah Family
// Utilise BroadcastChannel API pour la communication entre onglets/fenêtres

// Classe principale pour la synchronisation
class SyncService {
    constructor() {
        this.channel = null;
        this.listeners = {};
        this.clientId = this.generateClientId();
        this.setupChannel();
        
        // Stocker l'ID client pour l'identifier
        localStorage.setItem('sbahFamilyClientId', this.clientId);
        
        console.log(`Service de synchronisation initialisé: ${this.clientId}`);

        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.listeners = new Map();

        this.callbacks = {
            balance: [],
            deposits: [],
            events: [],
            members: [],
            transactions: []
        };
    }
    
    // Générer un ID client unique
    generateClientId() {
        return 'client_' + Math.random().toString(36).substring(2, 15);
    }
    
    // Configurer le canal de diffusion
    setupChannel() {
        try {
            this.channel = new BroadcastChannel('sbah_family_sync');
            
            this.channel.onmessage = (event) => {
                const { type, data, sender } = event.data;
                
                // Ignorer les messages de ce client
                if (sender === this.clientId) return;
                
                console.log(`Message reçu: ${type}`, data);
                
                // Déclencher les écouteurs pour ce type d'événement
                if (this.listeners[type]) {
                    this.listeners[type].forEach(callback => callback(data));
                }
                
                // Déclencher les écouteurs pour tous les événements
                if (this.listeners['*']) {
                    this.listeners['*'].forEach(callback => callback({ type, data }));
                }
            };
            
            console.log('Canal de diffusion configuré avec succès');
            
            // Envoyer un événement de connexion
            this.broadcast('client_connected', { timestamp: new Date().toISOString() });
        } catch (error) {
            console.error('Erreur lors de la configuration du canal:', error);
            
            // Fallback: utiliser localStorage pour la synchronisation
            this.setupLocalStorageFallback();
        }
    }
    
    // Alternative utilisant localStorage comme fallback
    setupLocalStorageFallback() {
        console.log('Utilisation de localStorage comme alternative de synchronisation');
        
        this.storageListener = (event) => {
            if (event.key === 'sbahFamilySync') {
                try {
                    const { type, data, sender, timestamp } = JSON.parse(event.newValue);
                    
                    // Ignorer les messages de ce client et les messages trop anciens (> 5 secondes)
                    if (sender === this.clientId) return;
                    
                    const messageTime = new Date(timestamp).getTime();
                    const now = new Date().getTime();
                    if (now - messageTime > 5000) return;
                    
                    console.log(`Message localStorage reçu: ${type}`, data);
                    
                    // Déclencher les écouteurs
                    if (this.listeners[type]) {
                        this.listeners[type].forEach(callback => callback(data));
                    }
                    
                    if (this.listeners['*']) {
                        this.listeners['*'].forEach(callback => callback({ type, data }));
                    }
                } catch (error) {
                    console.error('Erreur lors du traitement du message localStorage:', error);
                }
            }
        };
        
        window.addEventListener('storage', this.storageListener);
    }
    
    // S'abonner à un événement
    on(eventType, callback) {
        if (!this.listeners[eventType]) {
            this.listeners[eventType] = [];
        }
        
        this.listeners[eventType].push(callback);
        
        return () => {
            this.listeners[eventType] = this.listeners[eventType].filter(cb => cb !== callback);
        };
    }
    
    // Se désabonner de tous les événements
    off(eventType, callback) {
        if (!eventType) {
            this.listeners = {};
            return;
        }
        
        if (!callback) {
            delete this.listeners[eventType];
            return;
        }
        
        if (this.listeners[eventType]) {
            this.listeners[eventType] = this.listeners[eventType].filter(cb => cb !== callback);
        }
    }
    
    // Diffuser un événement à tous les clients
    broadcast(eventType, data) {
        const message = {
            type: eventType,
            data,
            sender: this.clientId,
            timestamp: new Date().toISOString()
        };
        
        console.log(`Diffusion: ${eventType}`, data);
        
        // Envoyer via BroadcastChannel
        if (this.channel) {
            try {
                this.channel.postMessage(message);
            } catch (error) {
                console.error('Erreur lors de la diffusion via canal:', error);
            }
        }
        
        // Également envoyer via localStorage comme fallback
        try {
            localStorage.setItem('sbahFamilySync', JSON.stringify(message));
            // Supprimer immédiatement pour permettre des modifications futures
            setTimeout(() => localStorage.removeItem('sbahFamilySync'), 100);
        } catch (error) {
            console.error('Erreur lors de la diffusion via localStorage:', error);
        }
    }
    
    // Synchroniser l'état de l'application
    syncState(type, data) {
        // Diffuser la mise à jour d'état
        this.broadcast(`sync_${type}`, data);
        
        // Également mettre à jour le localStorage local
        switch (type) {
            case 'users':
                localStorage.setItem('sbahFamilyUsers', JSON.stringify(data));
                break;
            case 'transactions':
                localStorage.setItem('sbahFamilyTransactions', JSON.stringify(data));
                break;
            case 'ceremonies':
                localStorage.setItem('sbahFamilyCeremonies', JSON.stringify(data));
                break;
            case 'balance':
                localStorage.setItem('sbahFamilyBalance', JSON.stringify(data));
                break;
        }
    }
    
    // Demander des données à jour
    requestLatestData() {
        this.broadcast('request_latest_data', {
            clientId: this.clientId,
            timestamp: new Date().toISOString()
        });
    }
    
    // Répondre à une demande de données
    respondToDataRequest(requesterId) {
        const data = {
            users: JSON.parse(localStorage.getItem('sbahFamilyUsers') || '[]'),
            transactions: JSON.parse(localStorage.getItem('sbahFamilyTransactions') || '[]'),
            ceremonies: JSON.parse(localStorage.getItem('sbahFamilyCeremonies') || '[]'),
            balance: JSON.parse(localStorage.getItem('sbahFamilyBalance') || '{"total":0}')
        };
        
        this.broadcast('latest_data_response', {
            requesterId,
            data,
            timestamp: new Date().toISOString()
        });
    }

    connect() {
        if (this.socket) {
            return;
        }

        this.socket = io(process.env.SOCKET_URL || 'http://localhost:3000', {
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: 1000
        });

        this.setupSocketListeners();
    }

    setupSocketListeners() {
        this.socket.on('connect', () => {
            console.log('Connecté au serveur');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.emit('connectionStatus', { status: 'connected' });
        });

        this.socket.on('disconnect', () => {
            console.log('Déconnecté du serveur');
            this.isConnected = false;
            this.emit('connectionStatus', { status: 'disconnected' });
        });

        this.socket.on('error', (error) => {
            console.error('Erreur de connexion:', error);
            this.emit('error', error);
        });

        this.socket.on('reconnect_attempt', (attemptNumber) => {
            console.log(`Tentative de reconnexion ${attemptNumber}/${this.maxReconnectAttempts}`);
            this.reconnectAttempts = attemptNumber;
            this.emit('reconnectAttempt', { attempt: attemptNumber });
        });

        // Événements spécifiques
        this.socket.on('payment:new', (data) => {
            this.emit('payment:new', data);
        });

        this.socket.on('payment:update', (data) => {
            this.emit('payment:update', data);
        });

        this.socket.on('event:new', (data) => {
            this.emit('event:new', data);
        });

        this.socket.on('event:update', (data) => {
            this.emit('event:update', data);
        });

        this.socket.on('member:new', (data) => {
            this.emit('member:new', data);
        });

        this.socket.on('member:update', (data) => {
            this.emit('member:update', data);
        });

        this.socket.on('notification:new', (data) => {
            this.emit('notification:new', data);
        });

        this.socket.on('balance_update', (newBalance) => {
            this.notifyCallbacks('balance', newBalance);
        });

        this.socket.on('deposit_update', (deposit) => {
            this.notifyCallbacks('deposits', deposit);
        });

        this.socket.on('event_update', (event) => {
            this.notifyCallbacks('events', event);
        });

        this.socket.on('member_update', (member) => {
            this.notifyCallbacks('members', member);
        });

        this.socket.on('transaction_update', (transaction) => {
            this.notifyCallbacks('transactions', transaction);
        });
    }

    subscribe(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }

    unsubscribe(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Erreur dans le callback pour l'événement ${event}:`, error);
                }
            });
        }
    }

    // Méthodes de synchronisation
    async syncPayments() {
        try {
            const response = await fetch('/api/payments/sync', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Échec de la synchronisation des paiements');
            }

            const data = await response.json();
            this.emit('payments:synced', data);
            return data;
        } catch (error) {
            console.error('Erreur de synchronisation des paiements:', error);
            throw error;
        }
    }

    async syncEvents() {
        try {
            const response = await fetch('/api/events/sync', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Échec de la synchronisation des événements');
            }

            const data = await response.json();
            this.emit('events:synced', data);
            return data;
        } catch (error) {
            console.error('Erreur de synchronisation des événements:', error);
            throw error;
        }
    }

    async syncMembers() {
        try {
            const response = await fetch('/api/members/sync', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Échec de la synchronisation des membres');
            }

            const data = await response.json();
            this.emit('members:synced', data);
            return data;
        } catch (error) {
            console.error('Erreur de synchronisation des membres:', error);
            throw error;
        }
    }

    // Méthodes de temps réel
    sendPayment(paymentData) {
        if (!this.isConnected) {
            throw new Error('Non connecté au serveur');
        }
        this.socket.emit('payment:send', paymentData);
    }

    sendEvent(eventData) {
        if (!this.isConnected) {
            throw new Error('Non connecté au serveur');
        }
        this.socket.emit('event:send', eventData);
    }

    sendMember(memberData) {
        if (!this.isConnected) {
            throw new Error('Non connecté au serveur');
        }
        this.socket.emit('member:send', memberData);
    }

    sendNotification(notificationData) {
        if (!this.isConnected) {
            throw new Error('Non connecté au serveur');
        }
        this.socket.emit('notification:send', notificationData);
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }

    // Enregistrement des callbacks
    onBalanceUpdate(callback) {
        this.callbacks.balance.push(callback);
    }

    onDepositUpdate(callback) {
        this.callbacks.deposits.push(callback);
    }

    onEventUpdate(callback) {
        this.callbacks.events.push(callback);
    }

    onMemberUpdate(callback) {
        this.callbacks.members.push(callback);
    }

    onTransactionUpdate(callback) {
        this.callbacks.transactions.push(callback);
    }

    // Notification des callbacks
    notifyCallbacks(type, data) {
        this.callbacks[type].forEach(callback => callback(data));
    }

    // Méthodes de récupération des données
    async getBalance() {
        try {
            const response = await fetch(`${process.env.API_URL}/balance`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération du solde');
            }

            const data = await response.json();
            return data.balance;
        } catch (error) {
            console.error('Erreur:', error);
            throw error;
        }
    }

    async getRecentDeposits() {
        try {
            const response = await fetch(`${process.env.API_URL}/deposits/recent`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des dépôts récents');
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur:', error);
            throw error;
        }
    }

    async getUpcomingEvents() {
        try {
            const response = await fetch(`${process.env.API_URL}/events/upcoming`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des événements à venir');
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur:', error);
            throw error;
        }
    }

    async getMembers() {
        try {
            const response = await fetch(`${process.env.API_URL}/members`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des membres');
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur:', error);
            throw error;
        }
    }

    async getTransactions(filter = 'all') {
        try {
            const response = await fetch(`${process.env.API_URL}/transactions?filter=${filter}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des transactions');
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur:', error);
            throw error;
        }
    }

    async getProfile() {
        try {
            const response = await fetch(`${process.env.API_URL}/profile`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération du profil');
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur:', error);
            throw error;
        }
    }

    // Méthodes de création/modification
    async createEvent(eventData) {
        try {
            const response = await fetch(`${process.env.API_URL}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(eventData)
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la création de l\'événement');
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur:', error);
            throw error;
        }
    }

    async updateProfile(profileData) {
        try {
            const response = await fetch(`${process.env.API_URL}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(profileData)
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour du profil');
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur:', error);
            throw error;
        }
    }

    async changePassword(passwordData) {
        try {
            const response = await fetch(`${process.env.API_URL}/profile/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(passwordData)
            });

            if (!response.ok) {
                throw new Error('Erreur lors du changement de mot de passe');
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur:', error);
            throw error;
        }
    }
}

// Création d'une instance unique du service
const syncService = new SyncService();

// Modification du prototype DB pour synchroniser automatiquement les changements
const originalDB = { ...DB };

// Modifie la méthode d'ajout d'utilisateur pour diffuser les mises à jour
DB.users.add = function(user) {
    const result = originalDB.users.add.call(this, user);
    
    // Synchroniser la liste des utilisateurs
    syncService.syncState('users', DB.users.getAll());
    
    // Diffuser l'événement pour le nouvel utilisateur
    syncService.broadcast('new_user', {
        user,
        timestamp: new Date().toISOString()
    });
    
    return result;
};

// Modifie la méthode de mise à jour d'utilisateur
DB.users.update = function(updatedUser) {
    const result = originalDB.users.update.call(this, updatedUser);
    
    // Synchroniser la liste des utilisateurs
    syncService.syncState('users', DB.users.getAll());
    
    return result;
};

// Modifie la méthode d'ajout de transaction
DB.transactions.add = function(transaction) {
    const result = originalDB.transactions.add.call(this, transaction);
    
    // Synchroniser les transactions et le solde
    syncService.syncState('transactions', DB.transactions.getAll());
    syncService.syncState('balance', DB.transactions.getBalance());
    
    // Diffuser l'événement pour la nouvelle transaction
    syncService.broadcast('new_transaction', {
        transaction,
        timestamp: new Date().toISOString()
    });
    
    return result;
};

// Modifie la méthode d'ajout de cérémonie
DB.ceremonies.add = function(ceremony) {
    const result = originalDB.ceremonies.add.call(this, ceremony);
    
    // Synchroniser les cérémonies
    syncService.syncState('ceremonies', DB.ceremonies.getAll());
    
    // Diffuser l'événement pour la nouvelle cérémonie
    syncService.broadcast('new_ceremony', {
        ceremony,
        timestamp: new Date().toISOString()
    });
    
    return result;
};

// Modifie la méthode de mise à jour de cérémonie
DB.ceremonies.update = function(updatedCeremony) {
    const result = originalDB.ceremonies.update.call(this, updatedCeremony);
    
    // Synchroniser les cérémonies
    syncService.syncState('ceremonies', DB.ceremonies.getAll());
    
    return result;
};

// Configurer les écouteurs pour les différents événements
syncService.on('sync_users', (users) => {
    localStorage.setItem('sbahFamilyUsers', JSON.stringify(users));
    // Recharger l'interface si l'écran des membres est visible
    if (document.getElementById('members-screen') && 
        !document.getElementById('members-screen').classList.contains('hidden')) {
        loadMembers();
    }
});

syncService.on('sync_transactions', (transactions) => {
    localStorage.setItem('sbahFamilyTransactions', JSON.stringify(transactions));
    // Recharger l'interface si l'écran d'historique est visible
    if (document.getElementById('history-screen') && 
        !document.getElementById('history-screen').classList.contains('hidden')) {
        loadTransactions();
    }
    
    // Mettre à jour les dépôts récents sur l'écran d'accueil
    if (document.getElementById('home-screen') && 
        !document.getElementById('home-screen').classList.contains('hidden')) {
        loadRecentDeposits();
    }
});

syncService.on('sync_ceremonies', (ceremonies) => {
    localStorage.setItem('sbahFamilyCeremonies', JSON.stringify(ceremonies));
    // Recharger l'interface si l'écran des cérémonies est visible
    if (document.getElementById('ceremonies-screen') && 
        !document.getElementById('ceremonies-screen').classList.contains('hidden')) {
        loadCeremonies();
    }
    
    // Mettre à jour les cérémonies à venir sur l'écran d'accueil
    if (document.getElementById('home-screen') && 
        !document.getElementById('home-screen').classList.contains('hidden')) {
        loadUpcomingCeremonies();
    }
});

syncService.on('sync_balance', (balance) => {
    localStorage.setItem('sbahFamilyBalance', JSON.stringify(balance));
    // Mettre à jour le solde affiché
    updateBalanceDisplay();
});

syncService.on('new_user', (data) => {
    // Notifier l'utilisateur du nouvel utilisateur
    notifications.info('Nouvel utilisateur', 
        `${data.user.name} de ${data.user.country}, ${data.user.city} vient de rejoindre SBah Family!`);
});

syncService.on('new_transaction', (data) => {
    const tx = data.transaction;
    
    if (tx.type === 'deposit') {
        notifications.success('Nouveau dépôt', 
            `${tx.userName} de ${tx.userCountry} vient d'effectuer un dépôt de ${formatCurrency(tx.amount)} GNF`);
    } else if (tx.type === 'withdrawal') {
        notifications.warning('Nouveau retrait', 
            `${tx.userName} vient d'effectuer un retrait de ${formatCurrency(tx.amount)} GNF pour: ${tx.description}`);
    }
});

syncService.on('new_ceremony', (data) => {
    notifications.info('Nouvelle cérémonie', 
        `Une cérémonie "${data.ceremony.title}" a été planifiée pour le ${formatDateFull(data.ceremony.date)}`);
});

syncService.on('request_latest_data', (data) => {
    // Répondre uniquement si la demande vient d'un autre client
    if (data.clientId !== syncService.clientId) {
        syncService.respondToDataRequest(data.clientId);
    }
});

syncService.on('latest_data_response', (data) => {
    // Mettre à jour les données uniquement si la réponse est destinée à ce client
    if (data.requesterId === syncService.clientId) {
        localStorage.setItem('sbahFamilyUsers', JSON.stringify(data.data.users));
        localStorage.setItem('sbahFamilyTransactions', JSON.stringify(data.data.transactions));
        localStorage.setItem('sbahFamilyCeremonies', JSON.stringify(data.data.ceremonies));
        localStorage.setItem('sbahFamilyBalance', JSON.stringify(data.data.balance));
        
        // Recharger l'interface
        if (currentUser) {
            showHomeScreen();
        }
    }
});

// Demander les dernières données lors du chargement
window.addEventListener('load', () => {
    // Attendre un court délai pour s'assurer que tous les clients sont prêts
    setTimeout(() => {
        syncService.requestLatestData();
    }, 1000);
});

// Exporter le service pour une utilisation dans d'autres scripts
window.syncService = syncService;
