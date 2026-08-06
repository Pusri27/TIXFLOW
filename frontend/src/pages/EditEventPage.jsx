import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminApi, eventApi } from '../services/api';
import { Sparkles, Image as ImageIcon, CheckCircle2, ShieldCheck, Eye, ArrowLeft, Save } from 'lucide-react';

export default function EditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'CONCERT',
    posterUrl: '',
    startTime: '',
    endTime: '',
    isQueueEnabled: true,
    dynamicPricingEnabled: false,
  });

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const res = await eventApi.getById(id);
      const evt = res.data;
      setForm({
        name: evt.name || '',
        description: evt.description || '',
        category: evt.category || 'CONCERT',
        posterUrl: evt.posterUrl || '',
        startTime: evt.startTime ? evt.startTime.substring(0, 16) : '',
        endTime: evt.endTime ? evt.endTime.substring(0, 16) : '',
        isQueueEnabled: evt.isQueueEnabled ?? true,
        dynamicPricingEnabled: evt.dynamicPricingEnabled ?? false,
      });
    } catch (err) {
      console.error(err);
      alert('Could not fetch event details.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updateEvent(id, {
        ...form,
        startTime: form.startTime ? new Date(form.startTime).toISOString() : null,
        endTime: form.endTime ? new Date(form.endTime).toISOString() : null,
      });
      setSuccessMsg('Event updated successfully!');
      setTimeout(() => {
        navigate('/');
      }, 1200);
    } catch (err) {
      console.error(err);
      alert('Failed to update event: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 font-semibold text-sm">Loading event data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <Link to="/" className="flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors text-sm font-bold">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discovery</span>
        </Link>
        <span className="text-xs font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full font-bold">
          Admin Edit Portal
        </span>
      </div>

      <div className="relative rounded-3xl overflow-hidden mb-8 bg-[#0d0e15] border border-white/10 p-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Edit Event #{id}</span>
            </span>
            <h1 className="text-3xl font-black text-white tracking-tight">Modify Event Configuration</h1>
            <p className="text-zinc-400 text-sm mt-1">Update event schedule, poster assets, descriptions, and queue policies.</p>
          </div>
          <div className="hidden sm:block p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
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

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="bg-[#0d0e15] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">Event Title</label>
          <input
            type="text"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full bg-[#131522] border border-white/10 focus:border-amber-500 rounded-2xl px-4 py-3.5 text-white text-sm outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full bg-[#131522] border border-white/10 focus:border-amber-500 rounded-2xl px-4 py-3.5 text-white text-sm outline-none"
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
                className="w-full bg-[#131522] border border-white/10 focus:border-amber-500 rounded-2xl pl-11 pr-4 py-3.5 text-white text-sm outline-none"
              />
              <ImageIcon className="w-4 h-4 text-zinc-500 absolute left-4 top-4" />
            </div>
          </div>
        </div>

        {/* Live Image Preview */}
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
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 flex items-center space-x-1 mb-1">
                <Eye className="w-3 h-3" />
                <span>Live Poster Image Preview</span>
              </span>
              <p className="text-xs text-white font-bold">{form.name || 'Untitled Event'}</p>
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
            <input
              type="datetime-local"
              name="startTime"
              required
              value={form.startTime}
              onChange={handleChange}
              className="w-full bg-[#131522] border border-white/10 focus:border-amber-500 rounded-2xl px-4 py-3.5 text-white text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
              End Date &amp; Time (Direct Picker)
            </label>
            <input
              type="datetime-local"
              name="endTime"
              required
              value={form.endTime}
              onChange={handleChange}
              className="w-full bg-[#131522] border border-white/10 focus:border-amber-500 rounded-2xl px-4 py-3.5 text-white text-sm outline-none"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">Description</label>
          <textarea
            name="description"
            rows="4"
            required
            value={form.description}
            onChange={handleChange}
            className="w-full bg-[#131522] border border-white/10 focus:border-amber-500 rounded-2xl px-4 py-3.5 text-white text-sm outline-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-black text-base shadow-xl transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <span>Saving Changes...</span>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Save Event Changes</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
