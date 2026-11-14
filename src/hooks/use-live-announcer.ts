'use client';

import { useCallback } from 'react';

export type AnnouncementPoliteness = 'polite' | 'assertive';

export function announceToScreenReader(message: string, politeness: AnnouncementPoliteness = 'polite') {
  if (typeof window === 'undefined') return;

  const event = new CustomEvent('bridgemate-announce', {
    detail: { message, politeness },
  });
  window.dispatchEvent(event);

  // If audio assist / Web Speech API is supported and enabled, speak the message
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      const isAudioAssist = document.documentElement.getAttribute('data-audio-assist') === 'true';
      if (isAudioAssist && politeness === 'assertive') {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // Speech synthesis fallback
    }
  }
}

export function useLiveAnnouncer() {
  const announce = useCallback((message: string, politeness: AnnouncementPoliteness = 'polite') => {
    announceToScreenReader(message, politeness);
  }, []);

  return { announce };
}

