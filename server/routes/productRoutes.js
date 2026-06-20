const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', ctrl.getProducts);
router.get('/meta/all', ctrl.getMeta);
router.post('/meta/categories', authorize('admin', 'inventory_manager'), ctrl.createCategory);
router.post('/meta/suppliers', authorize('admin', 'inventory_manager'), ctrl.createSupplier);

router.get('/:id', ctrl.getProduct);
router.post('/', authorize('admin', 'inventory_manager'), ctrl.createProduct);
router.put('/:id', authorize('admin', 'inventory_manager'), ctrl.updateProduct);
router.patch('/:id/stock', authorize('admin', 'inventory_manager'), ctrl.updateStock);
router.patch('/:id/deactivate', authorize('admin', 'inventory_manager'), ctrl.deactivateProduct);
router.patch('/:id/activate', authorize('admin', 'inventory_manager'), ctrl.activateProduct);
router.delete('/:id', authorize('admin'), ctrl.deleteProduct); // permanent delete = admin only

module.exports = router;
