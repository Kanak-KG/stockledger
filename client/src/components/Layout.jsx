import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_BY_ROLE = {
  admin: [
    { to: '/', label: 'Dashboard', icon: '◆' },
    { to: '/inventory', label: 'Inventory', icon: '▤' },
    { to: '/sales', label: 'Billing', icon: '✎' },
    { to: '/sales-history', label: 'Sales History', icon: '↺' },
    { to: '/reports', label: 'Reports', icon: '▦' },
    { to: '/ai-analytics', label: 'AI Analytics', icon: '✦' },
    { to: '/employees', label: 'Employees', icon: '◎' },
    { to: '/profile', label: 'Profile', icon: '○' },
  ],
  inventory_manager: [
    { to: '/', label: 'Dashboard', icon: '◆' },
    { to: '/inventory', label: 'Inventory', icon: '▤' },
    { to: '/profile', label: 'Profile', icon: '○' },
  ],
  sales_executive: [
    { to: '/', label: 'Dashboard', icon: '◆' },
    { to: '/sales', label: 'Billing', icon: '✎' },
    { to: '/sales-history', label: 'My Sales', icon: '↺' },
    { to: '/profile', label: 'Profile', icon: '○' },
  ],
};

const ROLE_LABEL = {
  admin: 'Admin',
  inventory_manager: 'Inventory Manager',
  sales_executive: 'Sales Executive',
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
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-ink text-paper flex flex-col">
        <div className="px-6 py-6 border-b border-white/10">
          <h1 className="font-display text-xl font-semibold tracking-tight">StockLedger</h1>
          <p className="text-xs text-white/50 mt-0.5">Sales &amp; Inventory</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  isActive ? 'bg-moss text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <span className="w-4 text-center opacity-80">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-moss flex items-center justify-center text-sm font-semibold">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-white/50">{ROLE_LABEL[user.role]}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left text-xs text-white/60 hover:text-rose transition-colors"
          >
            Sign out →
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
