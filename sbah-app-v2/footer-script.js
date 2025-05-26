// Script pour gérer le footer et les statistiques de SBah Family

class FooterManager {
    constructor() {
        this.membersCountEl = document.getElementById('members-count');
        this.transactionsCountEl = document.getElementById('transactions-count');
        this.ceremoniesCountEl = document.getElementById('ceremonies-count');
        this.galleryEl = document.getElementById('family-gallery');
        
        this.initialize();
    }
    
    initialize() {
        // Mettre à jour les compteurs initiaux
        this.updateCounters();
        
        // Configurer le défilement automatique de la galerie
        this.setupGalleryScroll();
        
        // Écouter les événements de synchronisation
        this.listenForUpdates();
        
        console.log('FooterManager initialisé');
    }
    
    updateCounters() {
        // Récupérer les données depuis localStorage
        const users = JSON.parse(localStorage.getItem('sbahFamilyUsers') || '[]');
        const transactions = JSON.parse(localStorage.getItem('sbahFamilyTransactions') || '[]');
        const ceremonies = JSON.parse(localStorage.getItem('sbahFamilyCeremonies') || '[]');
        
        // Animer les compteurs
        this.animateCounter(this.membersCountEl, users.length);
        this.animateCounter(this.transactionsCountEl, transactions.length);
        this.animateCounter(this.ceremoniesCountEl, ceremonies.length);
    }
    
    animateCounter(element, targetValue) {
        if (!element) return;
        
        // Récupérer la valeur actuelle
        const currentValue = parseInt(element.textContent) || 0;
        
        // Si la valeur est la même, ne rien faire
        if (currentValue === targetValue) return;
        
        // Animer le compteur
        element.classList.remove('animate-count');
        void element.offsetWidth; // Forcer un reflow
        element.classList.add('animate-count');
        
        // Déterminer la durée de l'animation en fonction de la différence
        const diff = Math.abs(targetValue - currentValue);
        const duration = Math.min(1500, Math.max(500, diff * 100));
        const increment = (targetValue - currentValue) / (duration / 16);
        
        let value = currentValue;
        const startTime = Date.now();
        
        const updateValue = () => {
            const elapsedTime = Date.now() - startTime;
            
            if (elapsedTime < duration) {
                value += increment;
                element.textContent = Math.round(value);
                requestAnimationFrame(updateValue);
            } else {
                element.textContent = targetValue;
            }
        };
        
        updateValue();
    }
    
    setupGalleryScroll() {
        if (!this.galleryEl) return;
        
        // Configurer le défilement automatique
        let scrollInterval;
        let scrollPosition = 0;
        let scrollDirection = 1; // 1 = droite, -1 = gauche
        
        const startAutoScroll = () => {
            scrollInterval = setInterval(() => {
                // Si on atteint la fin, changer de direction
                if (scrollPosition >= this.galleryEl.scrollWidth - this.galleryEl.clientWidth) {
                    scrollDirection = -1;
                } else if (scrollPosition <= 0) {
                    scrollDirection = 1;
                }
                
                scrollPosition += scrollDirection * 1;
                this.galleryEl.scrollLeft = scrollPosition;
            }, 30);
        };
        
        const stopAutoScroll = () => {
            clearInterval(scrollInterval);
        };
        
        // Démarrer le défilement automatique
        startAutoScroll();
        
        // Mettre à jour la position de défilement quand l'utilisateur interagit avec la galerie
        this.galleryEl.addEventListener('scroll', () => {
            scrollPosition = this.galleryEl.scrollLeft;
        });
        
        // Arrêter le défilement quand l'utilisateur interagit avec la galerie
        this.galleryEl.addEventListener('mouseenter', stopAutoScroll);
        this.galleryEl.addEventListener('touchstart', stopAutoScroll);
        
        // Reprendre le défilement quand l'utilisateur quitte la galerie
        this.galleryEl.addEventListener('mouseleave', startAutoScroll);
        this.galleryEl.addEventListener('touchend', () => {
            setTimeout(startAutoScroll, 3000);
        });
    }
    
    listenForUpdates() {
        // Écouter les événements de synchronisation pour mettre à jour les compteurs
        if (window.syncService) {
            syncService.on('sync_users', () => {
                this.updateCounters();
            });
            
            syncService.on('sync_transactions', () => {
                this.updateCounters();
            });
            
            syncService.on('sync_ceremonies', () => {
                this.updateCounters();
            });
            
            // Écouter les nouveaux éléments
            syncService.on('new_user', () => {
                this.updateCounters();
            });
            
            syncService.on('new_transaction', () => {
                this.updateCounters();
            });
            
            syncService.on('new_ceremony', () => {
                this.updateCounters();
            });
        }
        
        // Mettre à jour toutes les 30 secondes pour s'assurer que les compteurs sont à jour
        setInterval(() => {
            this.updateCounters();
        }, 30000);
    }
}

// Initialiser le gestionnaire de footer quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    window.footerManager = new FooterManager();
});
