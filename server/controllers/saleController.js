const pool = require('../config/db');

// POST /api/sales  - create a new sale (cashier billing flow)
// body: { customer_name, items: [{ product_id, quantity }] }
async function createSale(req, res) {
  const conn = await pool.getConnection();
  try {
    const { customer_name, items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'At least one item is required' });
    }

    await conn.beginTransaction();

    let totalAmount = 0;
    let totalProfit = 0;
    const lineItems = [];

    for (const item of items) {
      const [rows] = await conn.query('SELECT * FROM products WHERE id = ? FOR UPDATE', [item.product_id]);
      const product = rows[0];
      if (!product || !product.is_active) {
        throw { status: 404, message: `Product ${item.product_id} not found or inactive` };
      }
      if (product.quantity < item.quantity) {
        throw { status: 409, message: `Insufficient stock for "${product.name}". Available: ${product.quantity}` };
      }

      const subtotal = Number(product.selling_price) * item.quantity;
      const cost = Number(product.purchase_price) * item.quantity;
      totalAmount += subtotal;
      totalProfit += (subtotal - cost);

      lineItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        selling_price: product.selling_price,
        purchase_price: product.purchase_price,
        subtotal
      });

      await conn.query('UPDATE products SET quantity = quantity - ? WHERE id = ?', [item.quantity, product.id]);
    }

    const [saleResult] = await conn.query(
      'INSERT INTO sales (employee_id, total_amount, profit, customer_name) VALUES (?, ?, ?, ?)',
      [req.user.id, totalAmount, totalProfit, customer_name || null]
    );
    const saleId = saleResult.insertId;

    for (const li of lineItems) {
      await conn.query(
        `INSERT INTO sale_items (sale_id, product_id, product_name, quantity, selling_price, purchase_price, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [saleId, li.product_id, li.product_name, li.quantity, li.selling_price, li.purchase_price, li.subtotal]
      );
    }

    await conn.commit();
    res.status(201).json({ id: saleId, total_amount: totalAmount, profit: totalProfit, items: lineItems });
  } catch (err) {
    await conn.rollback();
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: 'Server error creating sale' });
  } finally {
    conn.release();
  }
}

// GET /api/sales  - history with optional date range + employee filter
async function getSales(req, res) {
  try {
    const { start, end, employee_id } = req.query;
    let where = 'WHERE 1=1';
    const params = [];

    // Non-admins only see their own sales
    if (req.user.role === 'sales_executive') {
      where += ' AND s.employee_id = ?';
      params.push(req.user.id);
    } else if (employee_id) {
      where += ' AND s.employee_id = ?';
      params.push(employee_id);
    }

    if (start) { where += ' AND s.created_at >= ?'; params.push(start); }
    if (end) { where += ' AND s.created_at <= ?'; params.push(end + ' 23:59:59'); }

    const [rows] = await pool.query(
      `SELECT s.*, u.name AS employee_name
       FROM sales s JOIN users u ON s.employee_id = u.id
       ${where} ORDER BY s.created_at DESC LIMIT 500`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching sales' });
  }
}

// GET /api/sales/:id  - full bill detail
async function getSaleDetail(req, res) {
  try {
    const [saleRows] = await pool.query(
      `SELECT s.*, u.name AS employee_name FROM sales s JOIN users u ON s.employee_id=u.id WHERE s.id = ?`,
      [req.params.id]
    );
    if (!saleRows[0]) return res.status(404).json({ message: 'Sale not found' });

    if (req.user.role === 'sales_executive' && saleRows[0].employee_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this sale' });
    }

    const [items] = await pool.query('SELECT * FROM sale_items WHERE sale_id = ?', [req.params.id]);
    res.json({ ...saleRows[0], items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/sales/stats/today  - dashboard card numbers
async function getTodayStats(req, res) {
  try {
    const [[salesToday]] = await pool.query(
      `SELECT COALESCE(SUM(total_amount),0) AS revenue, COALESCE(SUM(profit),0) AS profit, COUNT(*) AS count
       FROM sales WHERE DATE(created_at) = CURDATE()`
    );
    const [[productCount]] = await pool.query('SELECT COUNT(*) AS count FROM products WHERE is_active = TRUE');
    const [[lowStock]] = await pool.query('SELECT COUNT(*) AS count FROM products WHERE is_active = TRUE AND quantity <= min_quantity');
    const [[employeeCount]] = await pool.query("SELECT COUNT(*) AS count FROM users WHERE is_active = TRUE AND role != 'admin'");

    res.json({
      todaySales: salesToday.revenue,
      todayProfit: salesToday.profit,
      todayTransactions: salesToday.count,
      totalProducts: productCount.count,
      lowStockCount: lowStock.count,
      employeeCount: employeeCount.count
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
}

module.exports = { createSale, getSales, getSaleDetail, getTodayStats };
