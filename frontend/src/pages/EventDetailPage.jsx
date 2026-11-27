import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventApi, bookingApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SeatMap from '../components/SeatMap';
import WaitingRoomModal from '../components/WaitingRoomModal';
import { formatPrice } from '../utils/formatPrice';
import { Calendar, MapPin, AlertCircle, Users, ArrowLeft, ArrowRight, X, ShieldCheck, Compass } from 'lucide-react';

const FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [seatMap, setSeatMap] = useState(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [queueToken, setQueueToken] = useState(null);

  useEffect(() => {
    setNotFound(false);
    setLoading(true);
    fetchEventDetails();
    fetchSeatMap();

    // Restore any seats selected right before redirecting a guest to sign in
    try {
      const savedSeats = sessionStorage.getItem(`tixflow_pending_seats_${id}`);
      if (savedSeats) {
        const parsed = JSON.parse(savedSeats);
        if (Array.isArray(parsed)) {
          setSelectedSeatIds(parsed);
        }
        sessionStorage.removeItem(`tixflow_pending_seats_${id}`);
      }
    } catch {
      // Ignore storage parse issues
    }

    const pollInterval = setInterval(() => {
      fetchSeatMap();
    }, 15000);

    return () => clearInterval(pollInterval);
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const res = await eventApi.getById(id);
      setEvent(res.data);
    } catch (err) {
      console.error(err);
      setNotFound(true);
    }
  };

  const fetchSeatMap = async () => {
    try {
      const res = await eventApi.getSeats(id);
      setSeatMap(res.data);
      // Filter out any restored seat IDs that are no longer available
      if (res.data?.seats) {
        const availableSet = new Set(
          res.data.seats
            .filter((s) => s.status === 'AVAILABLE' && !s.isLocked)
            .map((s) => s.id)
        );
        setSelectedSeatIds((prev) => prev.filter((sid) => availableSet.has(sid)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSeat = (seatId) => {
    setErrorMessage('');
    setSelectedSeatIds((prev) =>
      prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId]
    );
  };

  const handleInitiateBooking = async () => {
    if (selectedSeatIds.length === 0) {
      setErrorMessage('Please choose at least one seat on the stadium map.');
      return;
    }

    if (!user) {
      try {
        sessionStorage.setItem(`tixflow_pending_seats_${id}`, JSON.stringify(selectedSeatIds));
      } catch {
        // Ignore storage errors
      }
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }

    setBookingLoading(true);
    setErrorMessage('');

    try {
      const res = await bookingApi.initiate(Number(id), selectedSeatIds);
      navigate(`/checkout/${res.data.id}`);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Unable to hold selected seats. Please try another seat.';
      setErrorMessage(msg);
      fetchSeatMap();
    } finally {
      setBookingLoading(false);
    }
  };

  const getSeatDetails = (seatId) => {
    if (!seatMap || !seatMap.seats) return null;
    const seat = seatMap.seats.find((s) => s.id === seatId);
    if (!seat) return null;
    const cat = (seatMap.categories || []).find((c) => c.id === seat.categoryId);
    return {
      ...seat,
      categoryName: cat?.name || 'Standard',
      price: cat?.price || 0,
    };
  };

  const selectedSeatsInfo = selectedSeatIds.map(getSeatDetails).filter(Boolean);
  const totalAmount = selectedSeatsInfo.reduce((sum, item) => sum + item.price, 0);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-24 text-center">
        <div className="w-8 h-8 border-3 border-[#E6E8EC] border-t-[#E11D48] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-[#6B7280]">Loading event &amp; stadium seating...</p>
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="market-card rounded-3xl p-8 sm:p-10 space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF1F2] text-[#E11D48] flex items-center justify-center mx-auto">
            <Compass className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <span className="inline-block text-xs font-bold text-[#E11D48] bg-[#FFF1F2] px-3 py-1 rounded-full">
              Event Unavailable
            </span>
            <h1 className="font-display text-2xl font-extrabold text-[#111827]">
              Event Not Found
            </h1>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              This event may have ended or been removed from the schedule. Check out our upcoming live experiences instead.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold px-6 py-3 rounded-full text-sm shadow-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse Upcoming Events</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-10 space-y-8">
      {/* Top Navigation Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#4B5563] hover:text-[#E11D48] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events</span>
        </Link>

        <button
          onClick={() => setShowQueueModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-[#FFF1F2] border border-[#E6E8EC] hover:border-rose-200 text-xs font-semibold text-[#4B5563] hover:text-[#E11D48] shadow-2xs transition-all cursor-pointer"
        >
          <Users className="w-3.5 h-3.5 text-[#E11D48]" />
          <span>{queueToken ? 'Queue Access Verified' : 'Preview Virtual Waiting Room'}</span>
        </button>
      </div>

      {/* Bright Event Overview Card */}
      <section className="market-card rounded-3xl p-5 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          <div className="lg:col-span-5 rounded-2xl overflow-hidden bg-[#F1F3F7] aspect-[16/10]">
            <img
              src={event.posterUrl || FALLBACK_POSTER}
              alt={event.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = FALLBACK_POSTER;
              }}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="lg:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#FFF1F2] text-[#E11D48] px-3.5 py-1 rounded-full text-xs font-bold">
                {event.category}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Official Tickets
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#111827] leading-tight">
              {event.name}
            </h1>

            <p className="text-[#4B5563] text-sm sm:text-base leading-relaxed">
              {event.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-3 bg-[#F7F8FA] border border-[#E6E8EC] p-3.5 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-[#FFF1F2] text-[#E11D48] flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#6B7280]">Date &amp; Time</p>
                  <p className="text-sm font-bold text-[#111827]">
                    {new Date(event.startTime).toLocaleString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {event.venue && (
                <div className="flex items-center gap-3 bg-[#F7F8FA] border border-[#E6E8EC] p-3.5 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF1F2] text-[#E11D48] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#6B7280]">Venue</p>
                    <p className="text-sm font-bold text-[#111827] leading-snug">
                      {`${event.venue.name}, ${event.venue.city}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Curved Stadium Map & Sticky Checkout Card */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-4">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-[#111827]">
              Choose Your Seats
            </h2>
            <p className="text-sm text-[#6B7280]">
              Seats curve around the main stage so you can compare sections and prices easily.
            </p>
          </div>
          <SeatMap seatMap={seatMap} selectedSeatIds={selectedSeatIds} onToggleSeat={handleToggleSeat} />
        </div>

        {/* Sticky Order Summary */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24">
          <div className="market-card rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#F1F3F7] pb-4">
              <h3 className="font-display text-lg font-extrabold text-[#111827]">Your Tickets</h3>
              <span className="text-xs font-bold bg-[#F1F3F7] text-[#4B5563] px-3 py-1 rounded-full">
                {selectedSeatsInfo.length} selected
              </span>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 p-3.5 rounded-2xl text-red-700 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {selectedSeatsInfo.length === 0 ? (
              <div className="py-8 text-center bg-[#F7F8FA] border border-dashed border-[#D1D5DB] rounded-2xl px-4">
                <p className="text-sm font-semibold text-[#374151]">No seats selected yet</p>
                <p className="text-xs text-[#6B7280] mt-1">
                  Click any open circle on the seating map to add tickets.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {selectedSeatsInfo.map((seat) => (
                  <div
                    key={seat.id}
                    className="flex items-center justify-between bg-[#F7F8FA] border border-[#E6E8EC] px-3.5 py-2.5 rounded-2xl text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-white bg-[#E11D48] px-2.5 py-1 rounded-full">
                        {seat.rowLabel}-{seat.seatNumber}
                      </span>
                      <span className="text-[#374151] font-semibold">{seat.categoryName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#111827]">
                        {formatPrice(seat.price)}
                      </span>
                      <button
                        onClick={() => handleToggleSeat(seat.id)}
                        className="text-[#9CA3AF] hover:text-[#E11D48] p-1 rounded-full hover:bg-white cursor-pointer"
                        aria-label={`Remove seat ${seat.rowLabel}-${seat.seatNumber}`}
                        title="Remove seat"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-[#F1F3F7] pt-4 space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-[#6B7280]">Subtotal</span>
                <span className="font-display text-2xl sm:text-3xl font-extrabold text-[#111827]">
                  {formatPrice(totalAmount)}
                </span>
              </div>

              <button
                onClick={handleInitiateBooking}
                disabled={selectedSeatsInfo.length === 0 || bookingLoading}
                className={`w-full py-4 px-5 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  selectedSeatsInfo.length === 0 || bookingLoading
                    ? 'bg-[#F1F3F7] text-[#9CA3AF] cursor-not-allowed'
                    : 'bg-[#E11D48] hover:bg-[#BE123C] text-white shadow-md shadow-rose-500/25 cursor-pointer'
                }`}
              >
                <span>{bookingLoading ? 'Reserving Your Seats...' : 'Continue to Checkout'}</span>
                {!bookingLoading && <ArrowRight className="w-4 h-4" />}
              </button>

              <p className="text-xs text-[#6B7280] text-center">
                We&apos;ll hold your seats for 10 minutes while you complete payment.
              </p>
            </div>
          </div>
        </aside>
      </section>

      {showQueueModal && (
        <WaitingRoomModal
          eventId={id}
          onTokenGranted={(token) => {
            setQueueToken(token);
            setShowQueueModal(false);
          }}
          onClose={() => setShowQueueModal(false)}
        />
      )}
    </div>
  );
}
