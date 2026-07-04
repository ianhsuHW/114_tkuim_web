const mongoose = require('mongoose');

const FixedProductSchema = new mongoose.Schema({
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sellerName: { type: String, required: true },
    sellerAvatar: { type: String },
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    images: [{ type: String }],
    mode: { type: String, default: 'fixed' }, // Strict default
    status: { type: String, enum: ['active', 'sold'], default: 'active' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FixedProduct', FixedProductSchema);
