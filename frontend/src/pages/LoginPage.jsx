import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, Eye, EyeOff, ArrowRight, Ticket, UserCheck, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('john@example.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Consumer Intro + Quick Demo Switcher */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E11D48] bg-[#FFF1F2] px-3.5 py-1.5 rounded-full">
              <Ticket className="w-3.5 h-3.5" />
              <span>Welcome Back</span>
            </span>
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-[#111827] leading-[1.08]">
              Every live show, right in your pocket.
            </h1>
            <p className="text-[#4B5563] text-sm sm:text-base leading-relaxed">
              Sign in to pick stadium seats, open your live gate QR passes, transfer tickets to friends, or manage event sales.
            </p>
          </div>

          {/* 1-Click Demo Account Cards */}
          <div className="market-card rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#111827]">Try a Demo Account</span>
              <span className="text-xs text-[#6B7280]">1-click autofill</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickFill('john@example.com', 'admin123')}
                className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  email === 'john@example.com'
                    ? 'bg-[#FFF1F2] border-rose-300 shadow-2xs'
                    : 'bg-[#F7F8FA] border-[#E6E8EC] hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#E11D48]">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Fan / Attendee</span>
                </div>
                <span className="text-sm font-bold text-[#111827] block mt-1">John Doe</span>
                <span className="text-xs text-[#6B7280] block truncate">john@example.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin@ticketapp.com', 'admin123')}
                className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  email === 'admin@ticketapp.com'
                    ? 'bg-[#FFF1F2] border-rose-300 shadow-2xs'
                    : 'bg-[#F7F8FA] border-[#E6E8EC] hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#E11D48]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Organizer / Host</span>
                </div>
                <span className="text-sm font-bold text-[#111827] block mt-1">Organizer Hub</span>
                <span className="text-xs text-[#6B7280] block truncate">admin@ticketapp.com</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Sign-In Card */}
        <div className="lg:col-span-6">
          <div className="market-card rounded-3xl p-6 sm:p-9 space-y-6">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-[#111827]">Sign In</h2>
              <p className="text-sm text-[#6B7280] mt-1">Enter your email and password to continue.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium p-3.5 rounded-2xl flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#F7F8FA] border border-[#E6E8EC] focus:border-[#E11D48] focus:bg-white text-[#111827] pl-11 pr-4 py-3.5 rounded-2xl text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#374151] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#F7F8FA] border border-[#E6E8EC] focus:border-[#E11D48] focus:bg-white text-[#111827] pl-11 pr-11 py-3.5 rounded-2xl text-sm outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold rounded-full shadow-md shadow-rose-500/25 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50 mt-2"
              >
                <span>{loading ? 'Signing In...' : 'Sign In'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="border-t border-[#F1F3F7] pt-5 text-center">
              <p className="text-xs sm:text-sm text-[#6B7280]">
                Don&apos;t have an account?{' '}
                <Link to="/register" state={location.state} className="text-[#E11D48] hover:underline font-bold">
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
