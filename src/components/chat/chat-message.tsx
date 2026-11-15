'use client';

import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, CheckCircle2, User, Bot, FileText } from 'lucide-react';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import { renderSemanticContent } from '@/lib/format-content';
import type { SupportedLanguage } from '@/hooks/use-accessibility';
import type { Citation } from './citation-popover';

export interface ChatMessageProps {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: Citation[];
  language?: SupportedLanguage;
  courseTag?: string;
  legalAnchor?: string;
}

const MESSAGE_I18N: Record<
  SupportedLanguage,
  {
    readAloud: string;
    stop: string;
    readAloudAria: string;
    stopAria: string;
    simpleModeOn: string;
    simpleModeOff: string;
    simpleModeAria: string;
    verifiedReferences: string;
    assistantLabel: string;
    userLabel: string;
  }
> = {
  en: {
    readAloud: 'Read Aloud',
    stop: 'Stop',
    readAloudAria: 'Read aloud response',
    stopAria: 'Stop reading aloud',
    simpleModeOn: 'Simple Mode: On',
    simpleModeOff: 'Simple Mode',
    simpleModeAria: 'Toggle plain-language simple mode',
    verifiedReferences: 'Verified References:',
    assistantLabel: 'AI Tutor Response',
    userLabel: 'Learner message',
  },
  am: {
    readAloud: 'አንብብ',
    stop: 'አቁም',
    readAloudAria: 'መልዕክቱን በድምፅ አንብብ',
    stopAria: 'ድምፅ ንባብ አቁም',
    simpleModeOn: 'ቀላል ሁነታ፡ በርቷል',
    simpleModeOff: 'ቀላል ሁነታ',
    simpleModeAria: 'ቀላል የአነባበብ ሁነታ ቀይር',
    verifiedReferences: 'የተረጋገጡ ምንጮች፡',
    assistantLabel: 'የትምህርት ረዳት ምላሽ',
    userLabel: 'የተማሪው መልዕክት',
  },
  om: {
    readAloud: 'Sagalee',
    stop: 'Dhaabi',
    readAloudAria: 'Ergaa sagaleen dubbisi',
    stopAria: 'Dubbisuu dhaabi',
    simpleModeOn: 'Haala Salphaa: Hojjata',
    simpleModeOff: 'Haala Salphaa',
    simpleModeAria: 'Gara haala salphaatti jijjiiri',
    verifiedReferences: "Wabiiwwan Mirkanaa'an:",
    assistantLabel: 'Deebii Gargaaraa Barnootaa',
    userLabel: 'Ergaa Barataa',
  },
  ti: {
    readAloud: 'ድምጺ',
    stop: 'ኣቋርጽ',
    readAloudAria: 'መልእኽቲ ብድምጺ ኣንብብ',
    stopAria: 'ምንባብ ኣቋርጽ',
    simpleModeOn: 'ቀሊል ኣገባብ፡ በርሀ',
    simpleModeOff: 'ቀሊል ኣገባብ',
    simpleModeAria: 'ናብ ቀሊል ኣገባብ ቀይር',
    verifiedReferences: 'ዝተረጋገጹ ምንጭታት፡',
    assistantLabel: 'ናይ ትምህርቲ ረዳኢ ምላሽ',
    userLabel: 'ናይ ተምሃራይ መልእኽቲ',
  },
  so: {
    readAloud: 'Cod',
    stop: 'Jooji',
    readAloudAria: 'Farriinta kor ugu akhri',
    stopAria: 'Jooji akhriska',
    simpleModeOn: 'Hab Fudud: Wuu Furan Yahay',
    simpleModeOff: 'Hab Fudud',
    simpleModeAria: 'U beddel habka fudud',
    verifiedReferences: 'Xogaha La Xaqiijiyay:',
    assistantLabel: 'Jawaabta Kaaliyaha AI',
    userLabel: 'Farriinta Baraha',
  },
  ar: {
    readAloud: 'قراءة',
    stop: 'إيقاف',
    readAloudAria: 'قراءة الرد بصوت عالٍ',
    stopAria: 'إيقاف القراءة الصوتية',
    simpleModeOn: 'الوضع المبسط: مفعل',
    simpleModeOff: 'الوضع المبسط',
    simpleModeAria: 'تبديل الوضع المبسط',
    verifiedReferences: 'المراجع المعتمدة:',
    assistantLabel: 'رد مساعد الذكاء الاصطناعي',
    userLabel: 'رسالة المتعلم',
  },
};

