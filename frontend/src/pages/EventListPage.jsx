import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventApi, adminApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Sparkles, Music, Film, Trophy, Theater, Search, ArrowUpRight, Flame, Edit, Trash2 } from 'lucide-react';

export default function EventListPage() {
  const { user } = useAuth();
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
      setEvents(Array.isArray(res.data) ? res.data : (res.data?.content || []));
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

    if (!window.confirm(`Are you sure you want to permanently delete event "${eventName}"?`)) {
      return;
    }

    try {
      await adminApi.deleteEvent(eventId);
      setEvents((prev) => prev.filter((item) => item.id !== eventId));
      alert(`Event "${eventName}" deleted successfully.`);
    } catch (err) {
      console.error(err);
      alert('Failed to delete event: ' + (err.response?.data?.message || err.message));
    }
  };

  const categories = [
    { id: '', name: 'All Featured', icon: Sparkles },
    { id: 'CONCERT', name: 'Concerts & Music', icon: Music },
    { id: 'MOVIE', name: 'Cinema & Premieres', icon: Film },
    { id: 'SPORTS', name: 'Sports & Arenas', icon: Trophy },
    { id: 'THEATER', name: 'Theater & Performing', icon: Theater },
  ];

  const filteredEvents = events.filter((e) =>
    e.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredEvent = events.length > 0 ? events[0] : null;

  const formatDateBadge = (dateString) => {
    if (!dateString) return { month: 'AUG', day: '15' };
    const d = new Date(dateString);
    const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const day = d.getDate();
    return { month, day };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-12">
      {/* Editorial Featured Spotlight Hero */}
      {featuredEvent && (
        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#0d0e15] shadow-2xl group">
          <div className="absolute inset-0">
            <img
              src={featuredEvent.posterUrl}
              alt={featuredEvent.name}
              className="w-full h-full object-cover object-center filter brightness-[0.35] blur-[2px] group-hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07080c] via-[#07080c]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#07080c] via-[#07080c]/80 to-transparent" />
          </div>

          <div className="relative z-10 p-8 sm:p-14 max-w-3xl space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md flex items-center space-x-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Featured Headline Event</span>
              </span>
              <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Instant Reservation</span>
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none">
              {featuredEvent.name}
            </h1>

            <p className="text-zinc-300 text-base sm:text-lg line-clamp-2 leading-relaxed font-normal">
              {featuredEvent.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-medium text-zinc-300">
              <div className="flex items-center space-x-2 bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-md border border-white/10">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>{new Date(featuredEvent.startTime).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</span>
              </div>
              {featuredEvent.venue && (
                <div className="flex items-center space-x-2 bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-md border border-white/10">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>{featuredEvent.venue.name}, {featuredEvent.venue.city}</span>
                </div>
              )}
            </div>

            <div className="pt-4 flex items-center space-x-4">
              <Link
                to={`/events/${featuredEvent.id}`}
                className="bg-white text-black hover:bg-zinc-200 font-extrabold px-6 py-3.5 rounded-2xl text-sm transition-all shadow-xl flex items-center space-x-2 group/btn"
              >
                <span>Select Seats &amp; Reserve</span>
                <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Discovery Toolbar */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Explore Live Experiences</h2>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">Discover world-tour concerts, exclusive theater shows, and stadium sports events.</p>
          </div>

          {/* Search Bar Input */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, artist, venue..."
              className="w-full bg-[#11131c] border border-white/10 focus:border-indigo-500 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder-zinc-500 outline-none transition-all"
            />
            <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-3.5" />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2.5 overflow-x-auto pb-2 scrollbar-none border-b border-white/[0.08] pt-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white text-black shadow-lg scale-102'
                    : 'bg-[#131520] border border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-indigo-400'}`} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Event Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 bg-[#11131c] rounded-3xl animate-pulse border border-white/10" />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-24 bg-[#0d0e15] rounded-3xl border border-white/10">
          <Sparkles className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-300 text-lg font-bold">No upcoming events match your filter.</p>
          <p className="text-zinc-500 text-xs mt-1">Try resetting search keywords or switching category filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => {
            const dateInfo = formatDateBadge(event.startTime);
            return (
              <div
                key={event.id}
                onClick={() => navigate(`/events/${event.id}`)}
                className="group bg-[#0d0e15] border border-white/[0.08] hover:border-indigo-500/50 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col cursor-pointer relative"
              >
                {/* Admin Quick Control Bar */}
                {isAdmin && (
                  <div className="absolute top-3 right-3 z-30 flex items-center space-x-1.5 bg-[#07080c]/90 border border-white/20 backdrop-blur-md p-1.5 rounded-2xl shadow-xl">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/events/edit/${event.id}`);
                      }}
                      className="p-1.5 text-amber-400 hover:bg-amber-500/20 rounded-xl transition-colors"
                      title="Edit Event"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => handleDeleteEvent(e, event.id, event.name)}
                      className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-xl transition-colors"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Poster Cover */}
                <div className="relative aspect-[16/10] overflow-hidden bg-black">
                  <img
                    src={event.posterUrl}
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e15] via-transparent to-transparent opacity-80" />

                  {/* Date Badge (Top Left) */}
                  <div className="absolute top-4 left-4 bg-[#07080c]/90 backdrop-blur-md rounded-2xl p-2.5 text-center min-w-[50px] border border-white/10 shadow-lg">
                    <span className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest">{dateInfo.month}</span>
                    <span className="block text-lg font-black text-white leading-none mt-0.5">{dateInfo.day}</span>
                  </div>

                  {/* Category Pill (Top Right - shift left if admin) */}
                  <div className={`absolute top-4 ${isAdmin ? 'right-24' : 'right-4'} bg-[#07080c]/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-zinc-300 border border-white/10`}>
                    {event.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1 mb-2">
                      {event.name}
                    </h3>
                    <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed font-normal">{event.description}</p>
                  </div>

                  <div className="space-y-2.5 border-t border-white/[0.08] pt-4 text-xs font-medium text-zinc-300">
                    <div className="flex items-center space-x-2 text-zinc-400">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{new Date(event.startTime).toLocaleString('en-US', { timeStyle: 'short' })}</span>
                    </div>

                    {event.venue && (
                      <div className="flex items-center space-x-2 text-zinc-400">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="line-clamp-1">{event.venue.name}, {event.venue.city}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
