'use client';

import React from 'react';
import Link from 'next/link';
import { useAccessibility, type FontScale, type SupportedLanguage } from '@/hooks/use-accessibility';
import { useLiveAnnouncer } from '@/hooks/use-live-announcer';
import { Eye, Type, Volume2, RotateCcw, Headphones, Globe } from 'lucide-react';

export function AccessibilityBar() {
  const {
    fontScale,
    highContrast,
    dyslexicFont,
    audioAssist,
    language,
    isRtl,
    setFontScale,
    toggleHighContrast,
    toggleDyslexicFont,
    toggleAudioAssist,
    setLanguage,
    toggleRtl,
    resetAccessibility,
  } = useAccessibility();

  const { announce } = useLiveAnnouncer();

  const handleFontChange = (scale: FontScale) => {
    setFontScale(scale);
    announce(
      language === 'am'
        ? `የፊደል መጠን ወደ ${scale}% ተቀይሯል`
        : `Font size adjusted to ${scale}%`
    );
  };

  const handleContrastToggle = () => {
    toggleHighContrast();
    announce(
      language === 'am'
        ? highContrast ? 'ከፍተኛ ንፅፅር ጠፍቷል' : 'ከፍተኛ ንፅፅር በርቷል'
        : highContrast ? 'High contrast disabled' : 'High contrast enabled'
    );
  };

  const handleDyslexicToggle = () => {
    toggleDyslexicFont();
    announce(
      language === 'am'
        ? dyslexicFont ? 'የንባብ ድጋፍ ፊደል ጠፍቷል' : 'የንባብ ድጋፍ ፊደል በርቷል'
        : dyslexicFont ? 'Dyslexia-friendly font disabled' : 'Dyslexia-friendly font enabled'
    );
  };

  const handleAudioToggle = () => {
    toggleAudioAssist();
    announce(
      language === 'am'
        ? audioAssist ? 'የድምፅ እገዛ ጠፍቷል' : 'የድምፅ እገዛ በርቷል'
        : audioAssist ? 'Audio assistance disabled' : 'Audio assistance enabled'
    );
  };

  const handleReset = () => {
    resetAccessibility();
    announce(
      language === 'am'
        ? 'የተደራሽነት ቅንብሮች ወደ ነባሪ ተመልሰዋል'
        : 'Accessibility settings reset to default'
    );
  };

  const scales: FontScale[] = [100, 125, 150, 200];

  return (
    <aside
      aria-label={language === 'am' ? 'የተደራሽነት መቆጣጠሪያ' : 'Accessibility controls'}
      className="bg-[var(--brand-primary)] text-[var(--brand-neutral)] border-b border-[#23453F] px-4 py-2 text-xs sm:text-sm shadow-xs sticky top-0 z-50 transition-colors"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Heading with Brand Warm Ochre Accent */}
        <div className="flex items-center gap-2 font-bold text-[var(--brand-accent)] tracking-wide">
          <Eye className="w-4 h-4" aria-hidden="true" />
          <span>{language === 'am' ? 'የተደራሽነት ማስተካከያ' : 'Accessibility Tools'}</span>
        </div>

        {/* Right: Controls in cohesive art-directed senior style */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Font Scaling (A, A+, A++, 200%) */}
          <div
            className="flex items-center gap-1 bg-[#23453F]/60 rounded-md p-1 border border-[#2D5A52]"
            role="group"
            aria-label={language === 'am' ? 'የፊደል መጠን' : 'Font Size'}
          >
            <Type className="w-3.5 h-3.5 text-[var(--brand-secondary)] ml-1" aria-hidden="true" />
            {scales.map((scale) => (
              <button
                key={scale}
                onClick={() => handleFontChange(scale)}
                aria-pressed={fontScale === scale}
                className={`px-2 py-1 rounded text-xs font-bold transition-all min-h-[28px] cursor-pointer ${
                  fontScale === scale
                    ? 'bg-[var(--brand-accent)] text-[var(--brand-primary)] shadow-xs ring-1 ring-white/50'
                    : 'text-[var(--brand-neutral)]/80 hover:bg-[#2D5A52] hover:text-white'
                }`}
                title={`${scale}%`}
              >
                {scale === 100 ? 'A' : scale === 125 ? 'A+' : scale === 150 ? 'A++' : '200%'}
              </button>
            ))}
          </div>

          {/* High Contrast */}
          <button
            onClick={handleContrastToggle}
            aria-pressed={highContrast}
            className={`px-3 py-1.5 rounded-md font-semibold text-xs border transition-all flex items-center gap-1.5 min-h-[32px] cursor-pointer ${
              highContrast
                ? 'bg-[#FFFF00] text-black border-white font-black ring-2 ring-black'
                : 'bg-[#23453F]/60 text-[var(--brand-neutral)] border-[#2D5A52] hover:bg-[#2D5A52]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current" aria-hidden="true" />
            {language === 'am' ? 'ከፍተኛ ንፅፅር' : 'High Contrast'}
          </button>

          {/* Dyslexia Font */}
          <button
            onClick={handleDyslexicToggle}
            aria-pressed={dyslexicFont}
            className={`px-3 py-1.5 rounded-md font-semibold text-xs border transition-all min-h-[32px] cursor-pointer ${
              dyslexicFont
                ? 'bg-[var(--brand-accent)] text-[var(--brand-primary)] border-white font-bold ring-2 ring-white/40'
                : 'bg-[#23453F]/60 text-[var(--brand-neutral)] border-[#2D5A52] hover:bg-[#2D5A52]'
            }`}
          >
            {language === 'am' ? 'የንባብ ፊደል' : 'Dyslexia Font'}
          </button>

          {/* Audio Assist */}
          <button
            onClick={handleAudioToggle}
            aria-pressed={audioAssist}
            className={`px-3 py-1.5 rounded-md font-semibold text-xs border transition-all flex items-center gap-1 min-h-[32px] cursor-pointer ${
              audioAssist
                ? 'bg-emerald-500 text-white border-white font-bold ring-2 ring-white/40'
                : 'bg-[#23453F]/60 text-[var(--brand-neutral)] border-[#2D5A52] hover:bg-[#2D5A52]'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
            {language === 'am' ? 'የድምፅ እገዛ' : 'Audio Assist'}
          </button>

          {/* Regional Languages */}
          <div className="flex items-center gap-1 bg-[#23453F]/60 rounded-md p-1 border border-[#2D5A52]">
            <Globe className="w-3.5 h-3.5 text-[var(--brand-secondary)] ml-1" aria-hidden="true" />
            <select
              value={language}
              onChange={(e) => {
                const nextLang = e.target.value as SupportedLanguage;
                setLanguage(nextLang);
                announce(`Language changed to ${nextLang}`);
              }}
              className="bg-transparent text-xs text-[var(--brand-neutral)] font-medium focus:outline-none cursor-pointer pr-1"
              aria-label="Select Regional Language"
            >
              <option value="en" className="bg-[var(--brand-primary)] text-white">English</option>
              <option value="am" className="bg-[var(--brand-primary)] text-white">አማርኛ (Amharic)</option>
              <option value="om" className="bg-[var(--brand-primary)] text-white">Afaan Oromoo</option>
              <option value="ti" className="bg-[var(--brand-primary)] text-white">ትግርኛ (Tigrinya)</option>
              <option value="so" className="bg-[var(--brand-primary)] text-white">Soomaali (Somali)</option>
            </select>
          </div>

          {/* RTL Toggle Button */}
          <button
            onClick={toggleRtl}
            aria-pressed={isRtl}
            className={`px-2.5 py-1.5 rounded-md font-bold text-xs border transition-all min-h-[32px] cursor-pointer flex items-center gap-1 ${
              isRtl
                ? 'bg-sky-400 text-slate-950 border-white ring-2 ring-white/40'
                : 'bg-[#23453F]/60 text-[var(--brand-neutral)] border-[#2D5A52] hover:bg-[#2D5A52]'
            }`}
            title="Toggle Right-to-Left (RTL) text layout"
            aria-label="Toggle RTL text layout for Arabic/Somali"
          >
            <span>RTL</span>
          </button>

          {/* Consistent Help: Live Help (Alt+H) */}
          <Link
            href="/support"
            className="px-3 py-1.5 rounded-md font-bold text-xs bg-[var(--brand-accent)] text-[var(--brand-primary)] border border-[#C88E45] hover:bg-[#D49E55] transition-all flex items-center gap-1.5 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white min-h-[32px]"
            aria-label={language === 'am' ? 'የቀጥታ የሰው ድጋፍ (Consistent Help - Alt+H)' : 'Live Human Help (Consistent Help - Alt+H)'}
          >
            <Headphones className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{language === 'am' ? 'የሰው ድጋፍ (Alt+H)' : 'Live Help (Alt+H)'}</span>
          </Link>

          {/* Reset Controls */}
          <button
            onClick={handleReset}
            className="p-1.5 rounded-md text-[var(--brand-secondary)] hover:text-white hover:bg-[#23453F] transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center cursor-pointer"
            title={language === 'am' ? 'ቅንብሮችን አድስ' : 'Reset settings'}
            aria-label={language === 'am' ? 'የተደራሽነት ቅንብሮችን ወደ ነባሪ መልስ' : 'Reset accessibility settings'}
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
