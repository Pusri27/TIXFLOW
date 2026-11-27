import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Users, DollarSign, UserCheck, ArrowLeft, PieChart, ChevronDown } from 'lucide-react';
import { organizerApi, eventApi } from '../services/api';
import { formatCompactPrice } from '../utils/formatPrice';

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
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#4B5563] hover:text-[#E11D48] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events</span>
        </Link>
        <span className="text-xs font-bold text-[#E11D48] bg-[#FFF1F2] px-3.5 py-1.5 rounded-full">
          Organizer Analytics
        </span>
      </div>

      {/* Event Switcher Card */}
      <div className="market-card rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-semibold text-[#6B7280] block">
              Live Box Office Overview
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#111827] mt-0.5">
              Sales &amp; Venue Occupancy
            </h1>
          </div>

          <div className="relative w-full sm:w-80">
            <select
              value={selectedEventId || ''}
              onChange={(e) => {
                const newId = Number(e.target.value);
                setSelectedEventId(newId);
                navigate(`/organizer/analytics/${newId}`);
              }}
              className="w-full bg-[#F7F8FA] border border-[#E6E8EC] focus:border-[#E11D48] text-[#111827] font-semibold text-sm px-4 py-3 rounded-2xl outline-none cursor-pointer appearance-none pr-10"
            >
              {eventsList.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.name} ({evt.category})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#6B7280] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-4 border-t border-[#F1F3F7]">
          {eventsList.map((evt) => (
            <button
              key={evt.id}
              onClick={() => {
                setSelectedEventId(evt.id);
                navigate(`/organizer/analytics/${evt.id}`);
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer truncate max-w-[210px] ${
                selectedEventId === evt.id
                  ? 'bg-[#111827] text-white shadow-xs'
                  : 'bg-[#F7F8FA] text-[#4B5563] hover:text-[#111827] border border-[#E6E8EC]'
              }`}
            >
              {evt.name}
            </button>
          ))}
        </div>
      </div>

      {loading || !analytics ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-[#E6E8EC] border-t-[#E11D48] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-[#6B7280]">Loading box-office metrics...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-[#111827]">{analytics.eventName}</h2>
            <p className="text-sm text-[#6B7280] mt-1">
              Confirmed ticket revenue, stadium sell-through, and live door check-in progress.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="market-card rounded-3xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6B7280]">Gross Revenue</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-4.5 h-4.5" />
                </div>
              </div>
              <p
                className="font-display text-2xl sm:text-3xl font-extrabold text-[#111827] tabular-nums"
                title={`IDR ${(analytics.totalRevenue || 0).toLocaleString('en-US')}`}
              >
                {formatCompactPrice(analytics.totalRevenue || 0)}
              </p>
              <span className="text-xs font-semibold text-emerald-600 block">Confirmed Stripe sales</span>
            </div>

            <div className="market-card rounded-3xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6B7280]">Occupancy Rate</span>
                <div className="w-9 h-9 rounded-xl bg-[#FFF1F2] text-[#E11D48] flex items-center justify-center">
                  <PieChart className="w-4.5 h-4.5" />
                </div>
              </div>
              <p className="font-display text-2xl sm:text-3xl font-extrabold text-[#111827] tabular-nums">
                {analytics.occupancyRatePercent}%
              </p>
              <div className="w-full bg-[#F1F3F7] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#E11D48] h-full rounded-full"
                  style={{ width: `${Math.min(100, analytics.occupancyRatePercent || 0)}%` }}
                />
              </div>
            </div>

            <div className="market-card rounded-3xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6B7280]">Seats Sold</span>
                <div className="w-9 h-9 rounded-xl bg-[#F1F3F7] text-[#374151] flex items-center justify-center">
                  <Users className="w-4.5 h-4.5" />
                </div>
              </div>
              <p className="font-display text-2xl sm:text-3xl font-extrabold text-[#111827] tabular-nums">
                {analytics.bookedSeats}{' '}
                <span className="text-lg text-[#9CA3AF] font-semibold">/ {analytics.totalCapacity}</span>
              </p>
              <span className="text-xs font-medium text-[#6B7280] block">
                {analytics.availableSeats} seats still open
              </span>
            </div>

            <div className="market-card rounded-3xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6B7280]">Door Check-Ins</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <UserCheck className="w-4.5 h-4.5" />
                </div>
              </div>
              <p className="font-display text-2xl sm:text-3xl font-extrabold text-[#111827] tabular-nums">
                {analytics.totalCheckedIn}{' '}
                <span className="text-lg text-[#9CA3AF] font-semibold">/ {analytics.totalTicketsIssued}</span>
              </p>
              <span className="text-xs font-medium text-[#6B7280] block">Verified at venue gate</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
