import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventApi, bookingApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SeatMap from '../components/SeatMap';
import WaitingRoomModal from '../components/WaitingRoomModal';
import { formatPrice } from '../utils/formatPrice';
import { Calendar, MapPin, AlertCircle, Users, ArrowLeft, ArrowRight, X } from 'lucide-react';

const FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [seatMap, setSeatMap] = useState(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [queueToken, setQueueToken] = useState(null);

  useEffect(() => {
    fetchEventDetails();
    fetchSeatMap();

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
    }
  };

  const fetchSeatMap = async () => {
    try {
      const res = await eventApi.getSeats(id);
      setSeatMap(res.data);
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
    if (!user) {
      navigate('/login');
      return;
    }

    if (selectedSeatIds.length === 0) {
      setErrorMessage('Select at least one seat on the floorplan.');
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

  if (loading || !event) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-20 text-center">
        <div className="w-7 h-7 border-2 border-[#242429] border-t-[#D4FF00] rounded-full animate-spin mx-auto mb-3" />
        <p className="font-mono text-xs text-[#9E9EA8] uppercase tracking-wider">Loading event floorplan...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-10 space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#9E9EA8] hover:text-[#D4FF00] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Events</span>
        </Link>

        <button
          onClick={() => setShowQueueModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#121214] hover:bg-[#17171A] border border-[#242429] text-[11px] font-mono text-[#9E9EA8] hover:text-[#D4FF00] transition-colors cursor-pointer"
        >
          <Users className="w-3.5 h-3.5 text-[#D4FF00]" />
          <span>{queueToken ? 'Queue Verified' : 'Preview Virtual Queue'}</span>
        </button>
      </div>

      {/* Event Editorial Header */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b border-[#242429] pb-10">
        <div className="lg:col-span-4 rounded-lg overflow-hidden border border-[#242429] bg-[#121214] aspect-[16/10] lg:aspect-[4/3]">
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

        <div className="lg:col-span-8 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2.5 font-mono text-[11px] uppercase tracking-wider">
              <span className="bg-[#17171A] border border-[#242429] text-[#D4FF00] px-2.5 py-1 rounded-sm font-semibold">
                {event.category}
              </span>
              <span className="text-[#666670]">Event #{event.id}</span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl font-bold text-[#F4F4F0] leading-[1.05] tracking-tight">
              {event.name}
            </h1>

            <p className="text-[#9E9EA8] text-sm sm:text-base leading-relaxed max-w-3xl">
              {event.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 border-t border-[#242429]">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded bg-[#121214] border border-[#242429] text-[#D4FF00]">
                <Calendar className="w-4 h-4 shrink-0" />
              </div>
              <div>
                <p className="font-mono text-[10px] font-semibold text-[#666670] uppercase tracking-wider">
                  Date &amp; Showtime
                </p>
                <p className="text-sm font-semibold text-[#F4F4F0] mt-0.5">
                  {new Date(event.startTime).toLocaleString('en-US', {
                    weekday: 'long',
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
              <div className="flex items-start gap-3">
                <div className="p-2 rounded bg-[#121214] border border-[#242429] text-[#D4FF00]">
                  <MapPin className="w-4 h-4 shrink-0" />
                </div>
                <div>
                  <p className="font-mono text-[10px] font-semibold text-[#666670] uppercase tracking-wider">
                    Venue
                  </p>
                  <p className="text-sm font-semibold text-[#F4F4F0] mt-0.5">
                    {event.venue.name}, {event.venue.city}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Floorplan & Sticky Order Summary */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#F4F4F0]">
              Select Seats
            </h2>
            <span className="font-mono text-[11px] text-[#666670]">
              Click available seats to add to order
            </span>
          </div>
          <SeatMap seatMap={seatMap} selectedSeatIds={selectedSeatIds} onToggleSeat={handleToggleSeat} />
        </div>

        {/* Sticky Order Summary */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24">
          <div className="bg-[#121214] border border-[#242429] rounded-lg p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#242429] pb-4">
              <h3 className="font-display text-base font-bold text-[#F4F4F0]">Your Selection</h3>
              <span className="font-mono text-xs text-[#9E9EA8]">
                {selectedSeatsInfo.length} {selectedSeatsInfo.length === 1 ? 'ticket' : 'tickets'}
              </span>
            </div>

            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/40 p-3 rounded-md text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {selectedSeatsInfo.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-[#242429] rounded-md px-4">
                <p className="text-xs text-[#9E9EA8]">No seats selected.</p>
                <p className="font-mono text-[11px] text-[#666670] mt-1">
                  Pick any open seat on the venue floorplan.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedSeatsInfo.map((seat) => (
                  <div
                    key={seat.id}
                    className="flex items-center justify-between bg-[#17171A] border border-[#242429] px-3 py-2.5 rounded-md text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-[#0B0B0C] bg-[#D4FF00] px-1.5 py-0.5 rounded-sm text-[11px]">
                        {seat.rowLabel}-{seat.seatNumber}
                      </span>
                      <span className="text-[#9E9EA8] font-medium">{seat.categoryName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-[#F4F4F0]">
                        {formatPrice(seat.price)}
                      </span>
                      <button
                        onClick={() => handleToggleSeat(seat.id)}
                        className="text-[#666670] hover:text-[#F4F4F0] p-0.5 cursor-pointer"
                        title="Remove seat"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-[#242429] pt-4 space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-[#9E9EA8]">
                  Total
                </span>
                <span className="font-display text-2xl sm:text-3xl font-bold text-[#F4F4F0] tabular-nums">
                  {formatPrice(totalAmount)}
                </span>
              </div>

              <button
                onClick={handleInitiateBooking}
                disabled={selectedSeatsInfo.length === 0 || bookingLoading}
                className={`w-full py-3.5 px-4 rounded-md font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                  selectedSeatsInfo.length === 0 || bookingLoading
                    ? 'bg-[#17171A] text-[#666670] border border-[#242429] cursor-not-allowed'
                    : 'bg-[#D4FF00] hover:bg-[#E2FF4D] text-[#0B0B0C] cursor-pointer'
                }`}
              >
                <span>{bookingLoading ? 'Locking Seats...' : 'Continue to Checkout'}</span>
                {!bookingLoading && <ArrowRight className="w-4 h-4" />}
              </button>

              <p className="font-mono text-[11px] text-[#666670] text-center">
                Seats are held exclusively for 10 minutes during checkout.
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
