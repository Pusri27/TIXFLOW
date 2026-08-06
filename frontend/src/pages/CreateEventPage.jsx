import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../services/api';
import { Sparkles, Calendar, DollarSign, Image as ImageIcon, MapPin, Layers, CheckCircle2, ShieldCheck, Eye } from 'lucide-react';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'CONCERT',
    posterUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80',
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
        startTime: form.startTime ? new Date(form.startTime).toISOString() : new Date(Date.now() + 86400000 * 7).toISOString(),
        endTime: form.endTime ? new Date(form.endTime).toISOString() : new Date(Date.now() + 86400000 * 7 + 10800000).toISOString(),
      });
      showToast({
        type: 'success',
        title: 'Event Published',
        message: 'Event published successfully with auto-generated seat tiers!',
      });
      setTimeout(() => {
        navigate('/');
      }, 1200);
    } catch (err) {
      console.error(err);
      showToast({
        type: 'error',
        title: 'Publish Failed',
        message: err.response?.data?.message || err.message || 'Failed to publish event',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden mb-8 bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950 border border-slate-800 p-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Admin Management Portal</span>
            </span>
            <h1 className="text-3xl font-black text-white tracking-tight">Create &amp; Publish New Event</h1>
            <p className="text-slate-400 text-sm mt-1">Configure event tiers, venue layout, and high-concurrency ticket safeguards.</p>
          </div>
          <div className="hidden sm:block p-4 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
            <ShieldCheck className="w-10 h-10" />
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center space-x-3 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-[#0d0e15] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Event Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">Event Title</label>
          <input
            type="text"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Coldplay Music Of The Spheres Tour 2026"
            className="w-full bg-[#131522] border border-white/10 focus:border-indigo-500 rounded-2xl px-4 py-3.5 text-white text-sm placeholder-zinc-500 outline-none transition-colors"
          />
        </div>

        {/* Category & Poster URL Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full bg-[#131522] border border-white/10 focus:border-indigo-500 rounded-2xl px-4 py-3.5 text-white text-sm outline-none"
            >
              <option value="CONCERT">Concert &amp; Music</option>
              <option value="MOVIE">Movie &amp; Cinema</option>
              <option value="SPORTS">Sports Arena</option>
              <option value="THEATER">Theater &amp; Show</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">Poster Image URL</label>
            <div className="relative">
              <input
                type="url"
                name="posterUrl"
                value={form.posterUrl}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-[#131522] border border-white/10 focus:border-indigo-500 rounded-2xl pl-11 pr-4 py-3.5 text-white text-sm placeholder-zinc-500 outline-none"
              />
              <ImageIcon className="w-4 h-4 text-zinc-500 absolute left-4 top-4" />
            </div>
          </div>
        </div>

        {/* Live Poster Image Preview Card */}
        {form.posterUrl && (
          <div className="bg-[#131522] border border-white/[0.08] p-4 rounded-2xl flex items-center space-x-4">
            <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-black shrink-0 border border-white/10">
              <img
                src={form.posterUrl}
                alt="Poster Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=600&q=80';
                }}
              />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 flex items-center space-x-1 mb-1">
                <Eye className="w-3 h-3" />
                <span>Live Poster Image Preview</span>
              </span>
              <p className="text-xs text-white font-bold line-clamp-1">{form.name || 'Untitled Event'}</p>
              <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">{form.posterUrl}</p>
            </div>
          </div>
        )}

        {/* Date Time Picker Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
              Start Date &amp; Time (Direct Picker)
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                name="startTime"
                required
                value={form.startTime}
                onChange={handleChange}
                className="w-full bg-[#131522] border border-white/10 focus:border-indigo-500 rounded-2xl px-4 py-3.5 text-white text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
              End Date &amp; Time (Direct Picker)
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                name="endTime"
                required
                value={form.endTime}
                onChange={handleChange}
                className="w-full bg-[#131522] border border-white/10 focus:border-indigo-500 rounded-2xl px-4 py-3.5 text-white text-sm outline-none"
              />
            </div>
          </div>
        </div>

        {/* Pricing Tiers Grid */}
        <div className="p-5 rounded-2xl bg-[#131522] border border-white/[0.08] space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Seat Tier Pricing Config (IDR)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1 font-semibold">VIP Tier Price (Rows A &amp; B)</label>
              <input
                type="number"
                name="vipPrice"
                value={form.vipPrice}
                onChange={handleChange}
                className="w-full bg-[#0d0e15] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-bold"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1 font-semibold">Regular Tier Price (Rows C &amp; D)</label>
              <input
                type="number"
                name="regularPrice"
                value={form.regularPrice}
                onChange={handleChange}
                className="w-full bg-[#0d0e15] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-bold"
              />
            </div>
          </div>
        </div>

        {/* Enterprise Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center justify-between p-4 rounded-2xl bg-[#131522] border border-white/[0.08] cursor-pointer">
            <div>
              <span className="text-sm font-bold text-white block">Virtual Waiting Room Queue</span>
              <span className="text-xs text-zinc-400">Protects event from traffic spikes</span>
            </div>
            <input
              type="checkbox"
              name="isQueueEnabled"
              checked={form.isQueueEnabled}
              onChange={handleChange}
              className="w-5 h-5 rounded accent-indigo-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-2xl bg-[#131522] border border-white/[0.08] cursor-pointer">
            <div>
              <span className="text-sm font-bold text-white block">Dynamic Pricing Engine</span>
              <span className="text-xs text-zinc-400">Adjusts price based on demand</span>
            </div>
            <input
              type="checkbox"
              name="dynamicPricingEnabled"
              checked={form.dynamicPricingEnabled}
              onChange={handleChange}
              className="w-5 h-5 rounded accent-indigo-500 cursor-pointer"
            />
          </label>
        </div>

        {/* Event Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">Description</label>
          <textarea
            name="description"
            rows="4"
            required
            value={form.description}
            onChange={handleChange}
            placeholder="Detailed description of the event performance, line-up, and venue policies..."
            className="w-full bg-[#131522] border border-white/10 focus:border-indigo-500 rounded-2xl px-4 py-3.5 text-white text-sm placeholder-zinc-500 outline-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-white hover:bg-zinc-200 text-black font-black text-base shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <span>Publishing Event...</span>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Publish Event Live</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
