import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../services/api';

const RANGES = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
  { key: 'custom', label: 'Custom' },
];

const COLORS = ['#2F6F4E', '#C2933C', '#B8543F', '#5C655F', '#8AA399', '#D9C27E'];

export default function Reports() {
  const [range, setRange] = useState('monthly');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams({ range });
    if (range === 'custom' && start && end) { params.set('start', start); params.set('end', end); }
    const { data } = await api.get(`/reports/summary?${params}`);
    setReport(data);
    setLoading(false);
  }

  useEffect(() => { if (range !== 'custom' || (start && end)) load(); }, [range]);

  const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Reports</h2>
          <p className="text-slate text-sm mt-1">{report ? `${report.range.start} → ${report.range.end}` : ''}</p>
        </div>
        <button onClick={() => window.print()} className="text-sm border border-sand px-4 py-2 rounded-md hover:bg-sand/40">
          Export / Print PDF
        </button>
      </div>

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`text-sm px-3.5 py-1.5 rounded-full border ${range === r.key ? 'bg-ink text-white border-ink' : 'border-sand text-slate hover:border-ink'}`}
          >
            {r.label}
          </button>
        ))}
        {range === 'custom' && (
          <>
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="px-2 py-1.5 rounded-md border border-sand text-sm" />
            <span className="text-slate text-sm">to</span>
            <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="px-2 py-1.5 rounded-md border border-sand text-sm" />
            <button onClick={load} className="text-sm bg-moss text-white px-3.5 py-1.5 rounded-md">Apply</button>
          </>
        )}
      </div>

      {loading || !report ? (
        <p className="text-slate text-sm">Loading report…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-sand rounded-lg px-5 py-4">
              <p className="text-xs text-slate uppercase tracking-wide">Total Revenue</p>
              <p className="text-2xl font-display font-semibold num mt-1">{inr(report.totalRevenue)}</p>
            </div>
            <div className="bg-white border border-sand rounded-lg px-5 py-4">
              <p className="text-xs text-slate uppercase tracking-wide">Total Profit</p>
              <p className="text-2xl font-display font-semibold num mt-1 text-moss">{inr(report.totalProfit)}</p>
            </div>
            <div className="bg-white border border-sand rounded-lg px-5 py-4">
              <p className="text-xs text-slate uppercase tracking-wide">Transactions</p>
              <p className="text-2xl font-display font-semibold num mt-1">{report.totalTransactions}</p>
            </div>
            <div className="bg-white border border-sand rounded-lg px-5 py-4">
              <p className="text-xs text-slate uppercase tracking-wide">Units Sold</p>
              <p className="text-2xl font-display font-semibold num mt-1">{report.unitsSold}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white border border-sand rounded-lg p-5">
              <h3 className="text-sm font-semibold mb-4">Revenue &amp; Profit over time</h3>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={report.byDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E3DA" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => inr(v)} />
                  <Line type="monotone" dataKey="revenue" stroke="#2F6F4E" strokeWidth={2} dot={false} name="Revenue" />
                  <Line type="monotone" dataKey="profit" stroke="#C2933C" strokeWidth={2} dot={false} name="Profit" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white border border-sand rounded-lg p-5">
              <h3 className="text-sm font-semibold mb-4">Revenue by category</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={report.byCategory} dataKey="revenue" nameKey="category" cx="50%" cy="50%" outerRadius={80} label>
                    {report.byCategory.map((entry, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => inr(v)} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-sand rounded-lg overflow-hidden">
            <h3 className="text-sm font-semibold px-5 pt-4 pb-2">Top selling products</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-sand/50 text-left text-xs text-slate uppercase tracking-wide">
                  <th className="px-5 py-2 font-medium">Product</th>
                  <th className="px-5 py-2 font-medium text-right">Units Sold</th>
                  <th className="px-5 py-2 font-medium text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {report.topProducts.map((p, idx) => (
                  <tr key={idx} className="border-t border-sand">
                    <td className="px-5 py-2.5">{p.product_name}</td>
                    <td className="px-5 py-2.5 text-right num">{p.unitsSold}</td>
                    <td className="px-5 py-2.5 text-right num">{inr(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
