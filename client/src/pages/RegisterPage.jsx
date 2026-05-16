// src/pages/RegisterPage.jsx — Modern redesign with error handling
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const result = await register(form.name, form.email, form.password);

    if (result?.success) {
      navigate('/dashboard');
    } else {
      setError(result?.message || 'Registration failed. Please try again.');
    }
    setLoading(false);
  };

  // Password strength indicator
  const pwStrength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2 : 3;

  const strengthLabel = ['', 'Too short', 'Good', 'Strong'];
  const strengthColor = ['', 'bg-red-400', 'bg-yellow-400', 'bg-green-500'];
  const strengthTextColor = ['', 'text-red-500', 'text-yellow-500', 'text-green-500'];

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="text-white font-semibold text-lg">Smart Expense Tracker</span>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Your AI-powered finance companion
          </h1>
          <p className="text-indigo-200 text-lg leading-relaxed">
            Join thousands of users who track smarter, save more, and stress less about money.
          </p>
        </div>

        <div className="relative grid grid-cols-2 gap-4">
          {[
            { value: '100%', label: 'Free to use' },
            { value: 'AI', label: 'Powered insights' },
            { value: 'OCR', label: 'Bill scanning' },
            { value: '∞', label: 'Expenses tracked' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white/10 backdrop-blur rounded-xl p-4">
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-indigo-200 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md">

          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">Smart Expense Tracker</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Get started for free — no credit card needed</p>
          </div>

          {/* ─── ERROR BANNER ─── */}
          {error && (
            <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-slide-up">
              <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-400">Registration failed</p>
                <p className="text-sm text-red-600 dark:text-red-300 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Full name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ravi Kumar"
                required
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="ravi@example.com"
                required
                className={`input ${error && error.includes('email') ? 'border-red-300 dark:border-red-700' : ''}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  required
                  className="input pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password strength bar */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          i <= pwStrength ? strengthColor[pwStrength] : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${strengthTextColor[pwStrength]}`}>
                    {strengthLabel[pwStrength]}
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>Create Account <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-xl flex items-center gap-2">
            <CheckCircle2 size={15} className="text-blue-500 flex-shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Your data is private and secure. We never sell your information.
            </p>
          </div>

          <p className="text-center mt-5 text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
