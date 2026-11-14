'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAccessibility, type SupportedLanguage, type SupportedTheme } from '@/hooks/use-accessibility';
import { useLiveAnnouncer } from '@/hooks/use-live-announcer';
import {
  BookOpen,
  Headphones,
  Bot,
  Briefcase,
  Code2,
  Sun,
  Moon,
  Sparkles,
  Menu,
  X,
  Type,
  Radio,
} from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    language,
    setLanguage,
    fontScale,
    increaseFontSize,
    decreaseFontSize,
    theme,
    setTheme,
    cycleTheme,
  } = useAccessibility();
  const { announce } = useLiveAnnouncer();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global Alt+H shortcut for Live Help
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        announce(
          language === 'am'
            ? 'ወደ ቀጥታ የሰው ድጋፍ እየተሸጋገረ ነው...'
            : 'Escalating to Live Human Help...'
        );
        router.push('/support');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, announce, language]);

  const navItems = [
    {
      href: '/learn',
      label: language === 'am' ? 'የትምህርት ረዳት' : 'Tutor',
      icon: BookOpen,
      match: ['/learn'],
    },
    {
      href: '/support',
      label: language === 'am' ? 'የሰው ድጋፍ' : 'Live Help',
      icon: Headphones,
      match: ['/support'],
    },
    {
      href: '/telegram',
      label: language === 'am' ? 'ቴሌግራም እና 2G' : 'Telegram & 2G',
      icon: Bot,
      match: ['/telegram', '/low-bandwidth'],
    },
    {
      href: '/jobs',
      label: language === 'am' ? 'የሥራ በር' : 'Career Gateway',
      icon: Briefcase,
      match: ['/jobs', '/discover'],
    },
    {
      href: '/developers',
      label: language === 'am' ? 'የኤፒአይ መረጃ' : 'API Docs',
      icon: Code2,
      match: ['/developers', '/embed-demo'],
    },
  ];

  const languages: { code: SupportedLanguage; label: string; full: string }[] = [
    { code: 'en', label: 'EN', full: 'English' },
    { code: 'am', label: 'አማ', full: 'አማርኛ (Amharic)' },
    { code: 'ti', label: 'ትግ', full: 'ትግርኛ (Tigrinya)' },
    { code: 'om', label: 'OM', full: 'Afaan Oromoo' },
    { code: 'so', label: 'SO', full: 'Soomaali' },
    { code: 'ar', label: 'AR', full: 'العربية' },
  ];

  const handleLangSelect = (code: SupportedLanguage, full: string) => {
    setLanguage(code);
    announce(`Language set to ${full}`);
  };

  const isCurrentActive = (matches: string[]) => {
    return matches.some((m) => pathname.startsWith(m));
  };

  return (
    <header
      className="sticky top-0 z-50 w-full min-h-[56px] border-b border-[var(--border-default)] bg-[var(--bg-surface)]/95 backdrop-blur-md transition-colors"
      role="banner"
    >
      {/* Skip to Main Content Link - strict WCAG visible on focus */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2.5 focus:bg-[var(--brand-primary)] focus:text-white focus:font-bold focus:shadow-lg focus:rounded-md focus:outline-none min-target flex items-center justify-center"
      >
        <span>
          {language === 'am' ? 'ወደ ዋና ይዘት ይዝለሉ (Skip to Content)' : 'Skip to main content'}
        </span>
      </a>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-full min-h-[56px] flex items-center justify-between gap-2 sm:gap-4 flex-wrap py-1.5">
        {/* LEFT: Clean SaaS Brand Mark */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/learn"
            className="group flex items-center gap-2.5 py-1 focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-md"
            aria-label="BridgeMate Home"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center font-black text-sm shadow-xs transition-transform group-hover:scale-105">
              BM
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-[var(--text-primary)] leading-tight flex items-center gap-1.5">
                <span>BridgeMate</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)]">
                  Track 3
                </span>
              </span>
              <span className="text-[10px] text-[var(--text-secondary)] hidden sm:block font-medium">
                {language === 'am' ? 'ተደራሽ የትምህርትና የሥራ ድልድይ' : 'Multilingual Assistant & Live Help'}
              </span>
            </div>
          </Link>
        </div>

        {/* CENTER: Minimalist Pill Navigation */}
        <nav
          className="hidden lg:flex items-center gap-1 p-1 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl"
          aria-label={language === 'am' ? 'ዋና ዳሰሳ' : 'Main Navigation'}
        >
          {navItems.map((item) => {
            const active = isCurrentActive(item.match);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[40px] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${
                  active
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs border border-[var(--border-default)] font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-[var(--brand-primary)]' : 'text-[var(--text-secondary)]'}`} aria-hidden="true" />
                <span>{item.label}</span>
                {active && (
                  <span
                    className="absolute -bottom-1 left-3 right-3 h-[2px] bg-[var(--brand-primary)] rounded-full"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT: Compact Segmented Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto shrink-0">
          {/* Segmented Language Switcher (EN | አማ | ትግ | OM | SO | AR) */}
          <div
            role="group"
            aria-label={language === 'am' ? 'ቋንቋ ይምረጡ' : 'Select Language'}
            className="inline-flex items-center p-0.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-[11px] font-bold"
          >
            {languages.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => handleLangSelect(l.code, l.full)}
                aria-pressed={language === l.code}
                className={`px-2 py-1.5 rounded-md transition-colors min-h-[36px] min-w-[32px] flex items-center justify-center font-bold cursor-pointer ${
                  language === l.code
                    ? 'bg-[var(--bg-surface)] text-[var(--brand-primary)] shadow-2xs border border-[var(--border-default)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title={l.full}
              >
                <span>{l.label}</span>
              </button>
            ))}
          </div>

          {/* Text Size (A- | A+) */}
          <div
            role="group"
            aria-label={language === 'am' ? 'የፊደል መጠን መቆጣጠሪያ' : 'Font size scaling'}
            className="inline-flex items-center p-0.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-xs font-bold"
          >
            <button
              type="button"
              onClick={() => {
                decreaseFontSize();
                announce(language === 'am' ? 'የፊደል መጠን ቀንሷል' : 'Font size decreased');
              }}
              disabled={fontScale <= 100}
              aria-label={language === 'am' ? 'የፊደል መጠን ቀንስ (A-)' : 'Decrease font size (A-)'}
              className="px-2 py-1.5 rounded-md min-h-[36px] min-w-[34px] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 cursor-pointer"
            >
              <span>A-</span>
            </button>
            <span className="text-[10px] font-mono px-1 text-[var(--text-secondary)]" aria-hidden="true">
              {fontScale}%
            </span>
            <button
              type="button"
              onClick={() => {
                increaseFontSize();
                announce(language === 'am' ? 'የፊደል መጠን ጨምሯል' : 'Font size increased');
              }}
              disabled={fontScale >= 200}
              aria-label={language === 'am' ? 'የፊደል መጠን ጨምር (A+)' : 'Increase font size (A+)'}
              className="px-2 py-1.5 rounded-md min-h-[36px] min-w-[34px] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 cursor-pointer"
            >
              <span>A+</span>
            </button>
          </div>

          {/* Theme Toggle (Light / Dark / High-Contrast) */}
          <button
            type="button"
            onClick={() => {
              cycleTheme();
              announce(
                language === 'am'
                  ? 'የገጽታ ቀለም ተቀይሯል'
                  : 'Theme switched'
              );
            }}
            className="min-h-[44px] px-2.5 py-1.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface)] flex items-center gap-1.5 transition-colors cursor-pointer"
            aria-label={
              language === 'am'
                ? `የቀለም ገጽታ ቀይር (አሁን ያለው፡ ${theme})`
                : `Toggle theme (current: ${theme})`
            }
          >
            {theme === 'light' && <Sun className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />}
            {theme === 'dark' && <Moon className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />}
            {theme === 'high-contrast' && <Sparkles className="w-3.5 h-3.5 text-yellow-400" aria-hidden="true" />}
            <span className="hidden sm:inline capitalize">{theme}</span>
          </button>

          {/* High-Priority "Live Human Help (Alt+H)" Button in Emerald-tinted pill */}
          <Link
            href="/support"
            className="min-h-[44px] px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all shadow-xs flex items-center gap-2 text-xs font-bold shrink-0 focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label={
              language === 'am'
                ? 'የሰው ድጋፍ (አቋራጭ Alt+H)'
                : 'Live Human Help (Keyboard Shortcut Alt+H)'
            }
          >
            <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
            </span>
            <Headphones className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
            <span className="hidden md:inline">
              {language === 'am' ? 'የሰው ድጋፍ' : 'Live Help'}
            </span>
            <kbd className="hidden lg:inline text-[10px] font-mono px-1 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
              Alt+H
            </kbd>
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden min-h-[44px] min-w-[44px] p-2 rounded-lg border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center cursor-pointer"
            aria-expanded={mobileMenuOpen}
            aria-label={
              mobileMenuOpen
                ? language === 'am' ? 'ምናሌ ዝጋ' : 'Close navigation menu'
                : language === 'am' ? 'ምናሌ ክፈት' : 'Open navigation menu'
            }
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <nav
          className="lg:hidden border-t border-[var(--border-default)] bg-[var(--bg-surface)] p-3 space-y-1 shadow-lg"
          aria-label={language === 'am' ? 'የሞባይል ዳሰሳ' : 'Mobile Navigation'}
        >
          {navItems.map((item) => {
            const active = isCurrentActive(item.match);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors min-target ${
                  active
                    ? 'bg-[var(--bg-subtle)] text-[var(--brand-primary)] font-bold border border-[var(--border-default)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
