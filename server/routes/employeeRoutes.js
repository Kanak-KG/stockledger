const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/employeeController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin'));

router.get('/', ctrl.getEmployees);
router.post('/', ctrl.createEmployee);
router.put('/:id', ctrl.updateEmployee);
router.patch('/:id/reset-password', ctrl.resetPassword);
router.delete('/:id', ctrl.removeEmployee);
router.get('/:id/activity', ctrl.getEmployeeActivity);

module.exports = router;
