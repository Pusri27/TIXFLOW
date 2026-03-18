import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, Phone, AlertCircle, Sparkles, ShieldCheck, Ticket, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(name, email, password, phone);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Email address may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Hero Feature Panel */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Join TIXFLOW Enterprise</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Create Your Digital Pass Account
          </h1>

          <p className="text-zinc-400 text-sm leading-relaxed">
            Register to instantly unlock live seat reservations, dynamic TOTP QR code passes, Stripe checkout integration, and P2P ticket transfers.
          </p>

          <div className="space-y-3 pt-2 text-xs text-zinc-300 font-medium">
            <div className="flex items-center space-x-3 bg-[#0d0e15] border border-white/[0.08] p-3.5 rounded-2xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Instant E-Ticket PDF downloads powered by Cloudinary</span>
            </div>
            <div className="flex items-center space-x-3 bg-[#0d0e15] border border-white/[0.08] p-3.5 rounded-2xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Anti-fraud dynamic 30-second TOTP QR token protection</span>
            </div>
            <div className="flex items-center space-x-3 bg-[#0d0e15] border border-white/[0.08] p-3.5 rounded-2xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>P2P Ticket Pass transfers directly to any email address</span>
            </div>
          </div>
        </div>

        {/* Right Authentication Form Panel */}
        <div className="lg:col-span-6">
          <div className="bg-[#0d0e15] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Create Account</h2>
                <p className="text-xs text-zinc-400">Fill in details to register</p>
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-4 rounded-2xl mb-6 flex items-center space-x-3 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-[#131522] border border-white/10 focus:border-indigo-500 text-white pl-11 pr-4 py-3 rounded-2xl text-sm outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-4 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full bg-[#131522] border border-white/10 focus:border-indigo-500 text-white pl-11 pr-4 py-3 rounded-2xl text-sm outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Phone / Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-4 top-3.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="w-full bg-[#131522] border border-white/10 focus:border-indigo-500 text-white pl-11 pr-4 py-3 rounded-2xl text-sm outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-4 top-3.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-[#131522] border border-white/10 focus:border-indigo-500 text-white pl-11 pr-4 py-3 rounded-2xl text-sm outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-white hover:bg-zinc-200 text-black font-black rounded-2xl shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] mt-2 text-sm cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Creating Your Account...' : 'Register Account'}
              </button>
            </form>

            <div className="border-t border-white/[0.08] pt-5 mt-5 text-center">
              <p className="text-xs text-zinc-400">
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-400 hover:underline font-bold">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
