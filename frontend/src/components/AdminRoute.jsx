import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="text-center py-24 text-sm font-medium text-[#6B7280]">
        Checking organizer permissions...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'ADMIN') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20">
        <div className="market-card rounded-3xl p-8 space-y-6 text-center">
          <div className="w-14 h-14 bg-rose-50 border border-rose-200 text-[#E11D48] rounded-2xl flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="inline-block text-xs font-bold text-[#E11D48] bg-[#FFF1F2] px-3 py-1 rounded-full">
              Organizer Access Required
            </span>
            <h1 className="font-display text-2xl font-extrabold text-[#111827]">
              Host Console Only
            </h1>
            <p className="text-[#6B7280] text-sm leading-relaxed">
              You&apos;re signed in as <strong className="text-[#111827]">{user.email}</strong> (Fan). Switch to the demo Organizer account to create events, view box-office reports, or scan door passes.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-[#E6E8EC] text-xs space-y-1 text-left">
            <p className="text-[#111827] font-bold flex items-center gap-1.5 mb-1.5">
              <Lock className="w-3.5 h-3.5 text-[#E11D48]" />
              <span>Demo Organizer Login</span>
            </p>
            <p className="text-[#4B5563]">
              Email: <span className="font-mono font-semibold text-[#111827]">admin@ticketapp.com</span>
            </p>
            <p className="text-[#4B5563]">
              Password: <span className="font-mono font-semibold text-[#111827]">admin123</span>
            </p>
          </div>

          <Link
            to="/"
            className="bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold px-6 py-3 rounded-full text-sm transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Events</span>
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
