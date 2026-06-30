import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

export default function Sales() {
  const [products, setProducts]       = useState([]);
  const [search, setSearch]           = useState('');
  const [cart, setCart]               = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState('');
  const [lastReceipt, setLastReceipt] = useState(null);

  async function loadProducts() {
    setLoading(true);
    const { data } = await api.get('/products');
    setProducts(data);
    setLoading(false);
  }
  useEffect(() => { loadProducts(); }, []);

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  function addToCart(p) {
    setCart(prev => {
      const ex = prev.find(i => i.product_id === p.id);
      if (ex) {
        if (ex.quantity >= p.quantity) return prev;
        return prev.map(i => i.product_id === p.id ? {...i, quantity: i.quantity+1} : i);
      }
      if (p.quantity < 1) return prev;
      return [...prev, { product_id:p.id, name:p.name, price:Number(p.selling_price), quantity:1, stock:p.quantity }];
    });
  }
  function updateQty(id, qty) {
    setCart(prev => prev.map(i => i.product_id===id ? {...i, quantity:Math.max(1,Math.min(qty,i.stock))} : i));
  }
  function removeFromCart(id) { setCart(prev => prev.filter(i => i.product_id!==id)); }

  const total = useMemo(() => cart.reduce((s,i) => s+i.price*i.quantity, 0), [cart]);

  async function completeSale() {
    if (!cart.length) return;
    setSubmitting(true); setError('');
    try {
      const { data } = await api.post('/sales', {
        customer_name: customerName || null,
        items: cart.map(i => ({ product_id:i.product_id, quantity:i.quantity })),
      });
      setLastReceipt({...data, customer_name:customerName});
      setCart([]); setCustomerName('');
      loadProducts();
    } catch (err) { setError(err.response?.data?.message || 'Could not complete sale'); }
    finally { setSubmitting(false); }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-body">Billing</h2>
        <p className="text-muted text-sm mt-1">Select products, build the cart, and complete the sale.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Product picker */}
        <div className="lg:col-span-2">
          <div className="relative mb-4">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products to add…" className="input pl-9" />
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-7 h-7 border-2 border-indigo border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filtered.map(p => {
                const inCart = cart.find(i => i.product_id===p.id);
                return (
                  <button key={p.id} onClick={() => addToCart(p)} disabled={p.quantity<1}
                    className={`text-left rounded-2xl p-4 border transition-all duration-150 hover:-translate-y-0.5 hover:shadow-card-hover disabled:opacity-40 disabled:cursor-not-allowed group ${
                      inCart ? 'bg-indigo/5 border-indigo/30 shadow-sm' : 'bg-card border-border hover:border-indigo/30'
                    }`}>
                    <p className="text-sm font-semibold text-body truncate group-hover:text-indigo transition-colors">{p.name}</p>
                    <p className="text-indigo font-bold num text-sm mt-1">₹{Number(p.selling_price).toFixed(2)}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted num">{p.quantity>0 ? `${p.quantity} left` : 'Out of stock'}</p>
                      {inCart && <span className="text-xs bg-indigo text-white px-2 py-0.5 rounded-full font-medium">{inCart.quantity}</span>}
                    </div>
                  </button>
                );
              })}
              {filtered.length===0 && (
                <div className="col-span-3 text-center py-12 text-muted text-sm">No products found.</div>
              )}
            </div>
          )}
        </div>

        {/* Cart */}
        <div className="bg-card border border-border rounded-2xl p-5 h-fit sticky top-8 shadow-card">
          <h3 className="font-display text-base font-bold mb-4 flex items-center gap-2">
            🧾 Current Bill
            {cart.length>0 && <span className="bg-indigo text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{cart.length}</span>}
          </h3>

          <input value={customerName} onChange={e => setCustomerName(e.target.value)}
            placeholder="Customer name (optional)"
            className="input text-sm mb-4" />

          {cart.length===0 ? (
            <div className="py-10 text-center">
              <p className="text-3xl mb-2">🛒</p>
              <p className="text-muted text-sm">Cart is empty</p>
              <p className="text-muted text-xs mt-1">Tap a product to add it</p>
            </div>
          ) : (
            <div className="space-y-3 mb-4 max-h-72 overflow-y-auto pr-1">
              {cart.map(i => (
                <div key={i.product_id} className="flex items-center justify-between gap-2 bg-surface rounded-xl p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-body truncate">{i.name}</p>
                    <p className="text-xs text-muted num">₹{i.price.toFixed(2)} each</p>
                  </div>
                  <input type="number" min="1" max={i.stock} value={i.quantity}
                    onChange={e => updateQty(i.product_id, Number(e.target.value))}
                    className="w-14 px-2 py-1 rounded-lg border border-border text-xs num text-center font-bold focus:outline-none focus:ring-2 focus:ring-indigo/30" />
                  <button onClick={() => removeFromCart(i.product_id)}
                    className="text-danger/60 hover:text-danger text-sm w-6 h-6 flex items-center justify-center rounded-lg hover:bg-danger/10 transition-colors">✕</button>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-border pt-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted">Subtotal ({cart.reduce((s,i)=>s+i.quantity,0)} items)</span>
              <span className="font-display text-lg font-bold num text-body">₹{total.toFixed(2)}</span>
            </div>
          </div>

          {error && <p className="text-danger text-xs mb-3 bg-danger/5 border border-danger/20 rounded-lg px-3 py-2">{error}</p>}

          <button onClick={completeSale} disabled={!cart.length||submitting}
            className="w-full bg-indigo hover:bg-violet text-white text-sm font-semibold py-3.5 rounded-xl transition-all shadow-md hover:shadow-glow-violet disabled:opacity-50">
            {submitting ? 'Processing…' : `Complete Sale · ₹${total.toFixed(2)}`}
          </button>
        </div>
      </div>

      {/* Receipt modal */}
      {lastReceipt && (
        <div className="fixed inset-0 bg-ink/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-card rounded-2xl w-full max-w-sm p-6 shadow-card-hover animate-fade-up">
            <div className="text-center mb-4">
              <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center text-2xl mx-auto mb-3">✓</div>
              <h3 className="font-display text-lg font-bold">Sale Complete!</h3>
              <p className="text-muted text-xs num">Receipt #{lastReceipt.id}</p>
            </div>
            <div className="space-y-2 text-sm border-t border-b border-dashed border-border py-4 mb-4 num">
              {lastReceipt.items.map(i => (
                <div key={i.product_id} className="flex justify-between">
                  <span className="text-muted">{i.product_name} ×{i.quantity}</span>
                  <span className="font-semibold">₹{Number(i.subtotal).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-display font-bold text-lg num mb-6">
              <span>Total</span>
              <span className="text-indigo">₹{Number(lastReceipt.total_amount).toFixed(2)}</span>
            </div>
            <button onClick={() => setLastReceipt(null)}
              className="w-full bg-indigo hover:bg-violet text-white font-semibold py-3 rounded-xl transition-colors">
              New Sale →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
