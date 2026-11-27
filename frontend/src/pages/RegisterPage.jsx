import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Phone, AlertCircle, ArrowRight } from 'lucide-react';

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
      setError(err.response?.data?.message || 'Registration failed. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Editorial Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#D4FF00] block">
              Create Account
            </span>
            <h1 className="font-display text-3xl sm:text-5xl font-bold text-[#F4F4F0] leading-[1.05] tracking-tight">
              Instant tickets. Zero scalper screenshots.
            </h1>
            <p className="text-[#9E9EA8] text-sm leading-relaxed">
              Set up your pass wallet for live seat locking, Stripe checkout, rotating 30-second QR entry tokens, and peer-to-peer ticket transfers.
            </p>
          </div>

          <div className="border-t border-[#242429] pt-5 space-y-3 font-mono text-xs text-[#9E9EA8]">
            <div className="flex items-center gap-3">
              <span className="text-[#D4FF00]">01</span>
              <span>10-minute exclusive seat holds at checkout</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#D4FF00]">02</span>
              <span>Rotating TOTP QR passes + downloadable PDF stubs</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#D4FF00]">03</span>
              <span>Instant pass transfers to any registered email</span>
            </div>
          </div>
        </div>

        {/* Right Registration Form */}
        <div className="lg:col-span-6">
          <div className="bg-[#121214] border border-[#242429] rounded-lg p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#F4F4F0]">Get Access</h2>
              <p className="text-xs text-[#9E9EA8] mt-1">Create your TIXFLOW attendee profile.</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-xs p-3.5 rounded-md flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#9E9EA8] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#666670] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Mercer"
                    className="w-full bg-[#0B0B0C] border border-[#242429] focus:border-[#D4FF00] text-[#F4F4F0] pl-10 pr-4 py-2.5 rounded-md text-sm outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#9E9EA8] mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#666670] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full bg-[#0B0B0C] border border-[#242429] focus:border-[#D4FF00] text-[#F4F4F0] pl-10 pr-4 py-2.5 rounded-md text-sm outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#9E9EA8] mb-1.5">
                  Mobile Number <span className="text-[#666670]">(Optional)</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#666670] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+65 8123 4567"
                    className="w-full bg-[#0B0B0C] border border-[#242429] focus:border-[#D4FF00] text-[#F4F4F0] pl-10 pr-4 py-2.5 rounded-md text-sm outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#9E9EA8] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#666670] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-[#0B0B0C] border border-[#242429] focus:border-[#D4FF00] text-[#F4F4F0] pl-10 pr-4 py-2.5 rounded-md text-sm outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#D4FF00] hover:bg-[#E2FF4D] text-[#0B0B0C] font-bold rounded-md transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50 mt-2"
              >
                <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="border-t border-[#242429] pt-5 text-center">
              <p className="text-xs text-[#9E9EA8]">
                Already registered?{' '}
                <Link to="/login" className="text-[#D4FF00] hover:underline font-semibold">
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
