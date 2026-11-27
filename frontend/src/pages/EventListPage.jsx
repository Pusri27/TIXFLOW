import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventApi, adminApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Calendar, MapPin, Search, ArrowUpRight, Edit, Trash2 } from 'lucide-react';

const FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80';

export default function EventListPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
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

  const handleDeleteEvent = async (e, eventId, eventName) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm(`Delete "${eventName}" permanently?`)) {
      return;
    }

    try {
      await adminApi.deleteEvent(eventId);
      setEvents((prev) => prev.filter((item) => item.id !== eventId));
      showToast({
        type: 'success',
        title: 'Event Removed',
        message: `"${eventName}" has been deleted.`,
      });
    } catch (err) {
      console.error(err);
      showToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.response?.data?.message || err.message,
      });
    }
  };

  const categories = [
    { id: '', name: 'All Events' },
    { id: 'CONCERT', name: 'Music & Concerts' },
    { id: 'MOVIE', name: 'Film & Screenings' },
    { id: 'SPORTS', name: 'Sports' },
    { id: 'THEATER', name: 'Stage & Arts' },
  ];

  const filteredEvents = events.filter(
    (e) =>
      e.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue?.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredEvent = !selectedCategory && !searchQuery && events.length > 0 ? events[0] : null;

  const formatDateBadge = (dateString) => {
    if (!dateString) return { month: 'TBA', day: '--', weekday: 'DATE' };
    const d = new Date(dateString);
    return {
      month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
      day: String(d.getDate()).padStart(2, '0'),
      weekday: d.toLocaleString('en-US', { weekday: 'short' }).toUpperCase(),
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-14">
      {/* Asymmetric Editorial Featured Showcase */}
      {featuredEvent && (
        <section className="border border-[#242429] bg-[#121214] rounded-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left Editorial Column */}
            <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between gap-8 order-2 lg:order-1">
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-wider">
                  <span className="inline-flex items-center gap-2 bg-[#D4FF00] text-[#0B0B0C] font-bold px-2.5 py-1 rounded-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0B0B0C]" />
                    Featured Release
                  </span>
                  <span className="text-[#9E9EA8] border border-[#242429] px-2.5 py-1 rounded-sm">
                    {featuredEvent.category}
                  </span>
                </div>

                <h1 className="font-display text-3xl sm:text-5xl font-bold text-[#F4F4F0] leading-[1.04] tracking-tight">
                  {featuredEvent.name}
                </h1>

                <p className="text-[#9E9EA8] text-sm sm:text-base leading-relaxed line-clamp-3 max-w-2xl">
                  {featuredEvent.description}
                </p>
              </div>

              <div className="space-y-6 pt-4 border-t border-[#242429]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 text-[#D4FF00] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#666670] block">
                        Date &amp; Doors
                      </span>
                      <span className="text-[#F4F4F0] font-medium">
                        {new Date(featuredEvent.startTime).toLocaleString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {featuredEvent.venue && (
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-[#D4FF00] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-[#666670] block">
                          Venue
                        </span>
                        <span className="text-[#F4F4F0] font-medium">
                          {featuredEvent.venue.name}, {featuredEvent.venue.city}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <Link
                    to={`/events/${featuredEvent.id}`}
                    className="inline-flex items-center gap-2 bg-[#D4FF00] hover:bg-[#E2FF4D] text-[#0B0B0C] font-bold px-6 py-3.5 rounded-md text-sm transition-colors group"
                  >
                    <span>Get Tickets</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                  <span className="font-mono text-[11px] text-[#666670] hidden sm:inline">
                    Instant seat selection
                  </span>
                </div>
              </div>
            </div>

            {/* Right Unblurred Artwork Column */}
            <div
              onClick={() => navigate(`/events/${featuredEvent.id}`)}
              className="lg:col-span-5 relative aspect-[16/10] lg:aspect-auto lg:min-h-[420px] bg-[#0B0B0C] overflow-hidden cursor-pointer group order-1 lg:order-2 border-b lg:border-b-0 lg:border-l border-[#242429]"
            >
              <img
                src={featuredEvent.posterUrl || FALLBACK_POSTER}
                alt={featuredEvent.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = FALLBACK_POSTER;
                }}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C]/60 via-transparent to-transparent lg:hidden" />
            </div>
          </div>
        </section>
      )}

      {/* Program Directory Header & Filter Bar */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F4F4F0] tracking-tight">
                Upcoming Lineup
              </h2>
              {!loading && (
                <span className="font-mono text-xs text-[#D4FF00] bg-[#17171A] border border-[#242429] px-2 py-0.5 rounded">
                  {String(filteredEvents.length).padStart(2, '0')}
                </span>
              )}
            </div>
            <p className="text-[#9E9EA8] text-xs sm:text-sm mt-1">
              Live tours, arena fixtures, film premieres, and stage productions.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#666670] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search artist, event, city..."
              className="w-full bg-[#121214] border border-[#242429] focus:border-[#D4FF00] rounded-md pl-10 pr-4 py-2.5 text-xs text-[#F4F4F0] placeholder-[#666670] outline-none transition-colors"
            />
          </div>
        </div>

        {/* Clean Editorial Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none border-b border-[#242429]">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer -mb-px ${
                  isActive
                    ? 'border-[#D4FF00] text-[#D4FF00]'
                    : 'border-transparent text-[#9E9EA8] hover:text-[#F4F4F0]'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Event Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-[#121214] border border-[#242429] rounded-lg overflow-hidden animate-pulse"
              >
                <div className="aspect-[16/10] bg-[#17171A]" />
                <div className="p-5 space-y-3">
                  <div className="w-24 h-3 bg-[#1E1E22] rounded" />
                  <div className="w-3/4 h-5 bg-[#1E1E22] rounded" />
                  <div className="w-1/2 h-3 bg-[#17171A] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="border border-[#242429] bg-[#121214] rounded-lg py-20 px-6 text-center">
            <p className="font-display text-lg font-bold text-[#F4F4F0]">No matching events</p>
            <p className="text-xs text-[#9E9EA8] mt-1">
              Try clearing your search query or switching to All Events.
            </p>
            {(searchQuery || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                }}
                className="mt-5 px-4 py-2 rounded-md bg-[#17171A] hover:bg-[#1E1E22] border border-[#242429] text-xs font-semibold text-[#D4FF00] cursor-pointer transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {filteredEvents.map((event) => {
              const dateInfo = formatDateBadge(event.startTime);
              return (
                <article
                  key={event.id}
                  onClick={() => navigate(`/events/${event.id}`)}
                  className="group bg-[#121214] border border-[#242429] hover:border-[#D4FF00]/60 rounded-lg overflow-hidden transition-colors flex flex-col cursor-pointer relative"
                >
                  {/* Admin Quick Controls */}
                  {isAdmin && (
                    <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-[#0B0B0C]/90 border border-[#242429] p-1 rounded-md">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/events/edit/${event.id}`);
                        }}
                        className="p-1.5 text-[#F4F4F0] hover:text-[#D4FF00] hover:bg-[#17171A] rounded transition-colors cursor-pointer"
                        title="Edit Event"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteEvent(e, event.id, event.name)}
                        className="p-1.5 text-[#9E9EA8] hover:text-red-400 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                        title="Delete Event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Crisp Poster Frame */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#0B0B0C] border-b border-[#242429]">
                    <img
                      src={event.posterUrl || FALLBACK_POSTER}
                      alt={event.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = FALLBACK_POSTER;
                      }}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />

                    {/* Architectural Date Stamp */}
                    <div className="absolute top-3 left-3 bg-[#0B0B0C]/95 border border-[#242429] px-2.5 py-1.5 rounded text-left font-mono">
                      <span className="block text-[10px] font-bold text-[#D4FF00] leading-none">
                        {dateInfo.weekday} · {dateInfo.month} {dateInfo.day}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-5">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-wider text-[#666670]">
                        <span>{event.category}</span>
                        <span>
                          {new Date(event.startTime).toLocaleString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <h3 className="font-display text-lg font-bold text-[#F4F4F0] group-hover:text-[#D4FF00] transition-colors line-clamp-1">
                        {event.name}
                      </h3>

                      <p className="text-[#9E9EA8] text-xs line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    <div className="pt-3.5 border-t border-[#242429] flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-1.5 text-[#9E9EA8] min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-[#666670] shrink-0" />
                        <span className="truncate">
                          {event.venue ? `${event.venue.name}, ${event.venue.city}` : 'TBA'}
                        </span>
                      </div>

                      <span className="font-mono text-[11px] font-semibold text-[#F4F4F0] group-hover:text-[#D4FF00] shrink-0 inline-flex items-center gap-1 transition-colors">
                        Tickets
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
