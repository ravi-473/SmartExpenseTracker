import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';

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
    }
    setLoading(false);
  };

  const inputCls = `input transition-all ${
    error ? 'border-red-500/50 focus:ring-red-500/30' : ''
  }`;

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your account">
      
      {error && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 animate-slide-up">
          <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-300">Login failed</p>
            <p className="text-sm text-red-400 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
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
          <label className="block text-sm font-medium text-gray-300 mb-2">
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="mt-3 text-sm text-right">
            <Link to="/forgot-password" className="text-blue-400 hover:text-blue-300 hover:underline transition-all">
              Forgot password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]"
        >
          {loading ? (
            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
          ) : (
            <>Sign in <ArrowRight size={18} /></>
          )}
        </button>
      </form>

      <p className="text-center mt-8 text-sm text-gray-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-bold hover:opacity-80 transition-opacity">
          Create one free
        </Link>
      </p>
    </AuthLayout>
  );
}
