import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
          <div className="min-h-screen bg-[#07080c] text-white flex flex-col selection:bg-indigo-500 selection:text-white">
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
            <footer className="border-t border-white/[0.08] bg-[#07080c] py-6 text-center text-xs text-zinc-500">
              © 2026 TIXFLOW — Real-Time Ticket Booking &amp; Reservation System (Java/Spring Boot + Neon PostgreSQL + Redis)
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}
