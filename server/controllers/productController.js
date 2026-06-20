const pool = require('../config/db');

// GET /api/products  (everyone can view; ?includeInactive=true for admin/inventory_manager)
async function getProducts(req, res) {
  try {
    const includeInactive = req.query.includeInactive === 'true' &&
      ['admin', 'inventory_manager'].includes(req.user.role);

    const where = includeInactive ? '' : 'WHERE p.is_active = TRUE';
    const [rows] = await pool.query(`
      SELECT p.*, c.name AS category_name, s.name AS supplier_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      ${where}
      ORDER BY p.name ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching products' });
  }
}

// GET /api/products/:id
async function getProduct(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name, s.name AS supplier_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/products  (admin, inventory_manager)
async function createProduct(req, res) {
  try {
    const { name, category_id, supplier_id, purchase_price, selling_price, quantity, min_quantity, barcode } = req.body;
    if (!name || purchase_price == null || selling_price == null) {
      return res.status(400).json({ message: 'name, purchase_price and selling_price are required' });
    }
    const [result] = await pool.query(
      `INSERT INTO products (name, category_id, supplier_id, purchase_price, selling_price, quantity, min_quantity, barcode, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, category_id || null, supplier_id || null, purchase_price, selling_price, quantity || 0, min_quantity || 10, barcode || null, req.user.id]
    );
    res.status(201).json({ id: result.insertId, message: 'Product created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating product' });
  }
}

// PUT /api/products/:id  (admin, inventory_manager)
async function updateProduct(req, res) {
  try {
    const { name, category_id, supplier_id, purchase_price, selling_price, quantity, min_quantity, barcode } = req.body;
    const [result] = await pool.query(
      `UPDATE products SET name=?, category_id=?, supplier_id=?, purchase_price=?, selling_price=?, quantity=?, min_quantity=?, barcode=?
       WHERE id = ?`,
      [name, category_id || null, supplier_id || null, purchase_price, selling_price, quantity, min_quantity, barcode || null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating product' });
  }
}

// PATCH /api/products/:id/stock  (admin, inventory_manager) - add purchased stock
async function updateStock(req, res) {
  try {
    const { quantityToAdd } = req.body;
    if (!quantityToAdd || quantityToAdd <= 0) {
      return res.status(400).json({ message: 'quantityToAdd must be a positive number' });
    }
    await pool.query('UPDATE products SET quantity = quantity + ? WHERE id = ?', [quantityToAdd, req.params.id]);
    res.json({ message: 'Stock updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating stock' });
  }
}

// PATCH /api/products/:id/deactivate  (admin, inventory_manager) - soft delete
async function deactivateProduct(req, res) {
  try {
    await pool.query('UPDATE products SET is_active = FALSE WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deactivated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// PATCH /api/products/:id/activate
async function activateProduct(req, res) {
  try {
    await pool.query('UPDATE products SET is_active = TRUE WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product activated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// DELETE /api/products/:id  (admin ONLY - permanent delete)
async function deleteProduct(req, res) {
  try {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product permanently deleted' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ message: 'Cannot delete: product has sales history. Deactivate it instead.' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error deleting product' });
  }
}

// GET /api/products/meta/categories-suppliers
async function getMeta(req, res) {
  try {
    const [categories] = await pool.query('SELECT * FROM categories ORDER BY name');
    const [suppliers] = await pool.query('SELECT * FROM suppliers ORDER BY name');
    res.json({ categories, suppliers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/products/meta/categories
async function createCategory(req, res) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'name is required' });
    const [result] = await pool.query('INSERT INTO categories (name) VALUES (?)', [name]);
    res.status(201).json({ id: result.insertId, name });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/products/meta/suppliers
async function createSupplier(req, res) {
  try {
    const { name, contact_person, phone, email } = req.body;
    if (!name) return res.status(400).json({ message: 'name is required' });
    const [result] = await pool.query(
      'INSERT INTO suppliers (name, contact_person, phone, email) VALUES (?, ?, ?, ?)',
      [name, contact_person || null, phone || null, email || null]
    );
    res.status(201).json({ id: result.insertId, name });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  getProducts, getProduct, createProduct, updateProduct,
  updateStock, deactivateProduct, activateProduct, deleteProduct,
  getMeta, createCategory, createSupplier
};
