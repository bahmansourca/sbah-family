// Configuration de l'application SBah Family
const CONFIG = {
    // URLs et endpoints
    API_URL: process.env.API_URL || 'http://localhost:3000',
    SOCKET_URL: process.env.SOCKET_URL || 'http://localhost:3000',
    WEBHOOK_URL: process.env.WEBHOOK_URL || 'https://serene-daffodil-eae953.netlify.app/.netlify/functions/paydunya-webhook',

    // Configuration PayDunya
    PAYDUNYA_MODE: process.env.PAYDUNYA_MODE || 'test', // 'test' ou 'live'
    PAYDUNYA_STORE_NAME: 'SBah Family',
    PAYDUNYA_STORE_TAGLINE: 'Cagnotte Familiale',
    PAYDUNYA_STORE_PHONE: '+224 123 456 789',
    PAYDUNYA_STORE_ADDRESS: 'Conakry, Guinée',
    PAYDUNYA_STORE_LOGO: 'https://sbahfamily.com/logo.png',
    PAYDUNYA_STORE_WEBSITE: 'https://sbahfamily.com',

    // Montants et limites
    PAYMENT_AMOUNTS: {
        1: 300000,  // 1 mois
        3: 900000,  // 3 mois
        6: 1800000, // 6 mois
        12: 3600000 // 12 mois
    },
    MIN_PAYMENT: 300000,
    PAYMENT_STEP: 10000,
    MAX_PAYMENT: 10000000,

    // Types d'événements
    EVENT_TYPES: {
        MARRIAGE: 'marriage',
        FUNERAL: 'funeral',
        SACRIFICE: 'sacrifice',
        BAPTISM: 'baptism',
        MEETING: 'meeting',
        OTHER: 'other'
    },

    // Rôles utilisateurs
    USER_ROLES: {
        ADMIN: 'admin',
        MEMBER: 'member',
        GUEST: 'guest'
    },

    // Statuts de paiement
    PAYMENT_STATUS: {
        PENDING: 'pending',
        COMPLETED: 'completed',
        FAILED: 'failed',
        CANCELLED: 'cancelled'
    },

    // Méthodes de paiement
    PAYMENT_METHODS: {
        ORANGE_MONEY: 'orange-money',
        VISA: 'visa',
        CASH: 'cash'
    },

    // Configuration de la synchronisation
    SYNC: {
        RECONNECT_ATTEMPTS: 5,
        RECONNECT_DELAY: 1000,
        SYNC_INTERVAL: 30000 // 30 secondes
    },

    // Configuration des notifications
    NOTIFICATIONS: {
        AUTO_HIDE_DELAY: 5000, // 5 secondes
        MAX_VISIBLE: 3
    },

    // Configuration du cache
    CACHE: {
        DURATION: 3600000, // 1 heure
        KEYS: {
            USER: 'sbahFamilyUser',
            TOKEN: 'sbahFamilyToken',
            BALANCE: 'sbahFamilyBalance',
            TRANSACTIONS: 'sbahFamilyTransactions',
            EVENTS: 'sbahFamilyEvents',
            MEMBERS: 'sbahFamilyMembers'
        }
    },

    // Configuration des requêtes API
    API: {
        TIMEOUT: 30000, // 30 secondes
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000
    },

    // Configuration de la sécurité
    SECURITY: {
        TOKEN_EXPIRY: 86400000, // 24 heures
        PASSWORD_MIN_LENGTH: 8,
        PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    },

    // Configuration des logs
    LOGGING: {
        ENABLED: true,
        LEVEL: process.env.LOG_LEVEL || 'info',
        MAX_ENTRIES: 1000
    },

    // Configuration des tests
    TESTING: {
        MOCK_API: true,
        MOCK_PAYMENTS: true,
        TEST_USER: {
            email: 'test@sbahfamily.com',
            password: 'Test123!'
        }
    }
};

// Export de la configuration
export default CONFIG; 