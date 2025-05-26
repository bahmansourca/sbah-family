// Script UI pour adapter l'interface au design de référence pastel

document.addEventListener('DOMContentLoaded', function() {
    // Appliquer le style pastel à tous les écrans
    applyPastelStyle();

    // Configurer les écouteurs d'événements
    setupEventListeners();

    // Mettre à jour la navigation pour qu'elle corresponde au design de référence
    updateNavigation();
});

function applyPastelStyle() {
    // Formatter les montants pour qu'ils correspondent au design de référence
    formatAmounts();

    // Mettre à jour le layout des listes de transactions
    updateTransactionLayout();

    // Créer les onglets pour l'historique (Entrées/Sorties)
    createHistoryTabs();

    // Mettre à jour l'affichage des cérémonies
    updateCeremoniesDisplay();

    // Mettre à jour l'affichage des avatars pour correspondre au design de référence
    updateAvatars();
}

function formatAmounts() {
    // Formatter tous les montants avec un point pour séparer les milliers
    document.querySelectorAll('.deposit-amount, .transaction-amount, .ceremony-amount, .balance-amount').forEach(el => {
        const text = el.textContent;
        if (text && text.includes('GNF')) {
            const amount = parseInt(text.replace(/\D/g, ''));
            if (!isNaN(amount)) {
                el.textContent = formatCurrency(amount) + ' GNF';
            }
        }
    });
}

