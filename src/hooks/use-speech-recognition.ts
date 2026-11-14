'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export function useSpeechRecognition(onResult?: (transcript: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    ) {
      setIsSupported(true);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Recognition already stopped
      }
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(
    (lang = 'am-ET') => {
      if (typeof window === 'undefined') return;

      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) return;

      try {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
          } catch {
            // Safe abort
          }
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = lang;

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setTranscript(text);
          if (onResult) {
            onResult(text);
          }
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        recognition.start();
      } catch (err) {
        setIsListening(false);
      }
    },
    [onResult]
  );

  return { isListening, isSupported, transcript, startListening, stopListening };
}
