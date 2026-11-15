'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Loader2, Edit3, X } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import type { SupportedLanguage } from '@/hooks/use-accessibility';

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  language?: SupportedLanguage;
}

const INPUT_I18N: Record<
  SupportedLanguage,
  {
    placeholder: string;
    voiceBtn: string;
    recording: string;
    voiceAriaStart: string;
    voiceAriaStop: string;
    sendBtn: string;
    thinking: string;
    sendAria: string;
    composerAria: string;
    textareaAria: string;
    transcriptFound: string;
    keepText: string;
    clearText: string;
    clearAria: string;
  }
> = {
  en: {
    placeholder: 'Ask about course concepts, barrier mitigations, or accommodation rights... (Enter to send)',
    voiceBtn: 'Voice',
    recording: 'Recording...',
    voiceAriaStart: 'Record voice input (Mic)',
    voiceAriaStop: 'Stop voice recording',
    sendBtn: 'Send',
    thinking: 'Thinking...',
    sendAria: 'Send message to assistant',
    composerAria: 'Tutor chat composer',
    textareaAria: 'Your question message',
    transcriptFound: 'Voice Transcript Preview (Review or Edit):',
    keepText: 'Keep Text',
    clearText: 'Clear',
    clearAria: 'Discard voice transcript',
  },
  am: {
    placeholder: 'የሥርዓተ-ትምህርት ወይም የሕግ ማመቻቸት ጥያቄዎን ይጻፉ... (Enter ለመላክ)',
    voiceBtn: 'ድምፅ',
    recording: 'በመቅዳት ላይ...',
    voiceAriaStart: 'በድምፅ ተናገር (ማይክሮፎን)',
    voiceAriaStop: 'የድምፅ ቀረፃ አቁም',
    sendBtn: 'ላክ',
    thinking: 'በማዘጋጀት ላይ...',
    sendAria: 'መልዕክቱን ላክ',
    composerAria: 'የትምህርት ረዳት መጠየቂያ',
    textareaAria: 'የጥያቄ መልዕክት',
    transcriptFound: 'የድምፅ ጽሑፍ ተገኝቷል (ይከልሱ ወይም ያስተካክሉ)፦',
    keepText: 'ጽሑፉን አጽድቅ',
    clearText: 'ሰርዝ',
    clearAria: 'የድምፅ ጽሑፍ ሰርዝ',
  },
  om: {
    placeholder: "Waa'ee barnootaa ykn mirga fooyyee iddoo hojii gaafadhaa... (Enter erguuf)",
    voiceBtn: 'Sagalee',
    recording: 'Waraabamaa jira...',
    voiceAriaStart: 'Sagaleedhaan dubbadhaa (Maayikroofoonii)',
    voiceAriaStop: 'Waraabbii sagalee dhaabi',
    sendBtn: 'Ergi',
    thinking: 'Yaadaa jira...',
    sendAria: 'Ergaa gara gargaaraatti ergi',
    composerAria: 'Bakka gaaffii gargaaraa barnootaa',
    textareaAria: 'Ergaa gaaffii keessanii',
    transcriptFound: "Barreeffamni sagalee argameera (irra deebi'aa ilaalaa):",
    keepText: 'Barreeffama Eegi',
    clearText: 'Haqi',
    clearAria: 'Barreeffama sagalee haqi',
  },
  ti: {
    placeholder: 'ብዛዕባ ስርዓተ-ትምህርቲ ወይ ናይ ምምችቻው መሰልኩም ሕተቱ... (Enter ንምልኣኽ)',
    voiceBtn: 'ድምጺ',
    recording: 'ይቕዳሕ ኣሎ...',
    voiceAriaStart: 'ብድምጺ ተዛረቡ (ማይክሮፎን)',
    voiceAriaStop: 'ናይ ድምጺ ምቕዳሕ ኣቋርጽ',
    sendBtn: 'ልኣኽ',
    thinking: 'የዳልው ኣሎ...',
    sendAria: 'መልእኽቲ ልኣኽ',
    composerAria: 'ናይ ትምህርቲ ረዳኢ መወከሲ',
    textareaAria: 'ናይ ሕቶኹም መልእኽቲ',
    transcriptFound: 'ናይ ድምጺ ጽሑፍ ተረኺቡ (ኣስተኻኽሉ ወይ ዳግመ-ርኣዩ)፦',
    keepText: 'ጽሑፍ ኣጽድቕ',
    clearText: 'ሰርዝ',
    clearAria: 'ናይ ድምጺ ጽሑፍ ሰርዝ',
  },
  so: {
    placeholder: 'Weydii wax ku saabsan koorsooyinka ama xuquuqda waafajinta... (Riix Enter si aad u dirto)',
    voiceBtn: 'Cod',
    recording: 'Waa la duubayaa...',
    voiceAriaStart: 'Ku hadal codkaaga (Makarafoonka)',
    voiceAriaStop: 'Jooji duubista codka',
    sendBtn: 'Dir',
    thinking: 'Wuu fekerayaa...',
    sendAria: 'U dir farriinta kaaliyaha',
    composerAria: 'Goobta weydiinta kaaliyaha waxbarashada',
    textareaAria: 'Farriinta su’aashaada',
    transcriptFound: 'Qoraalka codka waa la helay (dib u eeg ama sax):',
    keepText: 'Hay Qoraalka',
    clearText: 'Tirtir',
    clearAria: 'Tirtir qoraalka codka',
  },
  ar: {
    placeholder: 'اطرح سؤالاً عن مفاهيم المناهج، أو التسهيلات وحقوق العمل... (اضغط Enter للإرسال)',
    voiceBtn: 'صوت',
    recording: 'جارٍ التسجيل...',
    voiceAriaStart: 'تسجيل إدخال صوتي (ميكروفون)',
    voiceAriaStop: 'إيقاف التسجيل الصوتي',
    sendBtn: 'إرسال',
    thinking: 'جارٍ التفكير...',
    sendAria: 'إرسال الرسالة إلى المساعد',
    composerAria: 'مربع كتابة المساعد التعليمي',
    textareaAria: 'نص رسالة سؤالك',
    transcriptFound: 'معاينة النص الصوتي (راجع أو عدّل):',
    keepText: 'اعتماد النص',
    clearText: 'مسح',
    clearAria: 'تجاهل النص الصوتي',
  },
};

