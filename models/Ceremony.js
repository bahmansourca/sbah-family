const mongoose = require('mongoose');

const ceremonySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['mariage', 'baptême', 'funérailles', 'autre'],
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    estimatedBudget: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        required: true
    },
    location: {
        country: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        address: String
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
        default: 'upcoming'
    },
    participants: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['guest', 'organizer', 'contributor']
        },
        contribution: {
            amount: Number,
            status: {
                type: String,
                enum: ['pending', 'completed'],
                default: 'pending'
            }
        }
    }],
    images: [{
        url: String,
        caption: String
    }],
    totalCollected: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index pour les recherches fréquentes
ceremonySchema.index({ date: 1, status: 1 });
ceremonySchema.index({ organizer: 1 });

// Méthode pour calculer le total collecté
ceremonySchema.methods.updateTotalCollected = async function() {
    const Transaction = mongoose.model('Transaction');
    const total = await Transaction.aggregate([
        {
            $match: {
                ceremony: this._id,
                status: 'completed',
                type: 'deposit'
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$amount' }
            }
        }
    ]);

    this.totalCollected = total.length > 0 ? total[0].total : 0;
    await this.save();
};

// Middleware pour notifier les participants
ceremonySchema.post('save', async function(doc) {
    if (doc.isModified('status')) {
        // Implémenter la logique de notification ici
        // Elle sera développée dans le service de notification
    }
});

module.exports = mongoose.model('Ceremony', ceremonySchema); 