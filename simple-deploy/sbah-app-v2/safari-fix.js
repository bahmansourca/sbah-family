// Script de correction pour Safari
// Résout les problèmes courants de Safari avec localStorage et les restrictions ITP

console.log("Safari Fix - Chargement des corrections pour Safari");

// Fonction qui s'exécute avant le chargement des autres scripts
(function() {
    // Vérifier si le navigateur est Safari
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (isSafari) {
        console.log("Navigateur Safari détecté - Application des correctifs");
        
        // Correction pour localStorage dans Safari
        const originalSetItem = localStorage.setItem;
        const originalGetItem = localStorage.getItem;
        
        // Remplacer localStorage.setItem avec une version qui capture les erreurs
        localStorage.setItem = function(key, value) {
            try {
                originalSetItem.call(localStorage, key, value);
            } catch (e) {
                console.log(`Erreur Safari localStorage.setItem: ${e.message}`);
                
                // Tentative de solution alternative - stockage en mémoire
                if (!window._safariStorage) window._safariStorage = {};
                window._safariStorage[key] = value;
            }
        };
        
        // Remplacer localStorage.getItem avec une version qui utilise le stockage alternatif si nécessaire
        localStorage.getItem = function(key) {
            try {
                const value = originalGetItem.call(localStorage, key);
                return value;
            } catch (e) {
                console.log(`Erreur Safari localStorage.getItem: ${e.message}`);
                
                // Utiliser le stockage alternatif si disponible
                if (window._safariStorage && window._safariStorage[key]) {
                    return window._safariStorage[key];
                }
                return null;
            }
        };
        
        // Désactiver complètement les fonctionnalités problématiques
        window.disableProblemFeatures = function() {
            // Désactiver les intervalles problématiques
            const highestId = window.setInterval(() => {}, 9999);
            for (let i = 1; i <= highestId; i++) {
                window.clearInterval(i);
            }
            
            // Désactiver les scripts de synchronisation
            window.crossBrowserSyncEnabled = false;
            window.realTimeEnabled = false;
        };
        
        // Initialiser la base de données si localStorage est vide ou inaccessible
        window.initializeFallbackDatabase = function() {
            // Initialiser les utilisateurs de base
            if (!localStorage.getItem('sbahFamilyUsers')) {
                const defaultUsers = [
                    {
                        id: 1,
                        name: 'Thierno Sadou Bah',
                        email: 'admin@sbahfamily.com',
                        phone: '622538185',
                        country: 'Guinée',
                        city: 'Conakry',
                        password: 'admin123',
                        role: 'admin',
                        orangeMoneyAccount: '622538185'
                    }
                ];
                
                try {
                    localStorage.setItem('sbahFamilyUsers', JSON.stringify(defaultUsers));
                } catch (e) {
                    window._safariStorage = window._safariStorage || {};
                    window._safariStorage['sbahFamilyUsers'] = JSON.stringify(defaultUsers);
                }
            }
            
            // Initialiser les transactions de base
            if (!localStorage.getItem('sbahFamilyTransactions')) {
                const defaultTransactions = [];
                
                try {
                    localStorage.setItem('sbahFamilyTransactions', JSON.stringify(defaultTransactions));
                } catch (e) {
                    window._safariStorage = window._safariStorage || {};
                    window._safariStorage['sbahFamilyTransactions'] = JSON.stringify(defaultTransactions);
                }
            }
            
            // Initialiser les cérémonies de base
            if (!localStorage.getItem('sbahFamilyCeremonies')) {
                const defaultCeremonies = [];
                
                try {
                    localStorage.setItem('sbahFamilyCeremonies', JSON.stringify(defaultCeremonies));
                } catch (e) {
                    window._safariStorage = window._safariStorage || {};
                    window._safariStorage['sbahFamilyCeremonies'] = JSON.stringify(defaultCeremonies);
                }
            }
        };
        
        // Appliquer les correctifs
        window.disableProblemFeatures();
        window.initializeFallbackDatabase();
        
        // Remplacer les notifications pour éviter les problèmes avec Safari
        window.notifications = {
            success: function(title, message) {
                console.log(`[SUCCESS] ${title}: ${message}`);
                alert(`✅ ${title}: ${message}`);
            },
            error: function(title, message) {
                console.log(`[ERROR] ${title}: ${message}`);
                alert(`❌ ${title}: ${message}`);
            },
            info: function(title, message) {
                console.log(`[INFO] ${title}: ${message}`);
                alert(`ℹ️ ${title}: ${message}`);
            },
            warning: function(title, message) {
                console.log(`[WARNING] ${title}: ${message}`);
                alert(`⚠️ ${title}: ${message}`);
            }
        };
        
        // Fonctions de chargement simplifiées
        window.showLoading = function() {
            console.log("[UI] Affichage du chargement");
        };
        
        window.hideLoading = function() {
            console.log("[UI] Masquage du chargement");
        };
    } else {
        console.log("Navigateur non-Safari détecté - Aucun correctif nécessaire");
    }
})();

console.log("Safari Fix - Corrections chargées avec succès");
