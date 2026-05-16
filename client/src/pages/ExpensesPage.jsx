// src/pages/ExpensesPage.jsx - Full Expense Management
import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Edit, Search, Filter, X, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Food & Dining', 'Travel & Transport', 'Shopping', 'Entertainment',
  'Health & Medical', 'Utilities & Bills', 'Education', 'Salary & Income',
  'Freelance Income', 'Groceries', 'Fuel', 'Subscriptions',
  'Personal Care', 'Gifts & Donations', 'Rent & Housing', 'Other',
];

const EMPTY_FORM = {
  title: '', amount: '', type: 'expense', category: 'Other',
  date: new Date().toISOString().split('T')[0], notes: '',
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export default function ExpensesPage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({ type: '', search: '' });

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.search) params.append('search', filters.search);
      params.append('limit', '50');

      const { data } = await api.get(`/expenses?${params}`);
      setExpenses(data.data || []);
    } catch {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const openAdd = () => {
    setEditingExpense(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (expense) => {
    setEditingExpense(expense);
    setForm({
      title: expense.title,
      amount: expense.amount,
      type: expense.type,
      category: expense.category,
      date: new Date(expense.date).toISOString().split('T')[0],
      notes: expense.notes || '',
    });
    setShowModal(true);
  };

  // AI Auto-categorize
  const handleAICategorize = async () => {
    if (!form.title) return toast.error('Enter a title first');
    setAiLoading(true);
    try {
      const { data } = await api.post('/ai/categorize', { title: form.title });
      setForm((f) => ({ ...f, category: data.category }));
      toast.success(`AI suggested: ${data.category} ✨`);
    } catch {
      toast.error('AI categorization failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingExpense) {
        await api.put(`/expenses/${editingExpense._id}`, form);
        toast.success('Expense updated!');
      } else {
        await api.post('/expenses', form);
        toast.success('Expense added!');
      }
      setShowModal(false);
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      toast.success('Deleted!');
      fetchExpenses();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{expenses.length} transactions found</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Expense
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="input pl-9 py-2.5"
          />
        </div>
        <select
          value={filters.type}
          onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
          className="input w-auto py-2.5"
        >
          <option value="">All types</option>
          <option value="expense">Expenses</option>
          <option value="income">Income</option>
        </select>
      </div>

      {/* Expenses List */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading...
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-12 text-center">
            <TrendingDown size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No expenses found</p>
            <button onClick={openAdd} className="btn-primary">Add your first expense</button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {expenses.map((expense) => (
              <div key={expense._id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                {/* Type indicator */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  expense.type === 'income'
                    ? 'bg-green-100 dark:bg-green-900/20'
                    : 'bg-red-100 dark:bg-red-900/20'
                }`}>
                  {expense.type === 'income'
                    ? <TrendingUp size={18} className="text-green-600" />
                    : <TrendingDown size={18} className="text-red-500" />
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{expense.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                      {expense.category}
                    </span>
                    {expense.aiCategorized && (
                      <span className="text-xs text-purple-500 flex items-center gap-1">
                        <Sparkles size={10} /> AI
                      </span>
                    )}
                  </div>
                </div>

                {/* Amount */}
                <p className={`font-bold text-base flex-shrink-0 ${
                  expense.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
                }`}>
                  {expense.type === 'income' ? '+' : '-'}{formatCurrency(expense.amount)}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(expense)} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                    <Edit size={15} />
                  </button>
                  <button onClick={() => handleDelete(expense._id)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {editingExpense ? 'Edit Expense' : 'Add Expense'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Type toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                {['expense', 'income'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: t }))}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${
                      form.type === t
                        ? t === 'expense'
                          ? 'bg-white dark:bg-gray-900 text-red-500 shadow-sm'
                          : 'bg-white dark:bg-gray-900 text-green-600 shadow-sm'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {t === 'expense' ? '↓ Expense' : '↑ Income'}
                  </button>
                ))}
              </div>

              {/* Title + AI */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g., Swiggy lunch order"
                    required
                    className="input flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleAICategorize}
                    disabled={aiLoading}
                    title="AI Auto-Categorize"
                    className="px-3 py-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors flex-shrink-0"
                  >
                    {aiLoading ? <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /> : <Sparkles size={16} />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">💡 Click ✨ to auto-categorize with AI</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Amount (₹)</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  placeholder="0.00"
                  required
                  min="0"
                  step="0.01"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="input"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Any additional notes..."
                  rows={2}
                  className="input resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                  {editingExpense ? 'Update' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
