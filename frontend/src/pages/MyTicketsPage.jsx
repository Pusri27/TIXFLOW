import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ticketApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Calendar, MapPin, Download, QrCode, X, Send, RefreshCw, CheckCircle2, Lock, ArrowUpRight, Copy, Check } from 'lucide-react';

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
        title: 'Order Confirmed',
        message: 'Your payment is verified. Dynamic QR passes and PDF downloads are ready.',
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
        title: 'Pass Transferred',
        message: `Ownership transferred to ${recipientEmail.trim()}.`,
      });
      setTransferTicketTarget(null);
      setRecipientEmail('');
      fetchTickets();
    } catch (err) {
      console.error(err);
      showToast({
        type: 'error',
        title: 'Transfer Unavailable',
        message: err.response?.data?.message || err.message || 'Checked-in passes cannot be transferred.',
      });
    } finally {
      setTransferring(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#242429] pb-6">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#D4FF00] block mb-1">
            Pass Wallet
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F4F4F0] tracking-tight">
            My Passes
          </h1>
          <p className="text-[#9E9EA8] text-xs sm:text-sm mt-1">
            Present rotating QR codes at the gate, download PDF stubs, or transfer unused passes.
          </p>
        </div>

        {!loading && (
          <span className="font-mono text-xs text-[#9E9EA8] bg-[#121214] border border-[#242429] px-3 py-1.5 rounded-md w-fit">
            {tickets.length} {tickets.length === 1 ? 'active pass' : 'passes'}
          </span>
        )}
      </div>

      {showSuccessBanner && (
        <div className="p-5 bg-[#121214] border border-[#D4FF00]/50 rounded-lg flex items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-9 h-9 rounded bg-[#D4FF00] text-[#0B0B0C] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-[#F4F4F0]">
                Payment Confirmed
              </h3>
              <p className="text-[#9E9EA8] text-xs mt-0.5">
                Your Stripe checkout succeeded. Entry passes and PDF stubs are active below.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSuccessBanner(false)}
            className="text-[#666670] hover:text-[#F4F4F0] p-1.5 rounded hover:bg-[#17171A] cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-7 h-7 border-2 border-[#242429] border-t-[#D4FF00] rounded-full animate-spin mx-auto mb-3" />
          <p className="font-mono text-xs text-[#9E9EA8] uppercase tracking-wider">Loading passes...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20 bg-[#121214] rounded-lg border border-[#242429] px-6 space-y-4">
          <h3 className="font-display text-xl font-bold text-[#F4F4F0]">No Passes Yet</h3>
          <p className="text-[#9E9EA8] text-xs max-w-md mx-auto">
            Confirmed tickets appear here automatically with rotating gate QR tokens and downloadable PDFs.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 bg-[#D4FF00] hover:bg-[#E2FF4D] text-[#0B0B0C] font-bold px-5 py-2.5 rounded-md text-xs transition-colors"
          >
            <span>Browse Events</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {tickets.map((t) => (
            <div
              key={t.id}
              className="bg-[#121214] border border-[#242429] rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-12"
            >
              {/* Left Main Ticket Face */}
              <div className="md:col-span-8 p-6 sm:p-7 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-[#F4F4F0] bg-[#17171A] border border-[#242429] px-2.5 py-0.5 rounded">
                      {t.ticketCode}
                    </span>
                    {t.isUsed ? (
                      <span className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-semibold px-2.5 py-0.5 rounded inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        CHECKED IN
                      </span>
                    ) : (
                      <span className="bg-[#D4FF00] text-[#0B0B0C] font-bold px-2 py-0.5 rounded-sm">
                        VALID PASS
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-display text-2xl font-bold text-[#F4F4F0] tracking-tight">
                    {t.eventName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#9E9EA8] mt-2">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#D4FF00]" />
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
                      <MapPin className="w-3.5 h-3.5 text-[#9E9EA8]" />
                      {t.venueName}
                    </span>
                  </div>
                </div>

                {/* Seat Coordinates Grid */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#242429] font-mono">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#666670] block">Row</span>
                    <span className="text-base font-bold text-[#F4F4F0]">{t.rowLabel}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#666670] block">Seat</span>
                    <span className="text-base font-bold text-[#F4F4F0]">#{t.seatNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#666670] block">Section</span>
                    <span className="text-xs font-semibold text-[#D4FF00]">{t.categoryName}</span>
                  </div>
                </div>

                {t.isUsed && t.usedAt && (
                  <p className="font-mono text-[11px] text-emerald-400">
                    Scanned at gate · {new Date(t.usedAt).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Right Perforated Action Stub */}
              <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-dashed border-[#2E2E36] bg-[#0E0E11] p-6 flex flex-col justify-center gap-2.5">
                <button
                  onClick={() => setActiveQrTicket(t)}
                  className="w-full flex items-center justify-center gap-2 bg-[#D4FF00] hover:bg-[#E2FF4D] text-[#0B0B0C] px-4 py-3 rounded-md text-xs font-bold transition-colors cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Gate QR Code</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTransferTicketTarget(t)}
                    disabled={t.isUsed}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-md text-xs font-semibold border transition-colors ${
                      t.isUsed
                        ? 'bg-[#121214] border-[#1E1E22] text-[#666670] cursor-not-allowed'
                        : 'bg-[#121214] hover:bg-[#17171A] text-[#F4F4F0] border-[#242429] cursor-pointer'
                    }`}
                  >
                    {t.isUsed ? <Lock className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                    <span>{t.isUsed ? 'Used' : 'Transfer'}</span>
                  </button>

                  {t.pdfUrl ? (
                    <a
                      href={t.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 bg-[#121214] hover:bg-[#17171A] text-[#F4F4F0] border border-[#242429] px-3 py-2.5 rounded-md text-xs font-semibold transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </a>
                  ) : (
                    <span className="flex items-center justify-center bg-[#121214] text-[#666670] border border-[#1E1E22] px-3 py-2.5 rounded-md text-xs font-mono">
                      NO PDF
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
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#121214] border border-[#242429] rounded-lg p-6 sm:p-7 max-w-sm w-full text-center relative shadow-2xl space-y-5">
            <button
              onClick={() => {
                setActiveQrTicket(null);
                setDynamicQrData(null);
              }}
              className="absolute top-4 right-4 text-[#666670] hover:text-[#F4F4F0] p-1 rounded hover:bg-[#1E1E22] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 pt-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#D4FF00] block">
                {activeQrTicket.isUsed ? 'Checked-In Pass' : 'Live Entry Token'}
              </span>
              <h3 className="font-display text-xl font-bold text-[#F4F4F0]">
                {activeQrTicket.eventName}
              </h3>
              <p className="font-mono text-xs text-[#9E9EA8]">
                Row {activeQrTicket.rowLabel} · Seat #{activeQrTicket.seatNumber} ({activeQrTicket.categoryName})
              </p>
            </div>

            {dynamicQrData ? (
              <div className="bg-white p-4 rounded-md inline-block border-2 border-[#D4FF00]">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    dynamicQrData.qrPayload
                  )}`}
                  alt="Entry QR Code"
                  className="w-48 h-48"
                />
              </div>
            ) : (
              <div className="w-56 h-56 bg-[#0B0B0C] rounded-md mx-auto flex items-center justify-center font-mono text-xs text-[#9E9EA8] border border-[#242429]">
                Generating token...
              </div>
            )}

            {!activeQrTicket.isUsed && (
              <div className="flex items-center justify-center gap-2 font-mono text-[11px] text-[#D4FF00]">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Rotates every 30s · Screenshots invalid</span>
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                handleCopyPayload(dynamicQrData ? dynamicQrData.qrPayload : activeQrTicket.ticketCode)
              }
              className="w-full flex items-center justify-between gap-2 font-mono text-[11px] text-[#9E9EA8] hover:text-[#F4F4F0] bg-[#0B0B0C] px-3 py-2.5 rounded border border-[#242429] cursor-pointer"
              title="Copy payload for Gate Scanner test"
            >
              <span className="truncate">
                {dynamicQrData ? dynamicQrData.qrPayload : activeQrTicket.ticketCode}
              </span>
              {copiedToken ? (
                <Check className="w-3.5 h-3.5 text-[#D4FF00] shrink-0" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-[#666670] shrink-0" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* P2P Pass Transfer Modal */}
      {transferTicketTarget && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#121214] border border-[#242429] rounded-lg p-6 sm:p-7 max-w-md w-full relative shadow-2xl space-y-5 text-left">
            <button
              onClick={() => setTransferTicketTarget(null)}
              className="absolute top-4 right-4 text-[#666670] hover:text-[#F4F4F0] p-1 rounded hover:bg-[#1E1E22] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#D4FF00] block">
                Pass Transfer
              </span>
              <h3 className="font-display text-2xl font-bold text-[#F4F4F0]">Send Pass to Friend</h3>
              <p className="text-xs text-[#9E9EA8]">
                Transfer Row {transferTicketTarget.rowLabel} · Seat #{transferTicketTarget.seatNumber} for{' '}
                <span className="text-[#F4F4F0] font-medium">{transferTicketTarget.eventName}</span>.
              </p>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#9E9EA8] mb-2">
                  Recipient Account Email
                </label>
                <input
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className="w-full bg-[#0B0B0C] border border-[#242429] focus:border-[#D4FF00] rounded-md px-3.5 py-3 text-[#F4F4F0] text-sm outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={transferring || !recipientEmail.trim()}
                className="w-full py-3 bg-[#D4FF00] hover:bg-[#E2FF4D] text-[#0B0B0C] font-bold rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 text-sm"
              >
                {transferring ? (
                  <span>Transferring...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Transfer Ownership</span>
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
