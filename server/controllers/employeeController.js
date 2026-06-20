const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// GET /api/employees  (admin only)
async function getEmployees(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, role, is_active, created_at FROM users WHERE role != 'admin' ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching employees' });
  }
}

// POST /api/employees  (admin only) - create inventory_manager or sales_executive
async function createEmployee(req, res) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'name, email, password and role are required' });
    }
    if (!['inventory_manager', 'sales_executive'].includes(role)) {
      return res.status(400).json({ message: 'role must be inventory_manager or sales_executive' });
    }
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing[0]) return res.status(409).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashed, role]
    );
    res.status(201).json({ id: result.insertId, name, email, role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating employee' });
  }
}

// PUT /api/employees/:id  (admin only)
async function updateEmployee(req, res) {
  try {
    const { name, role, is_active } = req.body;
    await pool.query(
      'UPDATE users SET name = ?, role = ?, is_active = ? WHERE id = ? AND role != "admin"',
      [name, role, is_active, req.params.id]
    );
    res.json({ message: 'Employee updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating employee' });
  }
}

// PATCH /api/employees/:id/reset-password  (admin only)
async function resetPassword(req, res) {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'newPassword must be at least 6 characters' });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ? AND role != "admin"', [hashed, req.params.id]);
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// DELETE /api/employees/:id  (admin only) - deactivate, not hard delete (preserves sales history)
async function removeEmployee(req, res) {
  try {
    await pool.query('UPDATE users SET is_active = FALSE WHERE id = ? AND role != "admin"', [req.params.id]);
    res.json({ message: 'Employee deactivated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/employees/:id/activity  (admin only)
async function getEmployeeActivity(req, res) {
  try {
    const [logins] = await pool.query(
      'SELECT login_time FROM login_logs WHERE user_id = ? ORDER BY login_time DESC LIMIT 20',
      [req.params.id]
    );
    const [sales] = await pool.query(
      `SELECT id, total_amount, profit, created_at FROM sales WHERE employee_id = ? ORDER BY created_at DESC LIMIT 20`,
      [req.params.id]
    );
    res.json({ logins, sales });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getEmployees, createEmployee, updateEmployee, resetPassword, removeEmployee, getEmployeeActivity };
