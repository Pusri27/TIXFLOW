import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingApi } from '../services/api';
import { Clock, CreditCard, CheckCircle2, ShieldCheck, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';

export default function CheckoutPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [expiredError, setExpiredError] = useState(null);

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
        setExpiredError('Reservation time expired');
      }
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setExpiredError('Reservation time expired');
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
        const resList = await bookingApi.getMyBookings();
        setBooking(resList.data?.[0] || null);
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
        setExpiredError(msg || 'Reservation time expired. Please pick seats again.');
        setTimeLeft(0);
      } else {
        alert('Payment failed: ' + msg);
      }
    } finally {
      setPaying(false);
    }
  };

  const handleSimulateStripePayment = async () => {
    setPaying(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const res = await bookingApi.confirm(id, 'STRIPE');
      setBooking(res.data);
      setPaymentDone(true);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.message;
      if (status === 409 || status === 400) {
        setExpiredError(msg || 'Reservation time expired. Please pick seats again.');
        setTimeLeft(0);
      } else {
        alert('Payment execution failed: ' + msg);
      }
    } finally {
      setPaying(false);
    }
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (loading || !booking) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 font-semibold text-sm">Loading secure payment portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {!paymentDone ? (
        <div className="bg-[#0d0e15] border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          {/* Countdown Header */}
          <div className={`border rounded-2xl p-4 mb-8 flex items-center justify-between ${
            timeLeft < 60
              ? 'bg-rose-500/10 border-rose-500/30'
              : 'bg-amber-500/10 border-amber-500/30'
          }`}>
            <div className="flex items-center space-x-3">
              <Clock className={`w-5 h-5 animate-pulse ${timeLeft < 60 ? 'text-rose-400' : 'text-amber-400'}`} />
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${timeLeft < 60 ? 'text-rose-300' : 'text-amber-300'}`}>
                  Complete Payment Within
                </p>
                <p className={`text-3xl font-black tracking-tight tabular-nums ${timeLeft < 60 ? 'text-rose-400' : 'text-amber-400'}`}>
                  {formatTimer(timeLeft)}
                </p>
              </div>
            </div>
            <span className="text-xs text-zinc-400 font-medium max-w-xs text-right hidden sm:block">
              Your selected seats are atomically locked in Redis until the countdown expires.
            </span>
          </div>

          {(timeLeft === 0 || expiredError) && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm p-4 rounded-2xl mb-6 flex items-center justify-between space-x-3">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                <span className="font-semibold">
                  {expiredError
                    ? `Booking error: ${expiredError}`
                    : 'Your seat reservation has expired. Please go back and select seats again.'}
                </span>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="shrink-0 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                ← Pick Seats Again
              </button>
            </div>
          )}

          <h1 className="text-3xl font-black text-white mb-6 tracking-tight">Checkout &amp; Payment Gate</h1>

          <div className="space-y-5 mb-8 border-b border-white/[0.08] pb-8">
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-400 font-medium">Reservation Code:</span>
              <span className="font-mono font-bold text-indigo-400 text-base">{booking.bookingCode}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-400 font-medium">Event Title:</span>
              <span className="font-bold text-zinc-100">{booking.eventName}</span>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Reserved Seats</p>
              <div className="space-y-2.5">
                {(booking.items || []).map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center bg-[#131522] p-3.5 rounded-2xl border border-white/[0.08] text-sm"
                  >
                    <span className="font-bold text-zinc-200">
                      Row {item.rowLabel} — Seat #{item.seatNumber} ({item.categoryName})
                    </span>
                    <span className="font-black text-white">
                      ${item.price?.toLocaleString('en-US')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/[0.08]">
              <span className="text-base font-bold text-zinc-300">Total Amount:</span>
              <span className="text-3xl font-black text-white">
                ${booking.totalAmount?.toLocaleString('en-US')}
              </span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-5">
            {/* Primary — Official Stripe Hosted Checkout */}
            <button
              onClick={handlePayNow}
              disabled={paying || timeLeft === 0}
              className="w-full py-4.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-black rounded-2xl shadow-2xl shadow-indigo-600/40 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-3 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-base border border-indigo-400/30"
            >
              {paying ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Connecting to Official Stripe Gateway...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-6 h-6 text-white" />
                  <span>Pay via Official Stripe Checkout (${booking.totalAmount?.toLocaleString('en-US')})</span>
                </>
              )}
            </button>

            {/* Stripe Test Cards Grid */}
            <div className="bg-[#131522] border border-white/[0.08] rounded-2xl p-5 text-xs text-zinc-400 space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-zinc-200">Official Stripe Test Cards (Sandbox Mode)</span>
                </div>
                <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                  TEST NETWORK
                </span>
              </div>

              <p className="text-[11px] text-zinc-400">
                Use the following official Stripe test card numbers on <span className="text-zinc-200 font-mono">checkout.stripe.com</span>. Enter any future expiry date (e.g. <span className="text-zinc-200 font-mono">12/28</span>) &amp; CVC <span className="text-zinc-200 font-mono">123</span>.
              </p>

              <div className="space-y-2">
                <div className="flex justify-between items-center bg-[#0d0e15] border border-white/[0.06] p-2.5 rounded-xl">
                  <div>
                    <span className="text-white font-bold text-xs block">Visa (Standard Success)</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">✓ Payment Success</span>
                  </div>
                  <span className="font-mono font-bold text-white bg-white/5 px-2 py-1 rounded border border-white/10 text-xs">
                    4242 4242 4242 4242
                  </span>
                </div>

                <div className="flex justify-between items-center bg-[#0d0e15] border border-white/[0.06] p-2.5 rounded-xl">
                  <div>
                    <span className="text-white font-bold text-xs block">Mastercard (Success)</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">✓ Payment Success</span>
                  </div>
                  <span className="font-mono font-bold text-white bg-white/5 px-2 py-1 rounded border border-white/10 text-xs">
                    5555 5555 5555 4444
                  </span>
                </div>

                <div className="flex justify-between items-center bg-[#0d0e15] border border-white/[0.06] p-2.5 rounded-xl">
                  <div>
                    <span className="text-white font-bold text-xs block">American Express (Success)</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">✓ Payment Success</span>
                  </div>
                  <span className="font-mono font-bold text-white bg-white/5 px-2 py-1 rounded border border-white/10 text-xs">
                    3782 822463 10005
                  </span>
                </div>

                <div className="flex justify-between items-center bg-[#0d0e15] border border-white/[0.06] p-2.5 rounded-xl">
                  <div>
                    <span className="text-white font-bold text-xs block">3D Secure OTP Authentication</span>
                    <span className="text-[10px] text-amber-400 font-semibold">⚡ 3DS OTP Authentication</span>
                  </div>
                  <span className="font-mono font-bold text-white bg-white/5 px-2 py-1 rounded border border-white/10 text-xs">
                    4000 0000 0000 3020
                  </span>
                </div>

                <div className="flex justify-between items-center bg-[#0d0e15] border border-white/[0.06] p-2.5 rounded-xl">
                  <div>
                    <span className="text-white font-bold text-xs block">Card Declined (Test Failure)</span>
                    <span className="text-[10px] text-rose-400 font-semibold">✕ Bank Declined</span>
                  </div>
                  <span className="font-mono font-bold text-white bg-white/5 px-2 py-1 rounded border border-white/10 text-xs">
                    4000 0000 0000 0002
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Payment Success Screen */
        <div className="bg-[#0d0e15] border border-emerald-500/30 rounded-3xl p-10 shadow-2xl text-center max-w-xl mx-auto space-y-6">
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Payment Verified &amp; Confirmed!</h2>
            <p className="text-zinc-400 text-sm mt-2">
              Your ticket reservation for <span className="text-white font-bold">{booking.eventName}</span> has been confirmed. PDF passes are generated.
            </p>
          </div>

          <div className="bg-[#131522] border border-white/[0.08] p-4 rounded-2xl text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-zinc-400">Booking Code:</span>
              <span className="font-mono font-bold text-indigo-400">{booking.bookingCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Status:</span>
              <span className="font-bold text-emerald-400">CONFIRMED (Paid via Stripe)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Total Paid:</span>
              <span className="font-bold text-white">${booking.totalAmount?.toLocaleString('en-US')}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/my-tickets')}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer text-sm"
          >
            <span>View Purchased Tickets in My Wallet</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
