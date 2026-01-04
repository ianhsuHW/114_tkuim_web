const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const FixedProduct = require('../models/FixedProduct');
const AuctionProduct = require('../models/AuctionProduct');
const User = require('../models/User'); // Assuming you have this
// Middleware to check auth (simple version for demo)
const checkAuth = (req, res, next) => {
    // In a real app, verify JWT here. 
    // For this prompt-based rapid dev, we'll verify header 'x-user-id' sent from frontend
    // OR just trust the body for the 'demo' feel if strict auth isn't set up yet.
    // Let's rely on body.userId for simplicity unless session exists.
    next();
};

// Multer Storage
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, 'prod-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// GET All Public Products
router.get('/public', async (req, res) => {
    try {
        const [fixed, auctions] = await Promise.all([
            FixedProduct.find({ status: 'active' }).sort({ createdAt: -1 }),
            AuctionProduct.find({ status: 'active' }).sort({ createdAt: -1 })
        ]);

        // Normalize fields for frontend (map _id to id, price to proper field)
        const fixedFormatted = fixed.map(p => p.toObject()).map(p => ({ ...p, mode: 'fixed' }));
        const auctionsFormatted = auctions.map(p => p.toObject()).map(p => ({
            ...p,
            price: p.currentPrice, // Map currentPrice -> price for frontend compat
            mode: 'auction'
        }));

        const combined = [...fixedFormatted, ...auctionsFormatted].sort((a, b) => b.createdAt - a.createdAt);
        res.json(combined);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET My Products
router.get('/mine', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const [fixed, auctions] = await Promise.all([
            FixedProduct.find({ seller: userId }).sort({ createdAt: -1 }),
            AuctionProduct.find({ seller: userId }).sort({ createdAt: -1 })
        ]);

        const fixedFormatted = fixed.map(p => p.toObject()).map(p => ({ ...p, mode: 'fixed' }));
        const auctionsFormatted = auctions.map(p => p.toObject()).map(p => ({
            ...p,
            price: p.currentPrice,
            mode: 'auction'
        }));

        res.json([...fixedFormatted, ...auctionsFormatted]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST Upload Product
router.post('/', upload.array('photos', 5), async (req, res) => {
    try {
        const { title, description, price, mode, duration, sellerId, sellerName, sellerAvatar } = req.body;
        const images = req.files.map(f => `/uploads/${f.filename}`);

        let newProduct;
        if (mode === 'auction') {
            const endTime = Date.now() + parseInt(duration);
            newProduct = new AuctionProduct({
                seller: sellerId,
                sellerName,
                sellerAvatar,
                title,
                description,
                startPrice: price,
                currentPrice: price,
                images,
                endTime
            });
        } else {
            newProduct = new FixedProduct({
                seller: sellerId,
                sellerName,
                sellerAvatar,
                title,
                description,
                price,
                images
            });
        }

        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// POST Bid
router.post('/:id/bid', async (req, res) => {
    try {
        const { userId, amount } = req.body;
        // Only look in Auction Collection
        const product = await AuctionProduct.findById(req.params.id);

        if (!product) return res.status(404).json({ error: 'Auction Product not found' });
        if (product.status !== 'active') return res.status(400).json({ error: 'Auction ended' });
        if (Date.now() > product.endTime) return res.status(400).json({ error: 'Auction expired' });
        if (amount <= product.currentPrice) return res.status(400).json({ error: 'Bid must be higher' });

        product.currentPrice = amount;
        product.bids.push({ bidder: userId, amount });
        await product.save();

        const io = req.app.get('io');
        if (io) io.emit('priceUpdate', { id: product._id, price: product.currentPrice });

        res.json({ ...product.toObject(), price: product.currentPrice });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
