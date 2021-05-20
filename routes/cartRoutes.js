const express = require('express');
const router = express.Router();
const cartCtrl = require('../controllers/cartController');

router.route('/').get(cartCtrl.getMyCart).post(cartCtrl.addCartItem);
router
  .route('/:productId')
  .delete(cartCtrl.removeCartItem)
  .patch(cartCtrl.updateCartItem);

module.exports = router;
