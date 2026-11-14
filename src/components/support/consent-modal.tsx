'use client';

import React from 'react';
import { ShieldCheck, Monitor, MessageSquare, AlertTriangle, X } from 'lucide-react';
import { useAccessibility } from '@/hooks/use-accessibility';

export interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (consents: {
    consentTranscript: boolean;
    consentAudio: boolean;
    consentScreenShare: boolean;
  }) => void;
  initialValues?: {
    consentTranscript?: boolean;
    consentAudio?: boolean;
    consentScreenShare?: boolean;
  };
}

export function ConsentModal({
  isOpen,
  onClose,
  onConfirm,
  initialValues = {},
}: ConsentModalProps) {
  const { language } = useAccessibility();
  const [consentTranscript, setConsentTranscript] = React.useState(
    initialValues.consentTranscript ?? true
  );
  const [consentAudio, setConsentAudio] = React.useState(
    initialValues.consentAudio ?? false
  );
  const [consentScreenShare, setConsentScreenShare] = React.useState(
    initialValues.consentScreenShare ?? false
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      consentTranscript,
      consentAudio,
      consentScreenShare,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
    >
      <div className="relative w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl p-6 space-y-6">
        <button
          onClick={onClose}
          type="button"
          aria-label={language === 'am' ? 'ዝጋ' : 'Close'}
          className="absolute right-4 top-4 p-2 rounded-lg text-muted-foreground hover:bg-muted"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h2 id="consent-title" className="text-xl font-bold">
              {language === 'am' ? 'የግላዊነትና የፈቃድ ስምምነት' : 'Privacy & Consent Preferences'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {language === 'am'
                ? 'ለሰው ድጋፍ ሰጪው የሚጋራውን መረጃ እርስዎ ይቆጣጠራሉ'
                : 'You control what context is shared with the human support specialist'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transcript Summary */}
          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-border bg-slate-50 hover:bg-slate-100 cursor-pointer transition">
            <input
              type="checkbox"
              checked={consentTranscript}
              onChange={(e) => setConsentTranscript(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <div className="space-y-0.5">
              <span className="text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                {language === 'am'
                  ? 'የውይይት ማጠቃለያ ማጋራት (የሚመከር)'
                  : 'Share Conversation Summary (Recommended)'}
              </span>
              <p className="text-xs text-muted-foreground">
                {language === 'am'
                  ? 'እስካሁን የጠየቋቸውን ጥያቄዎችና ያጋጠምዎትን እንቅፋት ለድጋፍ ሰጪው ያጋራል (ጉዳይዎን ደግመው እንዳይናገሩ ይረዳል)'
                  : 'Allows specialist to see your stated goal and blocker so you never repeat yourself'}
              </p>
            </div>
          </label>

          {/* Screen Share */}
          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentScreenShare}
                onChange={(e) => setConsentScreenShare(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
              />
              <div className="space-y-0.5">
                <span className="text-sm font-semibold flex items-center gap-2 text-amber-950">
                  <Monitor className="w-4 h-4 text-amber-700" />
                  {language === 'am'
                    ? 'ስክሪን ማጋራት ፍቃድ (Screen Sharing Consent)'
                    : 'Allow Screen Sharing Assistance'}
                </span>
                <p className="text-xs text-amber-900/80">
                  {language === 'am'
                    ? 'ድጋፍ ሰጪው የስክሪን ገጽዎን በቀጥታ አይቶ እንዲረዳዎ ይፈቅዳል (በነባሪነት ጠፍቷል)'
                    : 'Grants the specialist view-only access to help guide you on complex application portals'}
                </p>
              </div>
            </label>
            {consentScreenShare && (
              <div className="flex items-center gap-2 text-[11px] text-amber-800 bg-amber-100/70 p-2 rounded-lg">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {language === 'am'
                    ? 'ማስታወሻ፡ ሚስጥራዊ የይለፍ ቃሎችዎን ወይም የባንክ መረጃዎችን በስክሪኑ ላይ አያሳዩ'
                    : 'Notice: Do not display passwords or sensitive financial credentials during screen sharing'}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-muted text-foreground transition"
            >
              {language === 'am' ? 'ሰርዝ' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition shadow"
            >
              {language === 'am' ? 'ተስማምቼ ቀጥል' : 'Confirm & Proceed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

