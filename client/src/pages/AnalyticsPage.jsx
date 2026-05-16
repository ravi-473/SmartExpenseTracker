// src/pages/AnalyticsPage.jsx - Charts & Analytics
import { useState, useEffect } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import api from '../utils/api';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

const CATEGORY_COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1',
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export default function AnalyticsPage() {
  const [monthly, setMonthly] = useState(null);
  const [categories, setCategories] = useState([]);
  const [topSpending, setTopSpending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [monthlyRes, catRes, topRes] = await Promise.all([
          api.get('/analytics/monthly'),
          api.get('/analytics/categories'),
          api.get('/analytics/top-spending'),
        ]);
        setMonthly(monthlyRes.data.data);
        setCategories(catRes.data.data || []);
        setTopSpending(topRes.data.data || []);
      } catch {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-xl w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          <div className="h-80 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Bar chart data
  const barData = monthly ? {
    labels: monthly.months,
    datasets: [
      {
        label: 'Income',
        data: monthly.income,
        backgroundColor: '#10b98133',
        borderColor: '#10b981',
        borderWidth: 2,
        borderRadius: 6,
      },
      {
        label: 'Expenses',
        data: monthly.expenses,
        backgroundColor: '#ef444433',
        borderColor: '#ef4444',
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  } : null;

  // Doughnut chart data
  const doughnutData = categories.length > 0 ? {
    labels: categories.map((c) => c.category),
    datasets: [{
      data: categories.map((c) => c.total),
      backgroundColor: CATEGORY_COLORS.slice(0, categories.length),
      borderWidth: 0,
      spacing: 4,
    }],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { padding: 16, font: { size: 12 } } },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${formatCurrency(ctx.parsed.y || ctx.parsed)}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: { callback: (v) => '₹' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v) },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { position: 'right', labels: { padding: 12, font: { size: 11 }, boxWidth: 12 } },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${formatCurrency(ctx.parsed)}`,
        },
      },
    },
  };

  const totalExpenses = categories.reduce((s, c) => s + c.total, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Your spending patterns and trends</p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Monthly Income vs Expense */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={18} className="text-blue-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Income vs Expenses (6 months)</h2>
          </div>
          <div className="h-64">
            {barData ? (
              <Bar data={barData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No data yet</div>
            )}
          </div>
        </div>

        {/* Doughnut Chart - Category Breakdown */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <PieChart size={18} className="text-purple-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Spending by Category</h2>
          </div>
          <div className="h-64">
            {doughnutData ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No expense data yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      {categories.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Category Breakdown (This Month)</h2>
          <div className="space-y-3">
            {categories.map((cat, idx) => {
              const pct = totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0;
              return (
                <div key={cat.category}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{cat.category}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(cat.total)}</span>
                      <span className="text-xs text-gray-400 ml-2">({pct.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Spending */}
      {topSpending.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-orange-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Top Expenses This Month</h2>
          </div>
          <div className="space-y-3">
            {topSpending.map((expense, idx) => (
              <div key={expense._id} className="flex items-center gap-3">
                <span className="w-6 h-6 bg-orange-100 dark:bg-orange-900/20 text-orange-600 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{expense.title}</p>
                  <p className="text-xs text-gray-400">{expense.category}</p>
                </div>
                <span className="text-sm font-bold text-red-500">{formatCurrency(expense.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
