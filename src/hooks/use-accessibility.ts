'use client';

import { useState, useEffect, useCallback } from 'react';

export type FontScale = 100 | 125 | 150 | 200;
export type SupportedLanguage = 'am' | 'om' | 'ti' | 'so' | 'en';

export interface AccessibilitySettings {
  fontScale: FontScale;
  highContrast: boolean;
  dyslexicFont: boolean;
  audioAssist: boolean;
  language: SupportedLanguage;
  isRtl: boolean;
}

const STORAGE_KEY = 'bridgemate_a11y_settings';

const DEFAULT_SETTINGS: AccessibilitySettings = {
  fontScale: 100,
  highContrast: false,
  dyslexicFont: false,
  audioAssist: false,
  language: 'en',
  isRtl: false,
};

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // Fallback to default settings
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Storage unavailable
    }

    const root = document.documentElement;
    root.setAttribute('data-font-scale', settings.fontScale.toString());
    root.setAttribute('data-high-contrast', settings.highContrast ? 'true' : 'false');
    root.setAttribute('data-dyslexic', settings.dyslexicFont ? 'true' : 'false');
    root.setAttribute('lang', settings.language);

    // RTL Handling for Somali / Arabic script per Track 3 spec
    const shouldBeRtl = settings.isRtl || settings.language === 'so';
    root.setAttribute('dir', shouldBeRtl ? 'rtl' : 'ltr');
  }, [settings, isMounted]);

  const setFontScale = useCallback((scale: FontScale) => {
    setSettings((prev) => ({ ...prev, fontScale: scale }));
  }, []);

  const toggleHighContrast = useCallback(() => {
    setSettings((prev) => ({ ...prev, highContrast: !prev.highContrast }));
  }, []);

  const toggleDyslexicFont = useCallback(() => {
    setSettings((prev) => ({ ...prev, dyslexicFont: !prev.dyslexicFont }));
  }, []);

  const toggleAudioAssist = useCallback(() => {
    setSettings((prev) => ({ ...prev, audioAssist: !prev.audioAssist }));
  }, []);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setSettings((prev) => ({
      ...prev,
      language: lang,
      isRtl: lang === 'so' ? true : prev.isRtl,
    }));
  }, []);

  const toggleRtl = useCallback(() => {
    setSettings((prev) => ({ ...prev, isRtl: !prev.isRtl }));
  }, []);

  const resetAccessibility = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return {
    ...settings,
    isMounted,
    setFontScale,
    toggleHighContrast,
    toggleDyslexicFont,
    toggleAudioAssist,
    setLanguage,
    toggleRtl,
    resetAccessibility,
  };
}

