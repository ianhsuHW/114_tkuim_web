const Bid = require('../models/Bid');
const Product = require('../models/Product');

exports.placeBid = async (req, res) => {
    const { productId } = req.params;
    const { amount } = req.body;
    const bidAmount = Number(amount);
    const userId = req.user.id;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: '找不到商品 (Product not found)' });
        }

        if (product.mode !== 'auction') {
            return res.status(400).json({ message: '此商品不開放競標' });
        }

        if (new Date(product.endTime) < new Date()) {
            return res.status(400).json({ message: '競標已結束' });
        }

        if (bidAmount <= product.price) {
            return res.status(400).json({ message: `出價金額 (NT$${bidAmount}) 必須高於目前價格 (NT$${product.price})` });
        }

        // Simplified race condition handling (atomic update could be better but sticking to requirements)
        // Update product price
        product.price = amount;
        product.winnerId = userId;
        await product.save();

        const bid = new Bid({
            productId,
            bidderId: userId,
            amount
        });
        await bid.save();

        const populatedBid = await Bid.findById(bid.id).populate('bidderId', 'username avatar');

        // Emit Socket Event
        const io = req.app.get('io');
        io.to(`product:${productId}`).emit('bid:update', {
            price: amount,
            lastBid: populatedBid
        });

        res.json(populatedBid);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
