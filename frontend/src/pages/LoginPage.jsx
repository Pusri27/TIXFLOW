import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Sparkles, ShieldCheck, Ticket, Eye, EyeOff, Zap, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('john@example.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Hero Feature Panel */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>TIXFLOW Enterprise Portal</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Next-Gen Ticket Reservation &amp; Gate Control
          </h1>

          <p className="text-zinc-400 text-sm leading-relaxed">
            Sign in to access your reserved stadium passes, real-time Redis seat holds, dynamic anti-fraud TOTP QR codes, and P2P ticket transfers.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-[#0d0e15] border border-white/[0.08] p-3.5 rounded-2xl flex items-center space-x-3">
              <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Redis Locks</p>
                <p className="text-zinc-500 text-[11px]">Atomic 10-min seat holds</p>
              </div>
            </div>

            <div className="bg-[#0d0e15] border border-white/[0.08] p-3.5 rounded-2xl flex items-center space-x-3">
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Anti-Fraud TOTP</p>
                <p className="text-zinc-500 text-[11px]">Dynamic 30s QR payload</p>
              </div>
            </div>
          </div>

          {/* Quick Demo Login Triggers */}
          <div className="bg-[#0d0e15] border border-white/10 rounded-2xl p-4 text-xs space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">
              One-Click Demo Account Quick Fill:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('john@example.com', 'admin123')}
                className="bg-[#181a28] hover:bg-[#202336] border border-white/10 text-zinc-200 px-3 py-1.5 rounded-xl font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Fill Customer (John Doe)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin@ticketapp.com', 'admin123')}
                className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Fill Admin (Promoter)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Authentication Form Panel */}
        <div className="lg:col-span-6">
          <div className="bg-[#0d0e15] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <LogIn className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Account Sign In</h2>
                <p className="text-xs text-zinc-400">Enter credentials to authenticate</p>
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-4 rounded-2xl mb-6 flex items-center space-x-3 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-4 top-4" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full bg-[#131522] border border-white/10 focus:border-indigo-500 text-white pl-11 pr-4 py-3.5 rounded-2xl text-sm outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-4 top-4" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#131522] border border-white/10 focus:border-indigo-500 text-white pl-11 pr-11 py-3.5 rounded-2xl text-sm outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-white hover:bg-zinc-200 text-black font-black rounded-2xl shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] mt-2 text-sm cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Authenticating Credentials...' : 'Sign In to Portal'}
              </button>
            </form>

            <div className="border-t border-white/[0.08] pt-6 mt-6 text-center">
              <p className="text-xs text-zinc-400">
                Don't have an account yet?{' '}
                <Link to="/register" className="text-indigo-400 hover:underline font-bold">
                  Create New Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
