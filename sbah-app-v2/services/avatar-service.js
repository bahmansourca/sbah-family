class AvatarService {
    constructor() {
        this.colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
            '#D4A5A5', '#9B59B6', '#3498DB', '#E67E22', '#2ECC71'
        ];
        this.shapes = ['circle', 'square', 'triangle'];
        this.patterns = ['dots', 'lines', 'waves'];
    }

    // Générer un avatar unique basé sur un identifiant
    generateAvatar(id) {
        const hash = this.hashCode(id);
        const color = this.colors[Math.abs(hash) % this.colors.length];
        const shape = this.shapes[Math.abs(hash >> 8) % this.shapes.length];
        const pattern = this.patterns[Math.abs(hash >> 16) % this.patterns.length];

        return this.createAvatarElement(color, shape, pattern);
    }

    // Créer l'élément HTML de l'avatar
    createAvatarElement(color, shape, pattern) {
        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.style.backgroundColor = color;

        // Ajouter la forme
        const shapeElement = document.createElement('div');
        shapeElement.className = `avatar-shape ${shape}`;
        avatar.appendChild(shapeElement);

        // Ajouter le motif
        const patternElement = document.createElement('div');
        patternElement.className = `avatar-pattern ${pattern}`;
        avatar.appendChild(patternElement);

        return avatar;
    }

    // Générer un hash simple à partir d'une chaîne
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    }

    // Régénérer un avatar existant
    regenerateAvatar(avatarElement, id) {
        const newAvatar = this.generateAvatar(id);
        avatarElement.innerHTML = newAvatar.innerHTML;
        avatarElement.className = newAvatar.className;
    }

    // Mettre à jour les couleurs de l'avatar
    updateAvatarColors(avatarElement, colors) {
        if (colors && colors.length > 0) {
            this.colors = colors;
            const id = avatarElement.getAttribute('data-id');
            if (id) {
                this.regenerateAvatar(avatarElement, id);
            }
        }
    }

    // Mettre à jour les formes de l'avatar
    updateAvatarShapes(avatarElement, shapes) {
        if (shapes && shapes.length > 0) {
            this.shapes = shapes;
            const id = avatarElement.getAttribute('data-id');
            if (id) {
                this.regenerateAvatar(avatarElement, id);
            }
        }
    }

    // Mettre à jour les motifs de l'avatar
    updateAvatarPatterns(avatarElement, patterns) {
        if (patterns && patterns.length > 0) {
            this.patterns = patterns;
            const id = avatarElement.getAttribute('data-id');
            if (id) {
                this.regenerateAvatar(avatarElement, id);
            }
        }
    }
} 