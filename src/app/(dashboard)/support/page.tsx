'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Headphones,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Loader2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useAccessibility } from '@/hooks/use-accessibility';
import { useLiveAnnouncer } from '@/hooks/use-live-announcer';
import { ConsentModal } from '@/components/support/consent-modal';
import type { CreateSupportRequest } from '@/lib/validators/support.schema';

export default function SupportPage() {
  const router = useRouter();
  const { language } = useAccessibility();
  const { announce } = useLiveAnnouncer();

  const [userGoal, setUserGoal] = useState('');
  const [selectedAccommodations, setSelectedAccommodations] = useState<string[]>([]);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fast keyboard shortcut: Alt + H to trigger immediate help
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        setIsConsentModalOpen(true);
        announce(
          language === 'am'
            ? 'የሰው ድጋፍ መስኮት ተከፍቷል'
            : 'Human assistance escalation modal opened via Alt+H'
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [language, announce]);

  const accommodationQuickPills = [
    {
      id: 'screen_reader',
      labelAm: 'ስክሪን አንባቢ (Screen Reader)',
      labelEn: 'Screen Reader User',
    },
    {
      id: 'large_font',
      labelAm: 'ትልቅ ፊደል (Large Print / Zoom)',
      labelEn: 'Large Print / Zoom Needs',
    },
    {
      id: 'eth_sign_language',
      labelAm: 'የኢትዮጵያ ምልክት ቋንቋ (EthSL)',
      labelEn: 'Ethiopian Sign Language (EthSL)',
    },
    {
      id: 'mobility_ramp',
      labelAm: 'የመንቀሳቀስ / ራምፕ ተደራሽነት',
      labelEn: 'Physical / Ramp Accessibility',
    },
  ];

  const toggleAccommodation = (pillLabel: string) => {
    setSelectedAccommodations((prev) =>
      prev.includes(pillLabel)
        ? prev.filter((p) => p !== pillLabel)
        : [...prev, pillLabel]
    );
  };

  const handleEscalateClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userGoal.trim()) {
      setError(
        language === 'am'
          ? 'እባክዎ የሚያስፈልግዎትን ድጋፍ ባጭሩ ይግለጹ'
          : 'Please enter what you need help with before escalating'
      );
      return;
    }
    setError(null);
    setIsConsentModalOpen(true);
  };

  const handleConfirmEscalation = async (consents: {
    consentTranscript: boolean;
    consentAudio: boolean;
    consentScreenShare: boolean;
  }) => {
    setIsConsentModalOpen(false);
    setIsLoading(true);
    setError(null);

    announce(
      language === 'am'
        ? 'የሰው ድጋፍ ሰጪ በመጠየቅ ላይ ነው። እባክዎ ይጠብቁ...'
        : 'Connecting to human support queue. Please wait...'
    );

    try {
      const payload: CreateSupportRequest = {
        userGoal: userGoal.trim() || (language === 'am' ? 'የቀጥታ የሰው ድጋፍ እገዛ' : 'Live human assistance request'),
        userLanguage: (language as any) || 'en',
        disclosedAccommodations: selectedAccommodations,
        consentTranscript: consents.consentTranscript,
        consentAudio: consents.consentAudio,
        consentScreenShare: consents.consentScreenShare,
      };

      const res = await fetch('/api/support/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || json.error || 'Failed to queue support request');
      }

      const sessionId = json.data.sessionId;
      router.push(`/support/${sessionId}`);
    } catch (err: any) {
      console.error('[Support Escalation Error]:', err);
      setError(err.message || 'Failed to connect to human support');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-100 text-purple-800">
            <Headphones className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {language === 'am'
                ? 'የቀጥታ የሰው ድጋፍ (Context-Preserving Live Help)'
                : 'Context-Preserving Live Help'}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {language === 'am'
                ? 'ጉዳይዎን ደግመው ሳያብራሩ ከአካል ጉዳተኞች የሥራና የትምህርት ባለሙያ ጋር በአንድ ጠቅታ ይገናኙ'
                : 'One-click escalation to human navigators with zero repetition and full privacy consent'}
            </p>
          </div>
        </div>

        {/* Shortcut Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-mono border border-slate-200">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Alt + H</span>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-900 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Main Escalation Form */}
      <form
        onSubmit={handleEscalateClick}
        className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-xs"
      >
        <div className="space-y-2">
          <label htmlFor="user-goal" className="block text-sm font-bold text-foreground">
            {language === 'am'
              ? 'ምን ዓይነት እገዛ ይፈልጋሉ? (Stated Objective)'
              : 'What do you need human assistance with?'}
          </label>
          <p className="text-xs text-muted-foreground">
            {language === 'am'
              ? 'ለምሳሌ፡ "በኢትዮ ቴሌኮም የሥራ ማመልከቻ ፖርታል ላይ የፈተና ማመቻቸት ጥያቄ ለማስገባት ድጋፍ እፈልጋለሁ"'
              : 'E.g., "Need guidance submitting my accommodation request on the CBE applicant portal"'}
          </p>
          <textarea
            id="user-goal"
            rows={3}
            value={userGoal}
            onChange={(e) => setUserGoal(e.target.value)}
            placeholder={
              language === 'am'
                ? 'ያጋጠምዎትን ችግር ወይም የሚያስፈልግዎትን ድጋፍ እዚህ ይግለጹ...'
                : 'Describe your issue or what step you need help with...'
            }
            className="w-full p-3.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
          />
        </div>

        {/* Accommodation Quick Tags */}
        <div className="space-y-2">
          <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {language === 'am'
              ? 'ለባለሙያው አስቀድመው ማሳወቅ የሚፈልጉት ተደራሽነት ፍላጎት (አማራጭ)'
              : 'Optional: Pre-disclose functional needs to the incoming specialist'}
          </span>
          <div className="flex flex-wrap gap-2">
            {accommodationQuickPills.map((p) => {
              const label = language === 'am' ? p.labelAm : p.labelEn;
              const isSelected = selectedAccommodations.includes(label);
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => toggleAccommodation(label)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${isSelected
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted text-muted-foreground border-border hover:bg-slate-100'
                    }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Guarantee Info Box */}
        <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/60 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-purple-700 mt-0.5 shrink-0" />
          <div className="space-y-0.5 text-xs text-purple-950">
            <p className="font-bold">
              {language === 'am'
                ? 'ድጋሜ ማብራራት አያስፈልግም (Zero Repetition Guarantee)'
                : 'Zero Repetition Context Handoff'}
            </p>
            <p className="text-purple-900/80">
              {language === 'am'
                ? 'የብሪጅሜት የማጠቃለያ ሞተር ያነጋገሯቸውን ነጥቦችና የተሞከሩ መፍትሔዎችን አጠቃሎ ለሰው ድጋፍ ሰጪው ያዘጋጃል።'
                : 'Our context broker automatically synthesizes your session history, active task, and stated goal into a structured brief for the human specialist.'}
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={isLoading || !userGoal.trim()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-700 text-white font-bold text-sm hover:bg-purple-800 disabled:opacity-50 transition shadow-md"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            <span>
              {language === 'am'
                ? 'ከሰው ድጋፍ ሰጪ ጋር አገናኘኝ'
                : 'Connect to Human Specialist'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Granular Consent Modal */}
      <ConsentModal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        onConfirm={handleConfirmEscalation}
        initialValues={{
          consentTranscript: true,
          consentAudio: false,
          consentScreenShare: false,
        }}
      />
    </div>
  );
}
