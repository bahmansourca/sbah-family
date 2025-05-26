/**
 * Améliorations UI pour SBah Family
 * Ce fichier ajoute des composants UI améliorés et des animations
 */

const UIImprovements = {
    init: function() {
        this.setupAnimations();
        this.enhanceCards();
        this.setupSmoothScrolling();
        this.improveFormValidation();
        this.addLoadingIndicators();
        
        // Initialiser après le chargement complet
        window.addEventListener('load', () => {
            this.showWelcomeAnimation();
        });
    },
    
    // Configuration des animations pour les éléments de la page
    setupAnimations: function() {
        // Animer l'apparition des éléments au scroll
        const animateOnScroll = () => {
            const elements = document.querySelectorAll('.card, .list-item, .section-title');
            
            elements.forEach(element => {
                const elementTop = element.getBoundingClientRect().top;
                const elementVisible = 150;
                
                if (elementTop < window.innerHeight - elementVisible) {
                    element.classList.add('visible');
                }
            });
        };
        
        // Ajouter l'écouteur d'événement pour le scroll
        window.addEventListener('scroll', animateOnScroll);
        
        // Lancer une première fois pour les éléments visibles au chargement
        setTimeout(animateOnScroll, 300);
    },
    
    // Amélioration des cartes avec hover effects
    enhanceCards: function() {
        const cards = document.querySelectorAll('.card');
        
        cards.forEach(card => {
            // Ajouter effet de survol
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
                this.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.1)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = 'var(--card-shadow)';
            });
            
            // Ajouter effet de clic
            card.addEventListener('mousedown', function() {
                this.style.transform = 'translateY(-2px)';
            });
            
            card.addEventListener('mouseup', function() {
                this.style.transform = 'translateY(-5px)';
            });
        });
    },
    
    // Configuration du défilement fluide
    setupSmoothScrolling: function() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 60,
                        behavior: 'smooth'
                    });
                }
            });
        });
    },
    
    // Amélioration de la validation des formulaires
    improveFormValidation: function() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, select, textarea');
            
            inputs.forEach(input => {
                // Validation en temps réel
                input.addEventListener('input', function() {
                    validateInput(this);
                });
                
                // Validation au focus out
                input.addEventListener('blur', function() {
                    validateInput(this);
                });
                
                // Fonction de validation
                function validateInput(input) {
                    // Réinitialiser l'état
                    input.classList.remove('valid', 'invalid');
                    
                    // Vérifier si le champ est requis
                    const isRequired = input.hasAttribute('required');
                    
                    if (isRequired && input.value.trim() === '') {
                        input.classList.add('invalid');
                        return;
                    }
                    
                    // Validation spécifique selon le type
                    if (input.type === 'email' && input.value) {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(input.value)) {
                            input.classList.add('invalid');
                            return;
                        }
                    }
                    
                    if (input.type === 'tel' && input.value) {
                        const phoneRegex = /^\d{9,15}$/;
                        if (!phoneRegex.test(input.value.replace(/\D/g, ''))) {
                            input.classList.add('invalid');
                            return;
                        }
                    }
                    
                    // Si tout est bon
                    if (input.value) {
                        input.classList.add('valid');
                    }
                }
            });
            
            // Validation avant soumission
            form.addEventListener('submit', function(e) {
                let isValid = true;
                
                const inputs = this.querySelectorAll('input, select, textarea');
                inputs.forEach(input => {
                    if (input.hasAttribute('required') && input.value.trim() === '') {
                        input.classList.add('invalid');
                        isValid = false;
                    }
                });
                
                if (!isValid) {
                    e.preventDefault();
                    notifications.warning('Formulaire incomplet', 'Veuillez remplir tous les champs obligatoires.');
                }
            });
        });
    },
    
    // Ajout d'indicateurs de chargement
    addLoadingIndicators: function() {
        // Détection des actions nécessitant un chargement
        const actionButtons = document.querySelectorAll('button[type="submit"], .primary-btn, .action-btn');
        
        actionButtons.forEach(button => {
            button.addEventListener('click', function() {
                if (this.getAttribute('data-loading') !== 'true' && !this.closest('form')) {
                    // Ajouter l'indicateur de chargement
                    const originalText = this.innerHTML;
                    this.setAttribute('data-original-text', originalText);
                    this.setAttribute('data-loading', 'true');
                    this.innerHTML = `<span class="loading-spinner"></span> Chargement...`;
                    this.disabled = true;
                    
                    // Réinitialiser après un délai (si l'action ne gère pas elle-même l'état)
                    setTimeout(() => {
                        if (this.getAttribute('data-loading') === 'true') {
                            this.innerHTML = this.getAttribute('data-original-text');
                            this.removeAttribute('data-loading');
                            this.disabled = false;
                        }
                    }, 3000);
                }
            });
        });
    },
    
    // Animation de bienvenue
    showWelcomeAnimation: function() {
        // Vérifier si c'est la première visite de session
        if (!sessionStorage.getItem('welcomeShown')) {
            // Créer l'élément d'animation
            const welcomeOverlay = document.createElement('div');
            welcomeOverlay.className = 'welcome-overlay';
            welcomeOverlay.innerHTML = `
                <div class="welcome-content">
                    <div class="welcome-logo">
                        <div class="logo-pulse"></div>
                        <div class="logo">SB</div>
                    </div>
                    <h2 class="welcome-title">Bienvenue sur SBah Family</h2>
                    <p class="welcome-subtitle">La plateforme de gestion financière familiale</p>
                </div>
            `;
            
            // Ajouter au document
            document.body.appendChild(welcomeOverlay);
            
            // Animer et supprimer
            setTimeout(() => {
                welcomeOverlay.classList.add('fade-out');
                setTimeout(() => {
                    welcomeOverlay.remove();
                }, 1000);
            }, 2500);
            
            // Marquer comme affichée pour cette session
            sessionStorage.setItem('welcomeShown', 'true');
        }
    }
};

