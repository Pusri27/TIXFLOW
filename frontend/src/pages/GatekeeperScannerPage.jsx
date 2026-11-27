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
      } catch (_) {
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
            } catch (_) {}
          }
        }, 500);
      }
    } catch (err) {
      setScanResult({
        success: false,
        message: `Camera unavailable (${err.message}). Paste or type the rotating pass token below.`,
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
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#9E9EA8] hover:text-[#D4FF00] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Events</span>
        </Link>
        <span className="font-mono text-[11px] uppercase tracking-wider text-[#D4FF00] bg-[#121214] border border-[#242429] px-2.5 py-1 rounded">
          Door Control
        </span>
      </div>

      <div className="bg-[#121214] border border-[#242429] rounded-lg p-6 sm:p-8 space-y-6">
        <div className="flex items-start justify-between gap-4 border-b border-[#242429] pb-5">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F4F4F0]">
              Gate Pass Scanner
            </h1>
            <p className="text-xs text-[#9E9EA8] mt-1">
              Scan attendee QR passes via camera or verify a rotating HMAC token string directly.
            </p>
          </div>
          <div className="w-10 h-10 rounded-md bg-[#D4FF00] text-[#0B0B0C] flex items-center justify-center shrink-0">
            <ScanLine className="w-5 h-5" />
          </div>
        </div>

        {/* Camera Viewfinder */}
        <div className="bg-[#0B0B0C] border border-[#242429] rounded-md p-6 text-center">
          {isCameraActive ? (
            <div className="relative max-w-xs mx-auto aspect-square rounded-md overflow-hidden bg-black border border-[#D4FF00]">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <div className="absolute inset-0 border border-dashed border-[#D4FF00]/70 m-6 rounded pointer-events-none" />
              <button
                type="button"
                onClick={stopCamera}
                className="absolute top-2.5 right-2.5 bg-[#0B0B0C]/90 hover:bg-[#121214] border border-[#242429] text-[#F4F4F0] px-2.5 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <CameraOff className="w-3.5 h-3.5 text-red-400" />
                <span>Stop</span>
              </button>
            </div>
          ) : (
            <div className="py-4 space-y-3">
              <div className="w-11 h-11 rounded-md bg-[#121214] border border-[#242429] text-[#D4FF00] flex items-center justify-center mx-auto">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F4F4F0]">Optical QR Reader</h3>
                <p className="text-xs text-[#666670] mt-0.5">
                  Point device camera at attendee mobile pass
                </p>
              </div>
              <button
                type="button"
                onClick={startCamera}
                className="px-4 py-2.5 bg-[#17171A] hover:bg-[#1E1E22] border border-[#242429] text-[#F4F4F0] font-semibold text-xs rounded-md transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <Camera className="w-3.5 h-3.5 text-[#D4FF00]" />
                <span>Open Camera</span>
              </button>
            </div>
          )}
        </div>

        {/* Manual Token Verification */}
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-[11px] text-[#9E9EA8] uppercase tracking-wider mb-2">
              Pass Token / QR Payload
            </label>
            <input
              type="text"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              placeholder="TIX-A1B2C3:5912384:signature..."
              className="w-full bg-[#0B0B0C] border border-[#242429] focus:border-[#D4FF00] text-[#F4F4F0] font-mono text-xs px-3.5 py-3 rounded-md outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !qrInput.trim()}
            className="w-full py-3.5 bg-[#D4FF00] hover:bg-[#E2FF4D] text-[#0B0B0C] font-bold rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 text-sm"
          >
            {loading ? (
              <span>Verifying Token...</span>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>Verify &amp; Check In</span>
              </>
            )}
          </button>
        </form>

        {/* Verification Result */}
        {scanResult && (
          <div
            className={`p-5 rounded-md border text-left ${
              scanResult.success
                ? 'bg-emerald-500/10 border-emerald-500/40'
                : 'bg-red-500/10 border-red-500/40'
            }`}
          >
            <div className="flex items-start gap-3">
              {scanResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-[#D4FF00] shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-2 flex-1">
                <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#F4F4F0]">
                  {scanResult.success ? scanResult.data.message || 'ADMIT — VALID PASS' : 'ENTRY DENIED'}
                </p>

                {scanResult.success ? (
                  <div className="font-mono text-xs space-y-1 text-[#9E9EA8] pt-2 border-t border-white/10">
                    <p>
                      Holder: <strong className="text-[#F4F4F0]">{scanResult.data.attendeeName}</strong>
                    </p>
                    <p>
                      Event: <strong className="text-[#F4F4F0]">{scanResult.data.eventName}</strong>
                    </p>
                    <p>
                      Seat: <strong className="text-[#D4FF00]">{scanResult.data.seatInfo}</strong>
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-red-300">{scanResult.message}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
