'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  Calendar,
  Volume2,
  VolumeX,
  FileCheck,
  Send,
  ShieldCheck,
  Banknote,
  Sparkles,
  Check,
  ArrowRight,
  Laptop,
} from 'lucide-react';
import { useAccessibility } from '@/hooks/use-accessibility';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import { useLiveAnnouncer } from '@/hooks/use-live-announcer';

export interface AccessibleJob {
  id: string;
  title: string;
  titleAm: string;
  organization: string;
  location: string;
  locationAm: string;
  salaryEtb: string;
  dateGregorian: string;
  dateEthiopian: string;
  isRemote: boolean;
  audioSummaryText: string;
  audioSummaryTextAm: string;
  verifiedAccommodations: string[];
  verifiedAccommodationsAm: string[];
  description: string;
  descriptionAm: string;
}

export function AccessibleJobCard({ job }: { job: AccessibleJob }) {
  const { language } = useAccessibility();
  const { announce } = useLiveAnnouncer();
  const { speak, stop, isSpeaking, isSupported } = useSpeechSynthesis();

  const [applied, setApplied] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const isAm = language === 'am';
  const title = isAm ? job.titleAm : job.title;
  const location = isAm ? job.locationAm : job.location;
  const summaryText = isAm ? job.audioSummaryTextAm : job.audioSummaryText;
  const accommodations = isAm ? job.verifiedAccommodationsAm : job.verifiedAccommodations;
  const description = isAm ? job.descriptionAm : job.description;

  const handleToggleAudio = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(summaryText, language);
      announce(
        isAm ? 'የሥራ ማስታወቂያውን አጭር የድምፅ ማብራሪያ በማጫወት ላይ...' : 'Playing audio job summary...'
      );
    }
  };

  return (
    <article
      aria-label={title}
      className="rounded-[12px] p-6 border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs hover:border-[var(--brand-primary)]/50 transition-all flex flex-col justify-between space-y-4"
    >
      {/* 1. Structured Header */}
      <div className="space-y-3">
        {/* Badges Bar: Salary, Dates, Remote */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* ETB Salary Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[var(--brand-primary)] border border-blue-200 dark:bg-blue-950/40 dark:border-blue-800">
              <Banknote className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{job.salaryEtb}</span>
            </span>

            {job.isRemote && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[var(--accent-verified)] border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800">
                <Laptop className="w-3 h-3" aria-hidden="true" />
                <span>{isAm ? 'የርቀት ሥራ (Remote)' : 'Remote Available'}</span>
              </span>
            )}
          </div>

          {/* Ethiopian + Gregorian Date */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-mono">
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{job.dateEthiopian} • {job.dateGregorian}</span>
          </div>
        </div>

        {/* Role Title & Organization */}
        <div>
          <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)] tracking-tight">
            {title}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)] mt-1 font-medium">
            <span className="flex items-center gap-1 text-[var(--text-primary)] font-bold">
              <Building2 className="w-3.5 h-3.5 text-[var(--brand-primary)]" aria-hidden="true" />
              <span>{job.organization}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{location}</span>
            </span>
          </div>
        </div>

        {/* Description snippet */}
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed readable-measure">
          {description}
        </p>

        {/* 2. Compact Embedded Audio Summary Bar */}
        {isSupported && (
          <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <Volume2 className="w-4 h-4 text-[var(--brand-primary)] shrink-0" aria-hidden="true" />
              <span className="font-semibold text-[var(--text-primary)]">
                {isAm ? 'አጭር የድምፅ ማብራሪያ (Audio Summary)' : 'Audio Job Briefing (0:45)'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleAudio}
              className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${
                isSpeaking
                  ? 'bg-red-600 text-white'
                  : 'bg-[var(--bg-surface)] text-[var(--brand-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-canvas)]'
              }`}
              aria-label={
                isSpeaking
                  ? isAm ? 'ድምፅ አቁም' : 'Stop audio briefing'
                  : isAm ? 'የሥራውን ማብራሪያ በድምፅ አድምጥ' : 'Listen to audio briefing'
              }
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 animate-pulse" aria-hidden="true" />
                  <span>{isAm ? 'አቁም' : 'Stop'}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{isAm ? 'አድምጥ' : 'Play Briefing'}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Audio Transcript — always visible for muted/Deaf users (WCAG 1.2.1) */}
        <div
          className="audio-transcript"
          aria-label={isAm ? 'የድምፅ ማጠቃለያ ጽሑፍ' : 'Audio Summary Transcript'}
          data-transcript="true"
        >
          {summaryText}
        </div>

        {/* 3. Verified Accommodations Offered Pill List */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent-verified)] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{isAm ? 'የተረጋገጡ የተደራሽነት ማመቻቸቶች' : 'Verified Accommodations Offered'}</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {accommodations.map((acc, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-50 text-[var(--accent-verified)] border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800"
              >
                <Check className="w-3 h-3 text-[var(--accent-verified)]" aria-hidden="true" />
                <span>{acc}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Action Buttons (Two 44px-tall buttons with 8px minimum gap) */}
      <div className="pt-3 border-t border-[var(--border-default)] flex flex-wrap sm:flex-nowrap items-center gap-2">
        {/* Button 1: Apply with Voice/Text */}
        <button
          type="button"
          onClick={() => {
            setApplied(true);
            announce(
              isAm
                ? 'ማመልከቻዎ በተሳካ ሁኔታ ተልኳል'
                : 'Application submitted successfully with voice/text credentials'
            );
          }}
          className={`flex-1 min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${
            applied
              ? 'bg-emerald-700 text-white'
              : 'bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white'
          }`}
          aria-label={isAm ? 'በድምፅ ወይም በጽሑፍ ያመልክቱ' : 'Apply with Voice/Text'}
        >
          {applied ? (
            <>
              <Check className="w-4 h-4" aria-hidden="true" />
              <span>{isAm ? 'ተልኳል! (Applied)' : 'Applied with Voice/Text!'}</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" aria-hidden="true" />
              <span>{isAm ? 'በድምፅ/በጽሑፍ ያመልክቱ' : 'Apply with Voice/Text'}</span>
            </>
          )}
        </button>

        {/* Button 2: Request Interview Accommodation (Zero Medical Disclosure) */}
        <Link
          href={`/translator?jobId=${job.id}&title=${encodeURIComponent(job.title)}`}
          className="flex-1 min-h-[44px] px-4 py-2 rounded-xl border-2 border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[var(--text-primary)] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
          aria-label={
            isAm
              ? 'የቃለ-መጠይቅ ማመቻቸት ጠይቅ (የህክምና መረጃ ሳይገለጽ)'
              : 'Request Interview Accommodation (Zero Medical Disclosure)'
          }
        >
          <FileCheck className="w-4 h-4 text-amber-600" aria-hidden="true" />
          <span>{isAm ? 'የማመቻቸት ጥያቄ (Art. 29)' : 'Request Accommodation'}</span>
        </Link>
      </div>
    </article>
  );
}
