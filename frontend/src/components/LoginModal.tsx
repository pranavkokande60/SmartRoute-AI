import React, { useState } from 'react';
import { X, Shield, Lock, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { api, setAuthToken, setCurrentUser } from '../api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      setAuthToken(res.access_token);
      setCurrentUser(res.user);
      onLoginSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    // Auto login
    setError(null);
    setLoading(true);
    api.login({ email: demoEmail, password: demoPass })
      .then((res) => {
        setAuthToken(res.access_token);
        setCurrentUser(res.user);
        onLoginSuccess(res.user);
        onClose();
      })
      .catch((err) => {
        setError(err.message || 'Demo login failed');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">SmartRoute AI Login</h2>
            <p className="text-xs text-slate-400">Authenticate with Role-Based Access Control</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3.5 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@smartroute.ai"
                className="w-full bg-slate-950 border border-slate-800 text-sm rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 text-sm rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs py-2.5 rounded-lg shadow-md transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* 1-Click Demo Accounts */}
        <div className="border-t border-slate-800 pt-4">
          <div className="text-[11px] font-semibold text-slate-400 mb-2.5 flex items-center justify-between">
            <span>Instant Demo Accounts</span>
            <span className="text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">1-Click Login</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleDemoClick('admin@smartroute.ai', 'Admin123!')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-sky-500/40 rounded-xl text-left transition-all group"
            >
              <div className="font-semibold text-slate-200 group-hover:text-sky-400 flex items-center justify-between">
                <span>Admin</span>
                <Shield className="w-3 h-3 text-sky-400" />
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Full governance</p>
            </button>

            <button
              onClick={() => handleDemoClick('analyst@smartroute.ai', 'Analyst123!')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-left transition-all group"
            >
              <div className="font-semibold text-slate-200 group-hover:text-emerald-400 flex items-center justify-between">
                <span>Analyst</span>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">ML & Models</p>
            </button>

            <button
              onClick={() => handleDemoClick('manager@smartroute.ai', 'Manager123!')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 rounded-xl text-left transition-all group"
            >
              <div className="font-semibold text-slate-200 group-hover:text-amber-400 flex items-center justify-between">
                <span>Manager</span>
                <Shield className="w-3 h-3 text-amber-400" />
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">SLA & Alerts</p>
            </button>

            <button
              onClick={() => handleDemoClick('viewer@smartroute.ai', 'Viewer123!')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/40 rounded-xl text-left transition-all group"
            >
              <div className="font-semibold text-slate-200 group-hover:text-purple-400 flex items-center justify-between">
                <span>Viewer</span>
                <Shield className="w-3 h-3 text-purple-400" />
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Read-only view</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
