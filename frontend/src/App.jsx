import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import NotFoundPage from './pages/NotFoundPage';
import AdminRoute from './components/AdminRoute';
import { Ticket } from 'lucide-react';

function AppFooter() {
  const { user } = useAuth();

  return (
    <footer className="border-t border-[#E6E8EC] bg-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[#E11D48] text-white shadow-sm">
            <Ticket className="w-4 h-4" />
          </span>
          <div>
            <span className="font-display font-extrabold text-lg text-[#111827] tracking-tight">
              tixflow
            </span>
            <p className="text-xs text-[#6B7280]">
              Concerts, sports arenas, cinema premieres &amp; theater experiences.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-[#4B5563]">
          <Link to="/" className="hover:text-[#E11D48] transition-colors">
            Explore Events
          </Link>
          {user && user.role !== 'ADMIN' && (
            <Link to="/my-tickets" className="hover:text-[#E11D48] transition-colors">
              My Tickets
            </Link>
          )}
          {user && user.role === 'ADMIN' && (
            <Link to="/organizer/analytics/1" className="hover:text-[#E11D48] transition-colors">
              Organizer Hub
            </Link>
          )}
          {!user && (
            <Link to="/login" className="hover:text-[#E11D48] transition-colors">
              Sign In
            </Link>
          )}
          <span className="text-xs text-[#9CA3AF]">
            © {new Date().getFullYear()} Tixflow
          </span>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-[#F7F8FA] text-[#111827] flex flex-col">
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
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <AppFooter />
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}
