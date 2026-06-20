const pool = require('../config/db');

// GET /api/ai/dead-stock?days=90  - products not sold in N days
async function getDeadStock(req, res) {
  try {
    const days = Number(req.query.days) || 90;
    const [rows] = await pool.query(
      `SELECT p.id, p.name, p.quantity, p.selling_price,
              MAX(s.created_at) AS last_sold_at,
              DATEDIFF(CURDATE(), COALESCE(MAX(s.created_at), p.created_at)) AS days_since_sale
       FROM products p
       LEFT JOIN sale_items si ON si.product_id = p.id
       LEFT JOIN sales s ON si.sale_id = s.id
       WHERE p.is_active = TRUE
       GROUP BY p.id
       HAVING days_since_sale >= ?
       ORDER BY days_since_sale DESC`,
      [days]
    );
    const suggestions = rows.map(r => ({
      ...r,
      recommendation: r.days_since_sale > 180
        ? 'Consider a 30-40% clearance discount or bundle offer'
        : 'Consider a 15-20% discount to move stock'
    }));
    res.json(suggestions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/ai/best-sellers?limit=10&days=30
async function getBestSellers(req, res) {
  try {
    const limit = Number(req.query.limit) || 10;
    const days = Number(req.query.days) || 30;
    const [rows] = await pool.query(
      `SELECT si.product_name, SUM(si.quantity) AS unitsSold, SUM(si.subtotal) AS revenue,
              SUM(si.subtotal - (si.purchase_price * si.quantity)) AS profit
       FROM sale_items si JOIN sales s ON si.sale_id = s.id
       WHERE s.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY si.product_name ORDER BY unitsSold DESC LIMIT ?`,
      [days, limit]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/ai/low-stock
async function getLowStock(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, quantity, min_quantity
       FROM products WHERE is_active = TRUE AND quantity <= min_quantity
       ORDER BY (quantity - min_quantity) ASC`
    );
    const withSuggestion = rows.map(r => ({
      ...r,
      suggestedRestock: Math.max(r.min_quantity * 2 - r.quantity, r.min_quantity)
    }));
    res.json(withSuggestion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/ai/profit-analysis?days=30
async function getProfitAnalysis(req, res) {
  try {
    const days = Number(req.query.days) || 30;
    const [[totals]] = await pool.query(
      `SELECT COALESCE(SUM(total_amount),0) AS revenue, COALESCE(SUM(profit),0) AS profit
       FROM sales WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)`,
      [days]
    );
    const [byCategory] = await pool.query(
      `SELECT c.name AS category,
              SUM(si.subtotal - (si.purchase_price * si.quantity)) AS profit,
              SUM(si.subtotal) AS revenue
       FROM sale_items si
       JOIN sales s ON si.sale_id = s.id
       JOIN products p ON si.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE s.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY c.name ORDER BY profit DESC`,
      [days]
    );
    res.json({
      revenue: totals.revenue,
      profit: totals.profit,
      margin: totals.revenue > 0 ? ((totals.profit / totals.revenue) * 100).toFixed(1) : 0,
      highestCategory: byCategory[0] || null,
      lowestCategory: byCategory[byCategory.length - 1] || null,
      byCategory
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/ai/narrative-report?days=30
// Builds a plain-English summary. Uses OpenAI if OPENAI_API_KEY is set, otherwise
// falls back to a built-in rule-based narrative generator (no external dependency).
async function getNarrativeReport(req, res) {
  try {
    const days = Number(req.query.days) || 30;

    const [[curr]] = await pool.query(
      `SELECT COALESCE(SUM(total_amount),0) AS revenue, COALESCE(SUM(profit),0) AS profit, COUNT(*) AS txns
       FROM sales WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)`, [days]
    );
    const [[prev]] = await pool.query(
      `SELECT COALESCE(SUM(total_amount),0) AS revenue
       FROM sales WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY) AND created_at < DATE_SUB(CURDATE(), INTERVAL ? DAY)`,
      [days * 2, days]
    );
    const [topProducts] = await pool.query(
      `SELECT si.product_name, SUM(si.quantity) AS units
       FROM sale_items si JOIN sales s ON si.sale_id = s.id
       WHERE s.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY si.product_name ORDER BY units DESC LIMIT 3`, [days]
    );
    const [[deadStockCount]] = await pool.query(
      `SELECT COUNT(*) AS count FROM (
         SELECT p.id, DATEDIFF(CURDATE(), COALESCE(MAX(s.created_at), p.created_at)) AS d
         FROM products p
         LEFT JOIN sale_items si ON si.product_id = p.id
         LEFT JOIN sales s ON si.sale_id = s.id
         WHERE p.is_active = TRUE
         GROUP BY p.id HAVING d >= 60
       ) t`
    );

    const growth = prev.revenue > 0
      ? (((curr.revenue - prev.revenue) / prev.revenue) * 100).toFixed(1)
      : null;

    let narrative;

    if (process.env.OPENAI_API_KEY) {
      narrative = await generateWithOpenAI({ curr, prev, growth, topProducts, deadStockCount: deadStockCount.count, days });
    } else {
      narrative = generateRuleBasedNarrative({ curr, growth, topProducts, deadStockCount: deadStockCount.count, days });
    }

    res.json({ narrative, generatedAt: new Date().toISOString(), engine: process.env.OPENAI_API_KEY ? 'openai' : 'rule-based' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error generating report' });
  }
}

function generateRuleBasedNarrative({ curr, growth, topProducts, deadStockCount, days }) {
  const periodLabel = days <= 1 ? 'today' : `the last ${days} days`;
  const sentences = [];

  if (growth !== null) {
    const direction = growth >= 0 ? 'increased' : 'decreased';
    sentences.push(`Sales ${direction} by ${Math.abs(growth)}% compared to the previous period.`);
  } else {
    sentences.push(`This is the first recorded sales period, so there is no prior period to compare against.`);
  }

  if (topProducts.length > 0) {
    const names = topProducts.map(p => p.product_name).join(', ');
    sentences.push(`${names} contributed the highest sales volume over ${periodLabel}.`);
  } else {
    sentences.push(`No sales were recorded over ${periodLabel}.`);
  }

  if (deadStockCount > 0) {
    sentences.push(`${deadStockCount} product${deadStockCount > 1 ? 's have' : ' has'} not been sold in over 60 days. Consider offering discounts or reducing future purchase orders for these items.`);
  } else {
    sentences.push(`No products are currently sitting idle in stock — inventory is moving well.`);
  }

  sentences.push(`Total revenue for the period was ₹${Number(curr.revenue).toLocaleString('en-IN')} with a profit of ₹${Number(curr.profit).toLocaleString('en-IN')} across ${curr.txns} transaction${curr.txns === 1 ? '' : 's'}.`);

  return sentences.join(' ');
}

async function generateWithOpenAI({ curr, prev, growth, topProducts, deadStockCount, days }) {
  try {
    const prompt = `You are a business analyst writing a short, plain-English sales summary for a small store owner.
Data for the last ${days} days:
- Revenue: ₹${curr.revenue}, Profit: ₹${curr.profit}, Transactions: ${curr.txns}
- Growth vs previous period: ${growth !== null ? growth + '%' : 'no prior data'}
- Top selling products: ${topProducts.map(p => p.product_name).join(', ') || 'none'}
- Products with no sales in 60+ days: ${deadStockCount}

Write 3-4 short sentences, friendly and direct, similar to: "Sales increased by 18% compared to last month. Cold drinks and biscuits contributed the highest revenue. Three products have not been sold in over 60 days. Consider offering discounts or reducing future purchases."`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200
      })
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() ||
      generateRuleBasedNarrative({ curr, growth, topProducts, deadStockCount, days });
  } catch (err) {
    console.error('OpenAI call failed, falling back to rule-based narrative:', err.message);
    return generateRuleBasedNarrative({ curr, growth, topProducts, deadStockCount, days });
  }
}

module.exports = { getDeadStock, getBestSellers, getLowStock, getProfitAnalysis, getNarrativeReport };
