import { useEffect, useState } from 'react';
import api from '../services/api';

const emptyForm = { name: '', email: '', password: '', role: 'sales_executive' };

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [resetTarget, setResetTarget] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  async function load() {
    setLoading(true);
    const { data } = await api.get('/employees');
    setEmployees(data);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/employees', form);
      setModalOpen(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create employee');
    }
  }

  async function toggleActive(emp) {
    await api.put(`/employees/${emp.id}`, { name: emp.name, role: emp.role, is_active: !emp.is_active });
    load();
  }

  async function submitReset(e) {
    e.preventDefault();
    if (newPassword.length < 6) return;
    await api.patch(`/employees/${resetTarget.id}/reset-password`, { newPassword });
    setResetTarget(null);
    setNewPassword('');
  }

  const ROLE_LABEL = { inventory_manager: 'Inventory Manager', sales_executive: 'Sales Executive' };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Employees</h2>
          <p className="text-slate text-sm mt-1">{employees.length} staff accounts</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="bg-moss hover:bg-mossDark text-white text-sm font-medium px-4 py-2.5 rounded-md">
          + Add Employee
        </button>
      </div>

      {loading ? (
        <p className="text-slate text-sm">Loading…</p>
      ) : (
        <div className="bg-white border border-sand rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sand/50 text-left text-xs text-slate uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-t border-sand">
                  <td className="px-4 py-3 font-medium">{emp.name}</td>
                  <td className="px-4 py-3 text-slate">{emp.email}</td>
                  <td className="px-4 py-3">{ROLE_LABEL[emp.role]}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${emp.is_active ? 'bg-moss/10 text-moss' : 'bg-rose/10 text-rose'}`}>
                      {emp.is_active ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                    <button onClick={() => setResetTarget(emp)} className="text-xs text-moss hover:underline">Reset password</button>
                    <button onClick={() => toggleActive(emp)} className="text-xs text-rose hover:underline">
                      {emp.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate text-sm">No employees yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Add Employee</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-sand text-sm" />
              <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-sand text-sm" />
              <input required type="password" placeholder="Temporary password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-sand text-sm" />
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2 rounded-md border border-sand text-sm">
                <option value="sales_executive">Sales Executive (Cashier)</option>
                <option value="inventory_manager">Inventory Manager (Storekeeper)</option>
              </select>
              {error && <p className="text-rose text-sm">{error}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="text-sm text-slate px-4 py-2">Cancel</button>
                <button type="submit" className="bg-moss hover:bg-mossDark text-white text-sm font-medium px-4 py-2 rounded-md">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {resetTarget && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg w-full max-w-xs p-6">
            <h3 className="text-lg font-semibold mb-1">Reset password</h3>
            <p className="text-xs text-slate mb-4">{resetTarget.name}</p>
            <form onSubmit={submitReset} className="space-y-3">
              <input autoFocus required type="password" minLength={6} placeholder="New password" value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 rounded-md border border-sand text-sm" />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setResetTarget(null)} className="text-sm text-slate px-4 py-2">Cancel</button>
                <button type="submit" className="bg-moss hover:bg-mossDark text-white text-sm font-medium px-4 py-2 rounded-md">Reset</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
