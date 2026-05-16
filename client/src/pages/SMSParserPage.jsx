// src/pages/SMSParserPage.jsx - Bank SMS Parser Demo
import { useState } from 'react';
import api from '../utils/api';
import { MessageSquare, Zap, Plus, RefreshCw, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Food & Dining', 'Travel & Transport', 'Shopping', 'Entertainment',
  'Health & Medical', 'Utilities & Bills', 'Education', 'Groceries',
  'Fuel', 'Subscriptions', 'Personal Care', 'Other',
];

export default function SMSParserPage() {
  const [smsText, setSmsText] = useState('');
  const [parsed, setParsed] = useState(null);
  const [form, setForm] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [samples, setSamples] = useState([]);
  const [loadingSamples, setLoadingSamples] = useState(false);

  const loadSamples = async () => {
    setLoadingSamples(true);
    try {
      const { data } = await api.get('/sms/samples');
      setSamples(data.samples || []);
    } catch {
      toast.error('Failed to load samples');
    } finally {
      setLoadingSamples(false);
    }
  };

  const handleParse = async () => {
    if (!smsText.trim()) return toast.error('Please enter an SMS message');
    setParsing(true);
    setParsed(null);
    setForm(null);
    try {
      const { data } = await api.post('/sms/parse', { smsText });
      setParsed(data.data);
      setForm({
        title: data.data.title || 'Bank Transaction',
        amount: data.data.amount || '',
        type: data.data.type || 'expense',
        category: data.data.category || 'Other',
        date: data.data.date
          ? new Date(data.data.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        notes: `Imported from SMS: ${smsText.substring(0, 100)}`,
        merchant: data.data.merchant || '',
        fromSMS: true,
      });
      toast.success(data.message);
    } catch {
      toast.error('Failed to parse SMS');
    } finally {
      setParsing(false);
    }
  };

  const handleSave = async () => {
    if (!form?.title || !form?.amount) return toast.error('Title and amount required');
    setSaving(true);
    try {
      await api.post('/expenses', form);
      toast.success('Transaction saved! 🎉');
      setSmsText('');
      setParsed(null);
      setForm(null);
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageSquare size={24} className="text-green-500" />
          Bank SMS Parser
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Paste a bank SMS — we'll extract the transaction details automatically
        </p>
      </div>

      {/* SMS Input */}
      <div className="card">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Paste Bank SMS
        </label>
        <textarea
          value={smsText}
          onChange={(e) => setSmsText(e.target.value)}
          rows={4}
          placeholder="e.g. Your SBI account XX4521 has been debited Rs.450.00 for SWIGGY on 14-01-2024..."
          className="input resize-none mb-3"
        />

        <div className="flex gap-3">
          <button
            onClick={loadSamples}
            disabled={loadingSamples}
            className="btn-secondary text-sm flex items-center gap-1.5"
          >
            <RefreshCw size={14} className={loadingSamples ? 'animate-spin' : ''} />
            Load Samples
          </button>
          <button
            onClick={handleParse}
            disabled={parsing || !smsText.trim()}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {parsing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Zap size={16} />}
            Parse SMS
          </button>
        </div>
      </div>

      {/* Sample Messages */}
      {samples.length > 0 && (
        <div className="card">
          <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-3">
            Sample Bank SMS Messages — Click to use
          </h3>
          <div className="space-y-2">
            {samples.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => { setSmsText(sample); setSamples([]); }}
                className="w-full text-left p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 border border-gray-100 dark:border-gray-800 hover:border-blue-200 transition-all text-xs text-gray-600 dark:text-gray-400"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Parsed Result + Form */}
      {form && (
        <div className="card animate-slide-up">
          <div className="flex items-center gap-2 mb-5">
            <CheckCircle size={18} className="text-green-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Extracted Transaction — Review & Save</h2>
          </div>

          <div className="space-y-4">
            {/* Type Toggle */}
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
                  {t === 'expense' ? '↓ Debit (Expense)' : '↑ Credit (Income)'}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
              <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="input" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Amount (₹)</label>
                <input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="input" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="input">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <button onClick={handleSave} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={16} />}
              Save Transaction
            </button>
          </div>
        </div>
      )}

      {/* Info box */}
      <div className="card border-green-100 dark:border-green-900/20 bg-green-50 dark:bg-green-900/10">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Supported SMS formats</h3>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <li>✅ SBI, HDFC, ICICI, Axis, Kotak, Yes Bank</li>
          <li>✅ UPI debit/credit notifications</li>
          <li>✅ Net banking transaction alerts</li>
          <li>✅ Credit card spend alerts</li>
        </ul>
      </div>
    </div>
  );
}
