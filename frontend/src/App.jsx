import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import EventListPage from './pages/EventListPage';
import EventDetailPage from './pages/EventDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import MyTicketsPage from './pages/MyTicketsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrganizerDashboardPage from './pages/OrganizerDashboardPage';
import GatekeeperScannerPage from './pages/GatekeeperScannerPage';
import CreateEventPage from './pages/CreateEventPage';
import EditEventPage from './pages/EditEventPage';
import AdminRoute from './components/AdminRoute';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-[#0B0B0C] text-[#F4F4F0] flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<EventListPage />} />
                <Route path="/events/:id" element={<EventDetailPage />} />
                <Route path="/checkout/:id" element={<CheckoutPage />} />
                <Route path="/my-tickets" element={<MyTicketsPage />} />
                <Route path="/organizer/analytics/:id" element={<AdminRoute><OrganizerDashboardPage /></AdminRoute>} />
                <Route path="/gatekeeper/scan" element={<AdminRoute><GatekeeperScannerPage /></AdminRoute>} />
                <Route path="/admin/events/create" element={<AdminRoute><CreateEventPage /></AdminRoute>} />
                <Route path="/admin/events/edit/:id" element={<AdminRoute><EditEventPage /></AdminRoute>} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Routes>
            </main>

            <footer className="border-t border-[#242429] bg-[#0B0B0C] mt-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-[#D4FF00] text-[#0B0B0C] font-mono font-bold text-xs">
                    /
                  </span>
                  <div>
                    <span className="font-display font-bold tracking-tight text-sm text-[#F4F4F0] uppercase">
                      TIXFLOW
                    </span>
                    <span className="text-xs text-[#666670] ml-3">
                      Live Event Ticketing &amp; Venue Access
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-xs text-[#9E9EA8]">
                  <Link to="/" className="hover:text-[#D4FF00] transition-colors">
                    Events
                  </Link>
                  <Link to="/my-tickets" className="hover:text-[#D4FF00] transition-colors">
                    My Passes
                  </Link>
                  <Link to="/login" className="hover:text-[#D4FF00] transition-colors">
                    Account
                  </Link>
                  <span className="font-mono text-[11px] text-[#666670]">
                    © {new Date().getFullYear()} TIXFLOW
                  </span>
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}
