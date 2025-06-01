// Service de cache pour SBah Family
import CONFIG from './config.js';
import logger from './logger.js';

class CacheService {
    constructor() {
        this.cache = new Map();
        this.duration = CONFIG.CACHE.DURATION;
        this.keys = CONFIG.CACHE.KEYS;
    }

    // Stocker une valeur dans le cache
    set(key, value, duration = this.duration) {
        try {
            const item = {
                value,
                expiry: Date.now() + duration
            };
            this.cache.set(key, item);
            logger.debug(`Cache set: ${key}`, { value, duration });
            return true;
        } catch (error) {
            logger.error(`Erreur lors du stockage en cache: ${key}`, error);
            return false;
        }
    }

    // Récupérer une valeur du cache
    get(key) {
        try {
            const item = this.cache.get(key);
            
            if (!item) {
                logger.debug(`Cache miss: ${key}`);
                return null;
            }

            if (Date.now() > item.expiry) {
                this.cache.delete(key);
                logger.debug(`Cache expired: ${key}`);
                return null;
            }

            logger.debug(`Cache hit: ${key}`);
            return item.value;
        } catch (error) {
            logger.error(`Erreur lors de la récupération du cache: ${key}`, error);
            return null;
        }
    }

    // Supprimer une valeur du cache
    delete(key) {
        try {
            const result = this.cache.delete(key);
            logger.debug(`Cache delete: ${key}`, { success: result });
            return result;
        } catch (error) {
            logger.error(`Erreur lors de la suppression du cache: ${key}`, error);
            return false;
        }
    }

    // Vérifier si une clé existe dans le cache
    has(key) {
        try {
            const item = this.cache.get(key);
            if (!item) return false;
            
            if (Date.now() > item.expiry) {
                this.cache.delete(key);
                return false;
            }
            
            return true;
        } catch (error) {
            logger.error(`Erreur lors de la vérification du cache: ${key}`, error);
            return false;
        }
    }

    // Vider tout le cache
    clear() {
        try {
            this.cache.clear();
            logger.info('Cache cleared');
            return true;
        } catch (error) {
            logger.error('Erreur lors du nettoyage du cache', error);
            return false;
        }
    }

    // Obtenir toutes les clés du cache
    keys() {
        return Array.from(this.cache.keys());
    }

    // Obtenir la taille du cache
    size() {
        return this.cache.size;
    }

    // Méthodes spécifiques pour les données de l'application

    // Cache du solde
    setBalance(balance) {
        return this.set(this.keys.BALANCE, balance);
    }

    getBalance() {
        return this.get(this.keys.BALANCE);
    }

    // Cache des transactions
    setTransactions(transactions) {
        return this.set(this.keys.TRANSACTIONS, transactions);
    }

    getTransactions() {
        return this.get(this.keys.TRANSACTIONS);
    }

    // Cache des événements
    setEvents(events) {
        return this.set(this.keys.EVENTS, events);
    }

    getEvents() {
        return this.get(this.keys.EVENTS);
    }

    // Cache des membres
    setMembers(members) {
        return this.set(this.keys.MEMBERS, members);
    }

    getMembers() {
        return this.get(this.keys.MEMBERS);
    }

    // Cache de l'utilisateur
    setUser(user) {
        return this.set(this.keys.USER, user);
    }

    getUser() {
        return this.get(this.keys.USER);
    }

    // Cache du token
    setToken(token) {
        return this.set(this.keys.TOKEN, token);
    }

    getToken() {
        return this.get(this.keys.TOKEN);
    }

    // Méthodes utilitaires

    // Mettre à jour une valeur existante
    update(key, updater) {
        try {
            const currentValue = this.get(key);
            if (currentValue === null) return false;

            const newValue = updater(currentValue);
            return this.set(key, newValue);
        } catch (error) {
            logger.error(`Erreur lors de la mise à jour du cache: ${key}`, error);
            return false;
        }
    }

    // Obtenir ou définir une valeur avec un callback
    getOrSet(key, callback, duration = this.duration) {
        try {
            const cachedValue = this.get(key);
            if (cachedValue !== null) return cachedValue;

            const newValue = callback();
            this.set(key, newValue, duration);
            return newValue;
        } catch (error) {
            logger.error(`Erreur lors de getOrSet: ${key}`, error);
            return null;
        }
    }

    // Nettoyer les entrées expirées
    cleanup() {
        try {
            const now = Date.now();
            for (const [key, item] of this.cache.entries()) {
                if (now > item.expiry) {
                    this.cache.delete(key);
                }
            }
            logger.debug('Cache cleanup completed');
        } catch (error) {
            logger.error('Erreur lors du nettoyage du cache', error);
        }
    }
}

// Création d'une instance unique du service de cache
const cacheService = new CacheService();

// Nettoyage périodique du cache
setInterval(() => cacheService.cleanup(), 60000); // Toutes les minutes

// Export du service de cache
export default cacheService; 