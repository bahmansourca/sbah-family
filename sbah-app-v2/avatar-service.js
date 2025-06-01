class AvatarService {
    constructor() {
        this.colors = [
            '#e0e7ff', // Bleu clair
            '#fbbf24', // Jaune
            '#34d399', // Vert
            '#f87171', // Rouge
            '#a78bfa', // Violet
            '#60a5fa', // Bleu
            '#f472b6', // Rose
            '#4ade80'  // Vert clair
        ];
    }

    // Génère un avatar SVG pour un membre
    generateAvatar(name, size = 40) {
        const initials = this.getInitials(name);
        const color = this.getColorForName(name);
        
        return `
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
                <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${color}"/>
                <text x="50%" y="50%" text-anchor="middle" dy=".3em" 
                    fill="white" font-family="Poppins, Arial" font-weight="bold" 
                    font-size="${size/2}px">${initials}</text>
            </svg>
        `;
    }

    // Génère une illustration pour un événement
    generateEventIllustration(type) {
        const illustrations = {
            marriage: {
                icon: 'fa-heart',
                color: '#fbbf24',
                background: '#fef3c7'
            },
            funeral: {
                icon: 'fa-cross',
                color: '#4b5563',
                background: '#e5e7eb'
            },
            sacrifice: {
                icon: 'fa-moon',
                color: '#7c3aed',
                background: '#ede9fe'
            },
            baptism: {
                icon: 'fa-dove',
                color: '#60a5fa',
                background: '#dbeafe'
            },
            meeting: {
                icon: 'fa-users',
                color: '#34d399',
                background: '#d1fae5'
            },
            other: {
                icon: 'fa-star',
                color: '#f59e0b',
                background: '#fef3c7'
            }
        };

        const event = illustrations[type] || illustrations.other;
        return `
            <div class="event-icon" style="background:${event.background};color:${event.color};">
                <i class="fas ${event.icon}"></i>
            </div>
        `;
    }

    // Génère une illustration pour le solde
    generateBalanceIllustration() {
        return `
            <svg viewBox="0 0 220 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="110" cy="110" rx="100" ry="10" fill="#e0e7ff"/>
                <circle cx="60" cy="60" r="28" fill="#fbbf24"/>
                <circle cx="160" cy="60" r="28" fill="#2563eb"/>
                <circle cx="110" cy="50" r="32" fill="#38bdf8"/>
                <ellipse cx="110" cy="100" rx="70" ry="18" fill="#fff" fill-opacity=".7"/>
                <ellipse cx="60" cy="100" rx="22" ry="7" fill="#fff" fill-opacity=".7"/>
                <ellipse cx="160" cy="100" rx="22" ry="7" fill="#fff" fill-opacity=".7"/>
                <text x="110" y="60" text-anchor="middle" font-size="18" font-family="Poppins,Arial" fill="#fff" font-weight="bold">Famille</text>
            </svg>
        `;
    }

    // Génère une illustration pour les paiements
    generatePaymentIllustration(method) {
        const illustrations = {
            'orange-money': {
                icon: 'fa-mobile-alt',
                color: '#f97316',
                background: '#ffedd5'
            },
            'visa': {
                icon: 'fa-credit-card',
                color: '#1e40af',
                background: '#dbeafe'
            },
            'cash': {
                icon: 'fa-money-bill',
                color: '#16a34a',
                background: '#dcfce7'
            }
        };

        const payment = illustrations[method] || illustrations.cash;
        return `
            <div class="payment-icon" style="background:${payment.background};color:${payment.color};">
                <i class="fas ${payment.icon}"></i>
            </div>
        `;
    }

    // Génère une illustration pour les notifications
    generateNotificationIllustration(type) {
        const illustrations = {
            payment: {
                icon: 'fa-money-bill-wave',
                color: '#16a34a',
                background: '#dcfce7'
            },
            event: {
                icon: 'fa-calendar-alt',
                color: '#f59e0b',
                background: '#fef3c7'
            },
            system: {
                icon: 'fa-bell',
                color: '#3b82f6',
                background: '#dbeafe'
            }
        };

        const notification = illustrations[type] || illustrations.system;
        return `
            <div class="notification-icon" style="background:${notification.background};color:${notification.color};">
                <i class="fas ${notification.icon}"></i>
            </div>
        `;
    }

    // Utilitaires
    getInitials(name) {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    getColorForName(name) {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return this.colors[Math.abs(hash) % this.colors.length];
    }
}

// Export pour utilisation dans d'autres fichiers
window.AvatarService = AvatarService; 