import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { Lock, ArrowRight, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.post('/auth/reset-password', { token, password });
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setMessage('Password reset successful! Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
        return;
      }
      setError(data.message || 'Reset failed');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `input transition-all ${
    error ? 'border-red-500/50 focus:ring-red-500/30' : ''
  }`;

  return (
    <AuthLayout title="Set new password" subtitle="Enter a strong new password for your account">
      
      {message && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 animate-slide-up">
          <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-300">Success</p>
            <p className="text-sm text-emerald-400 mt-0.5">{message}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 animate-slide-up">
          <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-300">Reset failed</p>
            <p className="text-sm text-red-400 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            New password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              required
              className={`${inputCls} pl-11 pr-12`}
              placeholder="At least 6 characters"
            />
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 p-1"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !!message}
          className="w-full mt-4 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]"
        >
          {loading ? (
            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
          ) : (
            <>Save New Password <ArrowRight size={18} /></>
          )}
        </button>
      </form>

      <p className="text-center mt-8 text-sm text-gray-400">
        Back to{' '}
        <Link to="/login" className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-bold hover:opacity-80 transition-opacity">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
