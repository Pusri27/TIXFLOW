import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminApi, eventApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { DollarSign, Image as ImageIcon, ArrowLeft, Plus, MapPin } from 'lucide-react';

const FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80';

// Preserves exact local wall-clock datetime ("YYYY-MM-DDTHH:mm:00") for Spring LocalDateTime without UTC offset shift
function formatLocalDateTimeParam(val) {
  if (!val) return null;
  return val.length === 16 ? `${val}:00` : val;
}

export default function CreateEventPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [venues, setVenues] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'CONCERT',
    venueId: '1',
    posterUrl: FALLBACK_POSTER,
    startTime: '',
    endTime: '',
    vipPrice: '1500000',
    regularPrice: '750000',
    isQueueEnabled: true,
    dynamicPricingEnabled: false,
  });

  useEffect(() => {
    eventApi
      .getVenues()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setVenues(list);
        if (list.length > 0) {
          setForm((prev) => ({ ...prev, venueId: String(list[0].id) }));
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminApi.createEvent({
        ...form,
        venueId: Number(form.venueId),
        vipPrice: Number(form.vipPrice),
        regularPrice: Number(form.regularPrice),
        startTime: formatLocalDateTimeParam(form.startTime),
        endTime: formatLocalDateTimeParam(form.endTime),
      });
      showToast({
        type: 'success',
        title: 'Event Published!',
        message: `"${form.name}" is now live with stadium seating tiers.`,
      });
      setTimeout(() => {
        navigate('/');
      }, 900);
    } catch (err) {
      console.error(err);
      showToast({
        type: 'error',
        title: 'Publish Failed',
        message: err.response?.data?.message || err.message || 'Unable to publish event.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10 sm:py-12 space-y-8">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#4B5563] hover:text-[#E11D48] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events</span>
        </Link>
        <span className="text-xs font-bold text-[#E11D48] bg-[#FFF1F2] px-3.5 py-1.5 rounded-full">
          Organizer Hub
        </span>
      </div>

      <div>
        <h1 className="font-display text-3xl font-extrabold text-[#111827]">
          Create New Event
        </h1>
        <p className="text-[#6B7280] text-sm mt-1">
          Set up event details, venue location, cover photo, schedule, and IDR ticket tier prices.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="market-card rounded-3xl p-6 sm:p-9 space-y-6"
      >
        <div>
          <label className="block text-xs font-bold text-[#374151] mb-2">
            Event Title
          </label>
          <input
            type="text"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Dua Lipa Radical Optimism Tour Jakarta"
            className="w-full bg-[#F7F8FA] border border-[#E6E8EC] focus:border-[#E11D48] focus:bg-white rounded-2xl px-4 py-3.5 text-[#111827] text-sm placeholder-[#9CA3AF] outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-[#374151] mb-2">
              Category
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full bg-[#F7F8FA] border border-[#E6E8EC] focus:border-[#E11D48] focus:bg-white rounded-2xl px-4 py-3.5 text-[#111827] text-sm outline-none"
            >
              <option value="CONCERT">Concerts &amp; Music</option>
              <option value="SPORTS">Sports &amp; Stadiums</option>
              <option value="MOVIE">Cinema &amp; Premieres</option>
              <option value="THEATER">Theater &amp; Arts</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#374151] mb-2">
              Venue &amp; City
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                name="venueId"
                value={form.venueId}
                onChange={handleChange}
                className="w-full bg-[#F7F8FA] border border-[#E6E8EC] focus:border-[#E11D48] focus:bg-white rounded-2xl pl-11 pr-4 py-3.5 text-[#111827] text-sm outline-none"
              >
                {venues.length > 0 ? (
                  venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} — {v.city}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="1">Jakarta International Stadium — Jakarta</option>
                    <option value="2">Grand XXI Cinema Center — Jakarta</option>
                    <option value="3">Bandung Convention Center — Bandung</option>
                    <option value="4">Trans Convention Centre — Bandung</option>
                    <option value="5">Jogja Expo Center (JEC) — Yogyakarta</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#374151] mb-2">
            Poster Image URL
          </label>
          <div className="relative">
            <ImageIcon className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              name="posterUrl"
              value={form.posterUrl}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-[#F7F8FA] border border-[#E6E8EC] focus:border-[#E11D48] focus:bg-white rounded-2xl pl-11 pr-4 py-3.5 text-[#111827] text-sm placeholder-[#9CA3AF] outline-none"
            />
          </div>
        </div>

        {form.posterUrl && (
          <div className="bg-[#F7F8FA] border border-[#E6E8EC] p-3.5 rounded-2xl flex items-center gap-4">
            <div className="w-24 h-16 rounded-xl overflow-hidden bg-white shrink-0 border border-[#E6E8EC]">
              <img
                src={form.posterUrl}
                alt="Poster preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = FALLBACK_POSTER;
                }}
              />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-[#E11D48] block">
                Cover Preview
              </span>
              <p className="text-sm text-[#111827] font-bold truncate">
                {form.name || 'Untitled Event'}
              </p>
              <p className="text-xs text-[#6B7280] truncate">{form.posterUrl}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-[#374151] mb-2">
              Start Date &amp; Time
            </label>
            <input
              type="datetime-local"
              name="startTime"
              required
              value={form.startTime}
              onChange={handleChange}
              className="w-full bg-[#F7F8FA] border border-[#E6E8EC] focus:border-[#E11D48] focus:bg-white rounded-2xl px-4 py-3.5 text-[#111827] text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#374151] mb-2">
              End Date &amp; Time
            </label>
            <input
              type="datetime-local"
              name="endTime"
              required
              value={form.endTime}
              onChange={handleChange}
              className="w-full bg-[#F7F8FA] border border-[#E6E8EC] focus:border-[#E11D48] focus:bg-white rounded-2xl px-4 py-3.5 text-[#111827] text-sm outline-none"
            />
          </div>
        </div>

        {/* Pricing Tiers (IDR) */}
        <div className="p-5 rounded-2xl bg-[#F7F8FA] border border-[#E6E8EC] space-y-4">
          <h3 className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-[#E11D48]" />
            <span>Seat Tier Pricing (IDR)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#4B5563] mb-1.5">VIP Rows (A &amp; B)</label>
              <input
                type="number"
                min="1"
                name="vipPrice"
                value={form.vipPrice}
                onChange={handleChange}
                className="w-full bg-white border border-[#E6E8EC] focus:border-[#E11D48] rounded-xl px-3.5 py-2.5 text-[#111827] font-semibold text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#4B5563] mb-1.5">Regular Rows (C &amp; D)</label>
              <input
                type="number"
                min="1"
                name="regularPrice"
                value={form.regularPrice}
                onChange={handleChange}
                className="w-full bg-white border border-[#E6E8EC] focus:border-[#E11D48] rounded-xl px-3.5 py-2.5 text-[#111827] font-semibold text-sm outline-none"
              />
            </div>
          </div>
        </div>

        {/* Queue & Dynamic Pricing Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center justify-between p-4 rounded-2xl bg-[#F7F8FA] border border-[#E6E8EC] cursor-pointer">
            <div>
              <span className="text-xs font-bold text-[#111827] block">Virtual Waiting Room</span>
              <span className="text-xs text-[#6B7280]">Fair queue for high traffic</span>
            </div>
            <input
              type="checkbox"
              name="isQueueEnabled"
              checked={form.isQueueEnabled}
              onChange={handleChange}
              className="w-4 h-4 rounded accent-[#E11D48] cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-2xl bg-[#F7F8FA] border border-[#E6E8EC] cursor-pointer">
            <div>
              <span className="text-xs font-bold text-[#111827] block">Dynamic Pricing</span>
              <span className="text-xs text-[#6B7280]">Adjusts as seats fill up</span>
            </div>
            <input
              type="checkbox"
              name="dynamicPricingEnabled"
              checked={form.dynamicPricingEnabled}
              onChange={handleChange}
              className="w-4 h-4 rounded accent-[#E11D48] cursor-pointer"
            />
          </label>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#374151] mb-2">
            About This Event
          </label>
          <textarea
            name="description"
            rows="4"
            required
            value={form.description}
            onChange={handleChange}
            placeholder="Share lineup highlights, gate open times, and venue guidelines..."
            className="w-full bg-[#F7F8FA] border border-[#E6E8EC] focus:border-[#E11D48] focus:bg-white rounded-2xl px-4 py-3.5 text-[#111827] text-sm placeholder-[#9CA3AF] outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-full bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-sm shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>{loading ? 'Publishing Event...' : 'Publish Event'}</span>
        </button>
      </form>
    </div>
  );
}
