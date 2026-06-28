import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { TrendingUp, Users, DollarSign, UserCheck, ArrowLeft, BarChart3, PieChart, Sparkles, Music, ChevronDown } from 'lucide-react';
import { organizerApi, eventApi } from '../services/api';

export default function OrganizerDashboardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [eventsList, setEventsList] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(id ? Number(id) : null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchAnalytics(selectedEventId);
    }
  }, [selectedEventId]);

  const fetchAllEvents = async () => {
    try {
      const res = await eventApi.getAll();
      const list = res.data || [];
      setEventsList(list);
      if (!selectedEventId && list.length > 0) {
        setSelectedEventId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch events list', err);
    }
  };

  const fetchAnalytics = async (eventId) => {
    setLoading(true);
    try {
      const res = await organizerApi.getAnalytics(eventId);
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <Link to="/" className="flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors text-sm font-bold">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discovery</span>
        </Link>
        <div className="flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 px-3.5 py-1.5 rounded-full text-xs text-indigo-300 font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Organizer Performance Telemetry</span>
        </div>
      </div>

      {/* Concert Selector Header */}
      <div className="bg-[#0d0e15] border border-white/10 rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 block mb-1">Select Event Telemetry</span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Concert Revenue &amp; Occupancy Dashboard</h1>
          </div>

          {/* Event Dropdown */}
          <div className="relative min-w-[280px]">
            <select
              value={selectedEventId || ''}
              onChange={(e) => {
                const newId = Number(e.target.value);
                setSelectedEventId(newId);
                navigate(`/organizer/analytics/${newId}`);
              }}
              className="w-full bg-[#131522] border border-white/10 focus:border-indigo-500 text-white font-bold text-sm px-4 py-3 rounded-2xl outline-none cursor-pointer appearance-none pr-10"
            >
              {eventsList.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.name} ({evt.category})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-4 top-4 pointer-events-none" />
          </div>
        </div>

        {/* Quick Concert Pill Switcher */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/[0.08]">
          {eventsList.map((evt) => (
            <button
              key={evt.id}
              onClick={() => {
                setSelectedEventId(evt.id);
                navigate(`/organizer/analytics/${evt.id}`);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                selectedEventId === evt.id
                  ? 'bg-white text-black shadow-lg'
                  : 'bg-[#131522] text-zinc-400 hover:text-white border border-white/10'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span className="truncate max-w-[150px]">{evt.name}</span>
            </button>
          ))}
        </div>
      </div>

      {loading || !analytics ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-zinc-400 font-semibold text-sm">Loading telemetry metrics...</p>
          </div>
        </div>
      ) : (
        <>
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">{analytics.eventName}</h2>
          <p className="text-zinc-400 text-sm mb-8">Real-time revenue metrics, occupancy rates, and gatekeeper check-in statistics.</p>

          {/* Stat Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-[#0d0e15] border border-white/10 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Gross Revenue</span>
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black text-white tracking-tight">
                ${(analytics.totalRevenue || 0).toLocaleString('en-US')}
              </p>
              <span className="text-xs text-emerald-400 mt-2 font-bold flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Confirmed Sales</span>
              </span>
            </div>

            <div className="bg-[#0d0e15] border border-white/10 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Seat Occupancy</span>
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
                  <PieChart className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black text-white tracking-tight">{analytics.occupancyRatePercent}%</p>
              <div className="w-full bg-[#131522] h-2.5 rounded-full mt-3 overflow-hidden border border-white/10">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full" style={{ width: `${analytics.occupancyRatePercent}%` }} />
              </div>
            </div>

            <div className="bg-[#0d0e15] border border-white/10 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Seats Reserved</span>
                <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black text-white tracking-tight">
                {analytics.bookedSeats} / {analytics.totalCapacity}
              </p>
              <span className="text-xs text-zinc-400 mt-2 block font-semibold">{analytics.availableSeats} seats remaining</span>
            </div>

            <div className="bg-[#0d0e15] border border-white/10 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Gate Check-Ins</span>
                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black text-white tracking-tight">
                {analytics.totalCheckedIn} / {analytics.totalTicketsIssued}
              </p>
              <span className="text-xs text-amber-400 mt-2 block font-bold">Physical Venue Entrances</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
