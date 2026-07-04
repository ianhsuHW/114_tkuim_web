const express = require('express');
const router = express.Router();
const { placeBid } = require('../controllers/bidController');
const auth = require('../middleware/authMiddleware');

// @route   POST api/bids/:productId
// @desc    Place a bid
// @access  Private (Buyer)
router.post('/:productId', auth, placeBid);

module.exports = router;
