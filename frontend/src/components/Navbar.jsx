import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Ticket, LogOut, Plus, ScanLine, BarChart2, ChevronDown, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setAdminMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-[#E6E8EC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* Friendly Consumer Brand Mark */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <span className="w-9 h-9 rounded-xl bg-[#E11D48] text-white flex items-center justify-center shadow-sm shadow-rose-500/20 transition-transform duration-200 group-hover:scale-105">
            <Ticket className="w-4.5 h-4.5" />
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight text-[#111827]">
            tixflow
          </span>
        </Link>

        {/* Desktop Pill Navigation */}
        <nav className="hidden sm:flex items-center gap-2">
          <Link
            to="/"
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              isActive('/')
                ? 'bg-[#FFF1F2] text-[#E11D48]'
                : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F1F3F7]'
            }`}
          >
            Explore Events
          </Link>

          {user && !isAdmin && (
            <Link
              to="/my-tickets"
              className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5 transition-all ${
                isActive('/my-tickets')
                  ? 'bg-[#FFF1F2] text-[#E11D48]'
                  : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F1F3F7]'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>My Tickets</span>
            </Link>
          )}

          {/* Organizer Dropdown */}
          {isAdmin && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  adminMenuOpen ||
                  location.pathname.startsWith('/admin') ||
                  location.pathname.startsWith('/organizer') ||
                  location.pathname.startsWith('/gatekeeper')
                    ? 'bg-[#FFF1F2] border-rose-200 text-[#E11D48]'
                    : 'bg-[#F7F8FA] border-[#E6E8EC] text-[#111827] hover:bg-[#F1F3F7]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#E11D48]" />
                <span>Organizer Hub</span>
                <ChevronDown className="w-4 h-4 text-[#6B7280]" />
              </button>

              {adminMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E6E8EC] rounded-2xl p-2 shadow-xl shadow-slate-900/10 z-50 space-y-0.5">
                  <Link
                    to="/admin/events/create"
                    onClick={() => setAdminMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#111827] hover:bg-[#FFF1F2] hover:text-[#E11D48] transition-colors"
                  >
                    <Plus className="w-4 h-4 text-[#E11D48]" />
                    <span>Create New Event</span>
                  </Link>

                  <Link
                    to="/organizer/analytics/1"
                    onClick={() => setAdminMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#4B5563] hover:bg-[#F7F8FA] hover:text-[#111827] transition-colors"
                  >
                    <BarChart2 className="w-4 h-4 text-[#6B7280]" />
                    <span>Sales &amp; Occupancy</span>
                  </Link>

                  <Link
                    to="/gatekeeper/scan"
                    onClick={() => setAdminMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#4B5563] hover:bg-[#F7F8FA] hover:text-[#111827] transition-colors"
                  >
                    <ScanLine className="w-4 h-4 text-[#6B7280]" />
                    <span>Door Ticket Scanner</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Auth Controls */}
          {user ? (
            <div className="flex items-center gap-2 pl-3 ml-1 border-l border-[#E6E8EC]">
              <div className="flex items-center gap-2 bg-[#F7F8FA] border border-[#E6E8EC] pl-1.5 pr-3 py-1 rounded-full">
                <div className="w-7 h-7 rounded-full bg-[#E11D48] text-white flex items-center justify-center text-xs font-bold">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-sm font-semibold text-[#111827] hidden md:inline max-w-[120px] truncate">
                  {user.name}
                </span>
                {isAdmin && (
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[#E11D48] bg-[#FFF1F2] px-2 py-0.5 rounded-full">
                    Host
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="p-2 rounded-full text-[#6B7280] hover:text-[#E11D48] hover:bg-[#FFF1F2] transition-colors cursor-pointer"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-3 ml-1 border-l border-[#E6E8EC]">
              <Link
                to="/login"
                className="text-sm font-semibold text-[#4B5563] hover:text-[#111827] px-3.5 py-2 rounded-full hover:bg-[#F1F3F7] transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-[#E11D48] hover:bg-[#BE123C] text-white px-4.5 py-2 rounded-full text-sm font-bold shadow-sm shadow-rose-500/20 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden p-2 rounded-full bg-[#F7F8FA] border border-[#E6E8EC] text-[#111827]"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-[#E6E8EC] bg-white px-4 py-4 space-y-2 shadow-lg">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-4 py-2.5 rounded-xl text-sm font-semibold ${
              isActive('/') ? 'bg-[#FFF1F2] text-[#E11D48]' : 'text-[#111827]'
            }`}
          >
            Explore Events
          </Link>

          {user && !isAdmin && (
            <Link
              to="/my-tickets"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold ${
                isActive('/my-tickets') ? 'bg-[#FFF1F2] text-[#E11D48]' : 'text-[#111827]'
              }`}
            >
              <Ticket className="w-4 h-4 text-[#E11D48]" />
              <span>My Tickets</span>
            </Link>
          )}

          {isAdmin && (
            <div className="pt-2 border-t border-[#E6E8EC] space-y-1">
              <span className="text-xs font-bold text-[#6B7280] px-4 block pb-1">
                Organizer Hub
              </span>
              <Link
                to="/admin/events/create"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#111827] hover:bg-[#F7F8FA]"
              >
                <Plus className="w-4 h-4 text-[#E11D48]" />
                <span>Create New Event</span>
              </Link>
              <Link
                to="/organizer/analytics/1"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-[#4B5563] hover:bg-[#F7F8FA]"
              >
                <BarChart2 className="w-4 h-4 text-[#6B7280]" />
                <span>Sales &amp; Occupancy</span>
              </Link>
              <Link
                to="/gatekeeper/scan"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-[#4B5563] hover:bg-[#F7F8FA]"
              >
                <ScanLine className="w-4 h-4 text-[#6B7280]" />
                <span>Door Ticket Scanner</span>
              </Link>
            </div>
          )}

          {user ? (
            <div className="pt-2 border-t border-[#E6E8EC]">
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  navigate('/');
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold text-[#E11D48] bg-[#FFF1F2]"
              >
                <span>Sign Out ({user.name})</span>
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[#E6E8EC]">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-full text-sm font-semibold bg-[#F7F8FA] border border-[#E6E8EC] text-[#111827]"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-full text-sm font-bold bg-[#E11D48] text-white"
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
