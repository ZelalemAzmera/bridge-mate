'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

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

      const isAmharic = lang === 'am' || /[\u1200-\u137F]/.test(text);

      // Check if browser has native Amharic TTS voice
      let hasNativeAmharicVoice = false;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        hasNativeAmharicVoice = voices.some(
          (v) => v.lang.startsWith('am') || v.name.toLowerCase().includes('amharic')
        );
      }

      // If Amharic and no native voice, use high-fidelity audio stream fallback
      if (isAmharic && !hasNativeAmharicVoice) {
        try {
          const cleanText = text.replace(/\[Source:.*?\]/g, '').trim().slice(0, 180);
          const audio = new Audio(`/api/tts?lang=am&text=${encodeURIComponent(cleanText)}`);
          audioRef.current = audio;

          audio.onplay = () => setIsSpeaking(true);
          audio.onended = () => {
            setIsSpeaking(false);
            audioRef.current = null;
          };
          audio.onerror = () => {
            setIsSpeaking(false);
            audioRef.current = null;
          };

          audio.play().catch(() => {
            setIsSpeaking(false);
          });
          return;
        } catch {
          // Fall through to standard speech synthesis
        }
      }

      // Standard Web Speech API (English or supported voices)
      if ('speechSynthesis' in window) {
        const cleanText = text.replace(/\[Source:.*?\]/g, '').trim();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = isAmharic ? 'am-ET' : 'en-US';
        utterance.rate = 0.95;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
      }
    },
    [stop]
  );

  return { speak, stop, isSpeaking, isSupported };
}
