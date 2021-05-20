const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const orderCtrl = require('../controllers/orderController');

router.use(authCtrl.protect);

router.get('/', orderCtrl.getMyOrders);
router.delete('/', orderCtrl.deleteAllOrders);

router.post('/checkout', orderCtrl.getStripeSession);

module.exports = router;
