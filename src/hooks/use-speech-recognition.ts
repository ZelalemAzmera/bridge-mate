'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export function useSpeechRecognition(
  onResult?: (transcript: string, provider?: string) => void
) {
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [provider, setProvider] = useState<string>('hasab-ai');

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const currentLangRef = useRef<string>('am');
  const autoStopTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasMediaDevices =
        typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
      const hasWebSpeech =
        'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
      setIsSupported(hasMediaDevices || hasWebSpeech);
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const stopListening = useCallback(() => {
    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current);
      autoStopTimeoutRef.current = null;
    }

    // 1. MediaRecorder Stop (Primary Hasab AI STT pipeline)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Safe catch
      }
    }

    // 2. Web Speech API Stop (Fallback)
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Safe catch
      }
    }

    setIsListening(false);
  }, []);

  const startListening = useCallback(
    async (lang = 'am') => {
      if (typeof window === 'undefined') return;

      // Extract 2-letter base language: 'am-ET' -> 'am', 'ti-ET' -> 'ti', etc.
      const normalizedLang = lang.split('-')[0].toLowerCase();
      currentLangRef.current = normalizedLang;

      // TIER 1: Native High-Fidelity Recording for Hasab AI STT (/api/transcribe)
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        try {
          // Stop any previous stream
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
          }

          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
          streamRef.current = stream;

          // Determine preferred MIME type
          let mimeType = 'audio/webm;codecs=opus';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = MediaRecorder.isTypeSupported('audio/webm')
              ? 'audio/webm'
              : MediaRecorder.isTypeSupported('audio/mp4')
              ? 'audio/mp4'
              : '';
          }

          const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
          mediaRecorderRef.current = recorder;
          audioChunksRef.current = [];

          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };

          recorder.onstart = () => {
            setIsListening(true);
            setIsTranscribing(false);
          };

          recorder.onstop = async () => {
            setIsListening(false);
            if (streamRef.current) {
              streamRef.current.getTracks().forEach((t) => t.stop());
              streamRef.current = null;
            }

            if (audioChunksRef.current.length === 0) return;

            setIsTranscribing(true);

            try {
              const audioBlob = new Blob(audioChunksRef.current, {
                type: recorder.mimeType || 'audio/webm',
              });

              const ext =
                audioBlob.type.includes('mp4') || audioBlob.type.includes('m4a')
                  ? 'm4a'
                  : audioBlob.type.includes('wav')
                  ? 'wav'
                  : 'webm';
              const formData = new FormData();
              formData.append('audio', audioBlob, `speech.${ext}`);
              formData.append('language', currentLangRef.current);

              const res = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData,
              });

              if (res.ok) {
                const data = await res.json();
                if (data.text) {
                  setTranscript(data.text);
                  setProvider(data.provider || 'hasab-ai');
                  if (onResult) {
                    onResult(data.text, data.provider);
                  }
                }
              }
            } catch (err) {
              console.warn('[Hasab AI Transcribe Request Failed]:', err);
            } finally {
              setIsTranscribing(false);
            }
          };

          recorder.start(250); // Collect data slices every 250ms
          // Automatically stop after 25 seconds of continuous recording
          if (autoStopTimeoutRef.current) clearTimeout(autoStopTimeoutRef.current);
          autoStopTimeoutRef.current = setTimeout(() => {
            stopListening();
          }, 25000);
          return;
        } catch (mediaErr) {
          console.warn('[MediaRecorder Not Available, falling back to Web Speech]:', mediaErr);
        }
      }

      // TIER 2: Browser Web Speech API fallback runner (if mic permission denied or MediaRecorder unsupported)
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          if (recognitionRef.current) {
            try {
              recognitionRef.current.abort();
            } catch {}
          }

          const recognition = new SpeechRecognition();
          recognitionRef.current = recognition;
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang =
            lang.includes('-')
              ? lang
              : lang === 'am'
              ? 'am-ET'
              : lang === 'ti'
              ? 'ti-ET'
              : lang === 'om'
              ? 'om-ET'
              : 'en-US';

          recognition.onstart = () => setIsListening(true);
          recognition.onresult = (event: any) => {
            const text = event.results?.[0]?.[0]?.transcript || '';
            if (text) {
              setTranscript(text);
              setProvider('web-speech');
              if (onResult) {
                onResult(text, 'web-speech');
              }
            }
          };
          recognition.onerror = () => setIsListening(false);
          recognition.onend = () => setIsListening(false);

          recognition.start();
        } catch (speechErr) {
          console.warn('[Web Speech API Error]:', speechErr);
          setIsListening(false);
        }
      }
    },
    [onResult]
  );

  return {
    isListening,
    isTranscribing,
    isSupported,
    transcript,
    provider,
    startListening,
    stopListening,
  };
}
