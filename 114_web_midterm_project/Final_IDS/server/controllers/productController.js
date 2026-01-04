const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
    try {
        const { mode } = req.query;
        let query = {};
        if (mode) {
            query.mode = mode;
        }
        const products = await Product.find(query).populate('sellerId', 'username avatar bio').sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('sellerId', 'username avatar bio');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(500).send('Server Error');
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private (Seller only)
exports.createProduct = async (req, res) => {
    const { title, description, price, mode, endTime } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';

    try {
        const newProduct = new Product({
            sellerId: req.user.id,
            title,
            description,
            image,
            price,
            mode,
            endTime
        });

        const product = await newProduct.save();
        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
