const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const cartCtrl = require('../controllers/cartController');

router.use(authCtrl.protect);

router.route('/').get(cartCtrl.getMyCart).post(cartCtrl.addCartItem);
router
  .route('/:productId')
  .delete(cartCtrl.removeCartItem)
  .patch(cartCtrl.updateCartItem);

// router.route('/').get(cartCtrl.getMyCart).post(cartCtrl.createCart);

// router.patch('/:itemId/change-qty', cartCtrl.updateCartItemQty);
// router.patch('/remove/:id', cartCtrl.removeFromCart);

module.exports = router;
