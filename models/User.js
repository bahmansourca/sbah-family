const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true,
        enum: ['Guinée', 'Canada', 'USA', 'Europe']
    },
    city: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'member'],
        default: 'member'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    notificationPreferences: {
        email: {
            type: Boolean,
            default: true
        },
        push: {
            type: Boolean,
            default: true
        }
    }
}, {
    timestamps: true
});

// Hash le mot de passe avant de sauvegarder
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Méthode pour vérifier le mot de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 