import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle2, Users, X } from 'lucide-react';
import { queueApi } from '../services/api';

export default function WaitingRoomModal({ eventId, onTokenGranted, onClose }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const joinAndPollQueue = async () => {
      try {
        const res = await queueApi.join(eventId);
        if (!active) return;
        setStatus(res.data);
      } catch {
        if (!active) return;
        setStatus({
          status: 'SERVING',
          position: 1,
          estimatedWaitSeconds: 0,
          queueToken: `QTOKEN-GUEST-${eventId}`,
        });
      } finally {
        if (active) setLoading(false);
      }
    };

    const pollQueueStatus = async () => {
      try {
        const res = await queueApi.getStatus(eventId);
        if (!active) return;
        setStatus(res.data);
      } catch {
        // Fallback already set
      }
    };

    joinAndPollQueue();
    const interval = setInterval(pollQueueStatus, 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [eventId]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-[#E6E8EC] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#9CA3AF] hover:text-[#111827] p-1.5 rounded-full hover:bg-[#F1F3F7] cursor-pointer"
          aria-label="Close queue modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 bg-[#FFF1F2] text-[#E11D48] text-xs font-bold px-3 py-1 rounded-full">
              <Users className="w-3.5 h-3.5" />
              <span>Virtual Waiting Room</span>
            </span>
            <h3 className="font-display text-2xl font-extrabold text-[#111827]">
              Fair Ticket Queue
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
              During high-demand drops, fans enter in order so nobody loses seats mid-checkout.
            </p>
          </div>

          {loading || !status ? (
            <div className="py-8 text-center bg-[#F7F8FA] border border-[#E6E8EC] rounded-2xl">
              <div className="w-7 h-7 border-3 border-[#E6E8EC] border-t-[#E11D48] rounded-full animate-spin mx-auto mb-2.5" />
              <span className="text-xs font-medium text-[#6B7280]">Checking your spot in line...</span>
            </div>
          ) : status.status === 'SERVING' ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <div>
                <p className="font-display text-xl font-extrabold text-[#111827]">You&apos;re Up!</p>
                <p className="text-xs text-[#4B5563] mt-1">
                  Spot #1 verified · You have direct access to select seats now.
                </p>
              </div>
              <button
                onClick={() => onTokenGranted(status.queueToken)}
                className="w-full py-3 bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold rounded-full text-sm shadow-sm transition-colors cursor-pointer"
              >
                Choose My Seats
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-[#F7F8FA] p-5 rounded-2xl border border-[#E6E8EC] flex items-baseline justify-between">
                <span className="text-xs font-semibold text-[#6B7280]">Your Place in Line</span>
                <span className="font-display text-3xl font-extrabold text-[#E11D48]">
                  #{status.position}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-[#4B5563] bg-[#FFFBEB] px-4 py-3 rounded-2xl border border-amber-200">
                <span className="flex items-center gap-2 font-medium text-amber-800">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Estimated wait time</span>
                </span>
                <span className="font-bold text-amber-900">
                  ~{status.estimatedWaitSeconds} sec
                </span>
              </div>
            </div>
          )}

          {status?.status !== 'SERVING' && (
            <button
              onClick={onClose}
              className="w-full py-3 bg-[#F1F3F7] hover:bg-[#E5E7EB] text-[#4B5563] font-semibold rounded-full text-xs transition-colors cursor-pointer"
            >
              Leave Waiting Room
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
