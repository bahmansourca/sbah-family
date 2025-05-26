// Illustrations pour SBah Family basées sur le design de référence

// Fonction pour générer le HTML de l'illustration de famille
function getFamilyIllustration() {
    return `
    <svg width="180" height="180" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="100" fill="#e6f2ff"/>
        
        <!-- Père -->
        <rect x="70" y="60" width="25" height="35" rx="5" fill="#1a5f7a"/>
        <circle cx="83" cy="45" r="15" fill="#F5D0C5"/>
        <rect x="73" y="95" width="10" height="25" fill="#1a5f7a"/>
        <rect x="83" y="95" width="10" height="25" fill="#1a5f7a"/>
        
        <!-- Mère -->
        <path d="M115 65 L125 95 L105 95 Z" fill="#FFD166"/>
        <circle cx="115" cy="45" r="15" fill="#F5D0C5"/>
        <rect x="105" y="95" width="10" height="25" fill="#FFD166"/>
        <rect x="115" y="95" width="10" height="25" fill="#FFD166"/>
        
        <!-- Enfant 1 -->
        <rect x="50" y="85" width="15" height="20" rx="3" fill="#FFD166"/>
        <circle cx="58" cy="75" r="10" fill="#F5D0C5"/>
        <rect x="53" y="105" width="5" height="15" fill="#FFD166"/>
        <rect x="58" y="105" width="5" height="15" fill="#FFD166"/>
        
        <!-- Enfant 2 -->
        <rect x="135" y="85" width="15" height="20" rx="3" fill="#FFD166"/>
        <circle cx="143" cy="75" r="10" fill="#F5D0C5"/>
        <rect x="138" y="105" width="5" height="15" fill="#FFD166"/>
        <rect x="143" y="105" width="5" height="15" fill="#FFD166"/>
    </svg>
    `;
}

// Fonction pour générer l'illustration de mariage
function getMarriageIllustration() {
    return `
    <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="120" rx="12" fill="#e6f2ff"/>
        
        <!-- Homme -->
        <rect x="30" y="35" width="20" height="30" rx="3" fill="#1a5f7a"/>
        <circle cx="40" cy="25" r="10" fill="#F5D0C5"/>
        <rect x="35" y="65" width="5" height="15" fill="#1a5f7a"/>
        <rect x="40" y="65" width="5" height="15" fill="#1a5f7a"/>
        
        <!-- Femme -->
        <path d="M75 35 L85 65 L65 65 Z" fill="#FFD166"/>
        <circle cx="75" cy="25" r="10" fill="#F5D0C5"/>
        <rect x="70" y="65" width="5" height="15" fill="#FFD166"/>
        <rect x="75" y="65" width="5" height="15" fill="#FFD166"/>
        
        <!-- Coeur -->
        <path d="M57.5 85 C52 75 42 82 42 90 C42 98 57.5 105 57.5 105 C57.5 105 73 98 73 90 C73 82 63 75 57.5 85 Z" fill="#f56565"/>
    </svg>
    `;
}

// Fonction pour générer l'illustration de funérailles
function getFuneralIllustration() {
    return `
    <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="120" rx="12" fill="#f0f0f0"/>
        
        <!-- Cadre photo -->
        <rect x="25" y="20" width="70" height="80" rx="5" fill="#805AD5"/>
        <rect x="30" y="25" width="60" height="70" rx="3" fill="#E2E8F0"/>
        
        <!-- Personne dans le cadre -->
        <rect x="45" y="35" width="30" height="40" rx="3" fill="#1a5f7a"/>
        <circle cx="60" cy="30" r="12" fill="#F5D0C5"/>
        
        <!-- Bougies -->
        <rect x="15" y="70" width="5" height="20" fill="#F6E05E"/>
        <path d="M15 70 L20 70 L17.5 60 Z" fill="#F6AD55"/>
        
        <rect x="100" y="70" width="5" height="20" fill="#F6E05E"/>
        <path d="M100 70 L105 70 L102.5 60 Z" fill="#F6AD55"/>
    </svg>
    `;
}

// Fonction pour obtenir l'illustration Orange Money
function getOrangeMoneyIllustration() {
    return `
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="20" fill="#fff9e6"/>
        <text x="20" y="25" font-size="16" font-weight="bold" text-anchor="middle" fill="#ff9500">OM</text>
    </svg>
    `;
}

