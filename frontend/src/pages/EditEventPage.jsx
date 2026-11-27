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
        <div className="w-8 h-8 border-3 border-[#E6E8EC] border-t-[#E11D48] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-[#6B7280]">Loading event details...</p>
      </div>
    );
  }

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
          Edit Event #{id}
        </span>
      </div>

      <div>
        <h1 className="font-display text-3xl font-extrabold text-[#111827]">
          Edit Event Details
        </h1>
        <p className="text-[#6B7280] text-sm mt-1">
          Update schedule, poster image, category, or event description.
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
            className="w-full bg-[#F7F8FA] border border-[#E6E8EC] focus:border-[#E11D48] focus:bg-white rounded-2xl px-4 py-3.5 text-[#111827] text-sm outline-none"
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
              Poster Image URL
            </label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                name="posterUrl"
                value={form.posterUrl}
                onChange={handleChange}
                className="w-full bg-[#F7F8FA] border border-[#E6E8EC] focus:border-[#E11D48] focus:bg-white rounded-2xl pl-11 pr-4 py-3.5 text-[#111827] text-sm outline-none"
              />
            </div>
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
            className="w-full bg-[#F7F8FA] border border-[#E6E8EC] focus:border-[#E11D48] focus:bg-white rounded-2xl px-4 py-3.5 text-[#111827] text-sm outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 rounded-full bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-sm shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Changes...' : 'Save Changes'}</span>
        </button>
      </form>
    </div>
  );
}
