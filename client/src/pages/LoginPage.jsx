// src/pages/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        navigate('/dashboard');
        return;
      }

      setError(result.message || 'Login failed. Please check your credentials.');
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      const status = err.response?.status;

      let message;
      if (serverMsg) {
        message = serverMsg;
      } else if (status === 401) {
        message = 'Wrong email or password. Please try again.';
      } else if (status === 400) {
        message = 'Please fill in all fields correctly.';
      } else if (!err.response) {
        message = 'Cannot reach server. Is the backend running?';
      } else {
        message = 'Something went wrong. Please try again.';
      }

      setError(message);
      console.log(err);
    }
    setLoading(false);
  };

  // Shake input borders red when there's an error
  const inputCls = `input transition-all ${
    error
      ? 'border-red-400 dark:border-red-500 focus:ring-red-400/40'
      : ''
  }`;

  return (
    <div className="min-h-screen flex">

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <span className="text-white font-semibold text-lg">Smart Expense Tracker</span>
        </div>

        <div className="relative">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Take control of your finances with AI
          </h1>
          <p className="text-blue-200 text-lg leading-relaxed">
            Track expenses, scan bills, get AI-powered savings suggestions, and predict your future spending.
          </p>
        </div>

        <div className="relative space-y-4">
          {[
            { icon: '🤖', text: 'AI auto-categorizes every expense instantly' },
            { icon: '📸', text: 'Scan bills with your camera — no manual entry' },
            { icon: '📊', text: 'Beautiful charts show exactly where money goes' },
            { icon: '💡', text: 'Personalized tips to save more every month' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <span className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">{icon}</span>
              <p className="text-blue-100 text-sm">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-[#0a0a0f]">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">Smart Expense Tracker</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome back</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Sign in to your account</p>

          {/* ═══════════════════════════════════════════
              ERROR BANNER — shows on wrong password
          ═══════════════════════════════════════════ */}
          {error && (
            <div className="mb-5 flex items-start gap-3 p-4 rounded-xl border
              bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-800
              animate-slide-up">
              <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                  Login failed
                </p>
                <p className="text-sm text-red-600 dark:text-red-300 mt-0.5">
                  {error}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className={`${inputCls} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60
                text-white font-semibold rounded-xl transition-all duration-200 active:scale-[0.98]
                flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
            >
              {loading
                ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                : <>Sign in <ArrowRight size={16} /></>
              }
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-500 font-semibold hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
