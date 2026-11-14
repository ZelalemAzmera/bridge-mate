import React from 'react';
import Link from 'next/link';
import { AccessibilityBar } from '@/components/layout/accessibility-bar';
import { SkipLink } from '@/components/layout/skip-link';
import { LiveAnnouncer } from '@/components/layout/live-announcer';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-primary/20">
      <SkipLink />
      <LiveAnnouncer />
      <AccessibilityBar />

      {/* Simplified Brand Header */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-xl p-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary"
            aria-label="BridgeMate Home / ዋና ገጽ"
          >
            <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-extrabold text-base shadow-xs">
              BM
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight leading-tight flex items-center gap-1.5">
                <span>BridgeMate</span>
                <span className="text-[10px] font-medium text-primary font-ethiopic">ብሪጅሜት</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                Accessible Onboarding & Identity
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <Link
              href="/learn"
              className="text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg transition-colors"
            >
              Skip to App →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full mx-auto">
          {children}
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="py-4 border-t border-border/40 text-center text-xs text-muted-foreground">
        BridgeMate • Digital Bridge Hackathon 2026 (Track 3) • WCAG 2.2 Level AA
      </footer>
    </div>
  );
}
