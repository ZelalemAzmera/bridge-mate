'use client';

import React from 'react';
import { Header } from '@/components/layout/header';
import { SkipLink } from '@/components/layout/skip-link';
import { LiveAnnouncer } from '@/components/layout/live-announcer';
import { useAccessibility } from '@/hooks/use-accessibility';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { language } = useAccessibility();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors">
      <SkipLink />
      <LiveAnnouncer />
      <Header />

      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 flex flex-col focus:outline-none max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8"
        aria-label={language === 'am' ? 'ዋና ይዘት' : 'Main Content Area'}
      >
        {children}
      </main>

      <footer className="border-t border-[var(--border-default)] bg-[var(--bg-surface)] py-6 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-secondary)]">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <span className="font-bold text-[var(--text-primary)]">BridgeMate</span>
            <span className="hidden sm:inline">•</span>
            <span>Digital Bridge Accessibility Hackathon 2026 (Track 3)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-medium text-[var(--accent-verified)]">
              WCAG 2.2 Level AA Verified
            </span>
            <span>•</span>
            <span>Ethiopian Proclamations 1156/2019 &amp; 568/2008 Grounded</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
