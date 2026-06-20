import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate('/');
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-ink text-paper px-12 py-12">
        <div>
          <h1 className="font-display text-2xl font-semibold">StockLedger</h1>
          <p className="text-white/50 text-sm mt-1">Sales &amp; Inventory Management</p>
        </div>
        <div>
          <p className="font-display text-3xl leading-snug max-w-md">
            Every product counted.<br />Every sale recorded.<br />Every decision backed by data.
          </p>
          <div className="flex gap-6 mt-8 text-sm text-white/50 num">
            <div><span className="text-moss text-lg">●</span> Role-based access</div>
            <div><span className="text-amber text-lg">●</span> Live AI analytics</div>
          </div>
        </div>
        <p className="text-xs text-white/30">Built for storekeepers, cashiers &amp; owners.</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <h1 className="font-display text-2xl font-semibold">StockLedger</h1>
          </div>
          <h2 className="text-xl font-semibold mb-1">Sign in</h2>
          <p className="text-slate text-sm mb-6">Enter your store credentials to continue.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@store.com"
                className="w-full px-3.5 py-2.5 rounded-md border border-sand bg-white focus:outline-none focus:ring-2 focus:ring-moss/40 focus:border-moss text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-md border border-sand bg-white focus:outline-none focus:ring-2 focus:ring-moss/40 focus:border-moss text-sm"
              />
            </div>

            {error && (
              <p className="text-rose text-sm bg-rose/10 border border-rose/20 rounded-md px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-moss hover:bg-mossDark text-white text-sm font-medium py-2.5 rounded-md transition-colors disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-xs text-slate mt-6">
            Default admin (after seeding): <span className="num">admin@store.com</span> / <span className="num">Admin@123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
