import { useEffect, useState } from 'react';
import api from '../services/api';

function InsightCard({ icon, title, color, children }) {
  const colors = {
    violet: 'from-violet to-indigo',
    amber:  'from-amber to-yellow-400',
    red:    'from-danger to-rose-400',
    green:  'from-success to-emerald-400',
  };
  return (
    <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
      <div className={`bg-gradient-to-r ${colors[color]} px-5 py-4 flex items-center gap-3`}>
        <span className="text-2xl">{icon}</span>
        <h3 className="font-display text-base font-bold text-white">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function AIAnalytics() {
  const [deadStock, setDeadStock]       = useState([]);
  const [bestSellers, setBestSellers]   = useState([]);
  const [lowStock, setLowStock]         = useState([]);
  const [profit, setProfit]             = useState(null);
  const [narrative, setNarrative]       = useState(null);
  const [narrativeLoading, setNarrativeLoading] = useState(false);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    async function load() {
      const [ds, bs, ls, pa] = await Promise.all([
        api.get('/ai/dead-stock'),
        api.get('/ai/best-sellers'),
        api.get('/ai/low-stock'),
        api.get('/ai/profit-analysis'),
      ]);
      setDeadStock(ds.data); setBestSellers(bs.data);
      setLowStock(ls.data);  setProfit(pa.data);
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

  const inr = n => `₹${Number(n||0).toLocaleString('en-IN')}`;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-indigo border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-body">AI Analytics</h2>
        <p className="text-muted text-sm mt-1">Automated insights generated from your live sales &amp; inventory data.</p>
      </div>

      {/* Natural Language Report - full width */}
      <div className="bg-gradient-to-r from-ink to-body rounded-2xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo/10 rounded-full -translate-y-12 translate-x-12 blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">✦</span>
            <h3 className="font-display text-lg font-bold text-white">Natural Language Report</h3>
            <span className="text-xs bg-white/10 text-white/60 px-3 py-1 rounded-full">AI Generated</span>
          </div>
          {!narrative ? (
            <div>
              <p className="text-white/50 text-sm mb-4">Click to generate a plain-English business summary based on your real sales data.</p>
              <button onClick={generateNarrative} disabled={narrativeLoading}
                className="bg-indigo hover:bg-violet text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-glow-violet disabled:opacity-60">
                {narrativeLoading ? 'Generating…' : 'Generate Report →'}
              </button>
            </div>
          ) : (
            <div>
              <p className="text-white/80 leading-relaxed text-sm mb-3">{narrative.narrative}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/30">
                  Engine: {narrative.engine==='openai' ? 'OpenAI GPT' : 'Built-in analytics'} · {new Date(narrative.generatedAt).toLocaleString('en-IN')}
                </p>
                <button onClick={generateNarrative} className="text-xs text-indigoLight hover:underline">Regenerate</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profit summary strip */}
      {profit && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Revenue (30d)',     val: inr(profit.revenue), color: 'text-indigo', bg: 'bg-indigo/5 border-indigo/20' },
            { label: 'Profit (30d)',      val: inr(profit.profit),  color: 'text-success', bg: 'bg-success/5 border-success/20' },
            { label: 'Profit Margin',     val: `${profit.margin}%`, color: 'text-amber', bg: 'bg-amber/5 border-amber/20' },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl border p-4 ${s.bg}`}>
              <p className="text-xs text-muted mb-1 font-medium">{s.label}</p>
              <p className={`font-display text-2xl font-bold num ${s.color}`}>{s.val}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Dead Stock */}
        <InsightCard icon="📦" title="Dead Stock (90+ days unsold)" color="red">
          {deadStock.length===0 ? (
            <div className="text-center py-6">
              <p className="text-2xl mb-2">🎉</p>
              <p className="text-sm text-muted">No dead stock — everything is moving.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {deadStock.slice(0,6).map(p => (
                <div key={p.id} className="flex items-start justify-between gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-semibold text-body">{p.name}</p>
                    <p className="text-xs text-muted mt-0.5">{p.recommendation}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold num text-danger">{p.days_since_sale}d</p>
                    <p className="text-xs text-muted num">{p.quantity} units</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </InsightCard>

        {/* Best Sellers */}
        <InsightCard icon="🔥" title="Best Sellers (last 30 days)" color="amber">
          {bestSellers.length===0 ? (
            <p className="text-sm text-muted text-center py-6">No sales recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {bestSellers.map((p,i) => (
                <div key={i} className="flex items-center gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                    i===0 ? 'bg-amber' : i===1 ? 'bg-muted' : 'bg-body/30'
                  }`}>{i+1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-body truncate">{p.product_name}</p>
                    <p className="text-xs text-muted num">{inr(p.revenue)} revenue</p>
                  </div>
                  <span className="text-sm font-bold num text-success">{p.unitsSold} sold</span>
                </div>
              ))}
            </div>
          )}
        </InsightCard>

        {/* Low Stock / Restock */}
        <InsightCard icon="⚠️" title="Restock Suggestions" color="violet">
          {lowStock.length===0 ? (
            <div className="text-center py-6">
              <p className="text-2xl mb-2">✓</p>
              <p className="text-sm text-muted">Stock levels look healthy.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStock.map(p => (
                <div key={p.id} className="flex items-center justify-between pb-3 border-b border-border last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-semibold text-body">{p.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="w-24 bg-surface rounded-full h-1.5">
                        <div className="bg-danger h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, (p.quantity/p.min_quantity)*100)}%` }} />
                      </div>
                      <p className="text-xs text-muted num">{p.quantity}/{p.min_quantity}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-indigo/10 text-indigo border border-indigo/20 px-3 py-1 rounded-full font-semibold num">
                    Order {p.suggestedRestock}
                  </span>
                </div>
              ))}
            </div>
          )}
        </InsightCard>

        {/* Category profit */}
        <InsightCard icon="💰" title="Profit by Category (30 days)" color="green">
          {!profit?.byCategory?.length ? (
            <p className="text-sm text-muted text-center py-6">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {profit.byCategory.map((c,i) => {
                const max = profit.byCategory[0]?.profit || 1;
                return (
                  <div key={i} className="pb-3 border-b border-border last:border-0 last:pb-0">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-body">{c.category||'Uncategorized'}</span>
                      <span className="num font-bold text-success">{inr(c.profit)}</span>
                    </div>
                    <div className="w-full bg-surface rounded-full h-1.5">
                      <div className="bg-gradient-to-r from-success to-emerald-400 h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.max(4,(c.profit/max)*100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </InsightCard>
      </div>
    </div>
  );
}
