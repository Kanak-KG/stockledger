import { useEffect, useState } from 'react';
import api from '../services/api';

const ROLE_LABEL = { inventory_manager:'Inventory Manager', sales_executive:'Sales Executive' };

const emptyForm = { name:'', email:'', password:'', role:'sales_executive' };

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm]           = useState(emptyForm);
  const [error, setError]         = useState('');
  const [resetTarget, setResetTarget] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  async function load() {
    setLoading(true);
    const { data } = await api.get('/employees');
    setEmployees(data); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault(); setError('');
    try { await api.post('/employees', form); setModalOpen(false); setForm(emptyForm); load(); }
    catch (err) { setError(err.response?.data?.message || 'Could not create employee'); }
  }

  async function toggleActive(emp) {
    await api.put(`/employees/${emp.id}`, { name:emp.name, role:emp.role, is_active:!emp.is_active });
    load();
  }

  async function submitReset(e) {
    e.preventDefault();
    if (newPassword.length < 6) return;
    await api.patch(`/employees/${resetTarget.id}/reset-password`, { newPassword });
    setResetTarget(null); setNewPassword('');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-body">Employees</h2>
          <p className="text-muted text-sm mt-1">{employees.length} staff accounts</p>
        </div>
        <button onClick={() => setModalOpen(true)}
          className="bg-indigo hover:bg-violet text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-glow-violet hover:-translate-y-0.5">
          + Add Employee
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-7 h-7 border-2 border-indigo border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="tbl-head">
                <th className="px-5 py-3.5 text-left font-semibold">Name</th>
                <th className="px-5 py-3.5 text-left font-semibold">Email</th>
                <th className="px-5 py-3.5 text-left font-semibold">Role</th>
                <th className="px-5 py-3.5 text-left font-semibold">Status</th>
                <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id} className="tbl-row">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo/10 flex items-center justify-center text-indigo font-bold text-sm">
                        {emp.name[0].toUpperCase()}
                      </div>
                      <span className="font-semibold text-body">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted">{emp.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                      emp.role==='inventory_manager'
                        ? 'bg-indigo/10 text-indigo border-indigo/20'
                        : 'bg-success/10 text-success border-success/20'
                    }`}>{ROLE_LABEL[emp.role]}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                      emp.is_active ? 'bg-success/10 text-success border-success/20' : 'bg-danger/10 text-danger border-danger/20'
                    }`}>{emp.is_active ? 'Active' : 'Deactivated'}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap space-x-3">
                    <button onClick={() => setResetTarget(emp)} className="text-xs text-indigo hover:underline font-medium">Reset password</button>
                    <button onClick={() => toggleActive(emp)} className={`text-xs hover:underline ${emp.is_active ? 'text-danger' : 'text-success'}`}>
                      {emp.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
              {employees.length===0 && (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-muted text-sm">No employees yet. Add your first one above.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-card rounded-2xl w-full max-w-sm p-6 shadow-card-hover animate-fade-up">
            <h3 className="font-display text-lg font-bold mb-5">Add Employee</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required placeholder="Full name" value={form.name}
                onChange={e => setForm({...form,name:e.target.value})} className="input" />
              <input required type="email" placeholder="Email address" value={form.email}
                onChange={e => setForm({...form,email:e.target.value})} className="input" />
              <input required type="password" placeholder="Temporary password" value={form.password}
                onChange={e => setForm({...form,password:e.target.value})} className="input" />
              <select value={form.role} onChange={e => setForm({...form,role:e.target.value})} className="input">
                <option value="sales_executive">Sales Executive (Cashier)</option>
                <option value="inventory_manager">Inventory Manager (Storekeeper)</option>
              </select>
              {error && <p className="text-danger text-sm">{error}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="text-sm text-muted hover:text-body px-4 py-2 rounded-xl hover:bg-surface transition-colors">Cancel</button>
                <button type="submit"
                  className="bg-indigo hover:bg-violet text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors shadow-md">
                  Create Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset password modal */}
      {resetTarget && (
        <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-card rounded-2xl w-full max-w-xs p-6 shadow-card-hover animate-fade-up">
            <h3 className="font-display text-lg font-bold mb-1">Reset Password</h3>
            <p className="text-xs text-muted mb-4">{resetTarget.name}</p>
            <form onSubmit={submitReset} className="space-y-3">
              <input autoFocus required type="password" minLength={6} placeholder="New password"
                value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input" />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setResetTarget(null)}
                  className="text-sm text-muted px-4 py-2">Cancel</button>
                <button type="submit"
                  className="bg-indigo hover:bg-violet text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">Reset</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
