import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ACCENT_CLASSES = {
  ink: 'text-ink',
  moss: 'text-moss',
  rose: 'text-rose',
  amber: 'text-amber',
};

function Card({ label, value, accent = 'ink', sub }) {
  return (
    <div className="bg-white border border-sand rounded-lg px-5 py-4">
      <p className="text-xs text-slate uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-display font-semibold mt-1 num ${ACCENT_CLASSES[accent]}`}>{value}</p>
      {sub && <p className="text-xs text-slate mt-1">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user.role]);

  if (loading) return <p className="text-slate text-sm">Loading dashboard…</p>;

  const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold">Welcome back, {user.name.split(' ')[0]}</h2>
        <p className="text-slate text-sm mt-1">Here's what's happening in your store today.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card label="Today's Sales" value={inr(stats.todaySales)} accent="moss" />
        <Card label="Today's Profit" value={inr(stats.todayProfit)} accent="moss" />
        <Card label="Active Products" value={stats.totalProducts} />
        <Card label="Low Stock Alerts" value={stats.lowStockCount} accent="rose" sub={stats.lowStockCount > 0 ? 'Needs restocking' : 'All good'} />
        {user.role === 'admin' && <Card label="Employees" value={stats.employeeCount} />}
        <Card label="Transactions Today" value={stats.todayTransactions} />
      </div>

      {user.role === 'admin' && report && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white border border-sand rounded-lg p-5">
            <h3 className="text-sm font-semibold mb-4">Revenue — this month</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={report.byDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E3DA" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => inr(v)} />
                <Line type="monotone" dataKey="revenue" stroke="#2F6F4E" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border border-sand rounded-lg p-5">
            <h3 className="text-sm font-semibold mb-4">Top products — this month</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={report.topProducts} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="product_name" type="category" width={100} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="unitsSold" fill="#C2933C" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