export function ChatInput({
  onSendMessage,
  isLoading = false,
  language = 'en',
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const [transcriptPreview, setTranscriptPreview] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { isListening, isSupported, startListening, stopListening } = useSpeechRecognition(
    (transcript) => {
      setTranscriptPreview(transcript);
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    }
  );

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        180
      )}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
    setTranscriptPreview(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleRecording = () => {
    if (isListening) {
      stopListening();
    } else {
      const bcpCode =
        language === 'am'
          ? 'am-ET'
          : language === 'ti'
          ? 'ti-ET'
          : language === 'om'
          ? 'om-ET'
          : language === 'so'
          ? 'so-ET'
          : language === 'ar'
          ? 'ar-SA'
          : 'en-US';
      startListening(bcpCode);
    }
  };

  const i18n = INPUT_I18N[language] || INPUT_I18N.en;

  return (
    <div className="w-full space-y-2">
      {/* Voice Transcript Preview & Editing Bar (when voice captured) */}
      {transcriptPreview && (
        <div
          role="status"
          aria-live="polite"
          className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs flex flex-wrap items-center justify-between gap-2 transition-all shadow-xs"
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            <span className="font-bold text-emerald-900 dark:text-emerald-200">
              {i18n.transcriptFound}
            </span>
            <span className="italic text-emerald-800 dark:text-emerald-300">&ldquo;{transcriptPreview}&rdquo;</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setTranscriptPreview(null);
                textareaRef.current?.focus();
              }}
              className="px-2.5 py-1 rounded-md bg-white dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 border border-emerald-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer min-h-[32px]"
            >
              <Edit3 className="w-3 h-3" aria-hidden="true" />
              <span>{i18n.keepText}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setInput((prev) => prev.replace(transcriptPreview, '').trim());
                setTranscriptPreview(null);
              }}
              className="px-2 py-1 rounded-md text-red-600 hover:bg-red-100 text-[11px] font-bold flex items-center gap-1 cursor-pointer min-h-[32px]"
              aria-label={i18n.clearAria}
            >
              <X className="w-3 h-3" aria-hidden="true" />
              <span>{i18n.clearText}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Composer Dock */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-end gap-2.5 p-2 bg-[var(--bg-surface)] border-2 border-[var(--border-default)] focus-within:border-[var(--brand-primary)] rounded-2xl shadow-xs transition-colors"
        aria-label={i18n.composerAria}
      >
        {/* Prominent 44×44px Voice Input Mic Button */}
        {isSupported && (
          <button
            type="button"
            onClick={toggleRecording}
            aria-pressed={isListening}
            className={`min-h-[44px] min-w-[44px] px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${
              isListening
                ? 'bg-red-600 text-white shadow-md animate-pulse'
                : 'bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-canvas)] border border-[var(--border-default)]'
            }`}
            aria-label={isListening ? i18n.voiceAriaStop : i18n.voiceAriaStart}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4 shrink-0" aria-hidden="true" />
                <div className="flex items-center gap-0.5 h-4 px-1" aria-hidden="true">
                  <span className="w-1 bg-white rounded-full animate-wave-1" />
                  <span className="w-1 bg-white rounded-full animate-wave-2" />
                  <span className="w-1 bg-white rounded-full animate-wave-3" />
                  <span className="w-1 bg-white rounded-full animate-wave-4" />
                </div>
                <span className="font-bold text-[11px]">{i18n.recording}</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-[var(--brand-primary)] shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline font-bold text-[11px]">{i18n.voiceBtn}</span>
              </>
            )}
          </button>
        )}

        {/* Text Area Input */}
        <div className="flex-1 min-w-0 py-1">
          <label htmlFor="tutor-textarea" className="sr-only">
            {i18n.textareaAria}
          </label>
          <textarea
            id="tutor-textarea"
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={i18n.placeholder}
            disabled={isLoading}
            className="w-full bg-transparent resize-none border-0 p-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-0 max-h-44 leading-relaxed font-sans"
          />
        </div>

        {/* Prominent 44×44px Send Button with Explicit Visible Text */}
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="min-h-[44px] min-w-[44px] px-4 rounded-xl bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-hover)] disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-1.5 text-xs font-bold shrink-0 shadow-xs focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] cursor-pointer"
          aria-label={i18n.sendAria}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">{i18n.thinking}</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{i18n.sendBtn}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
