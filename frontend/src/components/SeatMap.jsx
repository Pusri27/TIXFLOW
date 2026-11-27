import React from 'react';
import { Lock } from 'lucide-react';
import { formatPrice, formatCompactPrice } from '../utils/formatPrice';

export default function SeatMap({ seatMap, selectedSeatIds, onToggleSeat }) {
  if (!seatMap || !seatMap.seats) {
    return (
      <div className="market-card rounded-3xl p-12 text-center text-sm font-medium text-[#6B7280]">
        Loading interactive stadium seating map...
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

  // Compute gentle amphitheater parabolic curve offset per seat index in row
  const getCurveOffset = (index, totalInRow) => {
    if (totalInRow <= 2) return 0;
    const center = (totalInRow - 1) / 2;
    const normalized = (index - center) / center; // -1 to 1
    return Math.round(normalized * normalized * 12); // outer seats curve slightly upward/downward toward stage
  };

  const getSeatClass = (seat) => {
    const isSelected = selectedSeatIds.includes(seat.id);

    if (isSelected) {
      return 'bg-[#E11D48] text-white border-[#E11D48] font-bold shadow-md shadow-rose-500/30 scale-110 z-10';
    }

    if (seat.status === 'BOOKED') {
      return 'bg-[#E5E7EB] text-[#9CA3AF] border-transparent cursor-not-allowed';
    }

    if (seat.status === 'HELD' || seat.isLocked) {
      return 'bg-amber-50 text-amber-700 border-amber-300 cursor-not-allowed';
    }

    return 'bg-white text-[#111827] border-[#D1D5DB] hover:border-[#E11D48] hover:text-[#E11D48] hover:scale-110 shadow-2xs cursor-pointer';
  };

  return (
    <div className="market-card rounded-3xl p-5 sm:p-8 space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-[#F1F3F7]">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Stadium Availability</span>
        </div>
        <span className="text-xs text-[#6B7280]">
          Tap any open seat circle to select · Synced in real time
        </span>
      </div>

      {/* Curved Amphitheater Stage Arc */}
      <div className="max-w-xl mx-auto pt-1 text-center">
        <svg viewBox="0 0 520 68" className="w-full max-w-md mx-auto overflow-visible">
          <defs>
            <radialGradient id="stageWash" cx="50%" cy="20%" r="60%">
              <stop offset="0%" stopColor="#FB7185" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#FB7185" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="260" cy="40" rx="220" ry="32" fill="url(#stageWash)" />
          <path
            d="M 40 52 Q 260 8 480 52"
            fill="none"
            stroke="#E11D48"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <text
            x="260"
            y="50"
            textAnchor="middle"
            fill="#6B7280"
            fontSize="11"
            fontWeight="700"
            letterSpacing="3"
          >
            MAIN STAGE
          </text>
        </svg>
      </div>

      {/* Curved Bowl Seat Rows */}
      <div className="overflow-x-auto scrollbar-none py-3 bg-[#F7F8FA] rounded-2xl border border-[#E6E8EC] px-4">
        <div className="space-y-4 min-w-[360px] max-w-xl mx-auto py-3">
          {Object.entries(rows).map(([rowLabel, seats]) => {
            const firstCat = seats[0] ? categoriesById[seats[0].categoryId] : null;
            return (
              <div key={rowLabel} className="flex items-center justify-center gap-3 sm:gap-4">
                <span className="w-6 text-right text-xs font-bold text-[#6B7280]">
                  {rowLabel}
                </span>

                <div className="flex items-center gap-2 sm:gap-2.5 py-1">
                  {seats.map((seat, idx) => {
                    const isAvailable = seat.status === 'AVAILABLE' && !seat.isLocked;
                    const isSelected = selectedSeatIds.includes(seat.id);
                    const cat = categoriesById[seat.categoryId];
                    const yOffset = getCurveOffset(idx, seats.length);

                    return (
                      <button
                        key={seat.id}
                        disabled={!isAvailable && !isSelected}
                        onClick={() => onToggleSeat(seat.id)}
                        style={{
                          transform: `translateY(${yOffset}px)`,
                          ...(isAvailable && !isSelected && cat?.colorCode
                            ? { borderColor: cat.colorCode, borderWidth: '2px' }
                            : {}),
                        }}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border text-xs font-semibold flex items-center justify-center transition-all duration-150 ${getSeatClass(
                          seat
                        )}`}
                        title={`Row ${seat.rowLabel} Seat ${seat.seatNumber}${
                          cat ? ` · ${cat.name} (${formatPrice(cat.price)})` : ''
                        } (${seat.status})`}
                      >
                        {seat.status === 'BOOKED' ? (
                          '×'
                        ) : seat.status === 'HELD' || seat.isLocked ? (
                          <Lock className="w-3.5 h-3.5" />
                        ) : (
                          seat.seatNumber
                        )}
                      </button>
                    );
                  })}
                </div>

                <span
                  className="w-16 text-left text-[11px] font-semibold text-[#6B7280] hidden sm:inline whitespace-nowrap"
                  title={firstCat?.name}
                >
                  {firstCat ? formatCompactPrice(firstCat.price) : rowLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clean Consumer Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          {(seatMap.categories || []).map((cat) => (
            <div
              key={cat.id}
              className="inline-flex items-center gap-2 bg-[#F7F8FA] border border-[#E6E8EC] px-3 py-1.5 rounded-full"
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: cat.colorCode || '#6B7280' }}
              />
              <span className="text-[#111827] font-semibold">{cat.name}</span>
              <span className="text-[#6B7280] font-medium">{formatPrice(cat.price)}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#4B5563]">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#E11D48]" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-100 border border-amber-400" />
            <span>On Hold</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#E5E7EB]" />
            <span className="text-[#9CA3AF]">Sold</span>
          </div>
        </div>
      </div>
    </div>
  );
}
