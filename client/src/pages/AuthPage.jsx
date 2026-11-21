import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bot, Sparkles, Lock, Mail, User, Shield } from 'lucide-react';

const AuthPage = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (isRegister) {
      await register(name, email, password, role);
    } else {
      await login(email, password);
    }
    setLoading(false);
  };

  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setIsRegister(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 items-center justify-center shadow-lg shadow-indigo-500/25 mb-3">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">NovaAI Assistant</h1>
          <p className="text-xs text-slate-400 mt-1">Real-Time AI Conversational Platform</p>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 p-1 bg-slate-800/80 rounded-xl mb-6 border border-slate-700/60">
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              !isRegister
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              isRegister
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Asif Ali"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
              <div className="relative">
                <Shield className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="user">Standard User</option>
                  <option value="admin">Administrator (Analytics Access)</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01]"
          >
            {loading ? 'Authenticating...' : isRegister ? 'Create NovaAI Account' : 'Sign In to Chat'}
          </button>
        </form>

        {/* Demo Accounts Box */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 text-center uppercase tracking-wider mb-2.5">
            Quick Demo Login
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('admin@chatbot.com', 'password123')}
              className="py-1.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[11px] font-medium transition-colors text-center"
            >
              Sign in as Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemo('user@chatbot.com', 'password123')}
              className="py-1.5 px-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-[11px] font-medium transition-colors text-center"
            >
              Sign in as User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