// Fonction pour créer une illustration d'avatar basée sur les initiales
function createAvatarIllustration(name, country) {
    // Obtenir les initiales
    let initials = name.charAt(0).toUpperCase();
    const nameParts = name.split(' ');
    if (nameParts.length > 1 && nameParts[1].length > 0) {
        initials += nameParts[1].charAt(0).toUpperCase();
    }
    
    // Générer une couleur basée sur le nom
    const colors = ['#e6f2ff', '#fff9e6', '#edfdf9', '#f9edfd', '#fde9ed'];
    const colorIndex = name.length % colors.length;
    const bgColor = colors[colorIndex];
    
    // Générer une couleur de texte basée sur le pays
    const textColors = ['#1a5f7a', '#ff9500', '#48bb78', '#805AD5', '#f56565'];
    const textColorIndex = country ? country.length % textColors.length : 0;
    const textColor = textColors[textColorIndex];
    
    return `
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="20" fill="${bgColor}"/>
        <text x="20" y="25" font-size="16" font-weight="bold" text-anchor="middle" fill="${textColor}">${initials}</text>
    </svg>
    `;
}

// Fonction pour injecter les illustrations dans l'interface
function injectIllustrations() {
    // Ajouter l'illustration de famille sur l'écran d'accueil
    const homeLogo = document.querySelector('.home-logo');
    if (homeLogo) {
        homeLogo.innerHTML = getFamilyIllustration();
    }
    
    // Mettre à jour les illustrations de cérémonies
    const ceremonyCards = document.querySelectorAll('.ceremony-card');
    ceremonyCards.forEach(card => {
        const title = card.querySelector('.ceremony-title')?.textContent.toLowerCase();
        const ceremonyImage = card.querySelector('.ceremony-image');
        
        if (ceremonyImage) {
            if (title && title.includes('mariage')) {
                ceremonyImage.innerHTML = getMarriageIllustration();
            } else if (title && (title.includes('funérail') || title.includes('deuil'))) {
                ceremonyImage.innerHTML = getFuneralIllustration();
            } else {
                // Illustration par défaut pour d'autres cérémonies
                ceremonyImage.innerHTML = `
                <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                    <rect width="120" height="120" rx="12" fill="#f0f0f0"/>
                    <circle cx="60" cy="60" r="30" fill="#1a5f7a" opacity="0.2"/>
                    <path d="M45 60 L55 70 L75 50" stroke="#1a5f7a" stroke-width="5" fill="none"/>
                </svg>
                `;
            }
        }
    });
    
    // Mettre à jour les avatars des utilisateurs
    const userAvatars = document.querySelectorAll('.user-avatar');
    userAvatars.forEach(avatar => {
        const userItem = avatar.closest('.member-item, .deposit-item, .transaction-item');
        if (userItem) {
            const name = userItem.querySelector('.user-name')?.textContent || 'U';
            const location = userItem.querySelector('.user-location')?.textContent || '';
            const country = location.split(',')[0] || '';
            
            avatar.innerHTML = createAvatarIllustration(name, country);
        }
    });
    
    // Mettre à jour l'icône Orange Money
    const orangeMoneyIcons = document.querySelectorAll('.payment-icon');
    orangeMoneyIcons.forEach(icon => {
        if (icon.closest('.payment-method[data-method="orange"]')) {
            icon.innerHTML = getOrangeMoneyIllustration();
        }
    });
}

// Exécuter quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    // Injecter les illustrations initiales
    injectIllustrations();
    
    // Observer les changements dans le DOM pour mettre à jour les illustrations
    // lorsque de nouveaux éléments sont ajoutés
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                injectIllustrations();
            }
        });
    });
    
    // Observer les changements dans tout le document
    observer.observe(document.body, { childList: true, subtree: true });
    
    console.log('Illustrations de style pastel initialisées');
});

// Exposer les fonctions au scope global
window.getFamilyIllustration = getFamilyIllustration;
window.getMarriageIllustration = getMarriageIllustration;
window.getFuneralIllustration = getFuneralIllustration;
window.createAvatarIllustration = createAvatarIllustration;
