// Amélioration des avatars et images de cérémonies pour SBah Family

// Fonction pour générer un avatar moderne basé sur le nom d'utilisateur
function generateModernAvatar(name, country) {
    // Déterminer le style de base de l'avatar en fonction de la première lettre du nom
    const firstLetter = name.charAt(0).toLowerCase();
    const letterIndex = firstLetter.charCodeAt(0) - 97; // 'a' = 0, 'b' = 1, etc.
    
    // Sélectionner un style de couleur basé sur la lettre (modulo 5 pour avoir 5 styles)
    const colorStyle = `avatar-style-${(letterIndex % 5) + 1}`;
    
    // Sélectionner un pattern basé sur le pays
    let patternStyle = '';
    if (country) {
        const countryFirstLetter = country.charAt(0).toLowerCase();
        const countryIndex = countryFirstLetter.charCodeAt(0) - 97;
        patternStyle = `avatar-pattern-${(countryIndex % 3) + 1}`;
    }
    
    // Obtenir les initiales (première lettre du prénom et du nom si disponible)
    let initials = name.charAt(0).toUpperCase();
    const nameParts = name.split(' ');
    if (nameParts.length > 1 && nameParts[1].length > 0) {
        initials += nameParts[1].charAt(0).toUpperCase();
    }
    
    // Retourner le HTML de l'avatar
    return `
        <div class="modern-avatar ${colorStyle} ${patternStyle}">
            <div class="avatar-initials">${initials}</div>
        </div>
    `;
}

// Fonction pour générer une image de cérémonie basée sur son type
function generateCeremonyImage(ceremonyType) {
    // Déterminer la classe CSS en fonction du type de cérémonie
    let ceremonyClass = 'ceremony-other';
    
    // Normaliser le type de cérémonie en minuscules pour la comparaison
    const type = ceremonyType ? ceremonyType.toLowerCase() : '';
    
    if (type.includes('mariage')) {
        ceremonyClass = 'ceremony-marriage';
    } else if (type.includes('funerail') || type.includes('funérail') || type.includes('deuil') || type.includes('décès')) {
        ceremonyClass = 'ceremony-funeral';
    } else if (type.includes('anniversaire') || type.includes('birthday')) {
        ceremonyClass = 'ceremony-birthday';
    } else if (type.includes('fête') || type.includes('party') || type.includes('celebration')) {
        ceremonyClass = 'ceremony-party';
    } else if (type.includes('religieux') || type.includes('religious') || type.includes('prière')) {
        ceremonyClass = 'ceremony-religious';
    }
    
    // Retourner le HTML de l'image de cérémonie
    return `<div class="ceremony-image ${ceremonyClass}"></div>`;
}

// Fonction pour générer une icône d'historique basée sur le type de transaction ou d'événement
function generateHistoryIcon(type, description) {
    // Déterminer la classe CSS en fonction du type d'événement
    let iconClass = 'event-other';
    
    // Normaliser le type en minuscules pour la comparaison
    const eventType = type ? type.toLowerCase() : '';
    const eventDesc = description ? description.toLowerCase() : '';
    
    if (eventType === 'deposit') {
        iconClass = 'event-deposit';
    } else if (eventType === 'withdrawal') {
        iconClass = 'event-withdrawal';
    } else if (eventDesc.includes('mariage')) {
        iconClass = 'event-marriage';
    } else if (eventDesc.includes('funerail') || eventDesc.includes('funérail') || eventDesc.includes('deuil')) {
        iconClass = 'event-funeral';
    } else if (eventDesc.includes('anniversaire') || eventDesc.includes('birthday')) {
        iconClass = 'event-birthday';
    } else if (eventDesc.includes('fête') || eventDesc.includes('party')) {
        iconClass = 'event-party';
    } else if (eventDesc.includes('religieux') || eventDesc.includes('religious')) {
        iconClass = 'event-religious';
    }
    
    // Retourner le HTML de l'icône d'historique
    return `<div class="history-icon ${iconClass}"></div>`;
}

