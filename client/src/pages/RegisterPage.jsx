import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';

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
    try {
      const result = await register(form.name, form.email, form.password);

      if (result.success) {
        navigate('/dashboard');
        return;
      }

      setError(result.message || 'Registration failed. Please try again.');
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      const status = err.response?.status;
      
      let message;
      if (serverMsg) {
        message = serverMsg;
      } else if (status === 400) {
        message = 'Invalid details. Please check all fields.';
      } else if (status === 409) {
        message = 'This email is already registered. Try logging in instead.';
      } else if (!err.response) {
        message = 'Cannot reach server. Is the backend running?';
      } else {
        message = 'Registration failed. Please try again.';
      }
      setError(message);
    }
    setLoading(false);
  };

  const pwStrength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2 : 3;

  const strengthLabel = ['', 'Too short', 'Good', 'Strong'];
  const strengthColor = ['', 'bg-red-500', 'bg-yellow-500', 'bg-emerald-500'];
  const strengthTextColor = ['', 'text-red-400', 'text-yellow-400', 'text-emerald-400'];

  const inputCls = `input transition-all ${
    error ? 'border-red-500/50 focus:ring-red-500/30' : ''
  }`;

  return (
    <AuthLayout title="Create your account" subtitle="Get started for free — no credit card needed">
      
      {error && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 animate-slide-up">
          <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-300">Registration failed</p>
            <p className="text-sm text-red-400 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Full name
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Ravi Kumar"
            required
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email address
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
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
              className={`${inputCls} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 p-1"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {form.password && (
            <div className="mt-3">
              <div className="flex gap-1.5 mb-1.5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      i <= pwStrength ? strengthColor[pwStrength] : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
              <p className={`text-xs font-semibold ${strengthTextColor[pwStrength]}`}>
                {strengthLabel[pwStrength]}
              </p>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]"
        >
          {loading ? (
            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
          ) : (
            <>Create Account <ArrowRight size={18} /></>
          )}
        </button>
      </form>

      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center gap-3">
        <CheckCircle2 size={18} className="text-blue-400 flex-shrink-0" />
        <p className="text-sm text-blue-200">
          Your data is private and secure. We never sell your information.
        </p>
      </div>

      <p className="text-center mt-8 text-sm text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-bold hover:opacity-80 transition-opacity">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
