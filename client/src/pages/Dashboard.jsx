import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
         CartesianGrid, BarChart, Bar } from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const STAT_CARDS = [
  { key: 'todaySales',       label: "Today's Revenue",    icon: '₹',  grad: 'bg-card-violet', prefix: '₹' },
  { key: 'todayProfit',      label: "Today's Profit",     icon: '↑',  grad: 'bg-card-green',  prefix: '₹' },
  { key: 'totalProducts',    label: 'Active Products',    icon: '▤',  grad: 'bg-card-cyan',   prefix: ''  },
  { key: 'lowStockCount',    label: 'Low Stock Alerts',   icon: '⚠',  grad: 'bg-card-rose',   prefix: ''  },
  { key: 'todayTransactions',label: 'Transactions Today', icon: '✓',  grad: 'bg-card-amber',  prefix: ''  },
  { key: 'employeeCount',    label: 'Total Employees',    icon: '◎',  grad: 'bg-card-violet', prefix: ''  },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-light rounded-xl px-4 py-3 shadow-card text-body text-xs">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: ₹{Number(p.value).toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats]   = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get('/sales/stats/today');
        setStats(data);
        if (user.role === 'admin') {
          const { data: rep } = await api.get('/reports/summary?range=monthly');
          setReport(rep);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, [user.role]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-indigo border-t-transparent rounded-full animate-spin" />
        <p className="text-muted text-sm">Loading dashboard…</p>
      </div>
    </div>
  );

  const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
  const visibleCards = user.role === 'admin'
    ? STAT_CARDS
    : STAT_CARDS.filter(c => !['employeeCount'].includes(c.key));

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-body">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          <span className="text-gradient-violet">{user.name.split(' ')[0]}</span> 👋
        </h2>
        <p className="text-muted text-sm mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {visibleCards.map(({ key, label, icon, grad, prefix }) => {
          const val = stats?.[key] ?? 0;
          return (
            <div key={key} className={`stat-card ${grad} relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white/10 -translate-y-6 translate-x-6" />
              <div className="absolute bottom-0 right-4 w-10 h-10 rounded-full bg-white/5" />
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-2">{label}</p>
              <p className="font-display text-2xl font-bold num text-white">
                {prefix === '₹' ? inr(val) : val}
              </p>
              <p className="text-white/50 text-xl absolute top-4 right-5">{icon}</p>
            </div>
          );
        })}
      </div>

      {/* Charts — admin only */}
      {user.role === 'admin' && report && (
        <div className="grid lg:grid-cols-5 gap-6">

          {/* Revenue line chart - wider */}
          <div className="lg:col-span-3 bg-card rounded-2xl border border-border p-6 shadow-card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-body">Revenue this month</h3>
                <p className="text-muted text-xs mt-0.5">{report.range?.start} → {report.range?.end}</p>
              </div>
              <span className="text-xs bg-indigo/10 text-indigo px-3 py-1 rounded-full font-medium">Monthly</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={report.byDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={2.5} dot={false} name="Revenue" />
                <Line type="monotone" dataKey="profit"  stroke="#059669" strokeWidth={2}   dot={false} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top products bar chart */}
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-card">
            <h3 className="font-semibold text-body mb-5">Top products</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={report.topProducts} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis dataKey="product_name" type="category" width={80} tick={{ fontSize: 10, fill: '#6B7280' }} />
                <Tooltip formatter={(v) => [`${v} units`, 'Sold']} />
                <Bar dataKey="unitsSold" fill="#4F46E5" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary strip */}
          <div className="lg:col-span-5 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', val: inr(report.totalRevenue), color: 'text-indigo' },
              { label: 'Total Profit',  val: inr(report.totalProfit),  color: 'text-success' },
              { label: 'Transactions',  val: report.totalTransactions, color: 'text-amber' },
              { label: 'Units Sold',    val: report.unitsSold,         color: 'text-body' },
            ].map((s) => (
              <div key={s.label} className="bg-card rounded-2xl border border-border p-4 shadow-card">
                <p className="text-xs text-muted mb-1">{s.label}</p>
                <p className={`font-display text-xl font-bold num ${s.color}`}>{s.val}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
