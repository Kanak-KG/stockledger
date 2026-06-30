import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_BY_ROLE = {
  admin: [
    { to: '/dashboard',    label: 'Dashboard',    icon: '◆' },
    { to: '/inventory',    label: 'Inventory',    icon: '▤' },
    { to: '/sales',        label: 'Billing',      icon: '✎' },
    { to: '/sales-history',label: 'Sales History',icon: '↺' },
    { to: '/reports',      label: 'Reports',      icon: '▦' },
    { to: '/ai-analytics', label: 'AI Analytics', icon: '✦' },
    { to: '/employees',    label: 'Employees',    icon: '◎' },
    { to: '/profile',      label: 'Profile',      icon: '○' },
  ],
  inventory_manager: [
    { to: '/dashboard', label: 'Dashboard', icon: '◆' },
    { to: '/inventory', label: 'Inventory', icon: '▤' },
    { to: '/profile',   label: 'Profile',   icon: '○' },
  ],
  sales_executive: [
    { to: '/dashboard',     label: 'Dashboard', icon: '◆' },
    { to: '/sales',         label: 'Billing',   icon: '✎' },
    { to: '/sales-history', label: 'My Sales',  icon: '↺' },
    { to: '/profile',       label: 'Profile',   icon: '○' },
  ],
};

const ROLE_LABEL = {
  admin:             'Admin',
  inventory_manager: 'Inventory Manager',
  sales_executive:   'Sales Executive',
};

const ROLE_COLOR = {
  admin:             'bg-amber/20 text-amberLight',
  inventory_manager: 'bg-indigo/20 text-indigoLight',
  sales_executive:   'bg-success/20 text-emerald-300',
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const nav = NAV_BY_ROLE[user.role] || [];

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex bg-surface">
      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 bg-sidebar flex flex-col shadow-xl">

        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-card-violet flex items-center justify-center text-white font-display font-bold text-sm shadow-glow-violet">
              S
            </div>
            <div>
              <span className="font-display text-base font-bold text-white">Stock</span>
              <span className="font-display text-base font-bold text-indigoLight">Ledger</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo/20 text-white border border-indigo/30 shadow-sm'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`text-base w-5 text-center transition-colors ${isActive ? 'text-indigoLight' : ''}`}>
                    {item.icon}
                  </span>
                  {item.label}
                  {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigoLight" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User profile strip */}
        <div className="px-4 py-4 border-t border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-card-violet flex items-center justify-center text-white font-display font-bold text-sm shrink-0 shadow-glow-violet">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLOR[user.role]}`}>
                {ROLE_LABEL[user.role]}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left text-xs text-white/30 hover:text-danger transition-colors py-1"
          >
            ← Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
