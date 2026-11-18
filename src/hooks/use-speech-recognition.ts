'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export function useSpeechRecognition(
  onResult?: (transcript: string, provider?: string) => void
) {
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [provider, setProvider] = useState<string>('web-speech');

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const currentLangRef = useRef<string>('am');
  const autoStopTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const vadIntervalRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasWebSpeech =
        'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
      const hasMediaDevices =
        typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
      setIsSupported(hasWebSpeech || hasMediaDevices);
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (vadIntervalRef.current) {
        clearInterval(vadIntervalRef.current);
      }
    };
  }, []);

  const stopListening = useCallback(() => {
    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current);
      autoStopTimeoutRef.current = null;
    }
    if (vadIntervalRef.current) {
      clearInterval(vadIntervalRef.current);
      vadIntervalRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    // 1. Web Speech API Stop
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Safe catch
      }
    }

    // 2. MediaRecorder Stop
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Safe catch
      }
    }

    setIsListening(false);
  }, []);

  const startListening = useCallback(
    async (lang = 'am') => {
      if (typeof window === 'undefined') return;

      stopListening();

      // Extract 2-letter base language: 'am-ET' -> 'am', 'ti-ET' -> 'ti', etc.
      const normalizedLang = lang.split('-')[0].toLowerCase();
      currentLangRef.current = normalizedLang;

      const bcp47Map: Record<string, string> = {
        am: 'am-ET',
        ti: 'ti-ET',
        om: 'om-ET',
        so: 'so-ET',
        ar: 'ar-SA',
        en: 'en-US',
      };
      const bcpLang = bcp47Map[normalizedLang] || lang || 'am-ET';

      // TIER 1: Browser Web Speech API (Chrome, Edge, Samsung Internet, Android)
      // Instant streaming recognition with automatic pause/silence detection ("like before")
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognitionClass) {
        try {
          const recognition = new SpeechRecognitionClass();
          recognitionRef.current = recognition;
          recognition.continuous = false; // Automatically stops when user pauses speaking
          recognition.interimResults = true; // Real-time feedback with zero lag
          recognition.lang = bcpLang;

          recognition.onstart = () => {
            setIsListening(true);
            setIsTranscribing(false);
          };

          let finalTranscript = '';
          recognition.onresult = (event: any) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              const res = event.results[i];
              if (res.isFinal) {
                finalTranscript += res[0].transcript;
              } else {
                interim += res[0].transcript;
              }
            }
            const activeText = (finalTranscript || interim || '').trim();
            if (activeText) {
              setTranscript(activeText);
              setProvider('web-speech');
              if (onResult) {
                onResult(activeText, 'web-speech');
              }
            }
          };

          recognition.onerror = (e: any) => {
            console.warn('[Web Speech Recognition Error]:', e.error);
            setIsListening(false);
            setIsTranscribing(false);
          };

          recognition.onend = () => {
            setIsListening(false);
            setIsTranscribing(false);
          };

          recognition.start();
          return;
        } catch (speechErr) {
          console.warn('[Web Speech start failed, falling back to MediaRecorder]:', speechErr);
        }
      }

      // TIER 2: MediaRecorder with Web Audio Voice Activity Detection (VAD)
      // Used in Safari, Firefox, or when Web Speech is unavailable.
      // Automatically detects when user stops speaking via volume RMS analysis.
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        try {
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
            if (vadIntervalRef.current) {
              clearInterval(vadIntervalRef.current);
              vadIntervalRef.current = null;
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
              audioContextRef.current.close().catch(() => {});
              audioContextRef.current = null;
            }
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
              console.warn('[Transcribe API Request Failed]:', err);
            } finally {
              setIsTranscribing(false);
            }
          };

          // Web Audio Voice Activity Detection: detects silence and automatically stops
          try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
              const audioCtx = new AudioContextClass();
              audioContextRef.current = audioCtx;
              const source = audioCtx.createMediaStreamSource(stream);
              const analyser = audioCtx.createAnalyser();
              analyser.fftSize = 256;
              source.connect(analyser);

              const dataArray = new Uint8Array(analyser.frequencyBinCount);
              let hasSpoken = false;
              let silenceSince: number | null = null;

              vadIntervalRef.current = setInterval(() => {
                if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') {
                  if (vadIntervalRef.current) clearInterval(vadIntervalRef.current);
                  return;
                }
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
                const avgVolume = sum / dataArray.length;

                if (avgVolume > 14) {
                  hasSpoken = true;
                  silenceSince = null;
                } else if (hasSpoken) {
                  if (!silenceSince) {
                    silenceSince = Date.now();
                  } else if (Date.now() - silenceSince > 1300) {
                    // 1.3 seconds of silence after user finished speaking -> auto-stop
                    if (vadIntervalRef.current) clearInterval(vadIntervalRef.current);
                    stopListening();
                  }
                }
              }, 100);
            }
          } catch (vadInitErr) {
            console.warn('[VAD Init Error]:', vadInitErr);
          }

          recorder.start(250);

          // Maximum safety timeout
          if (autoStopTimeoutRef.current) clearTimeout(autoStopTimeoutRef.current);
          autoStopTimeoutRef.current = setTimeout(() => {
            stopListening();
          }, 25000);
        } catch (mediaErr) {
          console.warn('[MediaRecorder Not Available]:', mediaErr);
          setIsListening(false);
        }
      }
    },
    [onResult, stopListening]
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
