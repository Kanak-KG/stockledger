const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/saleController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/stats/today', ctrl.getTodayStats);
router.post('/', authorize('admin', 'sales_executive'), ctrl.createSale);
router.get('/', ctrl.getSales);
router.get('/:id', ctrl.getSaleDetail);

module.exports = router;
