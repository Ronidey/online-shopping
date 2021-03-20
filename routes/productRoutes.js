const express = require('express');
const router = express.Router();
const productCtrl = require('../controllers/productController');

router
  .route('/')
  .get(productCtrl.getAllProducts)
  .post(productCtrl.createProduct);

router.get('/search', productCtrl.getSearchResults);

router
  .route('/:id')
  .get(productCtrl.getProductById)
  .patch(productCtrl.updateProduct)
  .delete(productCtrl.deleteProduct);

router.get(
  '/category/:category',
  productCtrl.getProductsByCategory,
  productCtrl.getAllProducts
);

module.exports = router;
