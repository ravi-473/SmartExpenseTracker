// src/pages/AIInsightsPage.jsx - AI Savings Suggestions & Predictions
import { useState, useEffect } from 'react';
import api from '../utils/api';
import {
  Brain, TrendingUp, AlertTriangle, Lightbulb,
  RefreshCw, ChevronRight, Sparkles, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export default function AIInsightsPage() {
  const [insights, setInsights] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loadingPredictions, setLoadingPredictions] = useState(false);

  const fetchInsights = async () => {
    setLoadingInsights(true);
    try {
      const { data } = await api.get('/ai/insights');
      setInsights(data);
    } catch {
      toast.error('Failed to fetch AI insights');
    } finally {
      setLoadingInsights(false);
    }
  };

  const fetchPredictions = async () => {
    setLoadingPredictions(true);
    try {
      const { data } = await api.get('/ai/predict');
      setPredictions(data);
    } catch {
      toast.error('Failed to fetch predictions');
    } finally {
      setLoadingPredictions(false);
    }
  };

  useEffect(() => {
    fetchInsights();
    fetchPredictions();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Brain size={24} className="text-purple-500" />
          AI Insights
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Powered by OpenAI — personalized savings tips and spending predictions
        </p>
      </div>

      {/* Savings Tips */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl">
              <Lightbulb size={18} className="text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">AI Savings Suggestions</h2>
              <p className="text-xs text-gray-400">Based on your last 30 days</p>
            </div>
          </div>
          <button
            onClick={fetchInsights}
            disabled={loadingInsights}
            className="btn-secondary text-sm flex items-center gap-1.5"
          >
            <RefreshCw size={14} className={loadingInsights ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {loadingInsights ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : insights ? (
          <>
            {/* Summary strip */}
            {insights.summary && (
              <div className="grid grid-cols-3 gap-3 mb-5 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(insights.summary.totalSpent)}
                  </p>
                  <p className="text-xs text-gray-500">Spent (30 days)</p>
                </div>
                <div className="text-center border-x border-gray-200 dark:border-gray-700">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {insights.summary.totalExpenses}
                  </p>
                  <p className="text-xs text-gray-500">Transactions</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {insights.summary.topCategory}
                  </p>
                  <p className="text-xs text-gray-500">Top Category</p>
                </div>
              </div>
            )}

            {/* AI Tips */}
            <div className="space-y-3">
              {(insights.insights || []).map((tip, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20"
                >
                  <div className="w-7 h-7 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-xs font-bold text-blue-600">{idx + 1}</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>

            {/* Unusual Spending */}
            {insights.unusualSpending && insights.unusualSpending.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={16} className="text-orange-500" />
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">Unusual Spending Detected</h3>
                </div>
                <div className="space-y-2">
                  {insights.unusualSpending.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 rounded-xl"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.category} • {new Date(item.date).toLocaleDateString('en-IN')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-orange-600">{formatCurrency(item.amount)}</p>
                        <p className="text-xs text-orange-400">Unusual</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Sparkles size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Add expenses to get AI insights</p>
          </div>
        )}
      </div>

      {/* Next Month Predictions */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
              <Calendar size={18} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Expense Prediction — {predictions?.month || 'Next Month'}
              </h2>
              <p className="text-xs text-gray-400">Based on your spending history</p>
            </div>
          </div>
          <button
            onClick={fetchPredictions}
            disabled={loadingPredictions}
            className="btn-secondary text-sm flex items-center gap-1.5"
          >
            <RefreshCw size={14} className={loadingPredictions ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {loadingPredictions ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : predictions && predictions.predictions?.length > 0 ? (
          <>
            {/* Total prediction */}
            <div className="mb-5 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Predicted Total for {predictions.month}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(predictions.totalPredicted)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Based on your last 3 months of data</p>
            </div>

            {/* Per-category predictions */}
            <div className="space-y-3">
              {predictions.predictions.map((pred) => (
                <div key={pred.category} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <ChevronRight size={14} className="text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{pred.category}</p>
                      <p className="text-xs text-gray-400">
                        Confidence: <span className={`font-medium ${
                          pred.confidence === 'High' ? 'text-green-500' :
                          pred.confidence === 'Medium' ? 'text-yellow-500' : 'text-red-400'
                        }`}>{pred.confidence}</span>
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatCurrency(pred.predictedAmount)}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 mt-4 text-center">
              Predictions improve as you add more historical data
            </p>
          </>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <TrendingUp size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Add expenses for at least 1 month to see predictions</p>
          </div>
        )}
      </div>
    </div>
  );
}