// Remplacer les fonctions originales qui génèrent les éléments d'interface
function enhanceUserInterface() {
    // Remplacer la façon dont les membres sont affichés
    if (window.createMemberItem) {
        const originalCreateMemberItem = window.createMemberItem;
        window.createMemberItem = function(member) {
            const item = document.createElement('div');
            item.className = 'member-item';
            
            // Utiliser l'avatar moderne au lieu de l'icône originale
            item.innerHTML = `
                ${generateModernAvatar(member.name, member.country)}
                <div class="member-info">
                    <h3 class="user-name">${member.name}</h3>
                    <p class="user-location">${member.country}, ${member.city}</p>
                </div>
                <span class="badge ${member.isAdmin ? 'admin-badge' : 'member-badge'}">
                    ${member.isAdmin ? 'Admin' : 'Membre'}
                </span>
            `;
            
            return item;
        };
    }
    
    // Remplacer la façon dont les dépôts sont affichés
    if (window.createDepositItem) {
        const originalCreateDepositItem = window.createDepositItem;
        window.createDepositItem = function(deposit) {
            const item = document.createElement('div');
            item.className = 'deposit-item';
            
            // Utiliser l'avatar moderne au lieu de l'icône originale
            item.innerHTML = `
                ${generateModernAvatar(deposit.userName, deposit.userCountry)}
                <div class="deposit-info">
                    <h3 class="user-name">${deposit.userName}</h3>
                    <p class="user-location">${deposit.userCountry}, ${deposit.date}</p>
                </div>
                <div class="deposit-amount-container">
                    <p class="deposit-amount">${formatCurrency(deposit.amount)} GNF</p>
                    <p class="deposit-date">${formatDate(deposit.date)}</p>
                </div>
            `;
            
            return item;
        };
    }
    
    // Remplacer la façon dont les transactions sont affichées
    if (window.createTransactionItem) {
        const originalCreateTransactionItem = window.createTransactionItem;
        window.createTransactionItem = function(transaction) {
            const item = document.createElement('div');
            item.className = 'transaction-item';
            
            // Utiliser l'icône d'historique spécifique
            item.innerHTML = `
                ${generateHistoryIcon(transaction.type, transaction.description)}
                <div class="transaction-info">
                    <h3 class="user-name">${transaction.userName}</h3>
                    <p class="user-location">${transaction.description || 'Dépôt mensuel'}</p>
                </div>
                <div class="transaction-amount-container">
                    <p class="transaction-amount ${transaction.type === 'withdrawal' ? 'withdrawal' : ''}">${transaction.type === 'withdrawal' ? '-' : ''}${formatCurrency(transaction.amount)} GNF</p>
                    <p class="transaction-date">${formatDate(transaction.date)}</p>
                </div>
            `;
            
            return item;
        };
    }
    
    // Remplacer la façon dont les cérémonies sont affichées
    if (window.createCeremonyItem) {
        const originalCreateCeremonyItem = window.createCeremonyItem;
        window.createCeremonyItem = function(ceremony) {
            const item = document.createElement('div');
            item.className = 'ceremony-item';
            
            // Utiliser l'icône d'historique spécifique
            item.innerHTML = `
                ${generateHistoryIcon('ceremony', ceremony.title)}
                <div class="ceremony-info">
                    <h3 class="event-name">${ceremony.title}</h3>
                    <p class="event-date">${formatDateFull(ceremony.date)}</p>
                </div>
                <div class="ceremony-amount-container">
                    <p class="transaction-amount withdrawal">${formatCurrency(ceremony.budget)} GNF</p>
                </div>
            `;
            
            return item;
        };
    }
    
    // Remplacer la façon dont les cartes de cérémonie sont affichées
    if (window.createCeremonyCard) {
        const originalCreateCeremonyCard = window.createCeremonyCard;
        window.createCeremonyCard = function(ceremony) {
            const card = document.createElement('div');
            card.className = 'ceremony-card';
            
            // Utiliser l'image de cérémonie spécifique
            card.innerHTML = `
                ${generateCeremonyImage(ceremony.title)}
                <h3 class="ceremony-title">${ceremony.title}</h3>
                <p class="ceremony-date">${formatDateFull(ceremony.date)}</p>
                <p class="ceremony-amount">${formatCurrency(ceremony.budget)} GNF</p>
                <button class="ceremony-action-btn">
                    <i class="fas fa-info-circle"></i>
                    Détails
                </button>
            `;
            
            return card;
        };
    }
    
    // Remplacer l'avatar du profil
    const profileScreen = document.getElementById('profile-screen');
    if (profileScreen) {
        const profileAvatar = profileScreen.querySelector('.profile-avatar');
        if (profileAvatar && currentUser) {
            const avatarContainer = document.createElement('div');
            avatarContainer.className = 'profile-avatar-container';
            avatarContainer.innerHTML = `
                <div class="modern-avatar xl avatar-style-${Math.floor(Math.random() * 5) + 1} avatar-pattern-${Math.floor(Math.random() * 3) + 1}">
                    <div class="avatar-initials">${currentUser.name.charAt(0).toUpperCase()}</div>
                </div>
            `;
            
            if (profileAvatar.parentNode) {
                profileAvatar.parentNode.replaceChild(avatarContainer, profileAvatar);
            }
        }
    }
}

// Animer la galerie de photos de famille
function setupFamilyGallery() {
    const gallery = document.getElementById('family-gallery');
    if (!gallery) return;
    
    // Ajouter un défilement automatique
    let scrollInterval;
    
    const startAutoScroll = () => {
        scrollInterval = setInterval(() => {
            gallery.scrollLeft += 1;
            
            // Revenir au début si on atteint la fin
            if (gallery.scrollLeft >= gallery.scrollWidth - gallery.clientWidth) {
                gallery.scrollLeft = 0;
            }
        }, 30);
    };
    
    const stopAutoScroll = () => {
        clearInterval(scrollInterval);
    };
    
    // Démarrer le défilement automatique
    startAutoScroll();
    
    // Arrêter le défilement quand l'utilisateur interagit avec la galerie
    gallery.addEventListener('mouseenter', stopAutoScroll);
    gallery.addEventListener('touchstart', stopAutoScroll);
    
    // Reprendre le défilement quand l'utilisateur quitte la galerie
    gallery.addEventListener('mouseleave', startAutoScroll);
    gallery.addEventListener('touchend', () => {
        setTimeout(startAutoScroll, 3000);
    });
}

// Initialiser les améliorations d'interface
document.addEventListener('DOMContentLoaded', () => {
    enhanceUserInterface();
    setupFamilyGallery();
    
    console.log('Avatars modernes et images de cérémonies initialisés');
});
