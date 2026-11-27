import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventApi, adminApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Calendar, MapPin, Search, ArrowRight, Music, Film, Trophy, Theater, Compass, Edit, Trash2, Clock } from 'lucide-react';

const FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80';

const CATEGORY_LABELS = {
  CONCERT: 'Concerts',
  MOVIE: 'Cinema',
  SPORTS: 'Sports',
  THEATER: 'Theater',
};

export default function EventListPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(9);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    setVisibleCount(9);
    fetchEvents();
  }, [selectedCategory]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await eventApi.getAll(selectedCategory);
      setEvents(Array.isArray(res.data) ? res.data : res.data?.content || []);
    } catch (err) {
      console.error(err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = (e, eventId, eventName) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteTarget({ id: eventId, name: eventName });
  };

  const confirmDeleteEvent = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteEvent(deleteTarget.id);
      setEvents((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      showToast({
        type: 'success',
        title: 'Event Removed',
        message: `"${deleteTarget.name}" has been deleted.`,
      });
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      showToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.response?.data?.message || err.message,
      });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const categories = [
    { id: '', name: 'All Events', icon: Compass },
    { id: 'CONCERT', name: 'Concerts & Music', icon: Music },
    { id: 'SPORTS', name: 'Sports & Stadiums', icon: Trophy },
    { id: 'MOVIE', name: 'Cinema & Premieres', icon: Film },
    { id: 'THEATER', name: 'Theater & Arts', icon: Theater },
  ];

  const filteredEvents = events.filter(
    (e) =>
      e.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue?.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredEvent = !selectedCategory && !searchQuery && events.length > 0 ? events[0] : null;
  const displayedEvents = searchQuery ? filteredEvents : filteredEvents.slice(0, visibleCount);
  const hasMoreEvents = !searchQuery && filteredEvents.length > visibleCount;

  const formatDateBadge = (dateString) => {
    if (!dateString) return { month: 'TBA', day: '--' };
    const d = new Date(dateString);
    return {
      month: d.toLocaleString('en-US', { month: 'short' }),
      day: d.getDate(),
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-10 space-y-12">
      {/* Welcoming Consumer Spotlight Hero */}
      {featuredEvent && (
        <section className="market-card rounded-3xl p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-6 space-y-5 order-2 lg:order-1 px-2 sm:px-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 bg-[#FFF1F2] text-[#E11D48] text-xs font-bold px-3.5 py-1.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-[#E11D48]" />
                  Featured Experience
                </span>
                <span className="bg-[#F1F3F7] text-[#4B5563] text-xs font-semibold px-3 py-1.5 rounded-full">
                  {CATEGORY_LABELS[featuredEvent.category] || featuredEvent.category}
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-[#111827] leading-[1.08]">
                {featuredEvent.name}
              </h1>

              <p className="text-[#4B5563] text-sm sm:text-base leading-relaxed line-clamp-3">
                {featuredEvent.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs sm:text-sm text-[#374151]">
                <div className="inline-flex items-center gap-2 bg-[#F7F8FA] border border-[#E6E8EC] px-3.5 py-2 rounded-full font-medium">
                  <Calendar className="w-4 h-4 text-[#E11D48] shrink-0" />
                  <span>
                    {new Date(featuredEvent.startTime).toLocaleString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {featuredEvent.venue && (
                  <div className="inline-flex items-center gap-2 bg-[#F7F8FA] border border-[#E6E8EC] px-3.5 py-2 rounded-full font-medium">
                    <MapPin className="w-4 h-4 text-[#E11D48] shrink-0" />
                    <span>{`${featuredEvent.venue.name}, ${featuredEvent.venue.city}`}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to={`/events/${featuredEvent.id}`}
                  className="inline-flex items-center gap-2 bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold px-7 py-3.5 rounded-full text-sm shadow-md shadow-rose-500/20 transition-all group"
                >
                  <span>Select Seats</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <span className="text-xs font-medium text-[#6B7280]">
                  Interactive stadium map · Instant mobile pass
                </span>
              </div>
            </div>

            {/* Right Framed Artwork */}
            <div
              onClick={() => navigate(`/events/${featuredEvent.id}`)}
              className="lg:col-span-6 relative aspect-[16/10] rounded-2xl overflow-hidden bg-[#F1F3F7] cursor-pointer group order-1 lg:order-2 shadow-sm"
            >
              <img
                src={featuredEvent.posterUrl || FALLBACK_POSTER}
                alt={featuredEvent.name}
                fetchPriority="high"
                decoding="async"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = FALLBACK_POSTER;
                }}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </section>
      )}

      {/* Search & Category Pills */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#111827]">
                Upcoming Events
              </h2>
              {!loading && filteredEvents.length > 0 && (
                <span className="text-xs font-bold text-[#E11D48] bg-[#FFF1F2] px-3 py-1 rounded-full">
                  {filteredEvents.length === 1 ? '1 event' : `${filteredEvents.length} events`}
                </span>
              )}
            </div>
            <p className="text-[#6B7280] text-sm mt-1">
              Book verified seats for live music tours, international matches, and theater shows.
            </p>
          </div>

          {/* Rounded Pill Search */}
          <div className="relative w-full md:w-88">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search artist, match, or city..."
              className="w-full bg-white border border-[#E6E8EC] focus:border-[#E11D48] focus:ring-4 focus:ring-rose-500/10 rounded-full pl-11 pr-4 py-3 text-sm text-[#111827] placeholder-[#9CA3AF] outline-none transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Tactile Rounded Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-4.5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#111827] text-white shadow-sm'
                    : 'bg-white border border-[#E6E8EC] text-[#4B5563] hover:text-[#111827] hover:border-[#D1D5DB]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-[#6B7280]'}`} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Event Marketplace Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white border border-[#E6E8EC] rounded-2xl overflow-hidden p-3 space-y-3 animate-pulse"
              >
                <div className="aspect-[16/10] bg-[#F1F3F7] rounded-xl" />
                <div className="px-2 pb-2 space-y-2.5">
                  <div className="w-24 h-3.5 bg-[#F1F3F7] rounded-full" />
                  <div className="w-3/4 h-5 bg-[#E6E8EC] rounded-full" />
                  <div className="w-1/2 h-3.5 bg-[#F1F3F7] rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="market-card rounded-3xl py-20 px-6 text-center">
            <p className="font-display text-xl font-bold text-[#111827]">
              No events match your search
            </p>
            <p className="text-sm text-[#6B7280] mt-1">
              Try a different keyword or switch back to All Events.
            </p>
            {(searchQuery || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                }}
                className="mt-5 px-5 py-2.5 rounded-full bg-[#FFF1F2] hover:bg-rose-100 text-sm font-bold text-[#E11D48] cursor-pointer transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedEvents.map((event) => {
              const dateInfo = formatDateBadge(event.startTime);
              return (
                <article
                  key={event.id}
                  onClick={() => navigate(`/events/${event.id}`)}
                  className="group market-card market-card-hover rounded-2xl overflow-hidden flex flex-col cursor-pointer relative"
                >
                  {/* Host Quick Actions */}
                  {isAdmin && (
                    <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-white/95 backdrop-blur-md border border-[#E6E8EC] p-1 rounded-full shadow-md">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/events/edit/${event.id}`);
                        }}
                        className="p-2 text-[#4B5563] hover:text-[#111827] hover:bg-[#F1F3F7] rounded-full transition-colors cursor-pointer"
                        title="Edit Event"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteEvent(e, event.id, event.name)}
                        className="p-2 text-[#6B7280] hover:text-[#E11D48] hover:bg-[#FFF1F2] rounded-full transition-colors cursor-pointer"
                        title="Delete Event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Poster Frame */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#F1F3F7]">
                    <img
                      src={event.posterUrl || FALLBACK_POSTER}
                      alt={event.name}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = FALLBACK_POSTER;
                      }}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Clean Floating White Date Badge */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md rounded-xl px-3 py-1.5 text-center shadow-sm border border-black/5">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-[#E11D48] leading-none">
                        {dateInfo.month}
                      </span>
                      <span className="block font-display text-lg font-extrabold text-[#111827] leading-tight">
                        {dateInfo.day}
                      </span>
                    </div>

                    {/* Category Pill */}
                    {!isAdmin && (
                      <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-[#111827] text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                        {CATEGORY_LABELS[event.category] || event.category}
                      </span>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <h3 className="font-display text-lg font-bold text-[#111827] group-hover:text-[#E11D48] transition-colors line-clamp-1">
                        {event.name}
                      </h3>

                      <p className="text-[#6B7280] text-xs sm:text-sm line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    <div className="space-y-2.5 pt-3.5 border-t border-[#F1F3F7]">
                      <div className="flex items-center justify-between text-xs text-[#4B5563] font-medium">
                        <span className="inline-flex items-center gap-1.5 truncate pr-2">
                          <MapPin className="w-3.5 h-3.5 text-[#E11D48] shrink-0" />
                          <span className="truncate">
                            {event.venue ? `${event.venue.name}, ${event.venue.city}` : 'Venue TBA'}
                          </span>
                        </span>

                        <span className="inline-flex items-center gap-1 text-[#6B7280] shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(event.startTime).toLocaleString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-medium text-[#6B7280]">Available now</span>
                        <span className="text-xs font-bold text-[#E11D48] inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          Find Tickets
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
              })}
            </div>

            {hasMoreEvents && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 12)}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-[#FFF1F2] border border-[#E6E8EC] hover:border-rose-200 text-sm font-bold text-[#111827] hover:text-[#E11D48] shadow-xs transition-all cursor-pointer"
                >
                  <span>Show More Events ({filteredEvents.length - visibleCount} remaining)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Custom In-App Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          onClick={() => !deleting && setDeleteTarget(null)}
          className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Confirm event deletion"
            className="bg-white border border-[#E6E8EC] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5"
          >
            <div className="space-y-2">
              <span className="inline-block text-xs font-bold text-[#E11D48] bg-[#FFF1F2] px-3 py-1 rounded-full">
                Confirm Removal
              </span>
              <h3 className="font-display text-2xl font-extrabold text-[#111827]">
                Delete this event?
              </h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Are you sure you want to permanently remove{' '}
                <strong className="text-[#111827]">&ldquo;{deleteTarget.name}&rdquo;</strong> from the catalog?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="py-3 rounded-full bg-[#F1F3F7] hover:bg-[#E5E7EB] text-[#374151] text-sm font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDeleteEvent}
                className="py-3 rounded-full bg-[#E11D48] hover:bg-[#BE123C] text-white text-sm font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
