import { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ROLE_LABEL = { admin:'Admin', inventory_manager:'Inventory Manager', sales_executive:'Sales Executive' };
const ROLE_COLOR = {
  admin:             'bg-amber/10 text-amber border-amber/30',
  inventory_manager: 'bg-indigo/10 text-indigo border-indigo/30',
  sales_executive:   'bg-success/10 text-success border-success/30',
};

export default function Profile() {
  const { user } = useAuth();
  const [current, setCurrent] = useState('');
  const [newPw, setNewPw]     = useState('');
  const [msg, setMsg]         = useState('');
  const [err, setErr]         = useState('');

  async function handleSubmit(e) {
    e.preventDefault(); setMsg(''); setErr('');
    try {
      await api.put('/auth/change-password', { currentPassword:current, newPassword:newPw });
      setMsg('Password updated successfully.'); setCurrent(''); setNewPw('');
    } catch (error) { setErr(error.response?.data?.message || 'Could not update password'); }
  }

  return (
    <div className="max-w-lg">
      <h2 className="text-2xl font-bold text-body mb-6">Profile</h2>

      <div className="bg-card rounded-2xl border border-border shadow-card p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-card-violet flex items-center justify-center font-display font-bold text-white text-xl shadow-glow-violet">
            {user.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-body">{user.name}</h3>
            <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${ROLE_COLOR[user.role]}`}>
              {ROLE_LABEL[user.role]}
            </span>
          </div>
        </div>
        <div className="bg-surface rounded-xl p-4">
          <p className="text-xs text-muted mb-1 font-medium uppercase tracking-wider">Email</p>
          <p className="text-sm text-body font-medium">{user.email}</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-card p-6">
        <h3 className="font-display text-base font-bold mb-5">Change Password</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input required type="password" placeholder="Current password"
            value={current} onChange={e => setCurrent(e.target.value)} className="input" />
          <input required type="password" minLength={6} placeholder="New password (min 6 chars)"
            value={newPw} onChange={e => setNewPw(e.target.value)} className="input" />
          {err && <p className="text-danger text-sm bg-danger/5 border border-danger/20 rounded-lg px-3 py-2">{err}</p>}
          {msg && <p className="text-success text-sm bg-success/5 border border-success/20 rounded-lg px-3 py-2">{msg}</p>}
          <button type="submit"
            className="bg-indigo hover:bg-violet text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-md mt-1">
            Update password
          </button>
        </form>
      </div>
    </div>
  );
}
