import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center py-24 text-zinc-400 font-semibold">Verifying role permissions...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'ADMIN') {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="bg-[#0d0e15] border border-rose-500/30 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <span className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-widest px-3.5 py-1 rounded-full">
            Restricted Admin Console
          </span>

          <h1 className="text-3xl font-black text-white mt-4 mb-2 tracking-tight">Access Denied</h1>
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
            Your account (<strong className="text-white">{user.email}</strong>) is registered with role <strong className="text-amber-400">USER</strong>. Admin privileges are required to access management & scanner tools.
          </p>

          <div className="p-4 rounded-2xl bg-[#131522] border border-white/10 text-xs text-zinc-300 mb-6 text-left space-y-1">
            <p className="font-bold text-indigo-400 flex items-center space-x-1.5 mb-2">
              <Lock className="w-3.5 h-3.5" />
              <span>Test Admin Account Credentials:</span>
            </p>
            <p>Email: <strong className="text-white font-mono">admin@ticketapp.com</strong></p>
            <p>Password: <strong className="text-white font-mono">admin123</strong></p>
          </div>

          <div className="flex justify-center space-x-3">
            <Link
              to="/"
              className="bg-white text-black hover:bg-zinc-200 font-extrabold px-5 py-3 rounded-2xl text-xs transition-all flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Discovery</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
