import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Ticket, User, LogOut, Compass, Plus, ScanLine, BarChart2, ShieldCheck, ChevronDown, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-50 px-3 sm:px-8 py-3 bg-[#07080c]/90 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-2.5 group shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#0d0e15] rounded-[15px] flex items-center justify-center">
              <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-white flex items-center space-x-1.5">
              <span>tixflow</span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            </span>
            <span className="text-[9px] sm:text-[10px] font-semibold text-zinc-400 uppercase tracking-widest -mt-1">ENTERPRISE PASS</span>
          </div>
        </Link>

        {/* Desktop Navigation Items */}
        <nav className="hidden sm:flex items-center space-x-2">
          {/* Public Link */}
          <Link
            to="/"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              isActive('/')
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Discover Events</span>
          </Link>

          {/* ADMIN ONLY Tools Menu */}
          {isAdmin && (
            <div className="relative">
              <button
                onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 bg-gradient-to-r from-amber-500/20 to-indigo-500/20 border border-amber-500/30 text-amber-300 hover:border-amber-500/50 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Admin Console</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {/* Admin Dropdown Menu */}
              {adminMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#0d0e15] border border-white/10 rounded-2xl p-2 shadow-2xl z-50 space-y-1 backdrop-blur-2xl">
                  <Link
                    to="/admin/events/create"
                    onClick={() => setAdminMenuOpen(false)}
                    className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Publish New Event</span>
                  </Link>

                  <Link
                    to="/organizer/analytics/1"
                    onClick={() => setAdminMenuOpen(false)}
                    className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-indigo-300 hover:bg-indigo-500/10 transition-colors"
                  >
                    <BarChart2 className="w-4 h-4 text-indigo-400" />
                    <span>Organizer Telemetry</span>
                  </Link>

                  <Link
                    to="/gatekeeper/scan"
                    onClick={() => setAdminMenuOpen(false)}
                    className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-amber-300 hover:bg-amber-500/10 transition-colors"
                  >
                    <ScanLine className="w-4 h-4 text-amber-400" />
                    <span>Gatekeeper Scanner</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* User Auth Menu */}
          {user ? (
            <div className="flex items-center space-x-2 pl-3 border-l border-white/10">
              {!isAdmin && (
                <Link
                  to="/my-tickets"
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                    isActive('/my-tickets')
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-[#131520] border border-white/10 text-zinc-200 hover:border-white/20'
                  }`}
                >
                  <Ticket className="w-3.5 h-3.5 text-indigo-400" />
                  <span>My Tickets</span>
                </Link>
              )}

              <div className="flex items-center space-x-2 bg-[#131520] px-3 py-1.5 rounded-xl border border-white/10">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-black text-white">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-zinc-200 hidden md:inline leading-none">{user.name}</span>
                  <span className="text-[9px] font-mono font-bold text-amber-400 tracking-wider uppercase leading-none mt-0.5">
                    {user.role}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 pl-3 border-l border-white/10">
              <Link
                to="/login"
                className="text-xs font-semibold text-zinc-300 hover:text-white px-3.5 py-2"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Hamburger Toggle Button */}
        <div className="flex sm:hidden items-center space-x-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-[#131520] border border-white/10 text-zinc-200 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden mt-3 pt-3 border-t border-white/10 space-y-2 pb-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2.5 px-4 py-3 rounded-xl text-xs font-bold text-white bg-white/10"
          >
            <Compass className="w-4 h-4 text-indigo-400" />
            <span>Discover Events</span>
          </Link>

          {isAdmin && (
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest px-4 block">
                Admin Console Tools
              </span>
              <Link
                to="/admin/events/create"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/10"
              >
                <Plus className="w-4 h-4" />
                <span>Publish New Event</span>
              </Link>
              <Link
                to="/organizer/analytics/1"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-xs font-bold text-indigo-300 bg-indigo-500/10"
              >
                <BarChart2 className="w-4 h-4" />
                <span>Organizer Telemetry</span>
              </Link>
              <Link
                to="/gatekeeper/scan"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10"
              >
                <ScanLine className="w-4 h-4" />
                <span>Gatekeeper Scanner</span>
              </Link>
            </div>
          )}

          {user ? (
            <div className="pt-2 border-t border-white/10 space-y-2">
              {!isAdmin && (
                <Link
                  to="/my-tickets"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2.5 px-4 py-3 rounded-xl text-xs font-bold text-indigo-300 bg-indigo-500/10"
                >
                  <Ticket className="w-4 h-4" />
                  <span>My Tickets</span>
                </Link>
              )}

              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  navigate('/');
                }}
                className="w-full flex items-center space-x-2.5 px-4 py-3 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out ({user.name})</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-xl text-xs font-bold bg-[#131520] border border-white/10 text-white"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-xl text-xs font-bold bg-white text-black"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
