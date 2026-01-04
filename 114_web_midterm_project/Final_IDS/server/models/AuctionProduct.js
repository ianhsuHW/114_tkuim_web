const mongoose = require('mongoose');

const AuctionProductSchema = new mongoose.Schema({
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sellerName: { type: String, required: true },
    sellerAvatar: { type: String },
    title: { type: String, required: true },
    description: { type: String },
    startPrice: { type: Number, required: true }, // Renamed from price for clarity
    currentPrice: { type: Number, required: true },
    images: [{ type: String }],
    mode: { type: String, default: 'auction' }, // Strict default
    endTime: { type: Number, required: true },
    bids: [{
        bidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        amount: { type: Number },
        time: { type: Date, default: Date.now }
    }],
    status: { type: String, enum: ['active', 'sold', 'expired'], default: 'active' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuctionProduct', AuctionProductSchema);