// CSS supplémentaire pour les nouveaux composants
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        /* Styles pour les améliorations UI */
        .screen {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.5s ease, transform 0.5s ease;
        }
        
        .screen.visible {
            opacity: 1;
            transform: translateY(0);
        }
        
        .loading-spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease-in-out infinite;
            margin-right: 10px;
            vertical-align: middle;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        input.valid {
            border-color: var(--success-color);
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2327ae60' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 10px center;
            background-size: 20px;
            padding-right: 40px;
        }
        
        input.invalid {
            border-color: var(--danger-color);
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23e74c3c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cline x1='12' y1='8' x2='12' y2='12'%3E%3C/line%3E%3Cline x1='12' y1='16' x2='12.01' y2='16'%3E%3C/line%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 10px center;
            background-size: 20px;
            padding-right: 40px;
        }
        
        .welcome-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--gradient-blue);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            opacity: 1;
            transition: opacity 1s ease;
        }
        
        .welcome-overlay.fade-out {
            opacity: 0;
        }
        
        .welcome-content {
            text-align: center;
            color: white;
        }
        
        .welcome-logo {
            position: relative;
            width: 120px;
            height: 120px;
            margin: 0 auto 20px;
        }
        
        .logo-pulse {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: rgba(255,255,255,0.2);
            animation: pulse 2s infinite;
        }
        
        .logo {
            position: absolute;
            top: 10px;
            left: 10px;
            width: calc(100% - 20px);
            height: calc(100% - 20px);
            background: white;
            color: var(--primary-color);
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 40px;
            font-weight: bold;
        }
        
        .welcome-title {
            font-size: 24px;
            margin-bottom: 10px;
            opacity: 0;
            transform: translateY(20px);
            animation: fadeInUp 0.8s forwards 0.5s;
        }
        
        .welcome-subtitle {
            font-size: 16px;
            opacity: 0.8;
            opacity: 0;
            transform: translateY(20px);
            animation: fadeInUp 0.8s forwards 0.8s;
        }
        
        @keyframes pulse {
            0% {
                transform: scale(1);
                opacity: 1;
            }
            100% {
                transform: scale(1.5);
                opacity: 0;
            }
        }
        
        @keyframes fadeInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    
    document.head.appendChild(style);
});

// Initialisation des améliorations
document.addEventListener('DOMContentLoaded', function() {
    UIImprovements.init();
});