// Mise à jour du format de monnaie pour correspondre au design (300.000)
window.formatCurrency = function(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

function updateTransactionLayout() {
    // Mettre à jour la mise en page des éléments de transaction
    document.querySelectorAll('.transaction-item').forEach(item => {
        const transactionType = item.querySelector('.transaction-amount').classList.contains('withdrawal') 
            ? 'withdrawal' : 'deposit';
        
        // Ajouter une classe pour le style
        item.classList.add(transactionType);
        
        // Mettre à jour le texte MN pour les montants (comme sur le design)
        const amountContainer = item.querySelector('.transaction-amount-container');
        if (amountContainer) {
            const amountText = amountContainer.querySelector('.transaction-amount').textContent;
            const amount = parseInt(amountText.replace(/\D/g, ''));
            
            if (!isNaN(amount)) {
                const mnElement = document.createElement('div');
                mnElement.className = 'transaction-mn';
                mnElement.textContent = '300 MN';
                amountContainer.appendChild(mnElement);
            }
        }
    });
}

function createHistoryTabs() {
    const historyScreen = document.getElementById('history-screen');
    if (!historyScreen) return;
    
    const historyTabsContainer = historyScreen.querySelector('.history-tabs');
    if (!historyTabsContainer) {
        // Créer les onglets s'ils n'existent pas
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'history-tabs';
        
        const entriesTab = document.createElement('div');
        entriesTab.className = 'history-tab active';
        entriesTab.id = 'entries-tab';
        entriesTab.textContent = 'Entrées';
        
        const exitsTab = document.createElement('div');
        exitsTab.className = 'history-tab';
        exitsTab.id = 'exits-tab';
        exitsTab.textContent = 'Sorties';
        
        tabsContainer.appendChild(entriesTab);
        tabsContainer.appendChild(exitsTab);
        
        // Insérer après l'en-tête
        const header = historyScreen.querySelector('.header');
        if (header) {
            header.parentNode.insertBefore(tabsContainer, header.nextSibling);
        }
        
        // Configurer les écouteurs d'événements
        entriesTab.addEventListener('click', () => {
            entriesTab.classList.add('active');
            exitsTab.classList.remove('active');
            showTransactions('deposit');
        });
        
        exitsTab.addEventListener('click', () => {
            exitsTab.classList.add('active');
            entriesTab.classList.remove('active');
            showTransactions('withdrawal');
        });
    }
}

function showTransactions(type) {
    const transactions = document.querySelectorAll('.transaction-item');
    transactions.forEach(tx => {
        if (type === 'all') {
            tx.style.display = 'flex';
        } else if (type === 'deposit' && !tx.classList.contains('withdrawal')) {
            tx.style.display = 'flex';
        } else if (type === 'withdrawal' && tx.classList.contains('withdrawal')) {
            tx.style.display = 'flex';
        } else {
            tx.style.display = 'none';
        }
    });
}

function updateCeremoniesDisplay() {
    // Mettre à jour l'affichage des cérémonies
    document.querySelectorAll('.ceremony-card').forEach(card => {
        const title = card.querySelector('.ceremony-title');
        if (title) {
            const titleText = title.textContent.toLowerCase();
            let type = 'other';
            
            if (titleText.includes('mariage')) {
                type = 'marriage';
            } else if (titleText.includes('funérail') || titleText.includes('alpha')) {
                type = 'funeral';
            }
            
            // Ajouter l'élément d'image s'il n'existe pas
            if (!card.querySelector('.ceremony-image-wrapper')) {
                const imageContainer = document.createElement('div');
                imageContainer.className = 'ceremony-image-wrapper';
                
                const image = document.createElement('img');
                image.className = 'ceremony-image-illustration';
                image.src = type === 'marriage' 
                    ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiIHJ4PSIxMiIgZmlsbD0iI2U2ZjJmZiIvPjxyZWN0IHg9IjMwIiB5PSIzNSIgd2lkdGg9IjIwIiBoZWlnaHQ9IjMwIiByeD0iMyIgZmlsbD0iIzFhNWY3YSIvPjxjaXJjbGUgY3g9IjQwIiBjeT0iMjUiIHI9IjEwIiBmaWxsPSIjRjVEMEM1Ii8+PHJlY3QgeD0iMzUiIHk9IjY1IiB3aWR0aD0iNSIgaGVpZ2h0PSIxNSIgZmlsbD0iIzFhNWY3YSIvPjxyZWN0IHg9IjQwIiB5PSI2NSIgd2lkdGg9IjUiIGhlaWdodD0iMTUiIGZpbGw9IiMxYTVmN2EiLz48cGF0aCBkPSJNNzUgMzUgTDg1IDY1IEw2NSA2NSBaIiBmaWxsPSIjRkZEMTY2Ii8+PGNpcmNsZSBjeD0iNzUiIGN5PSIyNSIgcj0iMTAiIGZpbGw9IiNGNUQwQzUiLz48cmVjdCB4PSI3MCIgeT0iNjUiIHdpZHRoPSI1IiBoZWlnaHQ9IjE1IiBmaWxsPSIjRkZEMTY2Ii8+PHJlY3QgeD0iNzUiIHk9IjY1IiB3aWR0aD0iNSIgaGVpZ2h0PSIxNSIgZmlsbD0iI0ZGRDEwIi8+PHBhdGggZD0iTTU3LjUgODUgQzUyIDc1IDQyIDgyIDQyIDkwIEM0MiA5OCA1Ny41IDEwNSA1Ny41IDEwNSBDNTcuNSAxMDUgNzMgOTggNzMgOTAgQzczIDgyIDYzIDc1IDU3LjUgODUgWiIgZmlsbD0iI2Y1NjU2NSIvPjwvc3ZnPg=='
                    : type === 'funeral' 
                        ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiIHJ4PSIxMiIgZmlsbD0iI2YwZjBmMCIvPjxyZWN0IHg9IjI1IiB5PSIyMCIgd2lkdGg9IjcwIiBoZWlnaHQ9IjgwIiByeD0iNSIgZmlsbD0iIzgwNUFENSIvPjxyZWN0IHg9IjMwIiB5PSIyNSIgd2lkdGg9IjYwIiBoZWlnaHQ9IjcwIiByeD0iMyIgZmlsbD0iI0UyRThGMCIvPjxyZWN0IHg9IjQ1IiB5PSIzNSIgd2lkdGg9IjMwIiBoZWlnaHQ9IjQwIiByeD0iMyIgZmlsbD0iIzFhNWY3YSIvPjxjaXJjbGUgY3g9IjYwIiBjeT0iMzAiIHI9IjEyIiBmaWxsPSIjRjVEMEM1Ii8+PHJlY3QgeD0iMTUiIHk9IjcwIiB3aWR0aD0iNSIgaGVpZ2h0PSIyMCIgZmlsbD0iI0Y2RTA1RSIvPjxwYXRoIGQ9Ik0xNSA3MCBMMjAgNzAgTDE3LjUgNjAgWiIgZmlsbD0iI0Y2QUQ1NSIvPjxyZWN0IHg9IjEwMCIgeT0iNzAiIHdpZHRoPSI1IiBoZWlnaHQ9IjIwIiBmaWxsPSIjRjZFMDVFIi8+PHBhdGggZD0iTTEwMCA3MCBMMTMwMCA3MCBMMTAyLjUgNjAgWiIgZmlsbD0iI0Y2QUQ1NSIvPjwvc3ZnPg=='
                        : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiIHJ4PSIxMiIgZmlsbD0iI2YwZjBmMCIvPjxjaXJjbGUgY3g9IjYwIiBjeT0iNjAiIHI9IjMwIiBmaWxsPSIjMWE1ZjdhIiBvcGFjaXR5PSIwLjIiLz48cGF0aCBkPSJNNDUgNjAgTDU1IDcwIEw3NSA1MCIgc3Ryb2tlPSIjMWE1ZjdhIiBzdHJva2Utd2lkdGg9IjUiIGZpbGw9Im5vbmUiLz48L3N2Zz4=';
                
                imageContainer.appendChild(image);
                
                // Insérer avant le titre
                if (title.parentNode) {
                    title.parentNode.insertBefore(imageContainer, title);
                }
            }
        }
    });
}

function updateAvatars() {
    // Mettre à jour l'affichage des avatars pour qu'ils correspondent au design de référence
    document.querySelectorAll('.user-avatar').forEach(avatar => {
        const item = avatar.closest('.member-item, .deposit-item, .transaction-item');
        if (item) {
            const name = item.querySelector('.user-name')?.textContent || '';
            
            // Déterminer les initiales
            let initials = name.charAt(0).toUpperCase();
            const nameParts = name.split(' ');
            if (nameParts.length > 1 && nameParts[1].length > 0) {
                initials += nameParts[1].charAt(0).toUpperCase();
            }
            
            // Créer un SVG pour l'avatar
            avatar.innerHTML = `
                <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="20" fill="#e6f2ff"/>
                    <text x="20" y="25" font-size="16" font-weight="bold" text-anchor="middle" fill="#1a5f7a">${initials}</text>
                </svg>
            `;
        }
    });
}

function setupEventListeners() {
    // Bouton retour pour l'historique
    const historyBackBtn = document.getElementById('history-back-btn');
    if (historyBackBtn) {
        historyBackBtn.addEventListener('click', () => {
            document.getElementById('history-screen').classList.add('hidden');
            document.getElementById('home-screen').classList.remove('hidden');
        });
    }
    
    // Bouton retour pour les cérémonies
    const ceremoniesBackBtn = document.getElementById('ceremonies-back-btn');
    if (ceremoniesBackBtn) {
        ceremoniesBackBtn.addEventListener('click', () => {
            document.getElementById('ceremonies-screen').classList.add('hidden');
            document.getElementById('home-screen').classList.remove('hidden');
        });
    }
    
    // Bouton retour pour le dépôt
    const depositBackBtn = document.getElementById('deposit-back-btn');
    if (depositBackBtn) {
        depositBackBtn.addEventListener('click', () => {
            document.getElementById('deposit-screen').classList.add('hidden');
            document.getElementById('home-screen').classList.remove('hidden');
        });
    }
}

function updateNavigation() {
    // Mettre à jour la navigation pour qu'elle corresponde au design de référence
    const navigation = document.querySelector('.navigation');
    if (navigation) {
        navigation.innerHTML = `
            <div class="nav-item active" data-screen="home-screen">
                <i class="fas fa-home"></i>
                <span>Accueil</span>
            </div>
            <div class="nav-item" data-screen="deposit-screen">
                <i class="fas fa-plus-circle"></i>
                <span>Dépôt</span>
            </div>
            <div class="nav-item" data-screen="history-screen">
                <i class="fas fa-history"></i>
                <span>Historique</span>
            </div>
        `;
        
        // Ajouter les écouteurs d'événements
        navigation.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const targetScreen = item.getAttribute('data-screen');
                if (targetScreen) {
                    // Masquer tous les écrans
                    document.querySelectorAll('.screen').forEach(screen => {
                        screen.classList.add('hidden');
                    });
                    
                    // Afficher l'écran cible
                    const screen = document.getElementById(targetScreen);
                    if (screen) {
                        screen.classList.remove('hidden');
                    }
                    
                    // Mettre à jour l'élément actif
                    navigation.querySelectorAll('.nav-item').forEach(navItem => {
                        navItem.classList.remove('active');
                    });
                    item.classList.add('active');
                }
            });
        });
    }
}

// Réexporter les fonctions globales
window.applyPastelStyle = applyPastelStyle;
window.updateTransactionLayout = updateTransactionLayout;
window.updateCeremoniesDisplay = updateCeremoniesDisplay;