export function ChatMessage({
  role,
  content,
  citations = [],
  language = 'en',
  courseTag = 'Savanna Module 3',
  legalAnchor = 'Proclamation 1156/2019, Art. 29',
}: ChatMessageProps) {
  const { speak, stop, isSpeaking, isSupported } = useSpeechSynthesis();
  const [simpleMode, setSimpleMode] = useState(false);
  const isUser = role === 'user';
  const i18n = MESSAGE_I18N[language] || MESSAGE_I18N.en;

  const handleReadAloud = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(content, language);
    }
  };

  if (isUser) {
    return (
      <article
        aria-label={i18n.userLabel}
        className="flex justify-end my-3"
      >
        <div className="flex items-start gap-3 max-w-[85%] md:max-w-[75%]">
          <div className="bg-[var(--brand-primary)] text-white px-4 py-3 rounded-2xl rounded-tr-xs shadow-xs text-sm leading-relaxed font-medium">
            <p className="whitespace-pre-wrap break-words">{content}</p>
          </div>
          <div
            className="w-9 h-9 rounded-full bg-[var(--text-primary)] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5"
            aria-hidden="true"
          >
            <User className="w-4 h-4" />
          </div>
        </div>
      </article>
    );
  }

  // Assistant Response: Clean white elevated card (border-radius: 12px, padding: 20px, border: 1px solid var(--border-default))
  return (
    <article
      aria-label={i18n.assistantLabel}
      className="my-4 rounded-[12px] p-5 border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs transition-colors"
    >
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-[var(--border-default)]">
        {/* Verified Citation Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[var(--accent-verified)] border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span className="font-mono text-[11px] font-bold">
            {courseTag} • {legalAnchor}
          </span>
        </div>

        {/* Action Controls: Read Aloud & Simple Mode (minimum 44x44px target, 8px gap) */}
        <div className="flex items-center gap-2">
          {/* Read Aloud Button */}
          {isSupported && (
            <button
              type="button"
              onClick={handleReadAloud}
              className={`min-h-[44px] px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${
                isSpeaking
                  ? 'border-red-300 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
                  : 'border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-canvas)]'
              }`}
              aria-label={isSpeaking ? i18n.stopAria : i18n.readAloudAria}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4 text-red-600 animate-pulse" aria-hidden="true" />
                  <span>{i18n.stop}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-[var(--brand-primary)]" aria-hidden="true" />
                  <span>{i18n.readAloud}</span>
                </>
              )}
            </button>
          )}

          {/* Simple Mode Toggle */}
          <button
            type="button"
            onClick={() => setSimpleMode(!simpleMode)}
            aria-pressed={simpleMode}
            className={`min-h-[44px] px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${
              simpleMode
                ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-bold'
                : 'border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-canvas)]'
            }`}
            aria-label={i18n.simpleModeAria}
          >
            <Sparkles className="w-4 h-4 text-[var(--brand-primary)]" aria-hidden="true" />
            <span>
              {simpleMode ? i18n.simpleModeOn : i18n.simpleModeOff}
            </span>
          </button>
        </div>
      </div>

      {/* Semantic Rendered Content (68ch measure, no raw markdown) */}
      <div className="readable-measure py-1">
        {renderSemanticContent(content, simpleMode)}
      </div>

      {/* Citations & Evidence footer */}
      {citations.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[var(--border-default)] flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
          <span className="font-bold flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-[var(--brand-primary)]" aria-hidden="true" />
            <span>{i18n.verifiedReferences}</span>
          </span>
          {citations.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-default)] text-[11px] font-mono text-[var(--text-primary)]"
            >
              <span>{c.sourceTitle}</span>
              {c.excerpt && <span className="text-[var(--text-secondary)]">({c.excerpt})</span>}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
