import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventApi, bookingApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SeatMap from '../components/SeatMap';
import WaitingRoomModal from '../components/WaitingRoomModal';
import { Calendar, MapPin, Ticket, ShieldCheck, AlertCircle, Users, Sparkles, Clock, CheckCircle2 } from 'lucide-react';

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

    // Poll every 15 seconds to sync seat availability (WebSocket not supported on Cloud Run)
    const pollInterval = setInterval(() => {
      fetchSeatMap();
    }, 15000);

    return () => {
      clearInterval(pollInterval);
    };
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
      setErrorMessage('Please select at least 1 seat!');
      return;
    }

    setBookingLoading(true);
    setErrorMessage('');

    try {
      const res = await bookingApi.initiate(Number(id), selectedSeatIds);
      navigate(`/checkout/${res.data.id}`);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to lock seat. Please try another seat.';
      setErrorMessage(msg);
      fetchSeatMap();
    } finally {
      setBookingLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!seatMap || !seatMap.seats) return 0;
    return selectedSeatIds.reduce((sum, seatId) => {
      const seat = seatMap.seats.find((s) => s.id === seatId);
      if (!seat) return sum;
      const cat = (seatMap.categories || []).find((c) => c.id === seat.categoryId);
      return sum + (cat ? cat.price : 0);
    }, 0);
  };

  if (loading || !event) {
    return <div className="text-center py-24 text-slate-400 font-semibold">Loading event experience details...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Event Header Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-1 rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl relative aspect-[3/4]">
          <img src={event.posterUrl} alt={event.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />
        </div>

        <div className="lg:col-span-2 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {event.category}
              </span>

              <button
                onClick={() => setShowQueueModal(true)}
                className="bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 px-3.5 py-1 rounded-full text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Simulate High-Traffic Virtual Queue</span>
              </button>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4 tracking-tight">{event.name}</h1>
            <p className="text-slate-300 text-base leading-relaxed mb-6">{event.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-b border-slate-800/80 py-5">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Calendar className="w-5 h-5 shrink-0" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date & Time</p>
                  <p className="text-sm font-bold text-slate-100">
                    {new Date(event.startTime).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
                  </p>
                </div>
              </div>

              {event.venue && (
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <MapPin className="w-5 h-5 shrink-0" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Venue Location</p>
                    <p className="text-sm font-bold text-slate-100">
                      {event.venue.name}, {event.venue.city}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-4.5 rounded-2xl flex items-center space-x-3 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span>Protected by Redisson Atomic Locks & Dynamic TOTP Anti-Fraud Safeguards</span>
          </div>
        </div>
      </div>

      {/* Seat Selection & Sticky Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-black text-white mb-6 flex items-center space-x-2.5">
            <Ticket className="w-6 h-6 text-blue-400" />
            <span>Interactive Seat Selection</span>
          </h2>
          <SeatMap seatMap={seatMap} selectedSeatIds={selectedSeatIds} onToggleSeat={handleToggleSeat} />
        </div>

        {/* Sticky Booking Drawer */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sticky top-24 space-y-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-4">
              Booking Reservation Summary
            </h3>

            {errorMessage && (
              <div className="bg-rose-500/10 border border-rose-500/40 p-3.5 rounded-2xl text-rose-400 text-xs font-semibold flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Selected Seats ({selectedSeatIds.length})</p>
              {selectedSeatIds.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No seats selected yet. Click any available seat on the map.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedSeatIds.map((seatId) => {
                    const seat = seatMap.seats.find((s) => s.id === seatId);
                    return (
                      <span
                        key={seatId}
                        className="bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                        <span>{seat ? `${seat.rowLabel}-${seat.seatNumber}` : seatId}</span>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-slate-800 pt-4 flex justify-between items-end">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Investment</p>
                <p className="text-3xl font-black text-white mt-1">
                  ${calculateTotal().toLocaleString('en-US')}
                </p>
              </div>
            </div>

            <button
              onClick={handleInitiateBooking}
              disabled={selectedSeatIds.length === 0 || bookingLoading}
              className={`w-full py-4 px-4 rounded-xl font-bold text-base shadow-xl transition-all ${
                selectedSeatIds.length === 0 || bookingLoading
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {bookingLoading ? 'Acquiring Distributed Lock...' : 'Proceed to Instant Checkout'}
            </button>
          </div>
        </div>
      </div>

      {/* Waiting Room Modal */}
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
