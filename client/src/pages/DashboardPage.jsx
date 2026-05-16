// src/pages/DashboardPage.jsx - Main Dashboard
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  TrendingUp, TrendingDown, Wallet, ArrowRight, Plus,
  Brain, ScanLine, BarChart3, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

// Format currency
const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Stat Card component
const StatCard = ({ label, value, icon: Icon, color, trend }) => (
  <div className="card hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      </div>
      <div className={`p-2.5 rounded-xl ${
        color.includes('green') ? 'bg-green-100 dark:bg-green-900/20' :
        color.includes('red') ? 'bg-red-100 dark:bg-red-900/20' :
        'bg-blue-100 dark:bg-blue-900/20'
      }`}>
        <Icon size={20} className={color} />
      </div>
    </div>
    {trend && (
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">{trend}</p>
    )}
  </div>
);

// Quick Action Card
const QuickAction = ({ to, icon: Icon, label, color }) => (
  <Link
    to={to}
    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-sm transition-all"
  >
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center">{label}</span>
  </Link>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, expensesRes] = await Promise.all([
        api.get('/expenses/summary'),
        api.get('/expenses?limit=5'),
      ]);

      setSummary(summaryRes.data.data);
      setRecentExpenses(expensesRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-xl w-64"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const currency = user?.currency || 'INR';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {summary?.month || 'This month'} overview
          </p>
        </div>
        <button
          onClick={fetchData}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Income"
          value={formatCurrency(summary?.totalIncome || 0, currency)}
          icon={TrendingUp}
          color="text-green-600 dark:text-green-400"
          trend="Money received this month"
        />
        <StatCard
          label="Total Expenses"
          value={formatCurrency(summary?.totalExpense || 0, currency)}
          icon={TrendingDown}
          color="text-red-500 dark:text-red-400"
          trend="Money spent this month"
        />
        <StatCard
          label="Balance"
          value={formatCurrency(summary?.balance || 0, currency)}
          icon={Wallet}
          color={summary?.balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-500'}
          trend={summary?.balance >= 0 ? '✅ You\'re in the green!' : '⚠️ Spending more than income'}
        />
      </div>

      {/* Budget Progress (if set) */}
      {user?.monthlyBudget > 0 && (
        <div className="card">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Budget</p>
            <p className="text-sm text-gray-500">
              {formatCurrency(summary?.totalExpense || 0)} of {formatCurrency(user.monthlyBudget)}
            </p>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all ${
                (summary?.totalExpense / user.monthlyBudget) > 0.9
                  ? 'bg-red-500'
                  : (summary?.totalExpense / user.monthlyBudget) > 0.7
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{
                width: `${Math.min(100, ((summary?.totalExpense || 0) / user.monthlyBudget) * 100)}%`
              }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {Math.round(((summary?.totalExpense || 0) / user.monthlyBudget) * 100)}% of budget used
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction to="/expenses" icon={Plus} label="Add Expense" color="bg-blue-600" />
          <QuickAction to="/ocr-scanner" icon={ScanLine} label="Scan Bill" color="bg-purple-600" />
          <QuickAction to="/ai-insights" icon={Brain} label="AI Insights" color="bg-emerald-600" />
          <QuickAction to="/analytics" icon={BarChart3} label="Analytics" color="bg-orange-500" />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
          <Link
            to="/expenses"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {recentExpenses.length === 0 ? (
          <div className="text-center py-12">
            <Wallet size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
            <Link to="/expenses" className="btn-primary inline-flex items-center gap-2 mt-4 text-sm">
              <Plus size={16} /> Add your first expense
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentExpenses.map((expense) => (
              <div
                key={expense._id}
                className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium ${
                    expense.type === 'income'
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-600'
                      : 'bg-red-100 dark:bg-red-900/20 text-red-500'
                  }`}>
                    {expense.type === 'income' ? '↑' : '↓'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{expense.title}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {expense.category} • {new Date(expense.date).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${
                  expense.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
                }`}>
                  {expense.type === 'income' ? '+' : '-'}{formatCurrency(expense.amount, currency)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
