import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Users, DollarSign, UserCheck, ArrowLeft, PieChart, ChevronDown } from 'lucide-react';
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
      const list = Array.isArray(res.data) ? res.data : res.data?.content || [];
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
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-12 space-y-8">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#9E9EA8] hover:text-[#D4FF00] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Events</span>
        </Link>
        <span className="font-mono text-[11px] uppercase tracking-wider text-[#D4FF00] bg-[#121214] border border-[#242429] px-2.5 py-1 rounded">
          Organizer Analytics
        </span>
      </div>

      {/* Event Switcher Panel */}
      <div className="bg-[#121214] border border-[#242429] rounded-lg p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#666670] block">
              Box Office &amp; Gate Report
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F4F4F0] mt-0.5">
              Sales &amp; Venue Occupancy
            </h1>
          </div>

          <div className="relative w-full sm:w-72">
            <select
              value={selectedEventId || ''}
              onChange={(e) => {
                const newId = Number(e.target.value);
                setSelectedEventId(newId);
                navigate(`/organizer/analytics/${newId}`);
              }}
              className="w-full bg-[#0B0B0C] border border-[#242429] focus:border-[#D4FF00] text-[#F4F4F0] font-medium text-xs px-3.5 py-2.5 rounded-md outline-none cursor-pointer appearance-none pr-9"
            >
              {eventsList.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.name} ({evt.category})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#666670] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-4 border-t border-[#242429]">
          {eventsList.map((evt) => (
            <button
              key={evt.id}
              onClick={() => {
                setSelectedEventId(evt.id);
                navigate(`/organizer/analytics/${evt.id}`);
              }}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer truncate max-w-[200px] ${
                selectedEventId === evt.id
                  ? 'bg-[#D4FF00] text-[#0B0B0C]'
                  : 'bg-[#0B0B0C] text-[#9E9EA8] hover:text-[#F4F4F0] border border-[#242429]'
              }`}
            >
              {evt.name}
            </button>
          ))}
        </div>
      </div>

      {loading || !analytics ? (
        <div className="py-20 text-center">
          <div className="w-7 h-7 border-2 border-[#242429] border-t-[#D4FF00] rounded-full animate-spin mx-auto mb-3" />
          <p className="font-mono text-xs text-[#9E9EA8] uppercase tracking-wider">Loading metrics...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#F4F4F0]">{analytics.eventName}</h2>
            <p className="text-xs text-[#9E9EA8] mt-1">
              Confirmed Stripe box office revenue, seat sell-through, and live gate check-in counts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#121214] border border-[#242429] rounded-lg p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-semibold text-[#9E9EA8] uppercase tracking-wider">
                  Gross Revenue
                </span>
                <DollarSign className="w-4 h-4 text-[#D4FF00]" />
              </div>
              <p className="font-display text-3xl font-bold text-[#F4F4F0] tabular-nums">
                ${(analytics.totalRevenue || 0).toLocaleString('en-US')}
              </p>
              <span className="font-mono text-[11px] text-[#D4FF00] block">Confirmed orders</span>
            </div>

            <div className="bg-[#121214] border border-[#242429] rounded-lg p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-semibold text-[#9E9EA8] uppercase tracking-wider">
                  Occupancy
                </span>
                <PieChart className="w-4 h-4 text-[#9E9EA8]" />
              </div>
              <p className="font-display text-3xl font-bold text-[#F4F4F0] tabular-nums">
                {analytics.occupancyRatePercent}%
              </p>
              <div className="w-full bg-[#0B0B0C] h-1.5 rounded-xs overflow-hidden border border-[#242429]">
                <div
                  className="bg-[#D4FF00] h-full"
                  style={{ width: `${Math.min(100, analytics.occupancyRatePercent || 0)}%` }}
                />
              </div>
            </div>

            <div className="bg-[#121214] border border-[#242429] rounded-lg p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-semibold text-[#9E9EA8] uppercase tracking-wider">
                  Seats Sold
                </span>
                <Users className="w-4 h-4 text-[#9E9EA8]" />
              </div>
              <p className="font-display text-3xl font-bold text-[#F4F4F0] tabular-nums">
                {analytics.bookedSeats}{' '}
                <span className="text-lg text-[#666670] font-normal">/ {analytics.totalCapacity}</span>
              </p>
              <span className="font-mono text-[11px] text-[#9E9EA8] block">
                {analytics.availableSeats} open seats
              </span>
            </div>

            <div className="bg-[#121214] border border-[#242429] rounded-lg p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-semibold text-[#9E9EA8] uppercase tracking-wider">
                  Gate Check-Ins
                </span>
                <UserCheck className="w-4 h-4 text-[#D4FF00]" />
              </div>
              <p className="font-display text-3xl font-bold text-[#F4F4F0] tabular-nums">
                {analytics.totalCheckedIn}{' '}
                <span className="text-lg text-[#666670] font-normal">/ {analytics.totalTicketsIssued}</span>
              </p>
              <span className="font-mono text-[11px] text-[#9E9EA8] block">Verified at door</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
