import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, QrCode, CheckCircle2, UserCheck, ArrowLeft, ScanLine, Camera, CameraOff, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { organizerApi } from '../services/api';

export default function GatekeeperScannerPage() {
  const [qrInput, setQrInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Attach camera stream to video element when isCameraActive turns true and element mounts
  useEffect(() => {
    if (isCameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((err) => console.error('Video play error:', err));
    }
  }, [isCameraActive]);

  // Clean up camera stream on unmount
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
          video: { facingMode: 'environment' }
        });
      } catch (_) {
        // Fallback for laptop / desktop webcams
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;
      setIsCameraActive(true);

      // Attempt native BarcodeDetector if supported by browser
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
      alert('Camera access issue: ' + err.message + '. Please check camera permissions in your browser or enter the pass token manually.');
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
        message: err.response?.data?.message || err.message || 'Failed to verify QR Payload',
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
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <Link to="/" className="flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors text-sm font-bold">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <span className="text-xs font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full font-bold">
          Gatekeeper App
        </span>
      </div>

      <div className="bg-[#0d0e15] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/20">
            <ScanLine className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Gatekeeper QR Scanner</h1>
          <p className="text-zinc-400 text-xs font-medium max-w-md mx-auto">
            Scan physical or digital dynamic TOTP QR code passes for immediate venue gate validation.
          </p>
        </div>

        {/* Live Camera Viewfinder Box */}
        <div className="bg-[#131522] border border-white/10 rounded-3xl p-6 text-center space-y-4">
          {isCameraActive ? (
            <div className="relative max-w-sm mx-auto aspect-square rounded-2xl overflow-hidden bg-black border-2 border-indigo-500/50 shadow-2xl">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <div className="absolute inset-0 border-2 border-dashed border-indigo-400/60 m-8 rounded-xl pointer-events-none animate-pulse" />
              <button
                type="button"
                onClick={stopCamera}
                className="absolute top-3 right-3 bg-rose-500/80 hover:bg-rose-500 text-white p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
              >
                <CameraOff className="w-4 h-4" />
                <span>Close Camera</span>
              </button>
            </div>
          ) : (
            <div className="py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Live Camera Scanner</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Use device camera to automatically scan attendee QR pass</p>
              </div>
              <button
                type="button"
                onClick={startCamera}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-2xl shadow-lg transition-all cursor-pointer inline-flex items-center space-x-2"
              >
                <Camera className="w-4 h-4" />
                <span>Activate Camera Scanner</span>
              </button>
            </div>
          )}
        </div>

        {/* Manual Payload / Token Verification Input */}
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
              Dynamic QR Payload / Pass Token Input
            </label>
            <input
              type="text"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              placeholder="e.g. TIX-A1B2C3:5912384:sIgNaTuRe..."
              className="w-full bg-[#131522] border border-white/10 text-white font-mono text-sm px-4 py-3.5 rounded-2xl focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !qrInput.trim()}
            className="w-full py-4 bg-white hover:bg-zinc-200 text-black font-black rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Validating Dynamic Token...</span>
            ) : (
              <>
                <UserCheck className="w-5 h-5" />
                <span>Verify Attendee Pass</span>
              </>
            )}
          </button>
        </form>

        {/* Scan Result Feedback Banner */}
        {scanResult && (
          <div
            className={`p-6 rounded-2xl border text-left ${
              scanResult.success
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
            }`}
          >
            <div className="flex items-start space-x-3">
              {scanResult.success ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-black text-base tracking-tight">
                  {scanResult.success ? scanResult.data.message : 'ACCESS DENIED / INVALID PASS'}
                </p>

                {scanResult.success ? (
                  <div className="text-xs space-y-1 text-zinc-300 pt-2 border-t border-emerald-500/20 mt-2 font-medium">
                    <p><span className="text-zinc-400">Attendee Name:</span> <strong className="text-white">{scanResult.data.attendeeName}</strong></p>
                    <p><span className="text-zinc-400">Event Title:</span> <strong className="text-white">{scanResult.data.eventName}</strong></p>
                    <p><span className="text-zinc-400">Seat Assignment:</span> <strong className="text-emerald-400">{scanResult.data.seatInfo}</strong></p>
                  </div>
                ) : (
                  <p className="text-xs text-rose-300/80 font-medium">{scanResult.message}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
