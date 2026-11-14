// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAccessibility } from '@/hooks/use-accessibility';
import { announceToScreenReader } from '@/hooks/use-live-announcer';

describe('useAccessibility hook', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-font-scale');
    document.documentElement.removeAttribute('data-high-contrast');
    document.documentElement.removeAttribute('data-dyslexic');
    document.documentElement.removeAttribute('lang');
  });

  it('initializes with default settings', () => {
    const { result } = renderHook(() => useAccessibility());
    expect(result.current.fontScale).toBe(100);
    expect(result.current.highContrast).toBe(false);
    expect(result.current.dyslexicFont).toBe(false);
    expect(result.current.audioAssist).toBe(false);
    expect(result.current.language).toBe('en');
  });

  it('updates fontScale and sets data attribute on document element', () => {
    const { result } = renderHook(() => useAccessibility());
    act(() => {
      result.current.setFontScale(150);
    });
    expect(result.current.fontScale).toBe(150);
    expect(document.documentElement.getAttribute('data-font-scale')).toBe('150');
  });

  it('toggles high contrast mode and updates html attribute', () => {
    const { result } = renderHook(() => useAccessibility());
    act(() => {
      result.current.toggleHighContrast();
    });
    expect(result.current.highContrast).toBe(true);
    expect(document.documentElement.getAttribute('data-high-contrast')).toBe('true');

    act(() => {
      result.current.toggleHighContrast();
    });
    expect(result.current.highContrast).toBe(false);
    expect(document.documentElement.getAttribute('data-high-contrast')).toBe('false');
  });

  it('toggles dyslexic font mode and updates html attribute', () => {
    const { result } = renderHook(() => useAccessibility());
    act(() => {
      result.current.toggleDyslexicFont();
    });
    expect(result.current.dyslexicFont).toBe(true);
    expect(document.documentElement.getAttribute('data-dyslexic')).toBe('true');
  });

  it('switches language between Amharic and English', () => {
    const { result } = renderHook(() => useAccessibility());
    act(() => {
      result.current.setLanguage('en');
    });
    expect(result.current.language).toBe('en');
    expect(document.documentElement.getAttribute('lang')).toBe('en');

    act(() => {
      result.current.setLanguage('am');
    });
    expect(result.current.language).toBe('am');
    expect(document.documentElement.getAttribute('lang')).toBe('am');
  });
});

describe('Live Announcer Event Dispatcher', () => {
  it('dispatches bridgemate-announce custom event with detail', () => {
    let capturedMessage = '';
    let capturedPoliteness = '';

    const handler = (e: Event) => {
      const custom = e as CustomEvent;
      capturedMessage = custom.detail.message;
      capturedPoliteness = custom.detail.politeness;
    };

    window.addEventListener('bridgemate-announce', handler);
    announceToScreenReader('ፈተናው ተጀምሯል', 'assertive');

    expect(capturedMessage).toBe('ፈተናው ተጀምሯል');
    expect(capturedPoliteness).toBe('assertive');

    window.removeEventListener('bridgemate-announce', handler);
  });
});

