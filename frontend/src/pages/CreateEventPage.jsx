import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { DollarSign, Image as ImageIcon, ArrowLeft, Plus } from 'lucide-react';

const FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'CONCERT',
    posterUrl: FALLBACK_POSTER,
    startTime: '',
    endTime: '',
    vipPrice: '1500000',
    regularPrice: '750000',
    isQueueEnabled: true,
    dynamicPricingEnabled: false,
  });

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
        vipPrice: Number(form.vipPrice),
        regularPrice: Number(form.regularPrice),
        startTime: form.startTime
          ? new Date(form.startTime).toISOString()
          : new Date(Date.now() + 86400000 * 7).toISOString(),
        endTime: form.endTime
          ? new Date(form.endTime).toISOString()
          : new Date(Date.now() + 86400000 * 7 + 10800000).toISOString(),
      });
      showToast({
        type: 'success',
        title: 'Event Published',
        message: `"${form.name}" is now live with generated seating tiers.`,
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
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#9E9EA8] hover:text-[#D4FF00] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Events</span>
        </Link>
        <span className="font-mono text-[11px] uppercase tracking-wider text-[#D4FF00] bg-[#121214] border border-[#242429] px-2.5 py-1 rounded">
          New Listing
        </span>
      </div>

      <div>
        <h1 className="font-display text-3xl font-bold text-[#F4F4F0] tracking-tight">
          Publish Event
        </h1>
        <p className="text-[#9E9EA8] text-xs sm:text-sm mt-1">
          Configure event listing, artwork, schedule, and IDR seat pricing tiers.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-[#121214] border border-[#242429] rounded-lg p-6 sm:p-8 space-y-6"
      >
        <div>
          <label className="block font-mono text-[11px] uppercase tracking-wider text-[#9E9EA8] mb-2">
            Event Title
          </label>
          <input
            type="text"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Boiler Room × Warehouse Project"
            className="w-full bg-[#0B0B0C] border border-[#242429] focus:border-[#D4FF00] rounded-md px-3.5 py-3 text-[#F4F4F0] text-sm placeholder-[#666670] outline-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-[#9E9EA8] mb-2">
              Category
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full bg-[#0B0B0C] border border-[#242429] focus:border-[#D4FF00] rounded-md px-3.5 py-3 text-[#F4F4F0] text-sm outline-none"
            >
              <option value="CONCERT">Music &amp; Concerts</option>
              <option value="MOVIE">Film &amp; Screenings</option>
              <option value="SPORTS">Sports</option>
              <option value="THEATER">Stage &amp; Arts</option>
            </select>
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-[#9E9EA8] mb-2">
              Poster Artwork URL
            </label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 text-[#666670] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                name="posterUrl"
                value={form.posterUrl}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-[#0B0B0C] border border-[#242429] focus:border-[#D4FF00] rounded-md pl-10 pr-3.5 py-3 text-[#F4F4F0] text-sm placeholder-[#666670] outline-none"
              />
            </div>
          </div>
        </div>

        {form.posterUrl && (
          <div className="bg-[#0B0B0C] border border-[#242429] p-3.5 rounded-md flex items-center gap-4">
            <div className="w-24 h-16 rounded overflow-hidden bg-[#17171A] shrink-0 border border-[#242429]">
              <img
                src={form.posterUrl}
                alt="Artwork preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = FALLBACK_POSTER;
                }}
              />
            </div>
            <div className="min-w-0">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#D4FF00] block">
                Artwork Preview
              </span>
              <p className="text-xs text-[#F4F4F0] font-semibold truncate mt-0.5">
                {form.name || 'Untitled Event'}
              </p>
              <p className="font-mono text-[11px] text-[#666670] truncate">{form.posterUrl}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-[#9E9EA8] mb-2">
              Start Date &amp; Time
            </label>
            <input
              type="datetime-local"
              name="startTime"
              required
              value={form.startTime}
              onChange={handleChange}
              className="w-full bg-[#0B0B0C] border border-[#242429] focus:border-[#D4FF00] rounded-md px-3.5 py-3 text-[#F4F4F0] text-sm outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-[#9E9EA8] mb-2">
              End Date &amp; Time
            </label>
            <input
              type="datetime-local"
              name="endTime"
              required
              value={form.endTime}
              onChange={handleChange}
              className="w-full bg-[#0B0B0C] border border-[#242429] focus:border-[#D4FF00] rounded-md px-3.5 py-3 text-[#F4F4F0] text-sm outline-none"
            />
          </div>
        </div>

        {/* Pricing Tiers (IDR) */}
        <div className="p-5 rounded-md bg-[#0B0B0C] border border-[#242429] space-y-4">
          <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#F4F4F0] flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-[#D4FF00]" />
            <span>Seat Tier Pricing (IDR)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#9E9EA8] mb-1.5">VIP Rows (A &amp; B)</label>
              <input
                type="number"
                min="1"
                name="vipPrice"
                value={form.vipPrice}
                onChange={handleChange}
                className="w-full bg-[#121214] border border-[#242429] focus:border-[#D4FF00] rounded-md px-3.5 py-2.5 text-[#F4F4F0] font-mono text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-[#9E9EA8] mb-1.5">Regular Rows (C &amp; D)</label>
              <input
                type="number"
                min="1"
                name="regularPrice"
                value={form.regularPrice}
                onChange={handleChange}
                className="w-full bg-[#121214] border border-[#242429] focus:border-[#D4FF00] rounded-md px-3.5 py-2.5 text-[#F4F4F0] font-mono text-sm outline-none"
              />
            </div>
          </div>
        </div>

        {/* Queue & Dynamic Pricing Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center justify-between p-4 rounded-md bg-[#0B0B0C] border border-[#242429] cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-[#F4F4F0] block">Virtual Waiting Room</span>
              <span className="text-[11px] text-[#666670]">Meter traffic during peak drops</span>
            </div>
            <input
              type="checkbox"
              name="isQueueEnabled"
              checked={form.isQueueEnabled}
              onChange={handleChange}
              className="w-4 h-4 rounded accent-[#D4FF00] cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-md bg-[#0B0B0C] border border-[#242429] cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-[#F4F4F0] block">Dynamic Demand Pricing</span>
              <span className="text-[11px] text-[#666670]">Scale tier price with occupancy</span>
            </div>
            <input
              type="checkbox"
              name="dynamicPricingEnabled"
              checked={form.dynamicPricingEnabled}
              onChange={handleChange}
              className="w-4 h-4 rounded accent-[#D4FF00] cursor-pointer"
            />
          </label>
        </div>

        <div>
          <label className="block font-mono text-[11px] uppercase tracking-wider text-[#9E9EA8] mb-2">
            Lineup &amp; Event Info
          </label>
          <textarea
            name="description"
            rows="4"
            required
            value={form.description}
            onChange={handleChange}
            placeholder="Lineup, set times, age restrictions, and venue entry notes..."
            className="w-full bg-[#0B0B0C] border border-[#242429] focus:border-[#D4FF00] rounded-md px-3.5 py-3 text-[#F4F4F0] text-sm placeholder-[#666670] outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-md bg-[#D4FF00] hover:bg-[#E2FF4D] text-[#0B0B0C] font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>{loading ? 'Publishing...' : 'Publish Event'}</span>
        </button>
      </form>
    </div>
  );
}
