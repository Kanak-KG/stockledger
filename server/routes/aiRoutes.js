const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/aiController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin'));

router.get('/dead-stock', ctrl.getDeadStock);
router.get('/best-sellers', ctrl.getBestSellers);
router.get('/low-stock', ctrl.getLowStock);
router.get('/profit-analysis', ctrl.getProfitAnalysis);
router.get('/narrative-report', ctrl.getNarrativeReport);

module.exports = router;
