const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['deposit', 'withdrawal'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'GNF'
    },
    paymentMethod: {
        type: String,
        enum: ['orange_money', 'bank_transfer', 'cash'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    paydunyaReference: {
        type: String,
        sparse: true
    },
    ceremony: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ceremony',
        default: null
    },
    description: String,
    metadata: {
        paydunyaResponse: Object,
        adminApproval: {
            approved: {
                type: Boolean,
                default: false
            },
            approvedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            approvedAt: Date
        }
    }
}, {
    timestamps: true
});

// Index pour les recherches fréquentes
transactionSchema.index({ user: 1, type: 1, status: 1 });
transactionSchema.index({ paydunyaReference: 1 }, { sparse: true });

// Méthode pour calculer le solde total
transactionSchema.statics.calculateBalance = async function() {
    const result = await this.aggregate([
        {
            $group: {
                _id: null,
                totalDeposits: {
                    $sum: {
                        $cond: [
                            { $and: [
                                { $eq: ['$type', 'deposit'] },
                                { $eq: ['$status', 'completed'] }
                            ]},
                            '$amount',
                            0
                        ]
                    }
                },
                totalWithdrawals: {
                    $sum: {
                        $cond: [
                            { $and: [
                                { $eq: ['$type', 'withdrawal'] },
                                { $eq: ['$status', 'completed'] }
                            ]},
                            '$amount',
                            0
                        ]
                    }
                }
            }
        }
    ]);

    if (result.length === 0) return 0;
    return result[0].totalDeposits - result[0].totalWithdrawals;
};

// Middleware pour notifier les utilisateurs après une transaction
transactionSchema.post('save', async function(doc) {
    if (doc.status === 'completed') {
        // Implémenter la logique de notification ici
        // Elle sera développée dans le service de notification
    }
});

module.exports = mongoose.model('Transaction', transactionSchema); 