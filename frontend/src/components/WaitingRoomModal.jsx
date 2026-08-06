import React, { useEffect, useState } from 'react';
import { Clock, ShieldCheck, Users, Sparkles } from 'lucide-react';
import { queueApi } from '../services/api';

export default function WaitingRoomModal({ eventId, onTokenGranted, onClose }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    joinAndPollQueue();
    const interval = setInterval(pollQueueStatus, 3000);
    return () => clearInterval(interval);
  }, [eventId]);

  const joinAndPollQueue = async () => {
    try {
      const res = await queueApi.join(eventId);
      setStatus(res.data);
      if (res.data.status === 'SERVING' && res.data.queueToken) {
        onTokenGranted(res.data.queueToken);
      }
    } catch (err) {
      console.error('Queue Join Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const pollQueueStatus = async () => {
    try {
      const res = await queueApi.getStatus(eventId);
      setStatus(res.data);
      if (res.data.status === 'SERVING' && res.data.queueToken) {
        onTokenGranted(res.data.queueToken);
      }
    } catch (err) {
      console.error('Queue Poll Error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden">
        {/* Glowing Background Pulse */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="w-16 h-16 bg-blue-600/20 border border-blue-500/40 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
            <Users className="w-8 h-8 animate-pulse" />
          </div>

          <h3 className="text-2xl font-black text-white mb-2 flex items-center justify-center gap-2">
            <span>Ruang Antrean War Ticket</span>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Sistem membatasi traffic transaksi secara bertahap demi stabilitas database.
          </p>

          {loading || !status ? (
            <div className="py-8 text-slate-400 text-sm">Menghubungkan ke server antrean...</div>
          ) : status.status === 'SERVING' ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 mb-6">
              <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-emerald-300 font-bold text-lg">Giliran Anda Tiba!</p>
              <p className="text-xs text-slate-300 mt-1">
                Token akses tiket Anda telah diterbitkan. Membuka pemilihan kursi...
              </p>
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Posisi Antrean Anda</p>
                <p className="text-4xl font-black text-blue-400 font-mono">#{status.position}</p>
              </div>

              <div className="flex items-center justify-center space-x-2 text-xs text-slate-400 bg-slate-950/60 py-3 rounded-xl border border-slate-800">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Estimasi Waktu Tunggu: ~{status.estimatedWaitSeconds} detik</span>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm transition-colors"
          >
            Batal & Keluar Antrean
          </button>
        </div>
      </div>
    </div>
  );
}
