// src/pages/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { User, Save, Wallet, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    currency: user?.currency || 'INR',
    monthlyBudget: user?.monthlyBudget || '',
  });
  const [saving, setSaving] = useState(false);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);

  useEffect(() => {
    const loadRecent = async () => {
      setLoadingExpenses(true);
      try {
        const { data } = await api.get('/expenses?limit=10');
        setRecentExpenses(data.data || []);
      } catch (err) {
        // silently ignore; profile should still work
        console.error('Failed to load recent expenses', err.response?.data || err.message);
      } finally {
        setLoadingExpenses(false);
      }
    };

    loadRecent();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', form);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your account preferences</p>
      </div>

      {/* Avatar */}
      <div className="card flex items-center gap-4">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <Calendar size={11} />
            Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Settings Form */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
          <User size={16} /> Account Settings
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
            <input type="email" value={user?.email || ''} disabled className="input opacity-60 cursor-not-allowed" />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Currency</label>
            <select value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} className="input">
              <option value="INR">₹ INR — Indian Rupee</option>
              <option value="USD">$ USD — US Dollar</option>
              <option value="EUR">€ EUR — Euro</option>
              <option value="GBP">£ GBP — British Pound</option>
              <option value="AED">AED — UAE Dirham</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Monthly Budget
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <div className="relative">
              <Wallet size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                value={form.monthlyBudget}
                onChange={(e) => setForm((f) => ({ ...f, monthlyBudget: e.target.value }))}
                placeholder="e.g. 30000"
                min="0"
                className="input pl-9"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Shows a budget progress bar on your dashboard</p>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
            {saving
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Save size={16} />
            }
            Save Changes
          </button>
        </form>
      </div>

      {/* Recent user transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Your Recent Transactions</h2>
        </div>

        {loadingExpenses ? (
          <div className="py-6 text-center text-sm text-gray-500">Loading recent transactions...</div>
        ) : recentExpenses.length === 0 ? (
          <div className="py-6 text-center text-sm text-gray-500">No recent transactions</div>
        ) : (
          <div className="space-y-3">
            {recentExpenses.map((expense) => (
              <div key={expense._id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium ${
                    expense.type === 'income' ? 'bg-green-100 dark:bg-green-900/20 text-green-600' : 'bg-red-100 dark:bg-red-900/20 text-red-500'
                  }`}>
                    {expense.type === 'income' ? '↑' : '↓'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{expense.title}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{expense.category} • {new Date(expense.date).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${expense.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                  {expense.type === 'income' ? '+' : '-'}{new Intl.NumberFormat('en-IN', { style: 'currency', currency: user?.currency || 'INR', maximumFractionDigits: 0 }).format(expense.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
