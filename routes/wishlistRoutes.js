const express = require('express');
const router = express.Router();
const wishlistCtrl = require('../controllers/wishlistController');

router.get('/', wishlistCtrl.getMyWishlist);
router.post('/:productId', wishlistCtrl.addToWishlist);
router.delete('/:productId', wishlistCtrl.removeFromWishlist);

module.exports = router;
