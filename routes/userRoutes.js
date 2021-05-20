const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');
const authCtrl = require('../controllers/authController');
const cartRouter = require('./cartRoutes');
const wishlistRouter = require('./wishlistRoutes');

router.post('/signup', authCtrl.signup);
router.post('/login', authCtrl.login);
router.get('/isAuthenticated', authCtrl.isLoggedIn, authCtrl.isAuthenticated);
router.post('/logout', authCtrl.protect, authCtrl.logout);

router.use(authCtrl.protect);
router.use('/my-cart', cartRouter);
router.use('/my-wishlist', wishlistRouter);
router.get('/profile', userCtrl.getMyProfile);
router.delete('/profile', userCtrl.deleteMyAccount);
router.patch('/updatePassword', authCtrl.updatePassword);

module.exports = router;
