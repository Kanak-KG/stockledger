import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* ── tiny animated counter ── */
function Counter({ target, prefix = '', suffix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      let start = 0;
      const step = target / 60;
      const timer = setInterval(() => {
        start += step;
        if (start >= target) { setVal(target); clearInterval(timer); }
        else setVal(Math.floor(start));
      }, 16);
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{prefix}{val.toLocaleString('en-IN')}{suffix}</span>;
}

/* ── floating dashboard preview card ── */
function FloatCard({ className, children }) {
  return (
    <div className={`glass rounded-2xl p-4 shadow-glow-violet ${className}`}>
      {children}
    </div>
  );
}

const FEATURES = [
  {
    icon: '🔐',
    title: 'Three-Role Access',
    desc: 'Admin, Inventory Manager, and Sales Executive — each sees only what they need. No accidental deletions, no unauthorized access.',
    color: 'from-violet to-indigo',
  },
  {
    icon: '📦',
    title: 'Smart Inventory',
    desc: 'Add, edit, restock products. Soft-deactivate instead of hard-delete to preserve sales history. Low-stock alerts built in.',
    color: 'from-cyan-600 to-cyan-400',
  },
  {
    icon: '🧾',
    title: 'Cart-Based Billing',
    desc: 'Scan or search products, build a cart, complete the sale — stock reduces automatically, receipt generates instantly.',
    color: 'from-amber to-yellow-400',
  },
  {
    icon: '✦',
    title: 'AI Analytics',
    desc: 'Dead stock detection, best-seller rankings, restock suggestions, profit margin analysis, and plain-English business summaries.',
    color: 'from-success to-emerald-400',
  },
  {
    icon: '📊',
    title: 'Rich Reports',
    desc: 'Daily, weekly, monthly, yearly or custom date ranges. Revenue & profit charts, category breakdown, top products. Print to PDF.',
    color: 'from-rose-600 to-rose-400',
  },
  {
    icon: '🔒',
    title: 'Secure & Fast',
    desc: 'JWT authentication, bcrypt password hashing, SQL transactions with row locking — two cashiers can never oversell the same item.',
    color: 'from-indigo to-purple-400',
  },
];

const STEPS = [
  { n: '01', title: 'Admin sets up the store', desc: 'Add product catalogue, set prices, create employee accounts and assign roles.' },
  { n: '02', title: 'Staff gets to work', desc: 'Inventory managers restock products. Cashiers scan items and generate bills — all in real time.' },
  { n: '03', title: 'Owner reviews insights', desc: 'AI analytics surface trends, dead stock, profit margins and natural-language summaries automatically.' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="font-body text-white">

      {/* ══════════ HERO ══════════ */}
      <section className="min-h-screen bg-hero-gradient relative overflow-hidden flex flex-col">

        {/* subtle grid overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(rgba(129,140,248,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(129,140,248,.3) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/30 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo/20 rounded-full blur-3xl animate-pulse-slow delay-300" />

        {/* nav */}
        <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
          <div>
            <span className="font-display text-xl font-bold text-white">Stock</span>
            <span className="font-display text-xl font-bold text-gradient">Ledger</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="text-sm text-white/70 hover:text-white transition-colors font-medium">Sign in</button>
            <button onClick={() => navigate('/login')} className="btn-primary text-sm py-2 px-5">Get Started →</button>
          </div>
        </nav>

        {/* hero content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pb-20 max-w-5xl mx-auto w-full">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-xs text-white/70 mb-8 animate-fade-up">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Built with React · Node.js · MySQL · AI Analytics
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-up delay-100">
            Every product counted.<br />
            <span className="text-gradient">Every rupee tracked.</span>
          </h1>

          <p className="text-lg text-white/60 max-w-2xl mb-10 leading-relaxed animate-fade-up delay-200">
            StockLedger is a full-stack sales & inventory management system with role-based access, 
            live billing, rich reporting, and AI-powered business insights — built for real stores.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16 animate-fade-up delay-300">
            <button onClick={() => navigate('/login')} className="btn-primary text-base px-8 py-4">
              Open Dashboard →
            </button>
            <a href="#features" className="btn-outline text-base px-8 py-4">
              See Features
            </a>
          </div>

          {/* floating preview cards */}
          <div className="relative w-full max-w-3xl h-64 animate-fade-up delay-400">
            <FloatCard className="absolute left-0 top-0 w-52 animate-float">
              <p className="text-xs text-white/50 mb-1">Today's Revenue</p>
              <p className="text-2xl font-display font-bold num text-amberLight">₹84,500</p>
              <p className="text-xs text-success mt-1">↑ 18% vs last week</p>
            </FloatCard>

            <FloatCard className="absolute left-1/2 -translate-x-1/2 top-4 w-60 animate-float-slow">
              <p className="text-xs text-white/50 mb-2">Top Selling Today</p>
              <div className="space-y-1.5">
                {[['Cold Drink', 47], ['Biscuits', 31], ['Chips', 28]].map(([n, u]) => (
                  <div key={n} className="flex justify-between text-xs">
                    <span className="text-white/80">{n}</span>
                    <span className="num text-indigoLight">{u} units</span>
                  </div>
                ))}
              </div>
            </FloatCard>

            <FloatCard className="absolute right-0 top-2 w-48 animate-float delay-200">
              <p className="text-xs text-white/50 mb-1">Low Stock Alert</p>
              <p className="text-lg font-bold text-danger">8 products</p>
              <p className="text-xs text-white/50 mt-1">Need restocking soon</p>
            </FloatCard>

            <FloatCard className="absolute left-8 bottom-0 w-56 animate-float delay-300">
              <p className="text-xs text-white/50 mb-1">AI Insight</p>
              <p className="text-xs text-white/80 leading-relaxed">
                "Sales up 18% this month. 3 products haven't sold in 60+ days."
              </p>
            </FloatCard>

            <FloatCard className="absolute right-8 bottom-0 w-44 animate-float-slow delay-100">
              <p className="text-xs text-white/50 mb-1">Profit Margin</p>
              <p className="text-2xl font-display font-bold text-success num">28.3%</p>
              <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
                <div className="bg-success h-1.5 rounded-full" style={{ width: '28%' }} />
              </div>
            </FloatCard>
          </div>
        </div>

        {/* scroll cue */}
        <div className="relative z-10 flex justify-center pb-8 animate-bounce">
          <a href="#stats" className="text-white/30 text-xs flex flex-col items-center gap-1">
            <span>scroll</span>
            <span>↓</span>
          </a>
        </div>
      </section>

      {/* ══════════ STATS STRIP ══════════ */}
      <section id="stats" className="bg-body py-14 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: 'Products tracked', val: 500, suffix: '+' },
            { label: 'Roles supported', val: 3, suffix: '' },
            { label: 'Report types', val: 5, suffix: '' },
            { label: 'AI insights', val: 5, suffix: '' },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-display text-4xl font-bold text-gradient num">
                <Counter target={s.val} suffix={s.suffix} />
              </p>
              <p className="text-white/40 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ FEATURES ══════════ */}
      <section id="features" className="bg-ink py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-indigo text-sm font-semibold uppercase tracking-widest mb-3">Features</p>
            <h2 className="font-display text-4xl font-bold">Everything a store needs</h2>
            <p className="text-white/50 mt-4 max-w-xl mx-auto">From daily billing to deep AI analytics — built as a complete system, not a collection of tools.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="glass rounded-2xl p-6 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                  {f.icon}
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="bg-body py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amber text-sm font-semibold uppercase tracking-widest mb-3">Workflow</p>
            <h2 className="font-display text-4xl font-bold">How it works</h2>
          </div>

          <div className="space-y-6">
            {STEPS.map((s, i) => (
              <div key={i} className="glass rounded-2xl p-8 flex items-start gap-6">
                <span className="font-display text-5xl font-bold text-gradient opacity-60 shrink-0 num">{s.n}</span>
                <div>
                  <h3 className="font-display text-xl font-semibold mb-2">{s.title}</h3>
                  <p className="text-white/50 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ ROLE BREAKDOWN ══════════ */}
      <section className="bg-ink py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-indigoLight text-sm font-semibold uppercase tracking-widest mb-3">Access Control</p>
            <h2 className="font-display text-4xl font-bold">The right access for every role</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                role: 'Admin', icon: '👑', color: 'from-amber to-yellow-400',
                perms: ['Full dashboard & AI analytics', 'Manage all employees', 'View all reports & sales', 'Permanent product deletion', 'Business settings & overrides'],
              },
              {
                role: 'Inventory Manager', icon: '📦', color: 'from-indigo to-violet',
                perms: ['Add & edit products', 'Restock from suppliers', 'Deactivate (soft-delete) products', 'Manage categories & suppliers', 'View current stock levels'],
              },
              {
                role: 'Sales Executive', icon: '🧾', color: 'from-success to-emerald-400',
                perms: ['Search & add products to cart', 'Complete sales & generate bills', 'View own sales history', 'Auto stock deduction on sale', 'Customer name entry'],
              },
            ].map((r) => (
              <div key={r.role} className="glass rounded-2xl p-6">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${r.color} flex items-center justify-center text-2xl mb-4 shadow-glow-violet`}>
                  {r.icon}
                </div>
                <h3 className="font-display text-xl font-bold mb-4">{r.role}</h3>
                <ul className="space-y-2">
                  {r.perms.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-white/60">
                      <span className="text-success mt-0.5">✓</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className="bg-hero-gradient py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #5B21B6 0%, transparent 60%), radial-gradient(circle at 70% 50%, #4F46E5 0%, transparent 60%)' }} />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="font-display text-4xl font-bold mb-4">Ready to open the dashboard?</h2>
          <p className="text-white/50 mb-8 text-lg">Log in as Admin to explore the full system — create employees, add products, run a sale, and check AI insights.</p>
          <button onClick={() => navigate('/login')} className="btn-primary text-base px-10 py-4 shadow-glow-violet">
            Open StockLedger →
          </button>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="bg-ink border-t border-white/5 py-8 px-6 text-center text-white/30 text-sm">
        <p>StockLedger · Sales & Inventory Management System · Built with React, Node.js, MySQL</p>
      </footer>
    </div>
  );
}
