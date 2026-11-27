import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Phone, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(name, email, password, phone);
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Email may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Benefits Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <span className="inline-block text-xs font-bold text-[#E11D48] bg-[#FFF1F2] px-3.5 py-1.5 rounded-full">
              Create Your Account
            </span>
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-[#111827] leading-[1.08]">
              Book seats in seconds, stress-free.
            </h1>
            <p className="text-[#4B5563] text-sm sm:text-base leading-relaxed">
              Join Tixflow to reserve exact stadium seats, pay securely via Stripe, and keep rotating anti-fraud passes in your wallet.
            </p>
          </div>

          <div className="space-y-3 pt-2 text-sm text-[#374151] font-medium">
            <div className="flex items-center gap-3 bg-white border border-[#E6E8EC] p-3.5 rounded-2xl shadow-2xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>10-minute guaranteed seat hold while you check out</span>
            </div>
            <div className="flex items-center gap-3 bg-white border border-[#E6E8EC] p-3.5 rounded-2xl shadow-2xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Live 30-second rotating QR passes &amp; printable PDFs</span>
            </div>
            <div className="flex items-center gap-3 bg-white border border-[#E6E8EC] p-3.5 rounded-2xl shadow-2xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Easy 1-click ticket transfers to friends</span>
            </div>
          </div>
        </div>

        {/* Right Sign-Up Card */}
        <div className="lg:col-span-6">
          <div className="market-card rounded-3xl p-6 sm:p-9 space-y-6">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-[#111827]">Sign Up</h2>
              <p className="text-sm text-[#6B7280] mt-1">Create your free fan account below.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium p-3.5 rounded-2xl flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nadia Putri"
                    className="w-full bg-[#F7F8FA] border border-[#E6E8EC] focus:border-[#E11D48] focus:bg-white text-[#111827] pl-11 pr-4 py-3 rounded-2xl text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nadia@example.com"
                    className="w-full bg-[#F7F8FA] border border-[#E6E8EC] focus:border-[#E11D48] focus:bg-white text-[#111827] pl-11 pr-4 py-3 rounded-2xl text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1.5">
                  Mobile Number <span className="text-[#9CA3AF] font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+62 812 3456 7890"
                    className="w-full bg-[#F7F8FA] border border-[#E6E8EC] focus:border-[#E11D48] focus:bg-white text-[#111827] pl-11 pr-4 py-3 rounded-2xl text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-[#F7F8FA] border border-[#E6E8EC] focus:border-[#E11D48] focus:bg-white text-[#111827] pl-11 pr-4 py-3 rounded-2xl text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold rounded-full shadow-md shadow-rose-500/25 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50 mt-2"
              >
                <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="border-t border-[#F1F3F7] pt-5 text-center">
              <p className="text-xs sm:text-sm text-[#6B7280]">
                Already have an account?{' '}
                <Link to="/login" state={location.state} className="text-[#E11D48] hover:underline font-bold">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
