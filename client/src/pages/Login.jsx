import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate('/dashboard');
  }

  return (
    <div className="min-h-screen bg-hero-gradient flex">

      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 px-16 py-12 relative overflow-hidden">

        {/* grid */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(rgba(129,140,248,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(129,140,248,.4) 1px,transparent 1px)', backgroundSize: '50px 50px' }} />
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-violet/25 rounded-full blur-3xl" />

        <Link to="/" className="relative z-10">
          <span className="font-display text-2xl font-bold text-white">Stock</span>
          <span className="font-display text-2xl font-bold text-indigoLight">Ledger</span>
        </Link>

        <div className="relative z-10">
          <p className="font-display text-4xl font-bold leading-tight text-white mb-6">
            Your store's<br />
            <span className="text-gradient">command centre.</span>
          </p>

          {/* mini feature pills */}
          <div className="flex flex-wrap gap-3">
            {['Role-based access','AI Analytics','Live Reports','Secure Billing'].map((f) => (
              <span key={f} className="glass text-white/70 text-xs px-3 py-1.5 rounded-full">{f}</span>
            ))}
          </div>

          {/* floating stat card */}
          <div className="glass rounded-2xl p-5 mt-8 max-w-xs">
            <p className="text-xs text-white/40 mb-1">Today's Profit</p>
            <p className="font-display text-3xl font-bold text-amberLight num">₹24,300</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-success text-xs">↑ 22% vs yesterday</span>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/20">React · Node.js · MySQL · JWT Auth</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <Link to="/" className="lg:hidden block mb-10">
            <span className="font-display text-2xl font-bold text-white">Stock</span>
            <span className="font-display text-2xl font-bold text-indigoLight">Ledger</span>
          </Link>

          <div className="glass rounded-3xl p-8">
            <h2 className="font-display text-2xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-white/40 text-sm mb-7">Sign in to your store account</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Email</label>
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@store.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo/50 focus:border-indigo/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'} required value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo/50 focus:border-indigo/50 transition-colors pr-12"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 text-xs transition-colors">
                    {showPw ? 'hide' : 'show'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-danger/10 border border-danger/20 rounded-xl px-4 py-3">
                  <span className="text-danger text-xs">✕</span>
                  <p className="text-danger text-xs">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-indigo hover:bg-violet text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-glow-violet hover:shadow-glow-violet disabled:opacity-50 text-sm mt-2">
                {loading ? 'Signing in…' : 'Sign in →'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/5">
              <p className="text-xs text-white/25 text-center">Default admin credentials</p>
              <p className="text-xs text-white/40 text-center num mt-1">admin@store.com · Admin@123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
