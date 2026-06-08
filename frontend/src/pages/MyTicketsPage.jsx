import React, { useEffect, useState } from 'react';
import { ticketApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Ticket, Calendar, MapPin, Download, QrCode, X, Send, ShieldCheck, RefreshCw, Sparkles, CheckCircle2, UserCheck, Lock } from 'lucide-react';

export default function MyTicketsPage() {
  const { showToast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [activeQrTicket, setActiveQrTicket] = useState(null);
  const [dynamicQrData, setDynamicQrData] = useState(null);
  const [transferTicketTarget, setTransferTicketTarget] = useState(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [transferring, setTransferring] = useState(false);

  useEffect(() => {
    fetchTickets();
    const query = new URLSearchParams(window.location.search);
    if (query.get('success') === 'true') {
      setShowSuccessBanner(true);
      showToast({
        type: 'success',
        title: 'Payment Confirmed! 🎉',
        message: 'Congratulations! Your Stripe Sandbox payment was verified. Your official E-Ticket PDF and Dynamic QR Code are now active.',
      });
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!activeQrTicket) return;
    fetchDynamicQr(activeQrTicket.ticketCode);
    const interval = setInterval(() => {
      fetchDynamicQr(activeQrTicket.ticketCode);
    }, 30000);
    return () => clearInterval(interval);
  }, [activeQrTicket]);

  const fetchTickets = async () => {
    try {
      const res = await ticketApi.getMyTickets();
      setTickets(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDynamicQr = async (code) => {
    try {
      const res = await ticketApi.getDynamicQr(code);
      setDynamicQrData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!transferTicketTarget || !recipientEmail.trim()) return;

    setTransferring(true);
    try {
      await ticketApi.transfer(transferTicketTarget.id, recipientEmail.trim());
      showToast({
        type: 'success',
        title: 'P2P Transfer Complete',
        message: `Ticket pass successfully transferred to ${recipientEmail}`,
      });
      setTransferTicketTarget(null);
      setRecipientEmail('');
      fetchTickets();
    } catch (err) {
      console.error(err);
      showToast({
        type: 'error',
        title: 'Transfer Failed',
        message: err.response?.data?.message || err.message || 'Tiket yang sudah discan/digunakan tidak dapat ditransfer!',
      });
    } finally {
      setTransferring(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center space-x-4 mb-10">
        <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-3.5 rounded-2xl border border-white/10 text-white shadow-xl shadow-indigo-500/20">
          <Ticket className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">My Purchased Passes</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage your active event tickets, generate dynamic QR codes, or transfer passes.</p>
        </div>
      </div>

      {showSuccessBanner && (
        <div className="mb-8 p-6 bg-gradient-to-r from-emerald-950/80 via-emerald-900/40 to-emerald-950/80 border border-emerald-500/40 rounded-3xl backdrop-blur-xl shadow-2xl shadow-emerald-500/10 flex items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Payment Confirmed! 🎉
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-mono">STRIPE SUCCESS</span>
              </h3>
              <p className="text-emerald-200/80 text-sm mt-0.5">
                Congratulations! Your Stripe Sandbox payment has been verified. Your official E-Ticket PDF and Dynamic QR Code are now active below.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSuccessBanner(false)}
            className="text-emerald-400/60 hover:text-emerald-300 p-2 hover:bg-emerald-500/10 rounded-xl transition-all shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-zinc-400 font-semibold text-sm">Loading your digital pass wallet...</p>
          </div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20 bg-[#0d0e15] rounded-3xl border border-white/10 p-8">
          <Sparkles className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Active Tickets Found</h3>
          <p className="text-zinc-400 text-sm max-w-md mx-auto mb-6">
            You don't have any confirmed event tickets yet. Explore upcoming concerts and reserve your seats now!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {tickets.map((t) => (
            <div
              key={t.id}
              className={`bg-[#0d0e15] border rounded-3xl p-6 sm:p-8 shadow-2xl transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${
                t.isUsed ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-white/10'
              }`}
            >
              <div className="space-y-3 max-w-xl">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                    {t.ticketCode}
                  </span>

                  {t.isUsed ? (
                    <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs px-3 py-1 rounded-full flex items-center space-x-1.5 shadow-lg shadow-emerald-500/10">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>CHECKED IN AT VENUE GATE</span>
                    </span>
                  ) : (
                    <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold text-xs px-3 py-1 rounded-full flex items-center space-x-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                      <span>VALID ENTRY PASS</span>
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-black text-white tracking-tight">{t.eventName}</h3>

                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-300">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span>{new Date(t.eventStartTime).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>{t.venueName}</span>
                  </div>
                </div>

                <div className="pt-1 text-sm">
                  <span className="font-bold text-zinc-100">
                    Row {t.rowLabel} — Seat #{t.seatNumber}
                  </span>{' '}
                  <span className="text-zinc-400 font-medium">({t.categoryName})</span>
                </div>

                {t.isUsed && t.usedAt && (
                  <p className="text-xs text-emerald-400 font-medium pt-1">
                    ✓ Checked-in at entrance: {new Date(t.usedAt).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => setActiveQrTicket(t)}
                  className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-[#131522] hover:bg-[#1a1d2e] text-white px-4 py-3 rounded-2xl text-xs font-bold border border-white/10 transition-all cursor-pointer shadow-md"
                >
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  <span>Dynamic QR</span>
                </button>

                {/* Transfer Pass Button (Disabled if already checked in) */}
                <button
                  onClick={() => setTransferTicketTarget(t)}
                  disabled={t.isUsed}
                  className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl text-xs font-bold border transition-all ${
                    t.isUsed
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed opacity-50'
                      : 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border-indigo-500/30 cursor-pointer'
                  }`}
                  title={t.isUsed ? 'Already checked in at venue gate' : 'Transfer ticket to another user'}
                >
                  {t.isUsed ? <Lock className="w-4 h-4 text-zinc-600" /> : <Send className="w-4 h-4" />}
                  <span>{t.isUsed ? 'Pass Used' : 'Transfer Pass'}</span>
                </button>

                {t.pdfUrl && (
                  <a
                    href={t.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-white hover:bg-zinc-200 text-black px-4.5 py-3 rounded-2xl text-xs font-black shadow-lg transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>PDF Pass</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dynamic TOTP Anti-Fraud QR Modal */}
      {activeQrTicket && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d0e15] border border-white/10 rounded-3xl p-7 max-w-sm w-full text-center relative shadow-2xl space-y-4">
            <button
              onClick={() => {
                setActiveQrTicket(null);
                setDynamicQrData(null);
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-xl hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            {activeQrTicket.isUsed ? (
              <div className="flex items-center justify-center space-x-2 bg-emerald-500/20 border border-emerald-500/40 px-3.5 py-1.5 rounded-full text-xs text-emerald-300 font-bold w-fit mx-auto shadow-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>TICKET CHECKED-IN AT GATE</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 px-3.5 py-1 rounded-full text-xs text-indigo-300 font-bold w-fit mx-auto">
                <ShieldCheck className="w-4 h-4" />
                <span>Anti-Fraud Dynamic TOTP QR</span>
              </div>
            )}

            <h3 className="text-xl font-black text-white tracking-tight">{activeQrTicket.eventName}</h3>
            <p className="text-xs font-semibold text-zinc-400">
              Row {activeQrTicket.rowLabel} — Seat #{activeQrTicket.seatNumber}
            </p>

            {dynamicQrData ? (
              <div className={`bg-white p-4 rounded-3xl inline-block shadow-2xl border-2 ${activeQrTicket.isUsed ? 'border-emerald-500' : 'border-indigo-500'}`}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(dynamicQrData.qrPayload)}`}
                  alt="Dynamic Anti-Fraud QR Code"
                  className="w-48 h-48"
                />
              </div>
            ) : (
              <div className="w-48 h-48 bg-[#131522] rounded-3xl mx-auto flex items-center justify-center text-zinc-400 text-xs font-semibold border border-white/10">
                Generating Dynamic HMAC Token...
              </div>
            )}

            {!activeQrTicket.isUsed && (
              <div className="flex items-center justify-center space-x-2 text-xs text-amber-400 font-bold">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Refreshes every 30s (Anti-Screenshot)</span>
              </div>
            )}

            {activeQrTicket.isUsed && activeQrTicket.usedAt && (
              <p className="text-xs font-bold text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                ✓ Check-in Verified: {new Date(activeQrTicket.usedAt).toLocaleString()}
              </p>
            )}

            <p className="font-mono text-[11px] text-zinc-400 break-all bg-[#131522] p-3 rounded-2xl border border-white/10">
              {dynamicQrData ? dynamicQrData.qrPayload : activeQrTicket.ticketCode}
            </p>
          </div>
        </div>
      )}

      {/* Transfer Ticket Modal */}
      {transferTicketTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d0e15] border border-white/10 rounded-3xl p-7 max-w-md w-full relative shadow-2xl space-y-5 text-left">
            <button
              onClick={() => setTransferTicketTarget(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-xl hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 block mb-1">P2P Ticket Transfer</span>
              <h3 className="text-2xl font-black text-white tracking-tight">Transfer Entry Pass</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Transfer ownership of Row {transferTicketTarget.rowLabel} — Seat #{transferTicketTarget.seatNumber} ({transferTicketTarget.eventName}) to another user.
              </p>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">Recipient Email</label>
                <input
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="e.g. friend@example.com"
                  className="w-full bg-[#131522] border border-white/10 focus:border-indigo-500 rounded-2xl px-4 py-3 text-white text-sm outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={transferring || !recipientEmail.trim()}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {transferring ? (
                  <span>Transferring Ownership...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Confirm Transfer</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
