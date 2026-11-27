import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/formatPrice';
import { Clock, CreditCard, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, Copy, Check } from 'lucide-react';

const TEST_CARDS = [
  { label: 'Visa — Instant Approval', note: 'Payment succeeds', number: '4242 4242 4242 4242', tone: 'text-emerald-600' },
  { label: 'Mastercard — Instant Approval', note: 'Payment succeeds', number: '5555 5555 5555 4444', tone: 'text-emerald-600' },
  { label: '3D Secure OTP Card', note: 'Triggers OTP check', number: '4000 0000 0000 3020', tone: 'text-amber-600' },
  { label: 'Declined Test Card', note: 'Simulates bank decline', number: '4000 0000 0000 0002', tone: 'text-rose-600' },
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
        <div className="w-8 h-8 border-3 border-[#E6E8EC] border-t-[#E11D48] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-[#6B7280]">Preparing your checkout...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-12">
      {!paymentDone ? (
        <div className="space-y-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#4B5563] hover:text-[#E11D48] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Seat Map</span>
          </button>

          {/* Seat Hold Timer Banner */}
          <div
            className={`border rounded-2xl p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              timeLeft < 60
                ? 'bg-red-50 border-red-200'
                : 'bg-[#FFFBEB] border-amber-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'
                }`}
              >
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#4B5563]">Seats reserved for you</p>
                <p
                  className={`font-display text-2xl font-extrabold tabular-nums leading-tight ${
                    timeLeft < 60 ? 'text-red-600' : 'text-amber-900'
                  }`}
                >
                  {formatTimer(timeLeft)}
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#4B5563]">
              Complete payment before the timer runs out to keep these exact seats.
            </p>
          </div>

          {(timeLeft === 0 || expiredError) && (
            <div className="bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>
                  {expiredError
                    ? `${expiredError}. Please return to the stadium map and pick seats again.`
                    : 'Your seat hold has expired.'}
                </span>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="shrink-0 bg-white hover:bg-red-100 border border-red-200 text-red-700 px-4 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer"
              >
                Choose Seats Again
              </button>
            </div>
          )}

          {/* Main Checkout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Order Summary */}
            <div className="lg:col-span-7 market-card rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="border-b border-[#F1F3F7] pb-4 flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-[#6B7280] block">Order Summary</span>
                  <h1 className="font-display text-2xl font-extrabold text-[#111827] mt-0.5">
                    {booking.eventName}
                  </h1>
                </div>
                <span className="font-mono text-xs font-semibold text-[#E11D48] bg-[#FFF1F2] px-3 py-1 rounded-full shrink-0">
                  {booking.bookingCode}
                </span>
              </div>

              <div className="space-y-2.5">
                <span className="text-xs font-bold text-[#4B5563] block">
                  Selected Seats ({(booking.items || []).length})
                </span>
                <div className="divide-y divide-[#E6E8EC] border border-[#E6E8EC] rounded-2xl bg-[#F7F8FA]">
                  {(booking.items || []).map((item) => (
                    <div key={item.id} className="flex justify-between items-center px-4 py-3.5 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-white bg-[#111827] px-2.5 py-0.5 rounded-full text-xs">
                          {item.rowLabel}-{item.seatNumber}
                        </span>
                        <span className="text-[#111827] font-medium">{item.categoryName}</span>
                      </div>
                      <span className="font-bold text-[#111827]">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#F1F3F7] pt-5 flex items-baseline justify-between">
                <span className="text-sm font-semibold text-[#4B5563]">Total Payment</span>
                <span className="font-display text-2xl sm:text-3xl font-extrabold text-[#111827] tabular-nums">
                  {formatPrice(booking.totalAmount)}
                </span>
              </div>

              <button
                onClick={handlePayNow}
                disabled={paying || timeLeft === 0}
                className="w-full py-4 bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold rounded-full shadow-md shadow-rose-500/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                {paying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Connecting to Stripe Checkout...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay {formatPrice(booking.totalAmount)} with Stripe</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Sandbox Test Cards Helper */}
            <div className="lg:col-span-5 market-card rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#F1F3F7] pb-3">
                <span className="font-display text-base font-bold text-[#111827]">
                  Stripe Sandbox Cards
                </span>
                <span className="text-[11px] font-bold text-[#E11D48] bg-[#FFF1F2] px-2.5 py-0.5 rounded-full">
                  Demo Mode
                </span>
              </div>

              <p className="text-xs text-[#6B7280] leading-relaxed">
                Tap any test card below to copy it for <span className="font-semibold text-[#111827]">checkout.stripe.com</span>. Enter any future expiry (like <span className="font-semibold text-[#111827]">12/29</span>) and CVC <span className="font-semibold text-[#111827]">123</span>.
              </p>

              <div className="space-y-2">
                {TEST_CARDS.map((card) => {
                  const isCopied = copiedCard === card.number;
                  return (
                    <button
                      key={card.number}
                      type="button"
                      onClick={() => handleCopyCard(card.number)}
                      className="w-full text-left flex items-center justify-between bg-[#F7F8FA] hover:bg-[#F1F3F7] border border-[#E6E8EC] px-3.5 py-2.5 rounded-2xl transition-colors cursor-pointer group"
                    >
                      <div>
                        <span className="text-xs font-bold text-[#111827] block">{card.label}</span>
                        <span className={`text-[11px] font-medium ${card.tone}`}>{card.note}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-xs font-semibold text-[#111827] bg-white border border-[#E6E8EC] px-2.5 py-1 rounded-lg shadow-2xs">
                        <span>{card.number}</span>
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-[#9CA3AF] group-hover:text-[#E11D48]" />
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
        <div className="market-card rounded-3xl p-8 sm:p-10 max-w-xl mx-auto space-y-6 text-center">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Booking Confirmed
            </span>
            <h2 className="font-display text-3xl font-extrabold text-[#111827]">
              You&apos;re Going!
            </h2>
            <p className="text-[#4B5563] text-sm">
              Your tickets for <span className="text-[#111827] font-bold">{booking.eventName}</span> are ready in your wallet.
            </p>
          </div>

          <div className="bg-[#F7F8FA] border border-[#E6E8EC] p-4 rounded-2xl text-xs space-y-2.5 text-left">
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Booking Reference</span>
              <span className="font-mono font-bold text-[#111827]">{booking.bookingCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Payment Status</span>
              <span className="font-bold text-emerald-600">Paid via Stripe</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#E6E8EC]">
              <span className="text-[#6B7280]">Total Paid</span>
              <span className="font-bold text-[#111827]">{formatPrice(booking.totalAmount)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/my-tickets')}
            className="w-full py-4 bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold rounded-full shadow-md shadow-rose-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <span>View My Tickets</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
