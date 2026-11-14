'use client';

import React, { useState } from 'react';
import {
  Copy,
  Check,
  CheckCircle,
  Scale,
  Lightbulb,
  FileText,
  Save,
  Loader2,
} from 'lucide-react';
import type { GeneratedAccommodationLetter } from '@/lib/validators/translator.schema';
import { PdfExporter } from './pdf-exporter';
import { useAccessibility } from '@/hooks/use-accessibility';
import { useLiveAnnouncer } from '@/hooks/use-live-announcer';

export function DraftEditor({
  letter,
  onReset,
}: {
  letter: GeneratedAccommodationLetter;
  onReset: () => void;
}) {
  const { language } = useAccessibility();
  const { announce } = useLiveAnnouncer();
  const [activeLang, setActiveLang] = useState<'am' | 'en'>(language === 'en' ? 'en' : 'am');
  const [bodyAm, setBodyAm] = useState(letter.letterBodyAm);
  const [bodyEn, setBodyEn] = useState(letter.letterBodyEn);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isApproved, setIsApproved] = useState(letter.status === 'approved');

  const currentContent = activeLang === 'am' ? bodyAm : bodyEn;
  const currentSubject = activeLang === 'am' ? letter.subjectAm : letter.subjectEn;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${currentSubject}\n\n${currentContent}`);
    setCopied(true);
    announce(
      language === 'am'
        ? 'የማመቻቸት ደብዳቤው ወደ ቅንጥብ ሰሌዳ ተገልብጧል'
        : 'Accommodation request copied to clipboard'
    );
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApprove = async () => {
    if (!letter.id) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/translator/${letter.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
      if (res.ok) {
        setIsApproved(true);
        announce(
          language === 'am'
            ? 'ደብዳቤው ጸድቆ ተቀምጧል'
            : 'Accommodation request draft approved and saved'
        );
      }
    } catch {
      // Ignore in mock testing
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-card border-2 border-border rounded-2xl p-6 shadow-sm">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 mb-4 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                {language === 'am' ? 'የተረቀቀ ደብዳቤ' : 'Generated Draft'}
              </span>
              {isApproved && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{language === 'am' ? 'ጸድቋል' : 'Approved'}</span>
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-black text-foreground">
              {currentSubject}
            </h2>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={language === 'am' ? 'ደብዳቤውን ገልብጥ' : 'Copy letter'}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                  <span className="text-emerald-700 font-bold">{language === 'am' ? 'ተገልብጧል' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
                  <span>{language === 'am' ? 'ገልብጥ' : 'Copy'}</span>
                </>
              )}
            </button>

            <PdfExporter content={currentContent} subject={currentSubject} />

            <button
              type="button"
              disabled={isSaving || isApproved}
              onClick={handleApprove}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              <span>
                {isApproved
                  ? language === 'am' ? 'የተቀመጠ' : 'Saved'
                  : language === 'am' ? 'አፅድቅና አስቀምጥ' : 'Approve & Save'}
              </span>
            </button>
          </div>
        </div>

        {/* Language Switch Tabs */}
        <div className="flex border-b border-border mb-4 gap-2" role="tablist">
          <button
            role="tab"
            aria-selected={activeLang === 'am'}
            onClick={() => setActiveLang('am')}
            className={`pb-2 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${activeLang === 'am'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
          >
            አማርኛ (Amharic Draft)
          </button>
          <button
            role="tab"
            aria-selected={activeLang === 'en'}
            onClick={() => setActiveLang('en')}
            className={`pb-2 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${activeLang === 'en'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
          >
            English (English Draft)
          </button>
        </div>

        {/* Editable Letter Body */}
        <div>
          <label htmlFor="letter-edit-textarea" className="sr-only">
            {language === 'am' ? 'የደብዳቤ ጽሁፍ አርታዒ' : 'Editable letter content'}
          </label>
          <textarea
            id="letter-edit-textarea"
            rows={14}
            value={currentContent}
            onChange={(e) => {
              if (activeLang === 'am') {
                setBodyAm(e.target.value);
              } else {
                setBodyEn(e.target.value);
              }
            }}
            className="w-full rounded-xl border-2 border-border p-4 text-sm font-sans leading-relaxed text-foreground bg-background focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary"
          />
        </div>

        <div className="mt-2 text-right">
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-muted-foreground hover:text-foreground font-semibold underline"
          >
            {language === 'am' ? 'አዲስ ደብዳቤ አዘጋጅ' : 'Draft another accommodation request'}
          </button>
        </div>
      </div>

      {/* Statutory Citations Card */}
      <div className="bg-card border-2 border-border rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2 mb-3">
          <Scale className="w-4 h-4 text-primary" aria-hidden="true" />
          <span>{language === 'am' ? 'የተጠቀሱ የኢትዮጵያና የዓለም-አቀፍ ሕጎች' : 'Statutory & Legal Grounding (Ethiopia)'}</span>
        </h3>
        <ul className="space-y-2 text-xs text-muted-foreground" role="list">
          {letter.statutoryCitations.map((cite, i) => (
            <li key={i} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="font-bold text-primary">•</span>
              <span className="font-medium text-foreground">{cite}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Practical Tips */}
      <div className="bg-card border-2 border-border rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-amber-500" aria-hidden="true" />
          <span>{language === 'am' ? 'ጠቃሚ ምክሮች' : 'Practical Delivery Tips'}</span>
        </h3>
        <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
          {letter.practicalRecommendations.map((rec, i) => (
            <li key={i}>{rec}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

