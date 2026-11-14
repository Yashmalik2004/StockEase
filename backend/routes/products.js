const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const productController = require('../controllers/productController');

// All routes require authentication
router.use(auth);

// GET /api/products
router.get('/', productController.getAllProducts);

// POST /api/products
router.post('/', productController.createProduct);

// GET /api/products/:id
router.get('/:id', productController.getProduct);

// PUT /api/products/:id
router.put('/:id', productController.updateProduct);

// DELETE /api/products/:id
router.delete('/:id', productController.deleteProduct);

module.exports = router;
