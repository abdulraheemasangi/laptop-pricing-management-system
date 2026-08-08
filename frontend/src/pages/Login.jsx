import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Laptop, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('sales@electronics.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to authenticate. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="inline-flex p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 mb-4 shadow-xs">
            <Laptop className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sales Executive Login</h2>
          <p className="text-xs text-slate-500 mt-1">Laptop Configuration & Pricing Management System</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                placeholder="sales@electronics.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs cursor-pointer"
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In to Sales Portal'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200 text-center space-y-3">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Default Test Credentials Pre-loaded</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setEmail('sales@electronics.com');
              setPassword('admin123');
            }}
            className="text-xs text-blue-600 hover:text-blue-700 underline font-medium"
          >
            Auto-fill Rahul Sharma (Sales Lead) Credentials
          </button>
        </div>
      </div>
    </div>
  );
};

