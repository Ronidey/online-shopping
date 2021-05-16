const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');
const authCtrl = require('../controllers/authController');
const cartRouter = require('./cartRoutes');

router.use('/my-cart', cartRouter);

router.post('/signup', authCtrl.signup);
router.post('/login', authCtrl.login);
router.post('/logout', authCtrl.protect, authCtrl.logout);
router.get('/isAuthenticated', authCtrl.isLoggedIn, authCtrl.isAuthenticated);

router.use(authCtrl.protect);
router.get('/profile', userCtrl.getMyProfile);
router.delete('/profile', userCtrl.deleteMyAccount);
router.patch('/updatePassword', authCtrl.updatePassword);

router.patch(
  '/my-wishlist/:productId',
  authCtrl.protect,
  userCtrl.updateMyWishlist
);

// router.get('/', userCtrl.getAllUsers);
// router.get('/:id', userCtrl.getUserById);
// router.delete('/:id', userCtrl.deleteUser);

module.exports = router;
