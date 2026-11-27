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
    <header className="sticky top-0 z-50 bg-[#0B0B0C]/95 backdrop-blur-md border-b border-[#242429]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* Brand Wordmark */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <span className="w-7 h-7 rounded bg-[#D4FF00] text-[#0B0B0C] flex items-center justify-center font-mono font-bold text-sm transition-transform duration-200 group-hover:scale-105">
            /
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-[#F4F4F0] uppercase">
            TIXFLOW
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center gap-1.5">
          <Link
            to="/"
            className={`px-3.5 py-2 rounded-md text-xs font-semibold tracking-wide transition-colors ${
              isActive('/')
                ? 'text-[#D4FF00] bg-[#17171A]'
                : 'text-[#9E9EA8] hover:text-[#F4F4F0] hover:bg-[#121214]'
            }`}
          >
            Events
          </Link>

          {user && !isAdmin && (
            <Link
              to="/my-tickets"
              className={`px-3.5 py-2 rounded-md text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-colors ${
                isActive('/my-tickets')
                  ? 'text-[#D4FF00] bg-[#17171A]'
                  : 'text-[#9E9EA8] hover:text-[#F4F4F0] hover:bg-[#121214]'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>My Passes</span>
            </Link>
          )}

          {/* Organizer / Admin Console Dropdown */}
          {isAdmin && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                className={`px-3.5 py-2 rounded-md text-xs font-semibold tracking-wide flex items-center gap-1.5 border transition-colors cursor-pointer ${
                  adminMenuOpen || location.pathname.startsWith('/admin') || location.pathname.startsWith('/organizer') || location.pathname.startsWith('/gatekeeper')
                    ? 'bg-[#17171A] border-[#D4FF00]/50 text-[#D4FF00]'
                    : 'bg-[#121214] border-[#242429] text-[#F4F4F0] hover:border-[#34343C]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF00]" />
                <span>Organizer</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#9E9EA8]" />
              </button>

              {adminMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-[#121214] border border-[#242429] rounded-lg p-1.5 shadow-2xl z-50">
                  <Link
                    to="/admin/events/create"
                    onClick={() => setAdminMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-[#F4F4F0] hover:bg-[#17171A] hover:text-[#D4FF00] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#D4FF00]" />
                    <span>Publish Event</span>
                  </Link>

                  <Link
                    to="/organizer/analytics/1"
                    onClick={() => setAdminMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-[#F4F4F0] hover:bg-[#17171A] hover:text-[#D4FF00] transition-colors"
                  >
                    <BarChart2 className="w-3.5 h-3.5 text-[#9E9EA8]" />
                    <span>Sales &amp; Occupancy</span>
                  </Link>

                  <Link
                    to="/gatekeeper/scan"
                    onClick={() => setAdminMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-[#F4F4F0] hover:bg-[#17171A] hover:text-[#D4FF00] transition-colors"
                  >
                    <ScanLine className="w-3.5 h-3.5 text-[#9E9EA8]" />
                    <span>Gate Scanner</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Auth Controls */}
          {user ? (
            <div className="flex items-center gap-2 pl-3 ml-2 border-l border-[#242429]">
              <div className="flex items-center gap-2 bg-[#121214] border border-[#242429] px-2.5 py-1.5 rounded-md">
                <div className="w-5 h-5 rounded bg-[#1E1E22] border border-[#34343C] flex items-center justify-center font-mono text-[10px] font-bold text-[#D4FF00]">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-medium text-[#F4F4F0] hidden md:inline max-w-[120px] truncate">
                  {user.name}
                </span>
                {isAdmin && (
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#0B0B0C] bg-[#D4FF00] px-1.5 py-0.5 rounded-sm">
                    PRO
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="p-2 rounded-md text-[#9E9EA8] hover:text-[#F4F4F0] hover:bg-[#17171A] transition-colors cursor-pointer"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-3 ml-2 border-l border-[#242429]">
              <Link
                to="/login"
                className="text-xs font-semibold text-[#9E9EA8] hover:text-[#F4F4F0] px-3 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-[#D4FF00] hover:bg-[#E2FF4D] text-[#0B0B0C] px-4 py-2 rounded-md text-xs font-bold tracking-tight transition-colors"
              >
                Get Access
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden p-2 rounded-md bg-[#121214] border border-[#242429] text-[#F4F4F0]"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-[#242429] bg-[#0B0B0C] px-4 py-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2.5 rounded-md text-xs font-semibold ${
              isActive('/') ? 'bg-[#17171A] text-[#D4FF00]' : 'text-[#F4F4F0]'
            }`}
          >
            Events
          </Link>

          {user && !isAdmin && (
            <Link
              to="/my-tickets"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-xs font-semibold ${
                isActive('/my-tickets') ? 'bg-[#17171A] text-[#D4FF00]' : 'text-[#F4F4F0]'
              }`}
            >
              <Ticket className="w-4 h-4 text-[#D4FF00]" />
              <span>My Passes</span>
            </Link>
          )}

          {isAdmin && (
            <div className="pt-2 border-t border-[#242429] space-y-1">
              <span className="font-mono text-[10px] font-semibold text-[#666670] uppercase tracking-widest px-3 block pb-1">
                Organizer Tools
              </span>
              <Link
                to="/admin/events/create"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-md text-xs font-medium text-[#F4F4F0] hover:bg-[#17171A]"
              >
                <Plus className="w-4 h-4 text-[#D4FF00]" />
                <span>Publish Event</span>
              </Link>
              <Link
                to="/organizer/analytics/1"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-md text-xs font-medium text-[#F4F4F0] hover:bg-[#17171A]"
              >
                <BarChart2 className="w-4 h-4 text-[#9E9EA8]" />
                <span>Sales &amp; Occupancy</span>
              </Link>
              <Link
                to="/gatekeeper/scan"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-md text-xs font-medium text-[#F4F4F0] hover:bg-[#17171A]"
              >
                <ScanLine className="w-4 h-4 text-[#9E9EA8]" />
                <span>Gate Scanner</span>
              </Link>
            </div>
          )}

          {user ? (
            <div className="pt-2 border-t border-[#242429]">
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  navigate('/');
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-semibold text-red-400 bg-red-500/10"
              >
                <span>Sign Out ({user.name})</span>
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#242429]">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-md text-xs font-semibold bg-[#121214] border border-[#242429] text-[#F4F4F0]"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-md text-xs font-bold bg-[#D4FF00] text-[#0B0B0C]"
              >
                Get Access
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
