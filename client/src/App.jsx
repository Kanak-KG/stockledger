import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import SalesHistory from './pages/SalesHistory';
import Reports from './pages/Reports';
import AIAnalytics from './pages/AIAnalytics';
import Employees from './pages/Employees';
import Profile from './pages/Profile';

function Page({ children, roles }) {
  return (
    <ProtectedRoute roles={roles}>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<Page><Dashboard /></Page>} />
      <Route path="/profile" element={<Page><Profile /></Page>} />

      <Route path="/inventory" element={<Page roles={['admin', 'inventory_manager']}><Inventory /></Page>} />

      <Route path="/sales" element={<Page roles={['admin', 'sales_executive']}><Sales /></Page>} />
      <Route path="/sales-history" element={<Page roles={['admin', 'sales_executive']}><SalesHistory /></Page>} />

      <Route path="/reports" element={<Page roles={['admin']}><Reports /></Page>} />
      <Route path="/ai-analytics" element={<Page roles={['admin']}><AIAnalytics /></Page>} />
      <Route path="/employees" element={<Page roles={['admin']}><Employees /></Page>} />

      <Route path="*" element={<Page><Dashboard /></Page>} />
    </Routes>
  );
}
