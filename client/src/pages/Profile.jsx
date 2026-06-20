import { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ROLE_LABEL = { admin: 'Admin', inventory_manager: 'Inventory Manager', sales_executive: 'Sales Executive' };

export default function Profile() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      setMessage('Password updated successfully.');
      setCurrentPassword(''); setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update password');
    }
  }

  return (
    <div className="max-w-md">
      <h2 className="text-2xl font-semibold mb-6">Profile</h2>

      <div className="bg-white border border-sand rounded-lg p-5 mb-6">
        <p className="text-sm"><span className="text-slate">Name: </span>{user.name}</p>
        <p className="text-sm mt-1"><span className="text-slate">Email: </span>{user.email}</p>
        <p className="text-sm mt-1"><span className="text-slate">Role: </span>{ROLE_LABEL[user.role]}</p>
      </div>

      <div className="bg-white border border-sand rounded-lg p-5">
        <h3 className="text-sm font-semibold mb-4">Change password</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input required type="password" placeholder="Current password" value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-3 py-2 rounded-md border border-sand text-sm" />
          <input required type="password" minLength={6} placeholder="New password" value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 rounded-md border border-sand text-sm" />
          {error && <p className="text-rose text-sm">{error}</p>}
          {message && <p className="text-moss text-sm">{message}</p>}
          <button type="submit" className="bg-moss hover:bg-mossDark text-white text-sm font-medium px-4 py-2 rounded-md">Update password</button>
        </form>
      </div>
    </div>
  );
}
