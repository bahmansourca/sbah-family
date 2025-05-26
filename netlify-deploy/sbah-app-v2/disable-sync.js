// Script pour désactiver temporairement les fonctionnalités de synchronisation
// et éviter que le navigateur ne se bloque

console.log("Désactivation des fonctionnalités de synchronisation pour le test local");

// Fonction qui s'exécute avant le chargement des autres scripts
window.addEventListener('DOMContentLoaded', function() {
    // Remplacer les fonctions de synchronisation problématiques
    if (window.CrossBrowserSyncService) {
        console.log("Désactivation de CrossBrowserSyncService");
        
        // Remplacer la méthode setupSyncInterval par une version vide
        window.CrossBrowserSyncService.prototype.setupSyncInterval = function() {
            console.log("Intervalle de synchronisation désactivé pour le test");
        };
        
        // Remplacer la méthode broadcast par une version simplifiée
        window.CrossBrowserSyncService.prototype.broadcast = function(event, data) {
            console.log(`[SYNC-DISABLED] Broadcast: ${event}`, data);
        };
    }
    
    // Désactiver les intervalles problématiques dans real-time.js
    clearAllIntervals();
    
    console.log("Fonctionnalités de synchronisation désactivées avec succès");
});

// Fonction pour effacer tous les intervalles existants
function clearAllIntervals() {
    // Technique pour effacer tous les intervalles existants
    const highestId = window.setInterval(() => {}, 9999);
    for (let i = 1; i <= highestId; i++) {
        window.clearInterval(i);
    }
}

// Simuler le service de notification
window.notifications = {
    success: function(title, message) {
        console.log(`[NOTIFICATION-SUCCESS] ${title}: ${message}`);
        alert(`${title}: ${message}`);
    },
    error: function(title, message) {
        console.log(`[NOTIFICATION-ERROR] ${title}: ${message}`);
        alert(`${title}: ${message}`);
    },
    info: function(title, message) {
        console.log(`[NOTIFICATION-INFO] ${title}: ${message}`);
        alert(`${title}: ${message}`);
    },
    warning: function(title, message) {
        console.log(`[NOTIFICATION-WARNING] ${title}: ${message}`);
        alert(`${title}: ${message}`);
    }
};

// Fonctions de chargement
window.showLoading = function() {
    console.log("[UI] Affichage du chargement");
};

window.hideLoading = function() {
    console.log("[UI] Masquage du chargement");
};

console.log("Script de désactivation chargé avec succès");
