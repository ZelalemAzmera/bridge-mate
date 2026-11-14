'use client';

import React from 'react';
import {
  Users,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useAccessibility } from '@/hooks/use-accessibility';
import type { HandoffPacket } from '@/lib/validators/support.schema';

export interface QueueStatusProps {
  sessionId: string;
  queuePosition: number;
  estimatedWaitMinutes: number;
  handoffPacket?: HandoffPacket | null;
  onFastTrackAgentConnect?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function QueueStatus({
  sessionId,
  queuePosition,
  estimatedWaitMinutes,
  handoffPacket,
  onFastTrackAgentConnect,
  onCancel,
  isLoading = false,
}: QueueStatusProps) {
  const { language } = useAccessibility();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Queue Card */}
      <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-b from-primary/5 to-transparent p-6 sm:p-8 space-y-6 text-center shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <Users className="w-4 h-4" />
          {language === 'am' ? 'የድጋፍ ሰጪ መጠበቂያ ክፍል' : 'Live Support Waiting Room'}
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight">
            {language === 'am'
              ? `በተራ ቁጥር ${queuePosition} ላይ ነዎት`
              : `You are #${queuePosition} in line`}
          </h2>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 text-primary" />
            <span>
              {language === 'am'
                ? `የሚገመተው የጥበቃ ጊዜ፡ ~${estimatedWaitMinutes} ደቂቃ`
                : `Estimated wait time: ~${estimatedWaitMinutes} min`}
            </span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          {language === 'am'
            ? 'አንድ የሰው ድጋፍ ሰጪ እስኪገናኝዎት ድረስ እባክዎ ይህን ገጽ ክፍት አድርገው ይጠብቁ። የተዘጋጀው የዐውደ-ጽሑፍ ማጠቃለያ ለድጋፍ ሰጪው በቅድሚያ ደርሷል።'
            : 'Please keep this page open. A human specialist is reviewing your context packet and will join this room directly.'}
        </p>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {onFastTrackAgentConnect && (
            <button
              onClick={onFastTrackAgentConnect}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition shadow"
            >
              <Sparkles className="w-4 h-4" />
              {language === 'am' ? 'ድጋፍ ሰጪ አገናኝ (Demo Fast-Track)' : 'Connect Specialist (Demo Mode)'}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {onCancel && (
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition"
            >
              {language === 'am' ? 'ጥያቄውን ሰርዝ' : 'Cancel Request'}
            </button>
          )}
        </div>
      </div>

      {/* Structured Handoff Packet Preview */}
      {handoffPacket && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base">
              {language === 'am'
                ? 'ለሰው ድጋፍ ሰጪው የተላለፈ የዐውደ-ጽሑፍ ማጠቃለያ (Handoff Packet)'
                : 'Verified Context Handshake Packet'}
            </h3>
          </div>

          <div className="grid gap-3 text-sm">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {language === 'am' ? 'የተጠቃሚው ዓላማ (User Objective)' : 'User Objective'}
              </span>
              <p className="font-medium text-foreground">{handoffPacket.userGoal}</p>
            </div>

            {handoffPacket.disclosedAccommodations?.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                  {language === 'am'
                    ? 'የተገለጹ የማመቻቸት ፍላጎቶች (Disclosed Accommodations)'
                    : 'Disclosed Accommodations'}
                </span>
                <ul className="list-disc list-inside text-amber-950 space-y-0.5 text-xs">
                  {handoffPacket.disclosedAccommodations.map((acc, i) => (
                    <li key={i}>{acc}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                {language === 'am'
                  ? 'ለድጋፍ ሰጪው የተሰጠ የመነሻ ምክረ-ሐሳብ (Recommended Agent Action)'
                  : 'Recommended Agent Starting Action'}
              </span>
              <p className="text-emerald-950 text-xs">{handoffPacket.recommendedAgentAction}</p>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-2">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
            {language === 'am'
              ? 'ምንም ዓይነት የጤና ወይም የምርመራ መረጃ አልተጠየቀም፤ የሥራና የፈተና ተደራሽነት ፍላጎቶች ብቻ ተላልፈዋል።'
              : 'Zero medical diagnosis disclosed; only functional accommodation requirements transferred.'}
          </p>
        </div>
      )}
    </div>
  );
}

