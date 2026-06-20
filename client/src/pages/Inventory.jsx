import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  name: '', category_id: '', supplier_id: '', purchase_price: '', selling_price: '', quantity: '', min_quantity: 10, barcode: ''
};

export default function Inventory() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ categories: [], suppliers: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [restockId, setRestockId] = useState(null);
  const [restockQty, setRestockQty] = useState('');
  const [error, setError] = useState('');

  const canEdit = ['admin', 'inventory_manager'].includes(user.role);

  async function loadAll() {
    setLoading(true);
    try {
      const [{ data: prods }, { data: m }] = await Promise.all([
        api.get(`/products?includeInactive=${showInactive}`),
        api.get('/products/meta/all'),
      ]);
      setProducts(prods);
      setMeta(m);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, [showInactive]);

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
    setModalOpen(true);
  }

  function openEdit(p) {
    setForm({
      name: p.name, category_id: p.category_id || '', supplier_id: p.supplier_id || '',
      purchase_price: p.purchase_price, selling_price: p.selling_price, quantity: p.quantity,
      min_quantity: p.min_quantity, barcode: p.barcode || ''
    });
    setEditingId(p.id);
    setError('');
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, form);
      } else {
        await api.post('/products', form);
      }
      setModalOpen(false);
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  }

  async function handleDeactivate(id) {
    if (!confirm('Deactivate this product? It will be hidden from sales but kept in history.')) return;
    await api.patch(`/products/${id}/deactivate`);
    loadAll();
  }

  async function handleActivate(id) {
    await api.patch(`/products/${id}/activate`);
    loadAll();
  }

  async function handlePermanentDelete(id) {
    if (!confirm('Permanently delete this product? This cannot be undone.')) return;
    try {
      await api.delete(`/products/${id}`);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete product');
    }
  }

  async function submitRestock(e) {
    e.preventDefault();
    if (!restockQty || restockQty <= 0) return;
    await api.patch(`/products/${restockId}/stock`, { quantityToAdd: Number(restockQty) });
    setRestockId(null);
    setRestockQty('');
    loadAll();
  }

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Inventory</h2>
          <p className="text-slate text-sm mt-1">{filtered.length} products</p>
        </div>
        {canEdit && (
          <button onClick={openCreate} className="bg-moss hover:bg-mossDark text-white text-sm font-medium px-4 py-2.5 rounded-md transition-colors">
            + Add Product
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="px-3.5 py-2 rounded-md border border-sand bg-white text-sm w-72 focus:outline-none focus:ring-2 focus:ring-moss/40"
        />
        {canEdit && (
          <label className="flex items-center gap-2 text-sm text-slate">
            <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
            Show deactivated
          </label>
        )}
      </div>

      {loading ? (
        <p className="text-slate text-sm">Loading…</p>
      ) : (
        <div className="bg-white border border-sand rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sand/50 text-left text-xs text-slate uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium text-right">Purchase</th>
                <th className="px-4 py-3 font-medium text-right">Selling</th>
                <th className="px-4 py-3 font-medium text-right">Stock</th>
                {canEdit && <th className="px-4 py-3 font-medium text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className={`border-t border-sand ${!p.is_active ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.name}</p>
                    {!p.is_active && <span className="text-xs text-rose">Deactivated</span>}
                  </td>
                  <td className="px-4 py-3 text-slate">{p.category_name || '—'}</td>
                  <td className="px-4 py-3 text-right num">₹{Number(p.purchase_price).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right num">₹{Number(p.selling_price).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right num">
                    <span className={p.quantity <= p.min_quantity ? 'text-rose font-semibold' : ''}>{p.quantity}</span>
                  </td>
                  {canEdit && (
                    <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                      <button onClick={() => setRestockId(p.id)} className="text-xs text-moss hover:underline">Restock</button>
                      <button onClick={() => openEdit(p)} className="text-xs text-slate hover:underline">Edit</button>
                      {p.is_active ? (
                        <button onClick={() => handleDeactivate(p.id)} className="text-xs text-amber hover:underline">Deactivate</button>
                      ) : (
                        <button onClick={() => handleActivate(p.id)} className="text-xs text-moss hover:underline">Activate</button>
                      )}
                      {user.role === 'admin' && (
                        <button onClick={() => handlePermanentDelete(p.id)} className="text-xs text-rose hover:underline">Delete</button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate text-sm">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit Product' : 'Add Product'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-sand text-sm" />

              <div className="grid grid-cols-2 gap-3">
                <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="px-3 py-2 rounded-md border border-sand text-sm">
                  <option value="">Category…</option>
                  {meta.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select value={form.supplier_id} onChange={(e) => setForm({ ...form, supplier_id: e.target.value })} className="px-3 py-2 rounded-md border border-sand text-sm">
                  <option value="">Supplier…</option>
                  {meta.suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input required type="number" step="0.01" min="0" placeholder="Purchase price" value={form.purchase_price}
                  onChange={(e) => setForm({ ...form, purchase_price: e.target.value })} className="px-3 py-2 rounded-md border border-sand text-sm" />
                <input required type="number" step="0.01" min="0" placeholder="Selling price" value={form.selling_price}
                  onChange={(e) => setForm({ ...form, selling_price: e.target.value })} className="px-3 py-2 rounded-md border border-sand text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input required type="number" min="0" placeholder="Quantity" value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="px-3 py-2 rounded-md border border-sand text-sm" />
                <input type="number" min="0" placeholder="Min stock level" value={form.min_quantity}
                  onChange={(e) => setForm({ ...form, min_quantity: e.target.value })} className="px-3 py-2 rounded-md border border-sand text-sm" />
              </div>

              <input placeholder="Barcode (optional)" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-sand text-sm" />

              {error && <p className="text-rose text-sm">{error}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="text-sm text-slate px-4 py-2">Cancel</button>
                <button type="submit" className="bg-moss hover:bg-mossDark text-white text-sm font-medium px-4 py-2 rounded-md">
                  {editingId ? 'Save changes' : 'Add product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock modal */}
      {restockId && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg w-full max-w-xs p-6">
            <h3 className="text-lg font-semibold mb-4">Restock product</h3>
            <form onSubmit={submitRestock} className="space-y-3">
              <input autoFocus required type="number" min="1" placeholder="Quantity received" value={restockQty}
                onChange={(e) => setRestockQty(e.target.value)} className="w-full px-3 py-2 rounded-md border border-sand text-sm" />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setRestockId(null)} className="text-sm text-slate px-4 py-2">Cancel</button>
                <button type="submit" className="bg-moss hover:bg-mossDark text-white text-sm font-medium px-4 py-2 rounded-md">Add stock</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
