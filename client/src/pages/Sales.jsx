import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

export default function Sales() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]); // [{product_id, name, price, quantity, stock}]
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [lastReceipt, setLastReceipt] = useState(null);

  async function loadProducts() {
    setLoading(true);
    const { data } = await api.get('/products');
    setProducts(data);
    setLoading(false);
  }
  useEffect(() => { loadProducts(); }, []);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  function addToCart(p) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product_id === p.id);
      if (existing) {
        if (existing.quantity >= p.quantity) return prev; // can't exceed stock
        return prev.map((i) => i.product_id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      if (p.quantity < 1) return prev;
      return [...prev, { product_id: p.id, name: p.name, price: Number(p.selling_price), quantity: 1, stock: p.quantity }];
    });
  }

  function updateQty(productId, qty) {
    setCart((prev) => prev.map((i) => i.product_id === productId ? { ...i, quantity: Math.max(1, Math.min(qty, i.stock)) } : i));
  }

  function removeFromCart(productId) {
    setCart((prev) => prev.filter((i) => i.product_id !== productId));
  }

  const total = useMemo(() => cart.reduce((sum, i) => sum + i.price * i.quantity, 0), [cart]);

  async function completeSale() {
    if (cart.length === 0) return;
    setSubmitting(true);
    setError('');
    try {
      const { data } = await api.post('/sales', {
        customer_name: customerName || null,
        items: cart.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
      });
      setLastReceipt({ ...data, customer_name: customerName });
      setCart([]);
      setCustomerName('');
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not complete sale');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-1">Billing</h2>
      <p className="text-slate text-sm mb-6">Select products, build the cart, and complete the sale.</p>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Product picker */}
        <div className="lg:col-span-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products to add…"
            className="w-full px-3.5 py-2.5 rounded-md border border-sand bg-white text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-moss/40"
          />
          {loading ? (
            <p className="text-slate text-sm">Loading products…</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  disabled={p.quantity < 1}
                  className="text-left bg-white border border-sand rounded-lg p-3 hover:border-moss transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-slate num mt-1">₹{Number(p.selling_price).toFixed(2)}</p>
                  <p className="text-xs text-slate num">{p.quantity > 0 ? `${p.quantity} in stock` : 'Out of stock'}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cart */}
        <div className="bg-white border border-sand rounded-lg p-5 h-fit sticky top-8">
          <h3 className="text-sm font-semibold mb-3">Current Bill</h3>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Customer name (optional)"
            className="w-full px-3 py-2 rounded-md border border-sand text-sm mb-4"
          />

          {cart.length === 0 ? (
            <p className="text-slate text-sm py-6 text-center">Cart is empty — tap a product to add it.</p>
          ) : (
            <div className="space-y-3 mb-4 max-h-72 overflow-y-auto">
              {cart.map((i) => (
                <div key={i.product_id} className="flex items-center justify-between gap-2 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate">{i.name}</p>
                    <p className="text-xs text-slate num">₹{i.price.toFixed(2)} each</p>
                  </div>
                  <input
                    type="number" min="1" max={i.stock} value={i.quantity}
                    onChange={(e) => updateQty(i.product_id, Number(e.target.value))}
                    className="w-14 px-1.5 py-1 rounded border border-sand text-xs num text-center"
                  />
                  <button onClick={() => removeFromCart(i.product_id)} className="text-rose text-xs">✕</button>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-sand pt-3 flex justify-between text-sm font-semibold mb-4">
            <span>Total</span>
            <span className="num">₹{total.toFixed(2)}</span>
          </div>

          {error && <p className="text-rose text-xs mb-3">{error}</p>}

          <button
            onClick={completeSale}
            disabled={cart.length === 0 || submitting}
            className="w-full bg-moss hover:bg-mossDark text-white text-sm font-medium py-2.5 rounded-md transition-colors disabled:opacity-50"
          >
            {submitting ? 'Processing…' : 'Complete Sale'}
          </button>
        </div>
      </div>

      {/* Receipt modal */}
      {lastReceipt && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg w-full max-w-xs p-6 num">
            <h3 className="font-display text-lg font-semibold mb-1 text-center">Sale Complete</h3>
            <p className="text-xs text-slate text-center mb-4">Receipt #{lastReceipt.id}</p>
            <div className="space-y-1 text-sm border-t border-b border-dashed border-sand py-3 mb-3">
              {lastReceipt.items.map((i) => (
                <div key={i.product_id} className="flex justify-between">
                  <span>{i.product_name} x{i.quantity}</span>
                  <span>₹{Number(i.subtotal).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-semibold text-sm mb-6">
              <span>Total</span>
              <span>₹{Number(lastReceipt.total_amount).toFixed(2)}</span>
            </div>
            <button onClick={() => setLastReceipt(null)} className="w-full bg-moss hover:bg-mossDark text-white text-sm font-medium py-2.5 rounded-md font-body">
              New Sale
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
