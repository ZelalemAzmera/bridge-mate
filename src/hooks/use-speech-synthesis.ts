'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Strips markdown symbols, citations, and URLs so speech synthesis sounds natural and clear.
 */
function sanitizeSpeechText(text: string, maxLength = 300): string {
  return text
    .replace(/\[Source:.*?\]/g, '')
    .replace(/\[.*?\]\(.*?\)/g, '')
    .replace(/[*_#`~>]/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSupported('speechSynthesis' in window || typeof Audio !== 'undefined');
    }
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback(
    (text: string, lang = 'am') => {
      if (typeof window === 'undefined') return;

      stop();

      const cleanText = sanitizeSpeechText(text);
      if (!cleanText) return;

      const isAmharic = lang === 'am' || /[\u1200-\u137F]/.test(cleanText);

      // Web Speech API fallback runner
      const speakWithBrowserSpeech = () => {
        if ('speechSynthesis' in window) {
          try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = isAmharic ? 'am-ET' : 'en-US';
            utterance.rate = isAmharic ? 0.88 : 0.95;

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            window.speechSynthesis.speak(utterance);
          } catch {
            setIsSpeaking(false);
          }
        } else {
          setIsSpeaking(false);
        }
      };

      // Helper to play streaming audio with direct client and browser speech fallbacks
      const playWithResilience = (primaryUrl: string, directUrl: string) => {
        try {
          const audio = new Audio(primaryUrl);
          audioRef.current = audio;

          const executeFallback = () => {
            try {
              const fallbackAudio = new Audio(directUrl);
              audioRef.current = fallbackAudio;

              fallbackAudio.onplay = () => setIsSpeaking(true);
              fallbackAudio.onended = () => {
                setIsSpeaking(false);
                audioRef.current = null;
              };
              fallbackAudio.onerror = () => {
                audioRef.current = null;
                speakWithBrowserSpeech();
              };

              fallbackAudio.play().catch(() => {
                audioRef.current = null;
                speakWithBrowserSpeech();
              });
            } catch {
              audioRef.current = null;
              speakWithBrowserSpeech();
            }
          };

          audio.onplay = () => setIsSpeaking(true);
          audio.onended = () => {
            setIsSpeaking(false);
            audioRef.current = null;
          };
          audio.onerror = () => {
            executeFallback();
          };

          audio.play().catch(() => {
            executeFallback();
          });
        } catch {
          speakWithBrowserSpeech();
        }
      };

      // Local languages: Amharic (am), Tigrinya (ti), Afaan Oromoo (om), Somali (so)
      const isLocalLang = ['am', 'ti', 'om', 'so'].includes(lang) || /[\u1200-\u137F]/.test(cleanText);
      const effectiveLang = ['am', 'ti', 'om', 'so'].includes(lang)
        ? lang
        : (/[\u1200-\u137F]/.test(cleanText) ? 'am' : 'en');

      if (isLocalLang) {
        const encoded = encodeURIComponent(cleanText);
        const primaryUrl = `/api/tts?lang=${effectiveLang}&text=${encoded}`;
        const directUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${effectiveLang === 'en' ? 'en' : 'am'}&q=${encoded}`;
        playWithResilience(primaryUrl, directUrl);
        return;
      }

      // For English or other Latin-script languages, use Web Speech API or fallback stream
      if ('speechSynthesis' in window) {
        speakWithBrowserSpeech();
      } else {
        const encoded = encodeURIComponent(cleanText);
        const primaryUrl = `/api/tts?lang=en&text=${encoded}`;
        const directUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${encoded}`;
        playWithResilience(primaryUrl, directUrl);
      }
    },
    [stop]
  );

  return { speak, stop, isSpeaking, isSupported };
}
