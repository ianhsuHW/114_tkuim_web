const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order (Buy Now)
// @route   POST /api/orders
// @access  Private (Buyer)
exports.createOrder = async (req, res) => {
    const { productId } = req.body;
    const buyerId = req.user.id;

    try {
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.isSold) {
            return res.status(400).json({ message: 'Product already sold' });
        }

        if (product.mode === 'auction') {
            return res.status(400).json({ message: 'Cannot direct buy auction item' });
        }

        const order = new Order({
            productId,
            buyerId,
            amount: product.price,
            status: 'completed'
        });

        await order.save();

        product.isSold = true;
        await product.save();

        res.status(201).json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get user orders (Buyer) or Sales (Seller)
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
    try {
        // If buyer, get my purchases
        // If seller, get my sales (products I sold)
        // For simplicity, return all orders where user is buyer
        // To support Seller Dashboard, we'd need to query orders where product.sellerId is user.id
        // Let's implement basics first: user's purchases

        // Check role? Or just return both?
        // Let's return purchases for now.
        const orders = await Order.find({ buyerId: req.user.id }).populate('productId');
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
