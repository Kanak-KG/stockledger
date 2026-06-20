const express = require('express');
const router = express.Router();
const { getSummary } = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin'));
router.get('/summary', getSummary);

module.exports = router;
