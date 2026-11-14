'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Monitor,
  StopCircle,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Maximize2,
  Play,
} from 'lucide-react';
import { useAccessibility } from '@/hooks/use-accessibility';
import { useLiveAnnouncer } from '@/hooks/use-live-announcer';

export interface ScreenShareViewProps {
  sessionId: string;
  isEnabled: boolean;
  onStopSharing: () => void;
}

export function ScreenShareView({
  sessionId,
  isEnabled,
  onStopSharing,
}: ScreenShareViewProps) {
  const { language } = useAccessibility();
  const { announce } = useLiveAnnouncer();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLiveCapturing, setIsLiveCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isEnabled) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
        setIsLiveCapturing(false);
      }
      return;
    }

    // Auto-prompt browser screen sharing if available
    const startCapture = async () => {
      if (typeof window !== 'undefined' && navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices) {
        try {
          const mediaStream = await navigator.mediaDevices.getDisplayMedia({
            video: { displaySurface: 'browser' },
            audio: false,
          });

          setStream(mediaStream);
          setIsLiveCapturing(true);

          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }

          // Handle when learner clicks native browser "Stop Sharing" floating button
          mediaStream.getVideoTracks()[0].onended = () => {
            handleStop();
          };
        } catch (err) {
          // User cancelled native prompt or permission denied; continue in simulated mode
          console.log('[ScreenShareView] Native capture dismissed or unsupported, using simulated preview');
        }
      }
    };

    startCapture();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isEnabled]);

  if (!isEnabled) {
    return null;
  }

  const handleStop = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    setIsLiveCapturing(false);
    onStopSharing();
    announce(
      language === 'am'
        ? 'ስክሪን ማጋራት ቆሟል'
        : 'Screen sharing has been stopped'
    );
  };

  return (
    <div
      role="region"
      aria-label={language === 'am' ? 'የስክሪን ማጋራት ክልል' : 'Screen Share Assistance Area'}
      className="rounded-2xl border-2 border-red-500/50 bg-card overflow-hidden shadow-md space-y-0"
    >
      {/* Alert Header Banner */}
      <div className="bg-red-600 text-white px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm font-semibold">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </span>
          <span>
            {language === 'am'
              ? 'ስክሪን ማጋራት ክፍት ነው — ድጋፍ ሰጪው ስክሪንዎን እያየ ነው'
              : 'Screen Sharing Active — The specialist is viewing your shared window'}
          </span>
        </div>

        <button
          onClick={handleStop}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white text-red-700 hover:bg-red-50 font-bold text-xs transition focus:outline-none focus:ring-2 focus:ring-white"
        >
          <StopCircle className="w-4 h-4" />
          {language === 'am' ? 'ማጋራት አቁም' : 'Stop Sharing'}
        </button>
      </div>

      {/* Screen Preview Container */}
      <div className="p-4 sm:p-6 bg-slate-900 text-slate-100 flex flex-col items-center justify-center min-h-[260px] text-center space-y-4">
        {isLiveCapturing ? (
          <div className="w-full max-w-2xl rounded-xl overflow-hidden border border-slate-700 shadow-lg bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-h-[360px] object-contain"
            />
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-primary">
            <Monitor className="w-10 h-10 text-emerald-400" />
          </div>
        )}

        <div className="space-y-1 max-w-md">
          <p className="text-sm font-semibold text-white">
            {language === 'am'
              ? 'ደህንነቱ የተጠበቀ የስክሪን እይታ ክፍለ-ጊዜ (Live Screen Channel)'
              : 'Secure WebRTC Screen Session Established'}
          </p>
          <p className="text-xs text-slate-400">
            {language === 'am'
              ? 'የሰው ድጋፍ ሰጪው በሥራ ማመልከቻ ፖርታሎች፣ በሰነድ አሞላልና በቅጾች ላይ ቀጥተኛ መመሪያ እየሰጠዎት ነው'
              : 'The specialist can visually follow your application progress to guide you past complex portal barriers'}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            {language === 'am'
              ? 'ስክሪን የማየት ፈቃድ በማንኛውም ቅጽበት ሊቋረጥ ይችላል'
              : 'Consent-bound session: Can be terminated at any moment'}
          </span>
        </div>
      </div>
    </div>
  );
}

