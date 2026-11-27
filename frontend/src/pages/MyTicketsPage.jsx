import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ticketApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Calendar, MapPin, Download, QrCode, X, Send, RefreshCw, CheckCircle2, Lock, ArrowRight, Copy, Check, Ticket } from 'lucide-react';

export default function MyTicketsPage() {
  const { showToast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [activeQrTicket, setActiveQrTicket] = useState(null);
  const [dynamicQrData, setDynamicQrData] = useState(null);
  const [copiedToken, setCopiedToken] = useState(false);
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
        title: 'Tickets Confirmed!',
        message: 'Your payment is verified. Your mobile QR passes and PDF tickets are ready.',
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

  const handleCopyPayload = (text) => {
    navigator.clipboard?.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 1800);
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!transferTicketTarget || !recipientEmail.trim()) return;

    setTransferring(true);
    try {
      await ticketApi.transfer(transferTicketTarget.id, recipientEmail.trim());
      showToast({
        type: 'success',
        title: 'Ticket Sent',
        message: `Ticket transferred to ${recipientEmail.trim()}.`,
      });
      setTransferTicketTarget(null);
      setRecipientEmail('');
      fetchTickets();
    } catch (err) {
      console.error(err);
      showToast({
        type: 'error',
        title: 'Transfer Unavailable',
        message: err.response?.data?.message || err.message || 'Checked-in tickets cannot be transferred.',
      });
    } finally {
      setTransferring(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E11D48] bg-[#FFF1F2] px-3 py-1 rounded-full mb-2">
            <Ticket className="w-3.5 h-3.5" />
            <span>Ticket Wallet</span>
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#111827]">
            My Tickets
          </h1>
          <p className="text-[#6B7280] text-sm mt-1">
            Show your live QR pass at the entrance, download PDF tickets, or send a ticket to a friend.
          </p>
        </div>

        {!loading && (
          <span className="text-xs font-bold text-[#4B5563] bg-white border border-[#E6E8EC] px-4 py-2 rounded-full w-fit shadow-2xs">
            {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
          </span>
        )}
      </div>

      {showSuccessBanner && (
        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-3xl flex items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-extrabold text-emerald-950">
                Booking Confirmed!
              </h3>
              <p className="text-emerald-800 text-xs sm:text-sm mt-0.5">
                Your Stripe payment succeeded. Your QR passes and PDF downloads are active below.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSuccessBanner(false)}
            className="text-emerald-700 hover:text-emerald-950 p-1.5 rounded-full hover:bg-emerald-100 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-3 border-[#E6E8EC] border-t-[#E11D48] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-[#6B7280]">Loading your tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20 market-card rounded-3xl px-6 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF1F2] text-[#E11D48] flex items-center justify-center mx-auto">
            <Ticket className="w-7 h-7" />
          </div>
          <h3 className="font-display text-xl font-extrabold text-[#111827]">No Tickets Yet</h3>
          <p className="text-[#6B7280] text-sm max-w-md mx-auto">
            Once you book seats for an upcoming concert, match, or show, your passes will appear right here.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold px-6 py-3 rounded-full text-sm shadow-sm transition-colors"
          >
            <span>Explore Events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {tickets.map((t) => (
            <div
              key={t.id}
              className="market-card rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-12 relative"
            >
              {/* Left Boarding-Pass Face */}
              <div className="md:col-span-8 p-6 sm:p-7 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-[#4B5563] bg-[#F7F8FA] border border-[#E6E8EC] px-3 py-1 rounded-full">
                      {t.ticketCode}
                    </span>
                    {t.isUsed ? (
                      <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs px-3 py-1 rounded-full inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Checked In
                      </span>
                    ) : (
                      <span className="bg-[#FFF1F2] text-[#E11D48] font-bold text-xs px-3 py-1 rounded-full">
                        Active Pass
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-display text-2xl font-extrabold text-[#111827]">
                    {t.eventName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-[#4B5563] mt-2 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#E11D48]" />
                      {new Date(t.eventStartTime).toLocaleString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#6B7280]" />
                      {t.venueName}
                    </span>
                  </div>
                </div>

                {/* Boarding Pass Seat Details */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#F1F3F7]">
                  <div className="bg-[#F7F8FA] rounded-2xl p-3">
                    <span className="text-[11px] font-medium text-[#6B7280] block">Row</span>
                    <span className="font-display text-lg font-extrabold text-[#111827]">{t.rowLabel}</span>
                  </div>
                  <div className="bg-[#F7F8FA] rounded-2xl p-3">
                    <span className="text-[11px] font-medium text-[#6B7280] block">Seat</span>
                    <span className="font-display text-lg font-extrabold text-[#111827]">#{t.seatNumber}</span>
                  </div>
                  <div className="bg-[#F7F8FA] rounded-2xl p-3">
                    <span className="text-[11px] font-medium text-[#6B7280] block">Section</span>
                    <span className="text-xs font-bold text-[#E11D48] line-clamp-1 mt-1">{t.categoryName}</span>
                  </div>
                </div>

                {t.isUsed && t.usedAt && (
                  <p className="text-xs font-semibold text-emerald-700">
                    ✓ Scanned at venue door · {new Date(t.usedAt).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Right Perforated Ticket Stub */}
              <div className="md:col-span-4 border-t md:border-t-0 md:border-l-2 border-dashed border-[#E5E7EB] bg-[#FAFBFD] p-6 flex flex-col justify-center gap-3 relative">
                {/* Circular Boarding-Pass Notches (Desktop) */}
                <span className="hidden md:block w-5 h-5 rounded-full bg-[#F7F8FA] border border-[#E6E8EC] absolute -left-2.5 -top-2.5" />
                <span className="hidden md:block w-5 h-5 rounded-full bg-[#F7F8FA] border border-[#E6E8EC] absolute -left-2.5 -bottom-2.5" />

                <button
                  onClick={() => setActiveQrTicket(t)}
                  className="w-full flex items-center justify-center gap-2 bg-[#E11D48] hover:bg-[#BE123C] text-white px-4 py-3.5 rounded-full text-xs sm:text-sm font-bold shadow-sm shadow-rose-500/20 transition-all cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Show Gate QR</span>
                </button>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => setTransferTicketTarget(t)}
                    disabled={t.isUsed}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full text-xs font-bold border transition-colors ${
                      t.isUsed
                        ? 'bg-[#F1F3F7] border-transparent text-[#9CA3AF] cursor-not-allowed'
                        : 'bg-white hover:bg-[#F7F8FA] text-[#111827] border-[#E6E8EC] cursor-pointer'
                    }`}
                  >
                    {t.isUsed ? <Lock className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5 text-[#E11D48]" />}
                    <span>{t.isUsed ? 'Used' : 'Transfer'}</span>
                  </button>

                  {t.pdfUrl ? (
                    <a
                      href={t.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 bg-white hover:bg-[#F7F8FA] text-[#111827] border border-[#E6E8EC] px-3 py-2.5 rounded-full text-xs font-bold transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-[#4B5563]" />
                      <span>PDF</span>
                    </a>
                  ) : (
                    <span className="flex items-center justify-center bg-[#F1F3F7] text-[#9CA3AF] px-3 py-2.5 rounded-full text-xs font-semibold">
                      No PDF
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rotating Gate QR Modal */}
      {activeQrTicket && (
        <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#E6E8EC] rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center relative shadow-2xl space-y-5">
            <button
              onClick={() => {
                setActiveQrTicket(null);
                setDynamicQrData(null);
              }}
              className="absolute top-4 right-4 text-[#9CA3AF] hover:text-[#111827] p-1.5 rounded-full hover:bg-[#F1F3F7] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 pt-1">
              <span className="inline-block text-xs font-bold text-[#E11D48] bg-[#FFF1F2] px-3 py-1 rounded-full">
                {activeQrTicket.isUsed ? 'Checked-In Ticket' : 'Live Entry Pass'}
              </span>
              <h3 className="font-display text-xl font-extrabold text-[#111827] pt-1">
                {activeQrTicket.eventName}
              </h3>
              <p className="text-xs font-semibold text-[#6B7280]">
                Row {activeQrTicket.rowLabel} · Seat #{activeQrTicket.seatNumber} ({activeQrTicket.categoryName})
              </p>
            </div>

            {dynamicQrData ? (
              <div className="bg-white p-4 rounded-2xl inline-block border-2 border-[#E6E8EC] shadow-sm">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    dynamicQrData.qrPayload
                  )}`}
                  alt="Entry QR Code"
                  className="w-48 h-48"
                />
              </div>
            ) : (
              <div className="w-56 h-56 bg-[#F7F8FA] rounded-2xl mx-auto flex items-center justify-center text-xs font-medium text-[#6B7280] border border-[#E6E8EC]">
                Generating secure QR...
              </div>
            )}

            {!activeQrTicket.isUsed && (
              <div className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 px-3.5 py-1.5 rounded-full">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Refreshes every 30s · Anti-screenshot</span>
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                handleCopyPayload(dynamicQrData ? dynamicQrData.qrPayload : activeQrTicket.ticketCode)
              }
              className="w-full flex items-center justify-between gap-2 font-mono text-[11px] text-[#4B5563] hover:text-[#111827] bg-[#F7F8FA] px-3.5 py-2.5 rounded-xl border border-[#E6E8EC] cursor-pointer"
              title="Copy token for Door Scanner"
            >
              <span className="truncate">
                {dynamicQrData ? dynamicQrData.qrPayload : activeQrTicket.ticketCode}
              </span>
              {copiedToken ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* P2P Pass Transfer Modal */}
      {transferTicketTarget && (
        <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#E6E8EC] rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl space-y-5 text-left">
            <button
              onClick={() => setTransferTicketTarget(null)}
              className="absolute top-4 right-4 text-[#9CA3AF] hover:text-[#111827] p-1.5 rounded-full hover:bg-[#F1F3F7] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="inline-block text-xs font-bold text-[#E11D48] bg-[#FFF1F2] px-3 py-1 rounded-full">
                Send Ticket
              </span>
              <h3 className="font-display text-2xl font-extrabold text-[#111827] pt-1">
                Transfer to a Friend
              </h3>
              <p className="text-xs sm:text-sm text-[#6B7280]">
                Send Row {transferTicketTarget.rowLabel} · Seat #{transferTicketTarget.seatNumber} for{' '}
                <span className="text-[#111827] font-semibold">{transferTicketTarget.eventName}</span>.
              </p>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-2">
                  Friend&apos;s Account Email
                </label>
                <input
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className="w-full bg-[#F7F8FA] border border-[#E6E8EC] focus:border-[#E11D48] focus:bg-white rounded-2xl px-4 py-3 text-[#111827] text-sm outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={transferring || !recipientEmail.trim()}
                className="w-full py-3.5 bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold rounded-full shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 text-sm"
              >
                {transferring ? (
                  <span>Sending Ticket...</span>
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
