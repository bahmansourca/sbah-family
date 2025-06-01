// Service de logging pour SBah Family
import CONFIG from './config.js';

class Logger {
    constructor() {
        this.logs = [];
        this.maxEntries = CONFIG.LOGGING.MAX_ENTRIES;
        this.enabled = CONFIG.LOGGING.ENABLED;
        this.level = CONFIG.LOGGING.LEVEL;
        
        // Niveaux de log et leurs priorités
        this.levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3
        };
    }

    // Vérifier si le niveau de log est activé
    isLevelEnabled(level) {
        return this.levels[level] <= this.levels[this.level];
    }

    // Ajouter un log
    addLog(level, message, data = null) {
        if (!this.enabled || !this.isLevelEnabled(level)) {
            return;
        }

        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            data
        };

        this.logs.push(logEntry);

        // Limiter le nombre d'entrées
        if (this.logs.length > this.maxEntries) {
            this.logs.shift();
        }

        // Afficher dans la console
        this.consoleOutput(level, message, data);

        // Émettre l'événement de log
        this.emitLogEvent(logEntry);
    }

    // Sortie console formatée
    consoleOutput(level, message, data) {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

        switch (level) {
            case 'error':
                console.error(prefix, message, data || '');
                break;
            case 'warn':
                console.warn(prefix, message, data || '');
                break;
            case 'info':
                console.info(prefix, message, data || '');
                break;
            case 'debug':
                console.debug(prefix, message, data || '');
                break;
        }
    }

    // Émettre un événement de log
    emitLogEvent(logEntry) {
        const event = new CustomEvent('sbahFamilyLog', {
            detail: logEntry
        });
        window.dispatchEvent(event);
    }

    // Méthodes de logging par niveau
    error(message, data = null) {
        this.addLog('error', message, data);
    }

    warn(message, data = null) {
        this.addLog('warn', message, data);
    }

    info(message, data = null) {
        this.addLog('info', message, data);
    }

    debug(message, data = null) {
        this.addLog('debug', message, data);
    }

    // Obtenir tous les logs
    getLogs() {
        return [...this.logs];
    }

    // Obtenir les logs par niveau
    getLogsByLevel(level) {
        return this.logs.filter(log => log.level === level);
    }

    // Obtenir les logs par période
    getLogsByPeriod(startDate, endDate) {
        return this.logs.filter(log => {
            const logDate = new Date(log.timestamp);
            return logDate >= startDate && logDate <= endDate;
        });
    }

    // Effacer tous les logs
    clearLogs() {
        this.logs = [];
    }

    // Exporter les logs au format JSON
    exportLogs() {
        return JSON.stringify(this.logs, null, 2);
    }

    // Importer des logs
    importLogs(logsJson) {
        try {
            const logs = JSON.parse(logsJson);
            if (Array.isArray(logs)) {
                this.logs = logs;
                return true;
            }
            return false;
        } catch (error) {
            this.error('Erreur lors de l\'importation des logs', error);
            return false;
        }
    }

    // Activer/désactiver le logging
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    // Définir le niveau de log
    setLevel(level) {
        if (this.levels[level] !== undefined) {
            this.level = level;
            return true;
        }
        return false;
    }
}

// Création d'une instance unique du logger
const logger = new Logger();

// Export du logger
export default logger; 