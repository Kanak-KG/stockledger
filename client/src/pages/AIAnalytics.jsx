import { useEffect, useState } from 'react';
import api from '../services/api';

function Section({ title, children }) {
  return (
    <div className="bg-white border border-sand rounded-lg p-5 mb-6">
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}

export default function AIAnalytics() {
  const [deadStock, setDeadStock] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [profit, setProfit] = useState(null);
  const [narrative, setNarrative] = useState(null);
  const [narrativeLoading, setNarrativeLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [ds, bs, ls, pa] = await Promise.all([
        api.get('/ai/dead-stock'),
        api.get('/ai/best-sellers'),
        api.get('/ai/low-stock'),
        api.get('/ai/profit-analysis'),
      ]);
      setDeadStock(ds.data);
      setBestSellers(bs.data);
      setLowStock(ls.data);
      setProfit(pa.data);
      setLoading(false);
    }
    load();
  }, []);

  async function generateNarrative() {
    setNarrativeLoading(true);
    const { data } = await api.get('/ai/narrative-report');
    setNarrative(data);
    setNarrativeLoading(false);
  }

  const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  if (loading) return <p className="text-slate text-sm">Crunching the numbers…</p>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-1">AI Analytics</h2>
      <p className="text-slate text-sm mb-6">Automated insights generated from your live sales &amp; inventory data.</p>

      <Section title="✦ Natural Language Report">
        {!narrative ? (
          <button onClick={generateNarrative} disabled={narrativeLoading}
            className="bg-moss hover:bg-mossDark text-white text-sm font-medium px-4 py-2.5 rounded-md disabled:opacity-60">
            {narrativeLoading ? 'Generating…' : 'Generate Report'}
          </button>
        ) : (
          <div>
            <p className="text-sm leading-relaxed text-ink/90">{narrative.narrative}</p>
            <p className="text-xs text-slate mt-3">
              Engine: {narrative.engine === 'openai' ? 'OpenAI' : 'built-in rule-based engine'} · generated {new Date(narrative.generatedAt).toLocaleString('en-IN')}
            </p>
            <button onClick={generateNarrative} className="text-xs text-moss mt-2 hover:underline">Regenerate</button>
          </div>
        )}
      </Section>

      <div className="grid lg:grid-cols-2 gap-6">
        <Section title="📦 Dead Stock Detection (90+ days unsold)">
          {deadStock.length === 0 ? (
            <p className="text-sm text-slate">No dead stock — everything is moving.</p>
          ) : (
            <div className="space-y-2">
              {deadStock.slice(0, 8).map((p) => (
                <div key={p.id} className="flex justify-between items-center text-sm border-b border-sand/60 pb-2 last:border-0">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-slate">{p.days_since_sale} days since last sale · {p.recommendation}</p>
                  </div>
                  <span className="num text-rose">{p.quantity} units</span>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="🔥 Best Selling Products (last 30 days)">
          {bestSellers.length === 0 ? (
            <p className="text-sm text-slate">No sales recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {bestSellers.map((p, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm border-b border-sand/60 pb-2 last:border-0">
                  <p className="font-medium">{p.product_name}</p>
                  <span className="num text-moss">{p.unitsSold} sold · {inr(p.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="⚠️ Low Stock / Restock Suggestions">
          {lowStock.length === 0 ? (
            <p className="text-sm text-slate">Stock levels look healthy.</p>
          ) : (
            <div className="space-y-2">
              {lowStock.map((p) => (
                <div key={p.id} className="flex justify-between items-center text-sm border-b border-sand/60 pb-2 last:border-0">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-slate">Current: {p.quantity} · Minimum: {p.min_quantity}</p>
                  </div>
                  <span className="num text-amber">Order {p.suggestedRestock}</span>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="💰 Profit Analysis (last 30 days)">
          {profit && (
            <div>
              <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                <div><p className="text-xs text-slate">Revenue</p><p className="num font-semibold">{inr(profit.revenue)}</p></div>
                <div><p className="text-xs text-slate">Profit</p><p className="num font-semibold text-moss">{inr(profit.profit)}</p></div>
                <div><p className="text-xs text-slate">Margin</p><p className="num font-semibold">{profit.margin}%</p></div>
              </div>
              {profit.highestCategory && (
                <p className="text-xs text-slate">Highest earning: <span className="text-moss font-medium">{profit.highestCategory.category || 'Uncategorized'}</span></p>
              )}
              {profit.lowestCategory && (
                <p className="text-xs text-slate">Lowest earning: <span className="text-rose font-medium">{profit.lowestCategory.category || 'Uncategorized'}</span></p>
              )}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
