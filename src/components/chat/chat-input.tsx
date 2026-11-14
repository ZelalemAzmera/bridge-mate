'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Loader2, Edit3, X, Check } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import type { SupportedLanguage } from '@/hooks/use-accessibility';

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  language?: SupportedLanguage;
}

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

  const placeholder =
    language === 'am'
      ? 'የሥርዓተ-ትምህርት ወይም የሕግ ማመቻቸት ጥያቄዎን ይጻፉ... (Enter ለመላክ)'
      : 'Ask about course concepts, barrier mitigations, or accommodation rights... (Enter to send)';

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
              {language === 'am' ? 'የድምፅ ጽሑፍ ተገኝቷል (ይከልሱ ወይም ያስተካክሉ)፦' : 'Voice Transcript Preview (Review or Edit):'}
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
              <span>{language === 'am' ? 'ጽሑፉን አጽድቅ' : 'Keep Text'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setInput((prev) => prev.replace(transcriptPreview, '').trim());
                setTranscriptPreview(null);
              }}
              className="px-2 py-1 rounded-md text-red-600 hover:bg-red-100 text-[11px] font-bold flex items-center gap-1 cursor-pointer min-h-[32px]"
              aria-label={language === 'am' ? 'የድምፅ ጽሑፍ ሰርዝ' : 'Discard voice transcript'}
            >
              <X className="w-3 h-3" aria-hidden="true" />
              <span>{language === 'am' ? 'ሰርዝ' : 'Clear'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Composer Dock */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-end gap-2.5 p-2 bg-[var(--bg-surface)] border-2 border-[var(--border-default)] focus-within:border-[var(--brand-primary)] rounded-2xl shadow-xs transition-colors"
        aria-label={language === 'am' ? 'የትምህርት ረዳት መጠየቂያ' : 'Tutor chat composer'}
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
            aria-label={
              isListening
                ? language === 'am' ? 'የድምፅ ቀረፃ አቁም' : 'Stop voice recording'
                : language === 'am' ? 'በድምፅ ተናገር (Voice Mic)' : 'Record voice input (Mic)'
            }
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
                <span className="font-bold text-[11px]">{language === 'am' ? 'በመቅዳት ላይ...' : 'Recording...'}</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-[var(--brand-primary)] shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline font-bold text-[11px]">{language === 'am' ? 'ድምፅ' : 'Voice'}</span>
              </>
            )}
          </button>
        )}

        {/* Text Area Input */}
        <div className="flex-1 min-w-0 py-1">
          <label htmlFor="tutor-textarea" className="sr-only">
            {language === 'am' ? 'የጥያቄ መልዕክት' : 'Your question message'}
          </label>
          <textarea
            id="tutor-textarea"
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            className="w-full bg-transparent resize-none border-0 p-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-0 max-h-44 leading-relaxed font-sans"
          />
        </div>

        {/* Prominent 44×44px Send Button with Explicit Visible Text */}
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="min-h-[44px] min-w-[44px] px-4 rounded-xl bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-hover)] disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-1.5 text-xs font-bold shrink-0 shadow-xs focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] cursor-pointer"
          aria-label={language === 'am' ? 'መልዕክቱን ላክ' : 'Send message to assistant'}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">{language === 'am' ? 'በማዘጋጀት ላይ...' : 'Thinking...'}</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{language === 'am' ? 'ላክ' : 'Send'}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
