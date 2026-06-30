import { useEffect, useState } from 'react';
import api from '../services/api';

export default function SalesHistory() {
  const [sales, setSales]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    api.get('/sales').then(({data}) => setSales(data)).finally(() => setLoading(false));
  }, []);

  async function openDetail(id) {
    const {data} = await api.get(`/sales/${id}`);
    setDetail(data);
  }

  const inr = n => `₹${Number(n||0).toLocaleString('en-IN')}`;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-body">Sales History</h2>
        <p className="text-muted text-sm mt-1">{sales.length} transactions — click any row to see the full bill</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-7 h-7 border-2 border-indigo border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="tbl-head">
                <th className="px-5 py-3.5 text-left font-semibold">#</th>
                <th className="px-5 py-3.5 text-left font-semibold">Date & Time</th>
                <th className="px-5 py-3.5 text-left font-semibold">Employee</th>
                <th className="px-5 py-3.5 text-left font-semibold">Customer</th>
                <th className="px-5 py-3.5 text-right font-semibold">Total</th>
                <th className="px-5 py-3.5 text-right font-semibold">Profit</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(s => (
                <tr key={s.id} onClick={() => openDetail(s.id)}
                  className="tbl-row cursor-pointer group">
                  <td className="px-5 py-3.5 num text-muted text-xs">#{s.id}</td>
                  <td className="px-5 py-3.5 num text-muted text-xs">{new Date(s.created_at).toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3.5 font-medium text-body">{s.employee_name}</td>
                  <td className="px-5 py-3.5 text-muted">{s.customer_name||'—'}</td>
                  <td className="px-5 py-3.5 text-right num font-bold text-body">{inr(s.total_amount)}</td>
                  <td className="px-5 py-3.5 text-right num font-bold text-success">{inr(s.profit)}</td>
                </tr>
              ))}
              {sales.length===0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-muted text-sm">No sales yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-card rounded-2xl w-full max-w-sm p-6 shadow-card-hover animate-fade-up">
            <h3 className="font-display font-bold text-lg mb-1">Receipt #{detail.id}</h3>
            <p className="text-xs text-muted mb-4 num">{new Date(detail.created_at).toLocaleString('en-IN')} · {detail.employee_name}</p>
            <div className="space-y-2 text-sm border-t border-b border-dashed border-border py-4 mb-4 num">
              {detail.items.map(i => (
                <div key={i.id} className="flex justify-between">
                  <span className="text-muted">{i.product_name} ×{i.quantity}</span>
                  <span className="font-semibold">₹{Number(i.subtotal).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-display font-bold num text-lg mb-6">
              <span>Total</span>
              <span className="text-indigo">{inr(detail.total_amount)}</span>
            </div>
            <button onClick={() => setDetail(null)}
              className="w-full bg-body text-white font-semibold py-3 rounded-xl hover:bg-ink transition-colors">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
