'use client';

import { useState, useEffect, useCallback } from 'react';

export type FontScale = 100 | 125 | 150 | 200;
export type SupportedLanguage = 'en' | 'am' | 'ti' | 'om' | 'so' | 'ar';
export type SupportedTheme = 'light' | 'dark' | 'high-contrast';

export interface AccessibilitySettings {
  fontScale: FontScale;
  theme: SupportedTheme;
  highContrast: boolean;
  dyslexicFont: boolean;
  audioAssist: boolean;
  language: SupportedLanguage;
  isRtl: boolean;
}

const STORAGE_KEY = 'bridgemate_a11y_settings';

const DEFAULT_SETTINGS: AccessibilitySettings = {
  fontScale: 100,
  theme: 'light',
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
      if (saved && saved.trim()) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          // Backward compatibility for highContrast boolean to theme
          if (parsed.highContrast && !parsed.theme) {
            parsed.theme = 'high-contrast';
          }
          setSettings((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch {
      // Storage parsing fallback
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
    root.setAttribute('data-theme', settings.theme);
    root.setAttribute('data-high-contrast', settings.theme === 'high-contrast' ? 'true' : 'false');
    root.setAttribute('data-dyslexic', settings.dyslexicFont ? 'true' : 'false');
    root.setAttribute('lang', settings.language);

    // RTL Handling for Somali / Arabic script per Track 3 spec
    const shouldBeRtl = settings.isRtl || settings.language === 'so' || settings.language === 'ar';
    root.setAttribute('dir', shouldBeRtl ? 'rtl' : 'ltr');
  }, [settings, isMounted]);

  const setFontScale = useCallback((scale: FontScale) => {
    setSettings((prev) => ({ ...prev, fontScale: scale }));
  }, []);

  const increaseFontSize = useCallback(() => {
    setSettings((prev) => {
      const scales: FontScale[] = [100, 125, 150, 200];
      const currentIndex = scales.indexOf(prev.fontScale);
      const nextIndex = Math.min(currentIndex + 1, scales.length - 1);
      return { ...prev, fontScale: scales[nextIndex] };
    });
  }, []);

  const decreaseFontSize = useCallback(() => {
    setSettings((prev) => {
      const scales: FontScale[] = [100, 125, 150, 200];
      const currentIndex = scales.indexOf(prev.fontScale);
      const nextIndex = Math.max(currentIndex - 1, 0);
      return { ...prev, fontScale: scales[nextIndex] };
    });
  }, []);

  const setTheme = useCallback((theme: SupportedTheme) => {
    setSettings((prev) => ({
      ...prev,
      theme,
      highContrast: theme === 'high-contrast',
    }));
  }, []);

  const cycleTheme = useCallback(() => {
    setSettings((prev) => {
      const nextTheme: SupportedTheme =
        prev.theme === 'light'
          ? 'dark'
          : prev.theme === 'dark'
          ? 'high-contrast'
          : 'light';
      return {
        ...prev,
        theme: nextTheme,
        highContrast: nextTheme === 'high-contrast',
      };
    });
  }, []);

  const toggleHighContrast = useCallback(() => {
    setSettings((prev) => {
      const nextHigh = prev.theme !== 'high-contrast';
      return {
        ...prev,
        theme: nextHigh ? 'high-contrast' : 'light',
        highContrast: nextHigh,
      };
    });
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
      isRtl: lang === 'so' || lang === 'ar' ? true : prev.isRtl,
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
    increaseFontSize,
    decreaseFontSize,
    setTheme,
    cycleTheme,
    toggleHighContrast,
    toggleDyslexicFont,
    toggleAudioAssist,
    setLanguage,
    toggleRtl,
    resetAccessibility,
  };
}
