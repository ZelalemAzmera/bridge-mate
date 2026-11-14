'use client';

import React from 'react';
import Link from 'next/link';
import { useAccessibility, type FontScale } from '@/hooks/use-accessibility';
import { useLiveAnnouncer } from '@/hooks/use-live-announcer';
import { Eye, Type, Volume2, RotateCcw, Headphones, Globe } from 'lucide-react';
import type { SupportedLanguage } from '@/hooks/use-accessibility';

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
      className="bg-slate-900 text-slate-100 border-b border-slate-700 px-4 py-2 text-xs sm:text-sm"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Heading */}
        <div className="flex items-center gap-2 font-semibold text-amber-400">
          <Eye className="w-4 h-4" aria-hidden="true" />
          <span>{language === 'am' ? 'የተደራሽነት ማስተካከያ' : 'Accessibility Tools'}</span>
        </div>

        {/* Right: Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Font Scaling */}
          <div className="flex items-center gap-1 bg-slate-800 rounded-md p-1 border border-slate-700" role="group" aria-label={language === 'am' ? 'የፊደል መጠን' : 'Font Size'}>
            <Type className="w-3.5 h-3.5 text-slate-400 ml-1" aria-hidden="true" />
            {scales.map((scale) => (
              <button
                key={scale}
                onClick={() => handleFontChange(scale)}
                aria-pressed={fontScale === scale}
                className={`px-2 py-1 rounded text-xs font-bold transition-colors ${fontScale === scale
                    ? 'bg-primary text-white ring-2 ring-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
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
            className={`px-3 py-1.5 rounded-md font-medium text-xs border transition-colors flex items-center gap-1.5 ${highContrast
                ? 'bg-amber-400 text-black border-white font-bold ring-2 ring-white'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-current" aria-hidden="true" />
            {language === 'am' ? 'ከፍተኛ ንፅፅር' : 'High Contrast'}
          </button>

          {/* Dyslexia Font */}
          <button
            onClick={handleDyslexicToggle}
            aria-pressed={dyslexicFont}
            className={`px-3 py-1.5 rounded-md font-medium text-xs border transition-colors ${dyslexicFont
                ? 'bg-primary text-white border-white ring-2 ring-white'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
          >
            {language === 'am' ? 'የንባብ ፊደል' : 'Dyslexia Font'}
          </button>

          {/* Audio Assist */}
          <button
            onClick={handleAudioToggle}
            aria-pressed={audioAssist}
            className={`px-3 py-1.5 rounded-md font-medium text-xs border transition-colors flex items-center gap-1 ${audioAssist
                ? 'bg-emerald-500 text-white border-white ring-2 ring-white'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
          >
            <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
            {language === 'am' ? 'የድምፅ እገዛ' : 'Audio Assist'}
          </button>

          {/* Regional Languages (Amharic, Afaan Oromoo, Tigrinya, Somali, English) */}
          <div className="flex items-center gap-1 bg-slate-800 rounded-md p-1 border border-slate-700">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-1" aria-hidden="true" />
            <select
              value={language}
              onChange={(e) => {
                const nextLang = e.target.value as SupportedLanguage;
                setLanguage(nextLang);
                announce(`Language changed to ${nextLang}`);
              }}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer pr-1"
              aria-label="Select Regional Language"
            >
              <option value="am" className="bg-slate-900 text-white">አማርኛ (Amharic)</option>
              <option value="om" className="bg-slate-900 text-white">Oromoo (Oromo)</option>
              <option value="ti" className="bg-slate-900 text-white">ትግርኛ (Tigrinya)</option>
              <option value="so" className="bg-slate-900 text-white">Soomaali (RTL)</option>
              <option value="en" className="bg-slate-900 text-white">English</option>
            </select>
          </div>

          {/* RTL Toggle Button */}
          <button
            onClick={toggleRtl}
            aria-pressed={isRtl}
            className={`px-2 py-1.5 rounded-md font-bold text-xs border transition-colors flex items-center gap-1 ${isRtl
                ? 'bg-sky-500 text-slate-950 border-white ring-2 ring-white'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            title="Toggle Right-to-Left (RTL) text layout"
            aria-label="Toggle RTL text layout for Arabic/Somali"
          >
            <span>RTL</span>
          </button>

          {/* WCAG 2.2 SC 3.2.6: Consistent Help */}
          <Link
            href="/support"
            className="px-3 py-1.5 rounded-md font-semibold text-xs border border-emerald-500/50 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label={language === 'am' ? 'የቀጥታ የሰው ድጋፍ (Consistent Help - Alt+H)' : 'Live Human Help (Consistent Help - Alt+H)'}
          >
            <Headphones className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
            <span>{language === 'am' ? 'የሰው ድጋፍ (Alt+H)' : 'Live Help (Alt+H)'}</span>
          </Link>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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

