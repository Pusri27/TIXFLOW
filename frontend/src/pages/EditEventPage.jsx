import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminApi, eventApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Image as ImageIcon, ArrowLeft, Save } from 'lucide-react';

const FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80';

export default function EditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      showToast({
        type: 'error',
        title: 'Load Failed',
        message: 'Could not load event details.',
      });
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
      showToast({
        type: 'success',
        title: 'Changes Saved',
        message: `"${form.name}" has been updated.`,
      });
      setTimeout(() => {
        navigate('/');
      }, 900);
    } catch (err) {
      console.error(err);
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: err.response?.data?.message || err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-7 h-7 border-2 border-[#242429] border-t-[#D4FF00] rounded-full animate-spin mx-auto mb-3" />
        <p className="font-mono text-xs text-[#9E9EA8] uppercase tracking-wider">Loading event...</p>
      </div>
    );
  }

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
          Edit Event #{id}
        </span>
      </div>

      <div>
        <h1 className="font-display text-3xl font-bold text-[#F4F4F0] tracking-tight">
          Edit Listing
        </h1>
        <p className="text-[#9E9EA8] text-xs sm:text-sm mt-1">
          Update schedule, poster artwork, category, and description.
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
            className="w-full bg-[#0B0B0C] border border-[#242429] focus:border-[#D4FF00] rounded-md px-3.5 py-3 text-[#F4F4F0] text-sm outline-none"
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
                className="w-full bg-[#0B0B0C] border border-[#242429] focus:border-[#D4FF00] rounded-md pl-10 pr-3.5 py-3 text-[#F4F4F0] text-sm outline-none"
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
            className="w-full bg-[#0B0B0C] border border-[#242429] focus:border-[#D4FF00] rounded-md px-3.5 py-3 text-[#F4F4F0] text-sm outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 rounded-md bg-[#D4FF00] hover:bg-[#E2FF4D] text-[#0B0B0C] font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </form>
    </div>
  );
}
