// Service d'interface utilisateur
class UIService {
    constructor() {
        this.theme = {
            colors: {
                primary: '#4a90e2',    // Bleu clair
                secondary: '#ffd700',  // Doré
                success: '#2ecc71',    // Vert nature
                warning: '#f1c40f',    // Jaune
                danger: '#e74c3c',     // Rouge
                light: '#ffffff',      // Blanc
                dark: '#2c3e50',       // Bleu foncé
                gray: '#95a5a6'        // Gris
            },
            fonts: {
                primary: 'Poppins, sans-serif',
                secondary: 'Roboto, sans-serif'
            },
            spacing: {
                xs: '0.25rem',
                sm: '0.5rem',
                md: '1rem',
                lg: '1.5rem',
                xl: '2rem'
            },
            borderRadius: {
                sm: '0.25rem',
                md: '0.5rem',
                lg: '1rem',
                full: '9999px'
            }
        };

        this.icons = {
            payment: {
                'orange-money': 'mobile-alt',
                'mtn-momo': 'mobile-alt',
                'visa': 'credit-card',
                'cash': 'money-bill'
            },
            events: {
                'marriage': 'heart',
                'funeral': 'cross',
                'sacrifice': 'drumstick-bite',
                'baptism': 'baby',
                'meeting': 'users',
                'other': 'calendar'
            },
            status: {
                'paid': 'check-circle',
                'pending': 'clock',
                'overdue': 'exclamation-circle',
                'cancelled': 'times-circle'
            }
        };

        this.avatars = {
            default: 'user-circle',
            admin: 'user-shield',
            member: 'user'
        };

        this.countryFlags = {
            'GN': 'guinea',
            'SN': 'senegal',
            'ML': 'mali',
            'CI': 'ivory-coast',
            'FR': 'france',
            'US': 'united-states'
        };
    }

    // Méthodes de style
    getColor(color) {
        return this.theme.colors[color] || color;
    }

    getFont(font) {
        return this.theme.fonts[font] || font;
    }

    getSpacing(size) {
        return this.theme.spacing[size] || size;
    }

    getBorderRadius(size) {
        return this.theme.borderRadius[size] || size;
    }

    // Méthodes d'icônes
    getPaymentIcon(method) {
        return this.icons.payment[method] || this.icons.payment.cash;
    }

    getEventIcon(type) {
        return this.icons.events[type] || this.icons.events.other;
    }

    getStatusIcon(status) {
        return this.icons.status[status] || this.icons.status.pending;
    }

    getAvatarIcon(role) {
        return this.avatars[role] || this.avatars.default;
    }

    getCountryFlag(country) {
        return this.countryFlags[country] || this.countryFlags.GN;
    }

    // Méthodes de formatage
    formatCurrency(amount) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'GNF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(new Date(date));
    }

    formatDateTime(date) {
        return new Intl.DateTimeFormat('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }

    // Méthodes de composants
    createCard(title, content, type = 'default') {
        return `
            <div class="card card-${type}">
                <div class="card-header">
                    <h3 class="card-title">${title}</h3>
                </div>
                <div class="card-body">
                    ${content}
                </div>
            </div>
        `;
    }

    createButton(text, type = 'primary', icon = null) {
        const iconHtml = icon ? `<i class="fas fa-${icon}"></i> ` : '';
        return `
            <button class="btn btn-${type}">
                ${iconHtml}${text}
            </button>
        `;
    }

    createBadge(text, type = 'default') {
        return `<span class="badge badge-${type}">${text}</span>`;
    }

    createAlert(message, type = 'info') {
        return `
            <div class="alert alert-${type}">
                <i class="fas fa-${this.getStatusIcon(type)}"></i>
                ${message}
            </div>
        `;
    }

    // Méthodes de mise en page
    createGrid(items, columns = 3) {
        return `
            <div class="grid grid-cols-${columns} gap-${this.getSpacing('md')}">
                ${items.join('')}
            </div>
        `;
    }

    createList(items, type = 'default') {
        return `
            <ul class="list list-${type}">
                ${items.map(item => `<li>${item}</li>`).join('')}
            </ul>
        `;
    }

    // Méthodes de graphiques
    createPieChart(data, title) {
        // Implémentation du graphique en camembert
        return `
            <div class="chart-container">
                <h4>${title}</h4>
                <canvas id="${title.toLowerCase().replace(/\s+/g, '-')}-chart"></canvas>
            </div>
        `;
    }

    createBarChart(data, title) {
        // Implémentation du graphique en barres
        return `
            <div class="chart-container">
                <h4>${title}</h4>
                <canvas id="${title.toLowerCase().replace(/\s+/g, '-')}-chart"></canvas>
            </div>
        `;
    }

    // Méthodes de responsive
    isMobile() {
        return window.innerWidth < 768;
    }

    isTablet() {
        return window.innerWidth >= 768 && window.innerWidth < 1024;
    }

    isDesktop() {
        return window.innerWidth >= 1024;
    }

    // Méthodes d'animations
    fadeIn(element, duration = 300) {
        element.style.opacity = 0;
        element.style.display = 'block';
        
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            
            element.style.opacity = Math.min(progress / duration, 1);
            
            if (progress < duration) {
                window.requestAnimationFrame(animate);
            }
        };
        
        window.requestAnimationFrame(animate);
    }

    fadeOut(element, duration = 300) {
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            
            element.style.opacity = 1 - Math.min(progress / duration, 1);
            
            if (progress < duration) {
                window.requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        };
        
        window.requestAnimationFrame(animate);
    }
}

// Export du service
const uiService = new UIService();
export default uiService; 