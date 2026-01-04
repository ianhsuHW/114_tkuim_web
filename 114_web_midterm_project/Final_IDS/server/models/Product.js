const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sellerName: { type: String, required: true }, // Cache for easy display
    sellerAvatar: { type: String }, // Cache for easy display
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    images: [{ type: String }], // Array of image URLs
    mode: { type: String, enum: ['fixed', 'auction'], default: 'fixed' },
    endTime: { type: Number }, // For auctions
    bids: [{
        bidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        amount: { type: Number },
        time: { type: Date, default: Date.now }
    }],
    status: { type: String, enum: ['active', 'sold', 'expired'], default: 'active' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);
