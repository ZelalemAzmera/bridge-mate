'use client';

import React from 'react';
import { Volume2, VolumeX, User, Bot } from 'lucide-react';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import { CitationPopover, type Citation } from './citation-popover';
import type { SupportedLanguage } from '@/hooks/use-accessibility';

export interface ChatMessageProps {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: Citation[];
  language?: SupportedLanguage;
}

export function ChatMessage({
  role,
  content,
  citations = [],
  language = 'am',
}: ChatMessageProps) {
  const { speak, stop, isSpeaking, isSupported } = useSpeechSynthesis();
  const isUser = role === 'user';

  const handleReadAloud = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(content, language);
    }
  };

  return (
    <article
      aria-label={isUser ? (language === 'am' ? 'የእርስዎ መልዕክት' : 'Your message') : (language === 'am' ? 'የብሪጅሜት ረዳት ምላሽ' : 'BridgeMate Assistant response')}
      className={`flex gap-3 py-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div
          className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shrink-0 shadow-sm border border-white mt-1"
          aria-hidden="true"
        >
          <Bot className="w-5 h-5" />
        </div>
      )}

      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm transition-colors ${isUser
            ? 'bg-primary text-white font-medium rounded-tr-none'
            : 'bg-card text-card-foreground border-2 border-border rounded-tl-none'
          }`}
      >
        {/* Message Content */}
        <div className="whitespace-pre-wrap break-words">
          {content}
        </div>

        {/* Citations Container */}
        {!isUser && citations.length > 0 && (
          <div
            className="mt-3 pt-2.5 border-t border-border flex flex-wrap items-center gap-1.5"
            aria-label={language === 'am' ? 'የተጠቀሱ ማስረጃዎች' : 'Cited curriculum references'}
          >
            <span className="text-[11px] font-bold text-muted-foreground mr-1">
              {language === 'am' ? 'የተረጋገጡ ምንጮች፡' : 'Sources:'}
            </span>
            {citations.map((c) => (
              <CitationPopover key={c.id} citation={c} />
            ))}
          </div>
        )}

        {/* Read Aloud Accessible Button */}
        {!isUser && isSupported && (
          <div className="mt-2.5 pt-1.5 flex justify-end">
            <button
              type="button"
              onClick={handleReadAloud}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded p-1"
              aria-label={
                isSpeaking
                  ? language === 'am' ? 'ድምፅ አቁም' : 'Stop reading aloud'
                  : language === 'am' ? 'መልዕክቱን በድምፅ አንብብ' : 'Read message aloud'
              }
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-red-500 animate-pulse" aria-hidden="true" />
                  <span className="text-red-600 font-bold">{language === 'am' ? 'አቁም' : 'Stop'}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{language === 'am' ? 'አንብብ' : 'Read Aloud'}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {isUser && (
        <div
          className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm mt-1"
          aria-hidden="true"
        >
          <User className="w-5 h-5" />
        </div>
      )}
    </article>
  );
}

