import React from 'react';
import { Lock } from 'lucide-react';

export default function SeatMap({ seatMap, selectedSeatIds, onToggleSeat }) {
  if (!seatMap || !seatMap.seats) {
    return (
      <div className="bg-[#121214] border border-[#242429] rounded-lg p-12 text-center font-mono text-xs text-[#9E9EA8]">
        Loading venue seating layout...
      </div>
    );
  }

  const categoriesById = (seatMap.categories || []).reduce((acc, cat) => {
    acc[cat.id] = cat;
    return acc;
  }, {});

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
      return 'bg-[#D4FF00] text-[#0B0B0C] border-[#D4FF00] font-bold shadow-sm';
    }

    if (seat.status === 'BOOKED') {
      return 'bg-[#0E0E10] text-[#3A3A42] border-[#1C1C21] cursor-not-allowed';
    }

    if (seat.status === 'HELD' || seat.isLocked) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/40 cursor-not-allowed';
    }

    return 'bg-[#17171A] text-[#F4F4F0] border-[#2C2C34] hover:border-[#D4FF00] hover:text-[#D4FF00] cursor-pointer';
  };

  return (
    <div className="bg-[#121214] border border-[#242429] rounded-lg p-5 sm:p-8 space-y-8 ra-grid-bg">
      {/* Floorplan Status Strip */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-[#242429]">
        <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[#F4F4F0]">
          <span className="w-2 h-2 rounded-full bg-[#D4FF00]" />
          <span>Live Venue Floorplan</span>
        </div>
        <span className="font-mono text-[11px] text-[#666670]">
          Real-time availability · Auto-synced
        </span>
      </div>

      {/* Architectural Stage Deck */}
      <div className="max-w-lg mx-auto pt-1">
        <div className="h-1.5 bg-[#D4FF00] rounded-xs" />
        <div className="border-x border-b border-[#242429] bg-[#0B0B0C]/90 py-2 text-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#9E9EA8] font-semibold">
            STAGE
          </span>
        </div>
      </div>

      {/* Interactive Seat Rows */}
      <div className="overflow-x-auto scrollbar-none py-2">
        <div className="space-y-3 min-w-[340px] max-w-xl mx-auto">
          {Object.entries(rows).map(([rowLabel, seats]) => {
            const firstCat = seats[0] ? categoriesById[seats[0].categoryId] : null;
            return (
              <div key={rowLabel} className="flex items-center justify-center gap-3 sm:gap-4">
                <span className="w-6 text-right font-mono text-xs font-semibold text-[#666670]">
                  {rowLabel}
                </span>

                <div className="flex items-center gap-2 sm:gap-2.5">
                  {seats.map((seat) => {
                    const isAvailable = seat.status === 'AVAILABLE' && !seat.isLocked;
                    const isSelected = selectedSeatIds.includes(seat.id);
                    const cat = categoriesById[seat.categoryId];

                    return (
                      <button
                        key={seat.id}
                        disabled={!isAvailable && !isSelected}
                        onClick={() => onToggleSeat(seat.id)}
                        style={
                          isAvailable && !isSelected && cat?.colorCode
                            ? { borderTopColor: cat.colorCode, borderTopWidth: '2px' }
                            : undefined
                        }
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-md border font-mono text-xs flex items-center justify-center transition-colors ${getSeatClass(
                          seat
                        )}`}
                        title={`Row ${seat.rowLabel} Seat ${seat.seatNumber}${
                          cat ? ` · ${cat.name} ($${cat.price})` : ''
                        } (${seat.status})`}
                      >
                        {seat.status === 'BOOKED' ? (
                          '×'
                        ) : seat.status === 'HELD' || seat.isLocked ? (
                          <Lock className="w-3 h-3" />
                        ) : (
                          seat.seatNumber
                        )}
                      </button>
                    );
                  })}
                </div>

                <span
                  className="w-10 text-left font-mono text-[10px] text-[#666670] hidden sm:inline truncate"
                  title={firstCat?.name}
                >
                  {firstCat ? `$${firstCat.price}` : rowLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tier & Status Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-[#242429] text-xs">
        <div className="flex flex-wrap items-center gap-4">
          {(seatMap.categories || []).map((cat) => (
            <div key={cat.id} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-xs"
                style={{ backgroundColor: cat.colorCode || '#9E9EA8' }}
              />
              <span className="text-[#F4F4F0] font-medium">{cat.name}</span>
              <span className="font-mono text-[#9E9EA8]">${cat.price.toLocaleString('en-US')}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] text-[#9E9EA8]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#D4FF00]" />
            <span className="text-[#F4F4F0]">Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-amber-500/20 border border-amber-500/50" />
            <span>Held</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#0E0E10] border border-[#242429]" />
            <span className="text-[#666670]">Sold</span>
          </div>
        </div>
      </div>
    </div>
  );
}
