'use client';

import React from 'react';
import { useAccessibility } from '@/hooks/use-accessibility';
import { BookOpen, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { ChatContainer } from '@/components/chat/chat-container';
import { ContextSidebar } from '@/components/chat/context-sidebar';

export default function LearnPage() {
  const { language } = useAccessibility();

  return (
    <div className="space-y-6">
      {/* SaaS Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-default)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border border-[var(--brand-primary)]/20 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)]">
                {language === 'am' ? 'የትምህርት ረዳት እና የሰው ድጋፍ' : 'Multilingual Learning Assistant'}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[var(--accent-verified)] border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800">
                <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                <span>WCAG 2.2 AA</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
              {language === 'am'
                ? 'በሳቫና ሥርዓተ-ትምህርትና በኢትዮጵያ ሕጎች የተደገፉ የድምፅና የጽሑፍ ማብራሪያዎች'
                : 'Savannah LMS curriculum grounded guidance with instant 1-click human escalation'}
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-xs font-mono text-[var(--text-secondary)] bg-[var(--bg-subtle)] px-2.5 py-1 rounded-lg border border-[var(--border-default)] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            <span>ALX Savannah RAG Active</span>
          </span>
        </div>
      </div>

      {/* Main Workspace: 2-Column Split on Desktop, Single Column at <= 1024px or 200% zoom */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
        {/* Primary Column: Multilingual Voice & Text Tutor Chat Workspace */}
        <section
          aria-label={language === 'am' ? 'የትምህርት ረዳት የውይይት መስኮት' : 'Tutor Chat Workspace'}
          className="w-full min-w-0"
        >
          <ChatContainer />
        </section>

        {/* Secondary Context Column (340px) */}
        <section
          aria-label={language === 'am' ? 'የትምህርት አውድ እና የሰው ድጋፍ መረጃ' : 'Active Context & Escalation'}
          className="w-full min-w-0"
        >
          <ContextSidebar />
        </section>
      </div>
    </div>
  );
}
