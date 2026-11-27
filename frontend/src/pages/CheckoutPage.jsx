import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Clock, CreditCard, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, Copy, Check } from 'lucide-react';

const TEST_CARDS = [
  { label: 'Visa — Standard Approval', note: ' Instant success', number: '4242 4242 4242 4242', tone: 'text-[#D4FF00]' },
  { label: 'Mastercard — Standard Approval', note: 'Instant success', number: '5555 5555 5555 4444', tone: 'text-[#D4FF00]' },
  { label: '3D Secure Challenge', note: 'OTP verification', number: '4000 0000 0000 3020', tone: 'text-amber-400' },
  { label: 'Declined Card', note: 'Simulates bank decline', number: '4000 0000 0000 0002', tone: 'text-red-400' },
];

export default function CheckoutPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [expiredError, setExpiredError] = useState(null);
  const [copiedCard, setCopiedCard] = useState(null);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  useEffect(() => {
    if (!booking || paymentDone) return;

    if (booking.status === 'CONFIRMED') {
      setPaymentDone(true);
      return;
    }

    if (booking.expiresAt) {
      let dateStr = String(booking.expiresAt);
      if (!dateStr.endsWith('Z') && !dateStr.includes('+')) {
        dateStr += 'Z';
      }
      const expTime = new Date(dateStr).getTime();
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((expTime - now) / 1000));
      setTimeLeft(diffSec);

      if (diffSec <= 0) {
        setExpiredError('Seat hold expired');
      }
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setExpiredError('Seat hold expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [booking, paymentDone]);

  const fetchBooking = async () => {
    try {
      const res = await bookingApi.getMyBookings();
      const list = Array.isArray(res.data) ? res.data : [];
      const found = list.find((b) => String(b.id) === String(id));

      if (found) {
        setBooking(found);
        if (found.status === 'CONFIRMED') {
          setPaymentDone(true);
        }
      } else {
        setBooking(list[0] || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async () => {
    setPaying(true);
    try {
      const res = await bookingApi.createCheckoutSession(id);
      if (res.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
        return;
      }
    } catch (err) {
      console.error('Stripe checkout error:', err);
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.message;
      if (status === 409 || status === 400) {
        setExpiredError(msg || 'Reservation window expired. Please select seats again.');
        setTimeLeft(0);
      } else {
        showToast({
          type: 'error',
          title: 'Payment Error',
          message: msg,
        });
      }
    } finally {
      setPaying(false);
    }
  };

  const handleCopyCard = (number) => {
    navigator.clipboard?.writeText(number.replace(/\s+/g, ''));
    setCopiedCard(number);
    setTimeout(() => setCopiedCard(null), 1800);
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (loading || !booking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="w-7 h-7 border-2 border-[#242429] border-t-[#D4FF00] rounded-full animate-spin mx-auto mb-3" />
        <p className="font-mono text-xs text-[#9E9EA8] uppercase tracking-wider">Preparing order summary...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 sm:py-12">
      {!paymentDone ? (
        <div className="space-y-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#9E9EA8] hover:text-[#D4FF00] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Floorplan</span>
          </button>

          {/* Hold Countdown Strip */}
          <div
            className={`border rounded-lg p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              timeLeft < 60
                ? 'bg-red-500/10 border-red-500/40'
                : 'bg-[#121214] border-[#242429]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Clock className={`w-5 h-5 ${timeLeft < 60 ? 'text-red-400' : 'text-[#D4FF00]'}`} />
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#9E9EA8]">
                  Seats Held For
                </p>
                <p
                  className={`font-mono text-2xl font-bold tabular-nums leading-tight ${
                    timeLeft < 60 ? 'text-red-400' : 'text-[#F4F4F0]'
                  }`}
                >
                  {formatTimer(timeLeft)}
                </p>
              </div>
            </div>
            <p className="text-xs text-[#9E9EA8]">
              Complete checkout before the timer expires to keep your seats.
            </p>
          </div>

          {(timeLeft === 0 || expiredError) && (
            <div className="bg-red-500/10 border border-red-500/40 text-red-200 text-xs p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>
                  {expiredError
                    ? `${expiredError}. Please return to the floorplan and pick available seats.`
                    : 'Your seat hold has expired.'}
                </span>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="shrink-0 bg-[#121214] hover:bg-[#17171A] border border-red-500/40 text-[#F4F4F0] px-3.5 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer"
              >
                Select Seats Again
              </button>
            </div>
          )}

          {/* Main Checkout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Order Summary */}
            <div className="lg:col-span-7 bg-[#121214] border border-[#242429] rounded-lg p-6 sm:p-8 space-y-6">
              <div className="border-b border-[#242429] pb-4 flex items-baseline justify-between gap-4">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#666670] block">
                    Order Review
                  </span>
                  <h1 className="font-display text-2xl font-bold text-[#F4F4F0] mt-0.5">
                    {booking.eventName}
                  </h1>
                </div>
                <span className="font-mono text-xs text-[#D4FF00] bg-[#17171A] border border-[#242429] px-2.5 py-1 rounded">
                  {booking.bookingCode}
                </span>
              </div>

              <div className="space-y-2.5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#666670] block">
                  Tickets ({(booking.items || []).length})
                </span>
                <div className="divide-y divide-[#242429] border border-[#242429] rounded-md bg-[#0B0B0C]">
                  {(booking.items || []).map((item) => (
                    <div key={item.id} className="flex justify-between items-center px-4 py-3 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-[#0B0B0C] bg-[#D4FF00] px-1.5 py-0.5 rounded-sm">
                          {item.rowLabel}-{item.seatNumber}
                        </span>
                        <span className="text-[#F4F4F0] font-medium">{item.categoryName}</span>
                      </div>
                      <span className="font-mono font-semibold text-[#F4F4F0]">
                        ${item.price?.toLocaleString('en-US')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#242429] pt-5 flex items-baseline justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-[#9E9EA8]">
                  Total Due
                </span>
                <span className="font-display text-3xl font-bold text-[#F4F4F0] tabular-nums">
                  ${booking.totalAmount?.toLocaleString('en-US')}
                </span>
              </div>

              <button
                onClick={handlePayNow}
                disabled={paying || timeLeft === 0}
                className="w-full py-4 bg-[#D4FF00] hover:bg-[#E2FF4D] text-[#0B0B0C] font-bold rounded-md transition-colors flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                {paying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#0B0B0C]/30 border-t-[#0B0B0C] rounded-full animate-spin" />
                    <span>Redirecting to Stripe...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay ${booking.totalAmount?.toLocaleString('en-US')} with Stripe</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Sandbox Test Cards Helper */}
            <div className="lg:col-span-5 bg-[#121214] border border-[#242429] rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#242429] pb-3">
                <span className="font-mono text-xs font-semibold text-[#F4F4F0] uppercase tracking-wider">
                  Stripe Sandbox Cards
                </span>
                <span className="font-mono text-[10px] text-[#D4FF00] border border-[#D4FF00]/40 px-2 py-0.5 rounded-sm">
                  TEST MODE
                </span>
              </div>

              <p className="text-xs text-[#9E9EA8] leading-relaxed">
                Click any card number to copy for <span className="font-mono text-[#F4F4F0]">checkout.stripe.com</span>. Use any future expiry (<span className="font-mono text-[#F4F4F0]">12/29</span>) and CVC <span className="font-mono text-[#F4F4F0]">123</span>.
              </p>

              <div className="space-y-2">
                {TEST_CARDS.map((card) => {
                  const isCopied = copiedCard === card.number;
                  return (
                    <button
                      key={card.number}
                      type="button"
                      onClick={() => handleCopyCard(card.number)}
                      className="w-full text-left flex items-center justify-between bg-[#0B0B0C] hover:bg-[#17171A] border border-[#242429] px-3 py-2.5 rounded-md transition-colors cursor-pointer group"
                    >
                      <div>
                        <span className="text-xs font-medium text-[#F4F4F0] block">{card.label}</span>
                        <span className={`font-mono text-[10px] ${card.tone}`}>{card.note}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-xs text-[#F4F4F0] bg-[#121214] border border-[#242429] px-2 py-1 rounded">
                        <span>{card.number}</span>
                        {isCopied ? (
                          <Check className="w-3 h-3 text-[#D4FF00]" />
                        ) : (
                          <Copy className="w-3 h-3 text-[#666670] group-hover:text-[#D4FF00]" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Confirmed Receipt */
        <div className="bg-[#121214] border border-[#242429] rounded-lg p-8 sm:p-10 max-w-xl mx-auto space-y-6">
          <div className="w-12 h-12 bg-[#D4FF00] text-[#0B0B0C] rounded-md flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#D4FF00]">
              Order Confirmed
            </span>
            <h2 className="font-display text-3xl font-bold text-[#F4F4F0]">
              Passes Ready
            </h2>
            <p className="text-[#9E9EA8] text-sm">
              Your seats for <span className="text-[#F4F4F0] font-semibold">{booking.eventName}</span> are locked in and mobile QR passes have been issued.
            </p>
          </div>

          <div className="bg-[#0B0B0C] border border-[#242429] p-4 rounded-md font-mono text-xs space-y-2.5">
            <div className="flex justify-between">
              <span className="text-[#666670]">Reference</span>
              <span className="text-[#D4FF00] font-semibold">{booking.bookingCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#666670]">Status</span>
              <span className="text-[#F4F4F0]">PAID · STRIPE</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#242429]">
              <span className="text-[#666670]">Amount Paid</span>
              <span className="text-[#F4F4F0] font-bold">${booking.totalAmount?.toLocaleString('en-US')}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/my-tickets')}
            className="w-full py-3.5 bg-[#D4FF00] hover:bg-[#E2FF4D] text-[#0B0B0C] font-bold rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <span>Open My Passes</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
