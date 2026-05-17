import { useState } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';

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
      // Attempt to call backend forgot-password endpoint. If not implemented, show friendly message.
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage(data.message || 'If this email is registered, a reset link has been sent.');
    } catch (err) {
      // If backend route doesn't exist or returns 404/400, still show non-revealing message
      const serverMsg = err.response?.data?.message;
      if (serverMsg) setError(serverMsg);
      else setMessage('If this email is registered, a reset link has been sent.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-[#0a0a0f]">
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Forgot your password?</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Enter your account email and we'll send instructions to reset your password.</p>

        {message && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">{message}</div>}
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input w-full"
              placeholder="you@example.com"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Sending...' : 'Send reset instructions'}
          </button>
        </form>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          Remembered your password? <Link to="/login" className="text-blue-600">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
