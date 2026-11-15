'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export function useSpeechRecognition(onResult?: (transcript: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasWebSpeech = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
      const hasMediaDevices = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
      setIsSupported(hasWebSpeech || hasMediaDevices);
    }
  }, []);

  const stopListening = useCallback(() => {
    // 1. Web Speech API Stop
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Recognition already stopped
      }
    }

    // 2. MediaRecorder Stop (Fallback for Safari / Google AI Studio STT)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // MediaRecorder already stopped
      }
    }

    setIsListening(false);
  }, []);

  const startListening = useCallback(
    async (lang = 'am-ET') => {
      if (typeof window === 'undefined') return;

      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      // Tier 1: Real-time Web Speech API (Direct Google Speech Engine in Chrome/Android)
      if (SpeechRecognition) {
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
          return;
        } catch (err) {
          console.warn('[Web Speech API] Fallback to MediaRecorder transcription:', err);
        }
      }

      // Tier 2: MediaRecorder + Google AI Studio /api/transcribe (Safari, Firefox, Mobile edge)
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];

          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };

          mediaRecorder.onstart = () => setIsListening(true);
          mediaRecorder.onstop = async () => {
            setIsListening(false);
            stream.getTracks().forEach((track) => track.stop());

            if (audioChunksRef.current.length > 0) {
              const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
              const formData = new FormData();
              formData.append('audio', audioBlob);
              formData.append('language', lang.startsWith('am') ? 'am' : 'en');

              try {
                const res = await fetch('/api/transcribe', {
                  method: 'POST',
                  body: formData,
                });
                if (res.ok) {
                  const data = await res.json();
                  if (data.text) {
                    setTranscript(data.text);
                    if (onResult) {
                      onResult(data.text);
                    }
                  }
                }
              } catch (transcribeErr) {
                console.warn('[Transcribe API Error]:', transcribeErr);
              }
            }
          };

          mediaRecorder.start();
        } catch (mediaErr) {
          console.warn('[MediaRecorder Error]:', mediaErr);
          setIsListening(false);
        }
      }
    },
    [onResult]
  );

  return { isListening, isSupported, transcript, startListening, stopListening };
}
