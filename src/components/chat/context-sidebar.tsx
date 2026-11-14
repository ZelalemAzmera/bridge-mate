'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Headphones,
  CheckCircle2,
  Copy,
  Check,
  Shield,
  Monitor,
  ArrowRight,
  ExternalLink,
  Code2,
  Info,
} from 'lucide-react';
import { useAccessibility } from '@/hooks/use-accessibility';
import { useLiveAnnouncer } from '@/hooks/use-live-announcer';

export function ContextSidebar() {
  const { language } = useAccessibility();
  const { announce } = useLiveAnnouncer();
  const router = useRouter();

  const [screenShareConsent, setScreenShareConsent] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  const embedCode = `<script src="https://bridgemate.et/widget.js" data-lang="${language}" defer></script>\n<bridgemate-assistant course-id="alx-python-mod3"></bridgemate-assistant>`;

  const handleCopyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopiedEmbed(true);
      announce(
        language === 'am'
          ? 'የሳቫና መክተቻ ኮድ ወደ ቅንጥብ ሰሌዳ ተቀድቷል'
          : 'Widget embed snippet copied to clipboard'
      );
      setTimeout(() => setCopiedEmbed(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleEscalate = () => {
    announce(
      language === 'am'
        ? 'ወደ ቀጥታ የሰው ድጋፍ እየተሸጋገረ ነው...'
        : 'Connecting to human tutor...'
    );
    router.push(`/support?screenShare=${screenShareConsent}`);
  };

  return (
    <aside
      aria-label={language === 'am' ? 'የትምህርት አውድ እና ፈጣን ድጋፍ' : 'Course Context & Live Help Panel'}
      className="w-full space-y-4"
    >
      {/* 1. Active Course Context Card */}
      <div className="rounded-[12px] p-5 border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border-default)]">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--brand-primary)] flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{language === 'am' ? 'ንቁ የትምህርት አውድ' : 'Active Course Context'}</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[var(--accent-verified)] border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
            <span>Savanna Sync</span>
          </span>
        </div>

        <div>
          <h2 className="text-sm font-bold text-[var(--text-primary)]">
            ALX Software Engineering
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Module 3: Full-Stack Python &amp; Digital Accessibility
          </p>
        </div>

        <div className="p-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] text-xs space-y-1.5 font-mono">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[var(--text-secondary)]">Syllabus Anchor:</span>
            <span className="font-bold text-[var(--text-primary)]">WCAG 2.2 AA</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[var(--text-secondary)]">Legal Framework:</span>
            <span className="font-bold text-[var(--accent-verified)]">Art. 29 (1156/2019)</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[var(--text-secondary)]">Knowledge Retrieval:</span>
            <span className="font-bold text-[var(--brand-primary)]">Grounded RAG</span>
          </div>
        </div>
      </div>

      {/* 2. 1-Click Escalation to Human Tutor Card */}
      <div className="rounded-[12px] p-5 border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/20 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
            </span>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
              {language === 'am' ? 'የቀጥታ የሰው ድጋፍ' : 'Live Human Help'}
            </h2>
          </div>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-emerald-900 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 font-bold">
            Alt+H
          </kbd>
        </div>

        <p className="text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed">
          {language === 'am'
            ? 'በኤአይ ማብራሪያ ግራ ከተጋቡ፤ ያለምንም አውድ መጥፋት በአንድ ጠቅታ ወደ ሰው አጋዥ ይሸጋገሩ።'
            : 'Stranded or need customized accommodation guidance? Connect to an Ethiopian accessibility tutor with zero context loss.'}
        </p>

        {/* Explicit Learner-Controlled WebRTC Screen Share Toggle */}
        <div className="p-3 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-emerald-300 dark:border-emerald-700 space-y-2">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={screenShareConsent}
              onChange={(e) => setScreenShareConsent(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-[var(--brand-primary)] focus:ring-[var(--focus-ring)] cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-bold text-[var(--text-primary)] block">
                {language === 'am'
                  ? 'የስክሪን ሼሪንግ ፈቃድ ስጥ (WebRTC)'
                  : 'Allow Learner-Controlled Screen Share'}
              </span>
              <span className="text-[11px] text-[var(--text-secondary)] leading-tight block mt-0.5">
                {language === 'am'
                  ? 'እርስዎ በማንኛውም ሰከንድ ማቆም ይችላሉ፤ ምንም ቪዲዮ ሳይፈቅዱ አይተላለፍም።'
                  : 'Strict privacy: Affirmative consent only. Zero recording, revoke anytime.'}
              </span>
            </div>
          </label>
        </div>

        {/* 1-Click Escalation Action Button */}
        <button
          type="button"
          onClick={handleEscalate}
          className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
        >
          <Headphones className="w-4 h-4" aria-hidden="true" />
          <span>{language === 'am' ? 'የሰው ድጋፍ ጀምር (Connect Tutor)' : 'Connect to Human Tutor'}</span>
        </button>
      </div>

      {/* 3. Quick-Switch Preview of the <bridgemate-assistant> 1-Line Embed */}
      <div className="rounded-[12px] p-5 border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border-default)]">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-[var(--brand-primary)]" aria-hidden="true" />
            <span>{language === 'am' ? 'ሳቫና መክተቻ ኮድ' : 'Savannah LMS Embed'}</span>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-default)] text-[var(--text-secondary)]">
            1-Script Tag
          </span>
        </div>

        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          {language === 'am'
            ? 'ይህን ረዳት በአንድ መስመር ኮድ ወደ ሳቫና ወይም ወደ ማንኛውም የትምህርት ፖርታል ይክተቱ።'
            : 'Embed BridgeMate directly into ALX Savannah or any portal with a single non-blocking script.'}
        </p>

        {/* Code Snippet Box */}
        <div className="relative p-2.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] font-mono text-[11px] text-[var(--text-primary)] overflow-x-auto leading-relaxed">
          <code>
            {`<script src="https://bridgemate.et/widget.js" defer></script>\n<bridgemate-assistant></bridgemate-assistant>`}
          </code>
        </div>

        {/* Copy Button & View Demo Link */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={handleCopyEmbed}
            className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-xs font-bold text-[var(--text-primary)] flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
            aria-label={language === 'am' ? 'የመክተቻ ኮድ ቅዳ' : 'Copy embed snippet'}
          >
            {copiedEmbed ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                <span className="text-emerald-700 font-bold">
                  {language === 'am' ? 'ተቀድቷል! (Copied)' : 'Copied to Clipboard!'}
                </span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[var(--text-secondary)]" aria-hidden="true" />
                <span>{language === 'am' ? 'ኮዱን ቅዳ (Copy Embed Code)' : 'Copy Embed Code'}</span>
              </>
            )}
          </button>

          <Link
            href="/embed-demo"
            className="w-full min-h-[44px] px-3 py-2 rounded-lg text-xs font-semibold text-[var(--brand-primary)] hover:underline flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>{language === 'am' ? 'የመክተቻውን ማሳያ ይመልከቱ' : 'View Savannah Widget Live Demo'}</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
