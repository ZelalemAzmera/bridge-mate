'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAccessibility } from '@/hooks/use-accessibility';
import { useLiveAnnouncer } from '@/hooks/use-live-announcer';
import {
  BookOpen,
  FileSearch,
  FileCheck,
  Headphones,
  Briefcase,
  Menu,
  X,
  Globe,
  Puzzle,
  Code,
  Bot,
  Smartphone,
  ChevronDown,
  User,
  LogIn,
  LogOut,
  Sliders,
} from 'lucide-react';

interface NavLinkItem {
  href: string;
  labelAm: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  badge?: string;
}

export function Header() {
  const pathname = usePathname();
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

  const toggleLanguage = () => {
    const nextLang = language === 'am' ? 'en' : 'am';
    setLanguage(nextLang);
    announce(
      nextLang === 'am' ? 'ቋንቋ ወደ አማርኛ ተቀይሯል' : 'Language switched to English'
    );
  };

  const coreNavLinks: NavLinkItem[] = [
    {
      href: '/learn',
      labelAm: 'ትምህርት / ረዳት',
      labelEn: 'AI Assistant',
      icon: BookOpen,
    },
    {
      href: '/decoder',
      labelAm: 'ዕድል መፍቻ',
      labelEn: 'Decoder',
      icon: FileSearch,
    },
    {
      href: '/translator',
      labelAm: 'ማመቻቸት ጥያቄ',
      labelEn: 'Accommodation',
      icon: FileCheck,
    },
    {
      href: '/support',
      labelAm: 'ቀጥታ ድጋፍ',
      labelEn: 'Live Help',
      icon: Headphones,
      badge: 'Alt+H',
    },
    {
      href: '/discover',
      labelAm: 'የሥራ ዕድሎች',
      labelEn: 'Jobs',
      icon: Briefcase,
    },
  ];

  const platformLinks: NavLinkItem[] = [
    {
      href: '/embed-demo',
      labelAm: 'ሳቫና (Widget)',
      labelEn: 'Savannah Widget',
      icon: Puzzle,
    },
    {
      href: '/telegram',
      labelAm: 'ቴሌግራም ቦት',
      labelEn: 'Telegram Bot',
      icon: Bot,
    },
    {
      href: '/low-bandwidth',
      labelAm: 'ቀላል ገጽ (2G)',
      labelEn: '2G Low-Data',
      icon: Smartphone,
    },
    {
      href: '/developers',
      labelAm: 'ኤፒአይ (APIs)',
      labelEn: 'REST APIs',
      icon: Code,
    },
  ];

  const allLinks = [...coreNavLinks, ...platformLinks];

  return (
    <header className="bg-background/90 backdrop-blur-md border-b border-border/80 sticky top-0 z-40 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary p-1 active:scale-95 transition-all"
              aria-label="BridgeMate Home / ዋና ገጽ"
            >
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-extrabold text-lg shadow-sm border border-white/20">
                BM
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-foreground leading-tight flex items-center gap-1.5">
                  <span>BridgeMate</span>
                  <span className="text-[11px] font-medium text-primary font-ethiopic">ብሪጅሜት</span>
                </span>
                <span className="text-[10px] text-muted-foreground font-medium hidden sm:inline leading-tight">
                  {language === 'am' ? 'ከመማር ወደ ገቢ' : 'From Learning to Earning'}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links (with Framer Motion Pill) */}
          <nav
            aria-label={language === 'am' ? 'ዋና ዳሰሳ' : 'Main Navigation'}
            className="hidden lg:flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/60"
          >
            {coreNavLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary ${
                    isActive
                      ? 'text-primary'
                      : 'text-foreground/80 hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="active-nav-indicator"
                      className="absolute inset-0 bg-card rounded-lg shadow-xs border border-border -z-10"
                      transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
                    />
                  )}
                  <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{language === 'am' ? link.labelAm : link.labelEn}</span>
                  {link.badge && (
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="h-4 w-px bg-border/80 mx-1" />

            {/* Platform Shortcuts */}
            <Link
              href="/telegram"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                pathname === '/telegram'
                  ? 'bg-card text-primary font-bold border border-border shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-indigo-600" />
              <span>{language === 'am' ? 'ቴሌግራም' : 'Telegram'}</span>
            </Link>

            <Link
              href="/low-bandwidth"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                pathname === '/low-bandwidth'
                  ? 'bg-card text-emerald-600 font-bold border border-border shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span>2G</span>
            </Link>
          </nav>

          {/* Right: User Profile, Language Switcher & Mobile Trigger */}
          <div className="flex items-center gap-2">
            {/* User Profile / Identity Pill */}
            {currentUser ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-bold text-foreground transition-all cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-expanded={profileDropdownOpen}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="max-w-[110px] truncate hidden sm:inline">
                    {currentUser.fullName}
                  </span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-2xl shadow-xl py-2 z-50 text-xs">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="font-extrabold text-foreground truncate">{currentUser.fullName}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">
                        {currentUser.profile?.disabilityType || 'Tailored Profile'}
                      </span>
                    </div>

                    <Link
                      href="/onboarding"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-muted text-foreground font-semibold"
                    >
                      <Sliders className="w-3.5 h-3.5 text-primary" />
                      <span>{language === 'am' ? 'መገለጫ አብጅ (Onboarding)' : 'Re-run Onboarding'}</span>
                    </Link>

                    <Link
                      href="/telegram"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-muted text-foreground font-semibold"
                    >
                      <Bot className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{language === 'am' ? 'ቴሌግራም ቦት አገናኝ' : 'Connect Telegram Bot'}</span>
                    </Link>

                    <div className="border-t border-border mt-1 pt-1">
                      <button
                        type="button"
                        onClick={async () => {
                          setProfileDropdownOpen(false);
                          await fetch('/api/auth/session', { method: 'DELETE' });
                          setCurrentUser(null);
                          window.location.href = '/sign-in';
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-muted text-red-600 font-semibold cursor-pointer text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{language === 'am' ? 'ውጣ (Sign Out)' : 'Sign Out'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/sign-in"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-white text-xs font-bold shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
              >
                <LogIn className="w-3 h-3" />
                <span className="hidden sm:inline">{language === 'am' ? 'ይግቡ' : 'Sign In'}</span>
              </Link>
            )}

            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-bold transition-all active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary text-foreground shadow-xs"
              aria-label={
                language === 'am'
                  ? 'ወደ እንግሊዝኛ ቀይር (Switch to English)'
                  : 'ቋንቋ ወደ አማርኛ ቀይር (Switch to Amharic)'
              }
            >
              <Globe className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              <span>{language === 'am' ? 'English' : 'አማርኛ'}</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary active:scale-95 transition-all cursor-pointer border border-border/60"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={
                mobileMenuOpen
                  ? language === 'am' ? 'ዝርዝር ዝጋ' : 'Close navigation menu'
                  : language === 'am' ? 'ዝርዝር ክፈት' : 'Open navigation menu'
              }
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="lg:hidden border-t border-border bg-background px-4 pt-3 pb-6 space-y-1 shadow-lg"
        >
          <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider px-3 py-1">
            {language === 'am' ? 'ዋና ዋና አገልግሎቶች' : 'Core Services'}
          </div>
          {allLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-primary text-white font-bold shadow-xs'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{language === 'am' ? link.labelAm : link.labelEn}</span>
                </div>
                {link.badge && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
