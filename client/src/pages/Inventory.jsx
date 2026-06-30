import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  name:'', category_id:'', supplier_id:'', purchase_price:'',
  selling_price:'', quantity:'', min_quantity:10, barcode:''
};

function Badge({ label, color }) {
  const cls = {
    green:  'bg-success/10 text-success border-success/20',
    red:    'bg-danger/10 text-danger border-danger/20',
    amber:  'bg-amber/10 text-amber border-amber/20',
    gray:   'bg-muted/10 text-muted border-muted/20',
  }[color] || 'bg-muted/10 text-muted border-muted/20';
  return <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cls}`}>{label}</span>;
}

export default function Inventory() {
  const { user } = useAuth();
  const [products, setProducts]   = useState([]);
  const [meta, setMeta]           = useState({ categories:[], suppliers:[] });
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [restockId, setRestockId] = useState(null);
  const [restockQty, setRestockQty] = useState('');
  const [error, setError]         = useState('');

  const canEdit = ['admin','inventory_manager'].includes(user.role);

  async function loadAll() {
    setLoading(true);
    try {
      const [{ data: prods }, { data: m }] = await Promise.all([
        api.get(`/products?includeInactive=${showInactive}`),
        api.get('/products/meta/all'),
      ]);
      setProducts(prods); setMeta(m);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadAll(); }, [showInactive]);

  function openCreate() { setForm(emptyForm); setEditingId(null); setError(''); setModalOpen(true); }
  function openEdit(p) {
    setForm({ name:p.name, category_id:p.category_id||'', supplier_id:p.supplier_id||'',
      purchase_price:p.purchase_price, selling_price:p.selling_price, quantity:p.quantity,
      min_quantity:p.min_quantity, barcode:p.barcode||'' });
    setEditingId(p.id); setError(''); setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault(); setError('');
    try {
      if (editingId) await api.put(`/products/${editingId}`, form);
      else await api.post('/products', form);
      setModalOpen(false); loadAll();
    } catch (err) { setError(err.response?.data?.message || 'Something went wrong'); }
  }

  async function handleDeactivate(id) {
    if (!confirm('Deactivate this product?')) return;
    await api.patch(`/products/${id}/deactivate`); loadAll();
  }
  async function handleActivate(id) { await api.patch(`/products/${id}/activate`); loadAll(); }
  async function handleDelete(id) {
    if (!confirm('Permanently delete? Cannot be undone.')) return;
    try { await api.delete(`/products/${id}`); loadAll(); }
    catch (err) { alert(err.response?.data?.message || 'Could not delete'); }
  }
  async function submitRestock(e) {
    e.preventDefault();
    await api.patch(`/products/${restockId}/stock`, { quantityToAdd: Number(restockQty) });
    setRestockId(null); setRestockQty(''); loadAll();
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const stockBadge = (p) => {
    if (!p.is_active) return <Badge label="Deactivated" color="gray" />;
    if (p.quantity === 0) return <Badge label="Out of stock" color="red" />;
    if (p.quantity <= p.min_quantity) return <Badge label="Low stock" color="amber" />;
    return <Badge label="In stock" color="green" />;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-body">Inventory</h2>
          <p className="text-muted text-sm mt-1">{filtered.length} products</p>
        </div>
        {canEdit && (
          <button onClick={openCreate}
            className="bg-indigo hover:bg-violet text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-glow-violet hover:-translate-y-0.5">
            + Add Product
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-5 flex-wrap">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search products…"
            className="input pl-9 w-72" />
        </div>
        {canEdit && (
          <label className="flex items-center gap-2 text-sm text-muted cursor-pointer select-none">
            <input type="checkbox" checked={showInactive} onChange={e => setShowInactive(e.target.checked)}
              className="accent-indigo w-4 h-4 rounded" />
            Show deactivated
          </label>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-indigo border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="tbl-head">
                <th className="px-5 py-3.5 text-left font-semibold">Product</th>
                <th className="px-5 py-3.5 text-left font-semibold">Category</th>
                <th className="px-5 py-3.5 text-right font-semibold">Purchase</th>
                <th className="px-5 py-3.5 text-right font-semibold">Selling</th>
                <th className="px-5 py-3.5 text-right font-semibold">Stock</th>
                <th className="px-5 py-3.5 text-left font-semibold">Status</th>
                {canEdit && <th className="px-5 py-3.5 text-right font-semibold">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className={`tbl-row ${!p.is_active ? 'opacity-50' : ''}`}>
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-body">{p.name}</p>
                    {p.barcode && <p className="text-xs text-muted num">{p.barcode}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-muted">{p.category_name || '—'}</td>
                  <td className="px-5 py-3.5 text-right num text-muted">₹{Number(p.purchase_price).toFixed(2)}</td>
                  <td className="px-5 py-3.5 text-right num font-semibold">₹{Number(p.selling_price).toFixed(2)}</td>
                  <td className="px-5 py-3.5 text-right num font-bold">
                    <span className={p.quantity <= p.min_quantity && p.is_active ? 'text-danger' : 'text-body'}>
                      {p.quantity}
                    </span>
                    <span className="text-muted text-xs"> / {p.min_quantity}</span>
                  </td>
                  <td className="px-5 py-3.5">{stockBadge(p)}</td>
                  {canEdit && (
                    <td className="px-5 py-3.5 text-right whitespace-nowrap space-x-3">
                      <button onClick={() => setRestockId(p.id)} className="text-xs text-indigo hover:underline font-medium">Restock</button>
                      <button onClick={() => openEdit(p)} className="text-xs text-muted hover:text-body hover:underline">Edit</button>
                      {p.is_active
                        ? <button onClick={() => handleDeactivate(p.id)} className="text-xs text-amber hover:underline">Deactivate</button>
                        : <button onClick={() => handleActivate(p.id)} className="text-xs text-success hover:underline">Activate</button>
                      }
                      {user.role === 'admin' && (
                        <button onClick={() => handleDelete(p.id)} className="text-xs text-danger hover:underline">Delete</button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-muted text-sm">
                  {search ? `No products matching "${search}"` : 'No products yet — add your first one above.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-card rounded-2xl w-full max-w-md p-6 shadow-card-hover animate-fade-up">
            <h3 className="font-display text-lg font-bold mb-5">{editingId ? 'Edit Product' : 'Add Product'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required placeholder="Product name" value={form.name}
                onChange={e => setForm({...form, name:e.target.value})} className="input" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.category_id} onChange={e => setForm({...form, category_id:e.target.value})} className="input">
                  <option value="">Category…</option>
                  {meta.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select value={form.supplier_id} onChange={e => setForm({...form, supplier_id:e.target.value})} className="input">
                  <option value="">Supplier…</option>
                  {meta.suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input required type="number" step="0.01" min="0" placeholder="Purchase price (₹)"
                  value={form.purchase_price} onChange={e => setForm({...form, purchase_price:e.target.value})} className="input" />
                <input required type="number" step="0.01" min="0" placeholder="Selling price (₹)"
                  value={form.selling_price} onChange={e => setForm({...form, selling_price:e.target.value})} className="input" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input required type="number" min="0" placeholder="Quantity"
                  value={form.quantity} onChange={e => setForm({...form, quantity:e.target.value})} className="input" />
                <input type="number" min="0" placeholder="Min stock level"
                  value={form.min_quantity} onChange={e => setForm({...form, min_quantity:e.target.value})} className="input" />
              </div>
              <input placeholder="Barcode (optional)"
                value={form.barcode} onChange={e => setForm({...form, barcode:e.target.value})} className="input" />
              {error && <p className="text-danger text-sm">{error}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="text-sm text-muted hover:text-body px-4 py-2 rounded-xl hover:bg-surface transition-colors">Cancel</button>
                <button type="submit"
                  className="bg-indigo hover:bg-violet text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors shadow-md">
                  {editingId ? 'Save changes' : 'Add product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {restockId && (
        <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-card rounded-2xl w-full max-w-xs p-6 shadow-card-hover animate-fade-up">
            <h3 className="font-display text-lg font-bold mb-1">Restock product</h3>
            <p className="text-muted text-sm mb-4">Enter quantity received from supplier</p>
            <form onSubmit={submitRestock} className="space-y-3">
              <input autoFocus required type="number" min="1" placeholder="Quantity received"
                value={restockQty} onChange={e => setRestockQty(e.target.value)} className="input" />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setRestockId(null)}
                  className="text-sm text-muted px-4 py-2">Cancel</button>
                <button type="submit"
                  className="bg-success hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">
                  Add stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
