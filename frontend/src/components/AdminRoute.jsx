import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="text-center py-24 font-mono text-xs text-[#9E9EA8] uppercase tracking-wider">
        Checking permissions...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'ADMIN') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20">
        <div className="bg-[#121214] border border-[#242429] rounded-lg p-8 space-y-6">
          <div className="w-11 h-11 bg-red-500/10 border border-red-500/30 text-red-400 rounded-md flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>

          <div className="space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-red-400 block">
              Organizer Access Required
            </span>
            <h1 className="font-display text-2xl font-bold text-[#F4F4F0]">Restricted Console</h1>
            <p className="text-[#9E9EA8] text-xs leading-relaxed">
              Signed in as <strong className="text-[#F4F4F0]">{user.email}</strong> (Attendee). Promoter permissions are required to publish events, view sales analytics, or operate the gate scanner.
            </p>
          </div>

          <div className="p-4 rounded-md bg-[#0B0B0C] border border-[#242429] font-mono text-xs space-y-1">
            <p className="text-[#D4FF00] font-semibold flex items-center gap-1.5 mb-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Demo Organizer Account</span>
            </p>
            <p className="text-[#9E9EA8]">
              Email: <span className="text-[#F4F4F0]">admin@ticketapp.com</span>
            </p>
            <p className="text-[#9E9EA8]">
              Password: <span className="text-[#F4F4F0]">admin123</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="bg-[#D4FF00] hover:bg-[#E2FF4D] text-[#0B0B0C] font-bold px-4 py-2.5 rounded-md text-xs transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Events</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
