/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAccessibility } from '@/hooks/use-accessibility';

describe('Track 3: RTL (Somali / Arabic) & Regional Ethiopian Languages', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.setAttribute('dir', 'ltr');
    document.documentElement.setAttribute('lang', 'am');
  });

  it('defaults to English (en) and LTR direction', () => {
    const { result } = renderHook(() => useAccessibility());
    expect(result.current.language).toBe('en');
    expect(result.current.isRtl).toBe(false);
  });

  it('switches to regional languages: Afaan Oromoo (om), Tigrinya (ti), and Somali (so)', () => {
    const { result } = renderHook(() => useAccessibility());

    act(() => {
      result.current.setLanguage('om');
    });
    expect(result.current.language).toBe('om');

    act(() => {
      result.current.setLanguage('ti');
    });
    expect(result.current.language).toBe('ti');

    act(() => {
      result.current.setLanguage('so');
    });
    expect(result.current.language).toBe('so');
    expect(result.current.isRtl).toBe(true);
  });

  it('sets dir="rtl" on document.documentElement when Somali or RTL is activated', () => {
    const { result } = renderHook(() => useAccessibility());

    act(() => {
      result.current.setLanguage('so');
    });

    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    expect(document.documentElement.getAttribute('lang')).toBe('so');

    act(() => {
      result.current.setLanguage('en');
    });

    expect(result.current.language).toBe('en');
  });

  it('toggles RTL layout manually with toggleRtl()', () => {
    const { result } = renderHook(() => useAccessibility());

    act(() => {
      result.current.toggleRtl();
    });

    expect(result.current.isRtl).toBe(true);
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');

    act(() => {
      result.current.toggleRtl();
    });

    expect(result.current.isRtl).toBe(false);
    expect(document.documentElement.getAttribute('dir')).toBe('ltr');
  });
});
