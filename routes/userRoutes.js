const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');
const authCtrl = require('../controllers/authController');

router.post('/signup', authCtrl.signup);
router.post('/login', authCtrl.login);
router.post('/logout', authCtrl.logout);
router.get('/isAuthenticated', authCtrl.isLoggedIn, authCtrl.isAuthenticated);

router.get('/profile', authCtrl.isLoggedIn, userCtrl.getMyProfile);
router.delete('/profile', authCtrl.protect, userCtrl.deleteMyAccount);
router.patch('/updatePassword', authCtrl.protect, authCtrl.updatePassword);

router.patch(
  '/my-wishlist/:productId',
  authCtrl.protect,
  userCtrl.updateMyWishlist
);

// router.get('/', userCtrl.getAllUsers);
// router.get('/:id', userCtrl.getUserById);
// router.delete('/:id', userCtrl.deleteUser);

module.exports = router;
