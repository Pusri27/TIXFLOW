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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121214] border border-[#242429] rounded-lg p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#666670] hover:text-[#F4F4F0] p-1 rounded hover:bg-[#1E1E22] cursor-pointer"
          aria-label="Close queue modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[#D4FF00]">
              <Users className="w-3.5 h-3.5" />
              <span>Virtual Waiting Room</span>
            </span>
            <h3 className="font-display text-2xl font-bold text-[#F4F4F0]">High-Demand Queue</h3>
            <p className="text-xs text-[#9E9EA8] leading-relaxed">
              Entry is metered automatically to prevent double-booking during peak ticket drops.
            </p>
          </div>

          {loading || !status ? (
            <div className="py-8 text-center border border-[#242429] bg-[#0B0B0C] rounded-md">
              <div className="w-6 h-6 border-2 border-[#242429] border-t-[#D4FF00] rounded-full animate-spin mx-auto mb-2.5" />
              <span className="font-mono text-xs text-[#9E9EA8]">Assigning queue position...</span>
            </div>
          ) : status.status === 'SERVING' ? (
            <div className="bg-[#17171A] border border-[#D4FF00]/50 rounded-md p-5 text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-[#D4FF00] mx-auto" />
              <div>
                <p className="font-display text-lg font-bold text-[#F4F4F0]">Access Granted</p>
                <p className="text-xs text-[#9E9EA8] mt-1">
                  Position #1 · Direct floorplan access unlocked ({status.queueToken}).
                </p>
              </div>
              <button
                onClick={() => onTokenGranted(status.queueToken)}
                className="w-full py-2.5 bg-[#D4FF00] hover:bg-[#E2FF4D] text-[#0B0B0C] font-bold rounded-md text-xs transition-colors cursor-pointer"
              >
                Enter Floorplan
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-[#0B0B0C] p-5 rounded-md border border-[#242429] flex items-baseline justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-[#9E9EA8]">
                  Queue Position
                </span>
                <span className="font-mono text-3xl font-bold text-[#D4FF00]">
                  #{status.position}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-[#9E9EA8] bg-[#17171A] px-4 py-3 rounded-md border border-[#242429]">
                <span className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#D4FF00]" />
                  <span>Estimated wait</span>
                </span>
                <span className="font-mono font-semibold text-[#F4F4F0]">
                  ~{status.estimatedWaitSeconds}s
                </span>
              </div>
            </div>
          )}

          {status?.status !== 'SERVING' && (
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-[#17171A] hover:bg-[#1E1E22] border border-[#242429] text-[#9E9EA8] hover:text-[#F4F4F0] font-semibold rounded-md text-xs transition-colors cursor-pointer"
            >
              Leave Queue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
