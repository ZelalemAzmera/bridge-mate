'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Loader2 } from 'lucide-react';
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
  language = 'am',
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { isListening, isSupported, startListening } = useSpeechRecognition(
    (transcript) => {
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    }
  );

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        160
      )}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const placeholder =
    language === 'am'
      ? 'ጥያቄዎን በአማርኛ ወይም በእንግሊዝኛ ይጻፉ... (Enter ለመላክ)'
      : 'Type your inquiry in Amharic or English... (Press Enter to send)';

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-end gap-2 p-2 bg-card border-2 border-border rounded-2xl shadow-md focus-within:ring-4 focus-within:ring-primary focus-within:border-primary transition-all"
      aria-label={language === 'am' ? 'የመልዕክት መላኪያ ፎርም' : 'Message submission form'}
    >
      {/* Speech-to-Text Button */}
      {isSupported && (
        <button
          type="button"
          onClick={() => startListening(language === 'am' ? 'am-ET' : 'en-US')}
          className={`p-2.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 ${isListening
            ? 'bg-red-500 text-white animate-pulse'
            : 'text-muted-foreground hover:bg-slate-100 hover:text-foreground'
            }`}
          aria-label={
            isListening
              ? language === 'am' ? 'ማዳመጥ አቁም' : 'Stop voice recording'
              : language === 'am' ? 'በድምፅ መልዕክት ላክ' : 'Voice input speech-to-text'
          }
          title={language === 'am' ? 'በድምፅ ተናገር' : 'Voice input'}
        >
          {isListening ? (
            <MicOff className="w-5 h-5" aria-hidden="true" />
          ) : (
            <Mic className="w-5 h-5" aria-hidden="true" />
          )}
        </button>
      )}

      {/* Text Area */}
      <div className="flex-1 min-w-0">
        <label htmlFor="chat-textarea" className="sr-only">
          {language === 'am' ? 'የጥያቄ መልዕክት' : 'Your question message'}
        </label>
        <textarea
          id="chat-textarea"
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className="w-full bg-transparent resize-none border-0 p-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 max-h-40 leading-relaxed font-sans"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!input.trim() || isLoading}
        className="p-2.5 rounded-xl bg-primary text-white hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-primary transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 shadow-sm"
        aria-label={language === 'am' ? 'መልዕክቱን ላክ' : 'Send message'}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
        ) : (
          <Send className="w-5 h-5" aria-hidden="true" />
        )}
      </button>
    </form>
  );
}

