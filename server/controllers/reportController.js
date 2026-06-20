const pool = require('../config/db');

// Helper: resolve a named range to start/end SQL-friendly date strings
function resolveRange(range, start, end) {
  const today = new Date();
  const fmt = (d) => d.toISOString().slice(0, 10);

  if (range === 'custom' && start && end) return { start, end };

  if (range === 'daily') {
    const s = fmt(today);
    return { start: s, end: s };
  }
  if (range === 'weekly') {
    const d = new Date(today);
    d.setDate(d.getDate() - 6);
    return { start: fmt(d), end: fmt(today) };
  }
  if (range === 'monthly') {
    const d = new Date(today.getFullYear(), today.getMonth(), 1);
    return { start: fmt(d), end: fmt(today) };
  }
  if (range === 'yearly') {
    const d = new Date(today.getFullYear(), 0, 1);
    return { start: fmt(d), end: fmt(today) };
  }
  // default: last 30 days
  const d = new Date(today);
  d.setDate(d.getDate() - 29);
  return { start: fmt(d), end: fmt(today) };
}

// GET /api/reports/summary?range=daily|weekly|monthly|yearly|custom&start=&end=
async function getSummary(req, res) {
  try {
    const { range = 'monthly', start, end } = req.query;
    const { start: s, end: e } = resolveRange(range, start, end);

    const [[totals]] = await pool.query(
      `SELECT COALESCE(SUM(total_amount),0) AS totalRevenue,
              COALESCE(SUM(profit),0) AS totalProfit,
              COUNT(*) AS totalTransactions
       FROM sales WHERE DATE(created_at) BETWEEN ? AND ?`,
      [s, e]
    );

    const [[unitsSold]] = await pool.query(
      `SELECT COALESCE(SUM(si.quantity),0) AS units
       FROM sale_items si JOIN sales s ON si.sale_id = s.id
       WHERE DATE(s.created_at) BETWEEN ? AND ?`,
      [s, e]
    );

    const [byDay] = await pool.query(
      `SELECT DATE(created_at) AS date, SUM(total_amount) AS revenue, SUM(profit) AS profit
       FROM sales WHERE DATE(created_at) BETWEEN ? AND ?
       GROUP BY DATE(created_at) ORDER BY date ASC`,
      [s, e]
    );

    const [topProducts] = await pool.query(
      `SELECT si.product_name, SUM(si.quantity) AS unitsSold, SUM(si.subtotal) AS revenue
       FROM sale_items si JOIN sales s ON si.sale_id = s.id
       WHERE DATE(s.created_at) BETWEEN ? AND ?
       GROUP BY si.product_name ORDER BY unitsSold DESC LIMIT 5`,
      [s, e]
    );

    const [byCategory] = await pool.query(
      `SELECT c.name AS category, SUM(si.subtotal) AS revenue
       FROM sale_items si
       JOIN sales s ON si.sale_id = s.id
       JOIN products p ON si.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE DATE(s.created_at) BETWEEN ? AND ?
       GROUP BY c.name ORDER BY revenue DESC`,
      [s, e]
    );

    res.json({
      range: { start: s, end: e, label: range },
      totalRevenue: totals.totalRevenue,
      totalProfit: totals.totalProfit,
      totalTransactions: totals.totalTransactions,
      unitsSold: unitsSold.units,
      byDay,
      topProducts,
      byCategory
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error generating report' });
  }
}

module.exports = { getSummary, resolveRange };
