import { useState } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage(data.message || 'If this email is registered, a reset link has been sent.');
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      if (serverMsg) setError(serverMsg);
      else setMessage('If this email is registered, a reset link has been sent.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `input transition-all ${
    error ? 'border-red-500/50 focus:ring-red-500/30' : ''
  }`;

  return (
    <AuthLayout title="Forgot password?" subtitle="Enter your email to receive reset instructions">
      
      {message && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 animate-slide-up">
          <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-300">Email sent</p>
            <p className="text-sm text-emerald-400 mt-0.5">{message}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 animate-slide-up">
          <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-300">Error</p>
            <p className="text-sm text-red-400 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {!message ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`${inputCls} pl-11`}
                placeholder="you@example.com"
              />
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]"
          >
            {loading ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
            ) : (
              <>Send Reset Link <ArrowRight size={18} /></>
            )}
          </button>
        </form>
      ) : (
        <div className="mt-2 text-center">
          <p className="text-sm text-gray-400 mb-6">
            Please check your inbox (and spam folder) for the password reset link.
          </p>
        </div>
      )}

      <p className="text-center mt-8 text-sm text-gray-400">
        Remembered your password?{' '}
        <Link to="/login" className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-bold hover:opacity-80 transition-opacity">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
