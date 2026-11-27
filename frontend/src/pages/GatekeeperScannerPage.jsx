import React, { useState, useRef, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, UserCheck, ArrowLeft, ScanLine, Camera, CameraOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { organizerApi } from '../services/api';

export default function GatekeeperScannerPage() {
  const [qrInput, setQrInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (isCameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((err) => console.error('Video play error:', err));
    }
  }, [isCameraActive]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setScanResult(null);
    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;
      setIsCameraActive(true);

      if ('BarcodeDetector' in window) {
        const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
        const interval = setInterval(async () => {
          if (videoRef.current && streamRef.current && videoRef.current.readyState === 4) {
            try {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes.length > 0) {
                const detectedCode = barcodes[0].rawValue;
                clearInterval(interval);
                stopCamera();
                setQrInput(detectedCode);
                executeVerification(detectedCode);
              }
            } catch {
              // Ignore frame decode errors
            }
          }
        }, 500);
      }
    } catch (err) {
      setScanResult({
        success: false,
        message: `Camera unavailable (${err.message}). Paste or enter the pass token below.`,
      });
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const executeVerification = async (payload) => {
    if (!payload.trim()) return;
    setLoading(true);
    setScanResult(null);

    try {
      const res = await organizerApi.scanQr(payload.trim());
      setScanResult({
        success: true,
        data: res.data,
      });
      setQrInput('');
    } catch (err) {
      setScanResult({
        success: false,
        message: err.response?.data?.message || err.message || 'Invalid or expired QR token.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    executeVerification(qrInput);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-8 py-10 sm:py-12 space-y-8">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#4B5563] hover:text-[#E11D48] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events</span>
        </Link>
        <span className="text-xs font-bold text-[#E11D48] bg-[#FFF1F2] px-3.5 py-1.5 rounded-full">
          Door Check-In
        </span>
      </div>

      <div className="market-card rounded-3xl p-6 sm:p-9 space-y-6">
        <div className="flex items-start justify-between gap-4 border-b border-[#F1F3F7] pb-5">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#111827]">
              Door Ticket Scanner
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              Scan attendee QR passes with your camera or paste a live pass token to check guests in.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FFF1F2] text-[#E11D48] flex items-center justify-center shrink-0">
            <ScanLine className="w-6 h-6" />
          </div>
        </div>

        {/* Camera Viewfinder */}
        <div className="bg-[#F7F8FA] border border-[#E6E8EC] rounded-2xl p-6 text-center">
          {isCameraActive ? (
            <div className="relative max-w-xs mx-auto aspect-square rounded-2xl overflow-hidden bg-black border-2 border-[#E11D48] shadow-md">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <div className="absolute inset-0 border-2 border-dashed border-white/75 m-6 rounded-xl pointer-events-none" />
              <button
                type="button"
                onClick={stopCamera}
                className="absolute top-3 right-3 bg-white/95 hover:bg-white text-[#111827] px-3 py-1.5 rounded-full text-xs font-bold shadow cursor-pointer inline-flex items-center gap-1.5"
              >
                <CameraOff className="w-3.5 h-3.5 text-[#E11D48]" />
                <span>Close</span>
              </button>
            </div>
          ) : (
            <div className="py-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#E6E8EC] text-[#E11D48] flex items-center justify-center mx-auto shadow-2xs">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111827]">Camera QR Scanner</h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Point your phone or laptop camera at the guest&apos;s QR pass
                </p>
              </div>
              <button
                type="button"
                onClick={startCamera}
                className="px-5 py-2.5 bg-white hover:bg-[#FFF1F2] border border-[#E6E8EC] hover:border-rose-200 text-[#111827] hover:text-[#E11D48] font-bold text-xs rounded-full shadow-2xs transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Camera className="w-4 h-4 text-[#E11D48]" />
                <span>Open Camera</span>
              </button>
            </div>
          )}
        </div>

        {/* Manual Token Verification */}
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#374151] mb-2">
              Or Paste Pass Token Manually
            </label>
            <input
              type="text"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              placeholder="TIX-A1B2C3:5912384:signature..."
              className="w-full bg-[#F7F8FA] border border-[#E6E8EC] focus:border-[#E11D48] focus:bg-white text-[#111827] font-mono text-xs px-4 py-3.5 rounded-2xl outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !qrInput.trim()}
            className="w-full py-4 bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold rounded-full shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 text-sm"
          >
            {loading ? (
              <span>Checking Pass...</span>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>Verify &amp; Check In Guest</span>
              </>
            )}
          </button>
        </form>

        {/* Verification Result */}
        {scanResult && (
          <div
            className={`p-5 rounded-2xl border text-left ${
              scanResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-red-50 border-red-200 text-red-950'
            }`}
          >
            <div className="flex items-start gap-3">
              {scanResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-2 flex-1">
                <p className="font-display text-base font-extrabold">
                  {scanResult.success ? scanResult.data.message || 'Valid Ticket — Admit Guest' : 'Entry Denied'}
                </p>

                {scanResult.success ? (
                  <div className="text-xs space-y-1 text-emerald-900 pt-2 border-t border-emerald-200">
                    <p>
                      Guest: <strong>{scanResult.data.attendeeName}</strong>
                    </p>
                    <p>
                      Event: <strong>{scanResult.data.eventName}</strong>
                    </p>
                    <p>
                      Seat: <strong>{scanResult.data.seatInfo}</strong>
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-red-700 font-medium">{scanResult.message}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
