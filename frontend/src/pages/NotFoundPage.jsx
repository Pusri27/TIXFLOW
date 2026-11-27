import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="market-card rounded-3xl p-8 sm:p-10 space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-[#FFF1F2] text-[#E11D48] flex items-center justify-center mx-auto">
          <Compass className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <span className="inline-block text-xs font-bold text-[#E11D48] bg-[#FFF1F2] px-3 py-1 rounded-full">
            404 · Page Not Found
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#111827]">
            We couldn&apos;t find that page
          </h1>
          <p className="text-sm text-[#6B7280] leading-relaxed">
            The link may have moved or the event URL does not exist. Head back to the main lineup to explore upcoming shows.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold px-6 py-3 rounded-full text-sm shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Explore Upcoming Events</span>
        </Link>
      </div>
    </div>
  );
}
