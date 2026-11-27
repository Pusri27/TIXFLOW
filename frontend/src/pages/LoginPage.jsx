import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';

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
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Editorial Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#D4FF00] block">
              Member &amp; Promoter Access
            </span>
            <h1 className="font-display text-3xl sm:text-5xl font-bold text-[#F4F4F0] leading-[1.05] tracking-tight">
              Your passes, holds, and gate tools in one place.
            </h1>
            <p className="text-[#9E9EA8] text-sm leading-relaxed">
              Sign in to hold stadium seats, open rotating QR passes, transfer tickets to friends, or manage live venue check-ins.
            </p>
          </div>

          {/* Demo Account Switcher */}
          <div className="bg-[#121214] border border-[#242429] rounded-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#9E9EA8]">
                Demo Quick-Fill
              </span>
              <span className="font-mono text-[10px] text-[#666670]">1-Click Credentials</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickFill('john@example.com', 'admin123')}
                className={`text-left p-3 rounded-md border transition-colors cursor-pointer ${
                  email === 'john@example.com'
                    ? 'bg-[#17171A] border-[#D4FF00] text-[#F4F4F0]'
                    : 'bg-[#0B0B0C] border-[#242429] text-[#9E9EA8] hover:border-[#34343C]'
                }`}
              >
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#D4FF00] block">
                  Attendee
                </span>
                <span className="text-xs font-semibold text-[#F4F4F0] block mt-0.5">John Doe</span>
                <span className="font-mono text-[11px] text-[#666670]">john@example.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin@ticketapp.com', 'admin123')}
                className={`text-left p-3 rounded-md border transition-colors cursor-pointer ${
                  email === 'admin@ticketapp.com'
                    ? 'bg-[#17171A] border-[#D4FF00] text-[#F4F4F0]'
                    : 'bg-[#0B0B0C] border-[#242429] text-[#9E9EA8] hover:border-[#34343C]'
                }`}
              >
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#D4FF00] block">
                  Organizer / Gate
                </span>
                <span className="text-xs font-semibold text-[#F4F4F0] block mt-0.5">Promoter Console</span>
                <span className="font-mono text-[11px] text-[#666670]">admin@ticketapp.com</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Sign-In Form */}
        <div className="lg:col-span-6">
          <div className="bg-[#121214] border border-[#242429] rounded-lg p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#F4F4F0]">Sign In</h2>
              <p className="text-xs text-[#9E9EA8] mt-1">Enter your account email and password.</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-xs p-3.5 rounded-md flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#9E9EA8] mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#666670] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#0B0B0C] border border-[#242429] focus:border-[#D4FF00] text-[#F4F4F0] pl-10 pr-4 py-3 rounded-md text-sm outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#9E9EA8] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#666670] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0B0B0C] border border-[#242429] focus:border-[#D4FF00] text-[#F4F4F0] pl-10 pr-10 py-3 rounded-md text-sm outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#666670] hover:text-[#F4F4F0] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#D4FF00] hover:bg-[#E2FF4D] text-[#0B0B0C] font-bold rounded-md transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50 mt-2"
              >
                <span>{loading ? 'Signing In...' : 'Sign In'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="border-t border-[#242429] pt-5 text-center">
              <p className="text-xs text-[#9E9EA8]">
                New to TIXFLOW?{' '}
                <Link to="/register" className="text-[#D4FF00] hover:underline font-semibold">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
