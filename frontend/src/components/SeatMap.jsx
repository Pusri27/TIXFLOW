import React from 'react';
import { Lock, Zap, CheckCircle } from 'lucide-react';

export default function SeatMap({ seatMap, selectedSeatIds, onToggleSeat }) {
  if (!seatMap || !seatMap.seats) {
    return <div className="text-zinc-500 p-12 text-center text-sm font-semibold">Loading Live Stadium Seating Plan...</div>;
  }

  // Group seats by row
  const rows = seatMap.seats.reduce((acc, seat) => {
    if (!acc[seat.rowLabel]) {
      acc[seat.rowLabel] = [];
    }
    acc[seat.rowLabel].push(seat);
    return acc;
  }, {});

  const getSeatClass = (seat) => {
    const isSelected = selectedSeatIds.includes(seat.id);

    if (isSelected) {
      return 'bg-emerald-500 text-white border-emerald-400 shadow-xl shadow-emerald-500/50 scale-110 ring-2 ring-emerald-300 z-10';
    }

    if (seat.status === 'BOOKED') {
      return 'bg-[#181a26] text-zinc-700 border-white/[0.05] cursor-not-allowed opacity-35';
    }

    if (seat.status === 'HELD' || seat.isLocked) {
      return 'bg-amber-500/20 text-amber-400 border-amber-500/40 cursor-not-allowed animate-pulse';
    }

    return 'bg-[#11131e] text-zinc-300 border-white/10 hover:border-indigo-400 hover:text-white hover:scale-110 transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-indigo-500/25';
  };

  return (
    <div className="bg-[#0d0e15] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 backdrop-blur-2xl">
      {/* Real-time status header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-6 border-b border-white/[0.08]">
        <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">WebSocket STOMP Active</span>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-zinc-400 font-medium">
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          <span>Real-time seat holds synced via Redis lock engine</span>
        </div>
      </div>

      {/* Main Stage Arch */}
      <div className="w-full max-w-xl mx-auto py-2">
        <div className="relative">
          <div className="h-4 bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full shadow-[0_0_35px_rgba(99,102,241,0.9)] opacity-90" />
          <div className="absolute top-0 inset-x-0 h-1 bg-white/40 rounded-full blur-[1px]" />
        </div>
        <p className="text-center text-[10px] uppercase tracking-[0.3em] text-indigo-400 font-black mt-3">
          ● MAIN PERFORMANCE STAGE ●
        </p>
      </div>

      {/* Legend Bar */}
      <div className="flex flex-wrap items-center justify-center gap-6 bg-[#131522] py-4 px-6 rounded-2xl border border-white/10 shadow-inner">
        {(seatMap.categories || []).map((cat) => (
          <div key={cat.id} className="flex items-center space-x-2">
            <span
              className="w-3 h-3 rounded-full border shadow-sm"
              style={{ backgroundColor: cat.colorCode, borderColor: cat.colorCode }}
            />
            <span className="text-xs font-bold text-zinc-200">
              {cat.name} (${cat.price.toLocaleString('en-US')})
            </span>
          </div>
        ))}
        <div className="flex items-center space-x-2 border-l border-white/10 pl-4">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/50" />
          <span className="text-xs font-bold text-emerald-400">Selected</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-amber-500/40 border border-amber-500" />
          <span className="text-xs font-semibold text-zinc-400">User Hold</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-[#181a26] border border-white/10" />
          <span className="text-xs font-semibold text-zinc-600">Reserved</span>
        </div>
      </div>

      {/* Interactive Seat Rows */}
      <div className="overflow-x-auto scrollbar-none py-4">
        <div className="space-y-4 min-w-[340px] max-w-xl mx-auto">
        {Object.entries(rows).map(([rowLabel, seats]) => (
          <div key={rowLabel} className="flex items-center justify-center space-x-4">
            <span className="w-6 text-center font-black text-xs text-zinc-400 uppercase tracking-widest">{rowLabel}</span>
            <div className="flex items-center space-x-3">
              {seats.map((seat) => {
                const isAvailable = seat.status === 'AVAILABLE' && !seat.isLocked;
                const isSelected = selectedSeatIds.includes(seat.id);

                return (
                  <button
                    key={seat.id}
                    disabled={!isAvailable && !isSelected}
                    onClick={() => onToggleSeat(seat.id)}
                    className={`w-10 h-10 rounded-2xl border text-xs font-extrabold flex items-center justify-center transition-all ${getSeatClass(
                      seat
                    )}`}
                    title={`Seat ${seat.rowLabel}-${seat.seatNumber} (${seat.status})`}
                  >
                    {seat.status === 'BOOKED' ? (
                      '✕'
                    ) : seat.status === 'HELD' || seat.isLocked ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : (
                      seat.seatNumber
                    )}
                  </button>
                );
              })}
            </div>
            <span className="w-6 text-center font-black text-xs text-zinc-400 uppercase tracking-widest">{rowLabel}</span>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
