'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAccessibility, type SupportedLanguage } from '@/hooks/use-accessibility';
import { useLiveAnnouncer } from '@/hooks/use-live-announcer';
import {
  BookOpen,
  FileSearch,
  FileCheck,
  Headphones,
  Bot,
  Briefcase,
  Menu,
  X,
  User,
  LogIn,
  LogOut,
  ChevronDown,
} from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage } = useAccessibility();
  const { announce } = useLiveAnnouncer();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      })
      .catch(() => {});
  }, [pathname]);

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
      labelAm: 'የትምህርት ረዳት',
      labelEn: 'Tutor',
      icon: BookOpen,
      match: ['/learn'],
    },
    {
      href: '/decoder',
      labelAm: 'ዕድል መፍቻ',
      labelEn: 'Decoder',
      icon: FileSearch,
      match: ['/decoder'],
    },
    {
      href: '/translator',
      labelAm: 'ማመቻቸት ጥያቄ',
      labelEn: 'Accommodation',
      icon: FileCheck,
      match: ['/translator'],
    },
    {
      href: '/support',
      labelAm: 'ቀጥታ ድጋፍ',
      labelEn: 'Live Help',
      icon: Headphones,
      match: ['/support'],
      badge: 'Alt+H',
    },
    {
      href: '/jobs',
      labelAm: 'የሥራ በር',
      labelEn: 'Career Gateway',
      icon: Briefcase,
      match: ['/jobs', '/discover'],
    },
    {
      href: '/telegram',
      labelAm: 'ቴሌግራም እና 2G',
      labelEn: 'Telegram & 2G',
      icon: Bot,
      match: ['/telegram', '/low-bandwidth'],
    },
  ];

  const isCurrentActive = (matches: string[]) => {
    return matches.some((m) => pathname.startsWith(m));
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
      setCurrentUser(null);
      setProfileDropdownOpen(false);
      router.push('/sign-in');
    } catch {}
  };

  return (
    <header className="bg-[var(--bg-canvas)]/95 backdrop-blur-md border-b border-[var(--border-default)] sticky top-[41px] z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 flex-nowrap">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-6 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-lg p-1"
            aria-label="BridgeMate Home"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-serif font-black text-white text-base shadow-xs shrink-0"
              style={{ background: 'var(--brand-primary)' }}
            >
              BM
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg leading-tight tracking-tight text-[var(--text-primary)]">
                BridgeMate <span className="text-xs font-normal text-[var(--text-secondary)] font-sans">ብሪጅሜት</span>
              </span>
              <span className="text-[11px] text-[var(--text-secondary)] tracking-tight">
                {language === 'am' ? 'ከመማር ወደ ገቢ' : 'From Learning to Earning'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            aria-label={language === 'am' ? 'ዋና ዳሰሳ' : 'Main navigation'}
            className="hidden xl:flex items-center gap-1 ml-2"
          >
            {navItems.map((item) => {
              const active = isCurrentActive(item.match);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all min-h-[38px] ${
                    active
                      ? 'bg-[var(--bg-subtle)] text-[var(--brand-primary)] font-bold border border-[var(--border-default)] shadow-2xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{language === 'am' ? item.labelAm : item.labelEn}</span>
                  {item.badge && (
                    <kbd className="hidden lg:inline text-[9px] font-mono px-1 py-0.5 rounded bg-[var(--brand-accent)] text-[var(--brand-primary)] font-bold">
                      {item.badge}
                    </kbd>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions: User Persona / Profile (Top Right Corner) & Mobile Toggle */}
        <div className="flex items-center gap-2.5 shrink-0 ml-auto">
          {/* User Persona Profile Pill / Sign In */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] cursor-pointer min-h-[38px] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                aria-expanded={profileDropdownOpen}
                aria-haspopup="true"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="max-w-[120px] truncate">{currentUser.fullName}</span>
                <ChevronDown className="w-3 h-3 text-[var(--text-secondary)]" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-lg py-2 z-50 text-xs">
                  <div className="px-3.5 py-2 border-b border-[var(--border-default)]">
                    <p className="font-bold text-[var(--text-primary)]">{currentUser.fullName}</p>
                    <p className="text-[11px] text-[var(--text-secondary)] truncate">{currentUser.email}</p>
                  </div>
                  <Link
                    href="/onboarding"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 hover:bg-[var(--bg-subtle)] text-[var(--text-primary)] font-medium"
                  >
                    <User className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                    <span>{language === 'am' ? 'የተደራሽነት መገለጫ አብጅ' : 'Tailor Accessibility'}</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-[var(--bg-subtle)] text-rose-600 font-medium text-left cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{language === 'am' ? 'ውጣ' : 'Sign Out'}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] min-h-[38px]"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{language === 'am' ? 'ግባ' : 'Sign In'}</span>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden min-h-[38px] min-w-[38px] p-2 rounded-lg border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center cursor-pointer"
            aria-expanded={mobileMenuOpen}
            aria-label={
              mobileMenuOpen
                ? language === 'am' ? 'ምናሌ ዝጋ' : 'Close navigation menu'
                : language === 'am' ? 'ምናሌ ክፈት' : 'Open navigation menu'
            }
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <nav
          className="xl:hidden border-t border-[var(--border-default)] bg-[var(--bg-surface)] p-3 space-y-1 shadow-lg"
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-[var(--bg-subtle)] text-[var(--brand-primary)] font-bold border border-[var(--border-default)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{language === 'am' ? item.labelAm : item.labelEn}</span>
                {item.badge && (
                  <kbd className="ml-auto text-[9px] font-mono px-1 py-0.5 rounded bg-[var(--brand-accent)] text-[var(--brand-primary)] font-bold">
                    {item.badge}
                  </kbd>
                )}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
