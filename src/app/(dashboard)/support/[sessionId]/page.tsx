'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Headphones,
  CheckCircle,
  Monitor,
  PhoneOff,
  Sparkles,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { useAccessibility } from '@/hooks/use-accessibility';
import { useLiveAnnouncer } from '@/hooks/use-live-announcer';
import { QueueStatus } from '@/components/support/queue-status';
import { AgentChat } from '@/components/support/agent-chat';
import { ScreenShareView } from '@/components/support/screen-share-view';
import { ConsentModal } from '@/components/support/consent-modal';
import type { HandoffPacket } from '@/lib/validators/support.schema';
import type { SupportMessageItem } from '@/lib/services/support.service';

export default function SupportRoomPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const router = useRouter();
  const { language } = useAccessibility();
  const { announce } = useLiveAnnouncer();

  const [status, setStatus] = useState<'queued' | 'active' | 'closed' | 'loading'>('loading');
  const [queuePosition, setQueuePosition] = useState<number>(1);
  const [estimatedWaitMinutes, setEstimatedWaitMinutes] = useState<number>(2);
  const [handoffPacket, setHandoffPacket] = useState<HandoffPacket | null>(null);
  const [screenShareEnabled, setScreenShareEnabled] = useState(false);
  const [messages, setMessages] = useState<SupportMessageItem[]>([]);
  const [isScreenConsentOpen, setIsScreenConsentOpen] = useState(false);
  const [isFastTracking, setIsFastTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Poll status & fetch messages
  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/support/${sessionId}/status`);
      if (!res.ok) {
        throw new Error('Support session not found');
      }
      const json = await res.json();
      const data = json.data;

      setStatus(data.status);
      setQueuePosition(data.queuePosition);
      setEstimatedWaitMinutes(data.estimatedWaitMinutes);
      setHandoffPacket(data.handoffPacket);
      setScreenShareEnabled(data.screenShareEnabled);
    } catch (err: any) {
      console.error('[SupportRoom] Status fetch error:', err);
      setError(err.message || 'Error fetching status');
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/support/${sessionId}/message`);
      if (res.ok) {
        const json = await res.json();
        setMessages(json.data || []);
      }
    } catch (err) {
      console.error('[SupportRoom] Message fetch error:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchMessages();

    // Poll periodically
    const interval = setInterval(() => {
      fetchStatus();
      if (status === 'active') {
        fetchMessages();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [sessionId, status]);

  // Fast-track connection for demo
  const handleFastTrackConnect = async () => {
    setIsFastTracking(true);
    try {
      const res = await fetch(`/api/support/${sessionId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept', agentId: 'human-navigator-selamawit' }),
      });
      if (res.ok) {
        announce(
          language === 'am'
            ? 'የሰው ድጋፍ ሰጪ ተገናኝቷል'
            : 'Human specialist connected to your session'
        );
        await fetchStatus();
        await fetchMessages();
      }
    } catch (err: any) {
      console.error('[SupportRoom] Fast-track error:', err);
    } finally {
      setIsFastTracking(false);
    }
  };

  // Send message
  const handleSendMessage = async (text: string) => {
    const res = await fetch(`/api/support/${sessionId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: 'user', text }),
    });

    if (res.ok) {
      await fetchMessages();
    }
  };

  // Toggle Screen Share
  const handleEnableScreenShare = async () => {
    setIsScreenConsentOpen(true);
  };

  const handleConfirmScreenShare = async (consents: {
    consentScreenShare: boolean;
  }) => {
    setIsScreenConsentOpen(false);
    if (!consents.consentScreenShare) return;

    try {
      await fetch(`/api/support/${sessionId}/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consentType: 'screen_share',
          granted: true,
        }),
      });
      setScreenShareEnabled(true);
      announce(
        language === 'am'
          ? 'ስክሪን ማጋራት ተፈቅዷል'
          : 'Screen sharing enabled with affirmative consent'
      );
    } catch (err) {
      console.error('[SupportRoom] Screen share error:', err);
    }
  };

  const handleStopScreenShare = async () => {
    try {
      await fetch(`/api/support/${sessionId}/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consentType: 'screen_share',
          granted: false,
        }),
      });
      setScreenShareEnabled(false);
    } catch (err) {
      console.error('[SupportRoom] Stop screen share error:', err);
    }
  };

  // Close Session
  const handleCloseSession = async () => {
    try {
      await fetch(`/api/support/${sessionId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'close' }),
      });
      setStatus('closed');
      router.push('/support');
    } catch (err) {
      console.error('[SupportRoom] Close session error:', err);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          {language === 'am' ? 'የክፍለ-ጊዜ መረጃ በመጫን ላይ...' : 'Loading support session...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Room Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/support')}
            aria-label={language === 'am' ? 'ወደ ኋላ ተመለስ' : 'Go back to support'}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Headphones className="w-5 h-5 text-purple-700" />
              {language === 'am' ? 'የቀጥታ ድጋፍ ክፍል' : 'Live Support Room'}
            </h1>
            <p className="text-xs text-muted-foreground">
              ID: <span className="font-mono">{sessionId.slice(0, 8)}...</span>
            </p>
          </div>
        </div>

        {/* Room Controls */}
        <div className="flex items-center gap-2">
          {status === 'active' && !screenShareEnabled && (
            <button
              onClick={handleEnableScreenShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-xs font-semibold hover:bg-amber-100 transition"
            >
              <Monitor className="w-3.5 h-3.5 text-amber-700" />
              {language === 'am' ? 'ስክሪን አጋራ' : 'Share Screen'}
            </button>
          )}

          <button
            onClick={handleCloseSession}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-rose-700 hover:bg-rose-50 transition"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            {language === 'am' ? 'ክፍለ-ጊዜውን አጠናቅቅ' : 'End Session'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Main View: Queue Status vs Active Live Room */}
      {status === 'queued' ? (
        <QueueStatus
          sessionId={sessionId}
          queuePosition={queuePosition}
          estimatedWaitMinutes={estimatedWaitMinutes}
          handoffPacket={handoffPacket}
          onFastTrackAgentConnect={handleFastTrackConnect}
          onCancel={handleCloseSession}
          isLoading={isFastTracking}
        />
      ) : (
        <div className="space-y-6">
          {/* Active Screen Share Region if consented */}
          <ScreenShareView
            sessionId={sessionId}
            isEnabled={screenShareEnabled}
            onStopSharing={handleStopScreenShare}
          />

          {/* Context Banner */}
          {handoffPacket && (
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/80 flex items-center justify-between text-xs text-emerald-950">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>{language === 'am' ? 'ዐውደ-ጽሑፍ ተላልፏል፡ ' : 'Context Active: '}</strong>
                  {handoffPacket.userGoal}
                </span>
              </div>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-semibold text-[10px]">
                {language === 'am' ? 'ተረጋግጧል' : 'Verified'}
              </span>
            </div>
          )}

          {/* Live Agent Chat */}
          <AgentChat
            sessionId={sessionId}
            initialMessages={messages}
            onSendMessage={handleSendMessage}
          />
        </div>
      )}

      {/* Consent Modal for Screen Share */}
      <ConsentModal
        isOpen={isScreenConsentOpen}
        onClose={() => setIsScreenConsentOpen(false)}
        onConfirm={handleConfirmScreenShare}
        initialValues={{
          consentTranscript: true,
          consentAudio: false,
          consentScreenShare: true,
        }}
      />
    </div>
  );
}

