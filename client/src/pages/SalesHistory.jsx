import { useEffect, useState } from 'react';
import api from '../services/api';

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    api.get('/sales').then(({ data }) => setSales(data)).finally(() => setLoading(false));
  }, []);

  async function openDetail(id) {
    const { data } = await api.get(`/sales/${id}`);
    setDetail(data);
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-1">Sales History</h2>
      <p className="text-slate text-sm mb-6">{sales.length} transactions</p>

      {loading ? (
        <p className="text-slate text-sm">Loading…</p>
      ) : (
        <div className="bg-white border border-sand rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sand/50 text-left text-xs text-slate uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Employee</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
                <th className="px-4 py-3 font-medium text-right">Profit</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id} onClick={() => openDetail(s.id)} className="border-t border-sand hover:bg-sand/20 cursor-pointer">
                  <td className="px-4 py-3 num">{new Date(s.created_at).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">{s.employee_name}</td>
                  <td className="px-4 py-3">{s.customer_name || '—'}</td>
                  <td className="px-4 py-3 text-right num">₹{Number(s.total_amount).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right num text-moss">₹{Number(s.profit).toFixed(2)}</td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate text-sm">No sales yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-6">
            <h3 className="font-semibold mb-1">Receipt #{detail.id}</h3>
            <p className="text-xs text-slate mb-4">{new Date(detail.created_at).toLocaleString('en-IN')} · {detail.employee_name}</p>
            <div className="space-y-1 text-sm border-t border-b border-dashed border-sand py-3 mb-3 num">
              {detail.items.map((i) => (
                <div key={i.id} className="flex justify-between">
                  <span>{i.product_name} x{i.quantity}</span>
                  <span>₹{Number(i.subtotal).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-semibold text-sm num mb-6">
              <span>Total</span>
              <span>₹{Number(detail.total_amount).toFixed(2)}</span>
            </div>
            <button onClick={() => setDetail(null)} className="w-full bg-ink text-white text-sm font-medium py-2.5 rounded-md">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
