'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Volume2,
  VolumeX,
  User,
  Headphones,
  Info,
  Loader2,
} from 'lucide-react';
import { useAccessibility } from '@/hooks/use-accessibility';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import { useLiveAnnouncer } from '@/hooks/use-live-announcer';
import type { SupportMessageItem } from '@/lib/services/support.service';

export interface AgentChatProps {
  sessionId: string;
  initialMessages?: SupportMessageItem[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading?: boolean;
}

export function AgentChat({
  sessionId,
  initialMessages = [],
  onSendMessage,
  isLoading = false,
}: AgentChatProps) {
  const { language } = useAccessibility();
  const { announce } = useLiveAnnouncer();
  const { speak, stop, isSpeaking } = useSpeechSynthesis();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<SupportMessageItem[]>(initialMessages);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || isSending) return;

    setIsSending(true);
    setInputText('');

    // Optimistically add user message
    const tempUserMsg: SupportMessageItem = {
      id: `temp-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      await onSendMessage(text);
    } catch (err) {
      console.error('[AgentChat] Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleReadAloud = (text: string) => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text, language);
      announce(language === 'am' ? 'መልእክቱ እየተነበበ ነው' : 'Reading message aloud');
    }
  };

  return (
    <div className="flex flex-col h-[520px] rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Agent Info Bar */}
      <div className="px-5 py-3.5 border-b border-border bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Headphones className="w-5 h-5" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {language === 'am'
                ? 'ሰላማዊት ታደሰ (የሥራና የተደራሽነት ባለሙያ)'
                : 'Selamawit T. (Inclusion Specialist)'}
            </h3>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {language === 'am' ? 'በቀጥታ መስመር ላይ ይገኛሉ' : 'Active in Room'}
            </p>
          </div>
        </div>

        <span className="text-[11px] px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-medium">
          {language === 'am' ? 'ደህንነቱ የተጠበቀ ክፍለ-ጊዜ' : 'Encrypted Session'}
        </span>
      </div>

      {/* Messages Stream */}
      <div
        role="log"
        aria-live="polite"
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-slate-50/50"
      >
        {messages.map((m) => {
          if (m.sender === 'system') {
            return (
              <div
                key={m.id}
                className="mx-auto max-w-md p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-center text-xs text-muted-foreground flex items-center justify-center gap-2"
              >
                <Info className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{m.text}</span>
              </div>
            );
          }

          const isUser = m.sender === 'user';

          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div className="flex items-center gap-1.5 px-1">
                <span className="text-[10px] font-semibold text-muted-foreground">
                  {isUser
                    ? language === 'am' ? 'እርስዎ' : 'You'
                    : language === 'am' ? 'ሰላማዊት (ባለሙያ)' : 'Selamawit (Specialist)'}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(m.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div
                className={`group relative max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-sm ${
                  isUser
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-card text-card-foreground border border-border rounded-tl-sm shadow-xs'
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>

                {/* Read Aloud Button */}
                <button
                  type="button"
                  onClick={() => handleReadAloud(m.text)}
                  aria-label={
                    isSpeaking
                      ? language === 'am' ? 'ንባብ አቁም' : 'Stop speech'
                      : language === 'am' ? 'ድምፅ አሰማ' : 'Read message aloud'
                  }
                  className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition ${
                    isUser
                      ? 'text-primary-foreground/80 hover:text-white bg-white/10'
                      : 'text-muted-foreground hover:text-foreground bg-muted'
                  }`}
                >
                  {isSpeaking ? (
                    <VolumeX className="w-3 h-3 text-amber-300" />
                  ) : (
                    <Volume2 className="w-3 h-3" />
                  )}
                  <span>{language === 'am' ? 'አንብብ' : 'Listen'}</span>
                </button>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={handleSend}
        className="p-3 border-t border-border bg-card flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            language === 'am'
              ? 'መልእክትዎን እዚህ ይጻፉ...'
              : 'Type your message to the specialist...'
          }
          className="flex-1 px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition flex items-center gap-1.5 shadow"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {language === 'am' ? 'ላክ' : 'Send'}
          </span>
        </button>
      </form>
    </div>
  );
}

