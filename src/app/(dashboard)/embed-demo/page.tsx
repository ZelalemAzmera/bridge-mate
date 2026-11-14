'use client';

import React, { useEffect, useState, useRef } from 'react';
import Script from 'next/script';
import { 
  Puzzle, 
  Terminal, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  BookOpen, 
  Laptop, 
  Volume2, 
  Globe 
} from 'lucide-react';

export default function EmbedDemoPage() {
  const [theme, setTheme] = useState<'dark' | 'light' | 'high-contrast'>('dark');
  const [lang, setLang] = useState<'am' | 'en'>('am');
  const [courseId, setCourseId] = useState('alx-swe-cohort-2026');
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [events, setEvents] = useState<Array<{ name: string; time: string; detail?: any }>>([]);
  const widgetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleWidgetEvent = (e: Event) => {
      const customEvt = e as CustomEvent;
      const now = new Date().toLocaleTimeString();
      setEvents((prev) => [
        {
          name: customEvt.type,
          time: now,
          detail: customEvt.detail,
        },
        ...prev.slice(0, 9),
      ]);
    };

    const target = widgetRef.current || document;
    target.addEventListener('bridgemate:open', handleWidgetEvent);
    target.addEventListener('bridgemate:close', handleWidgetEvent);
    target.addEventListener('bridgemate:message', handleWidgetEvent);
    target.addEventListener('bridgemate:escalate', handleWidgetEvent);
    target.addEventListener('bridgemate:error', handleWidgetEvent);

    return () => {
      target.removeEventListener('bridgemate:open', handleWidgetEvent);
      target.removeEventListener('bridgemate:close', handleWidgetEvent);
      target.removeEventListener('bridgemate:message', handleWidgetEvent);
      target.removeEventListener('bridgemate:escalate', handleWidgetEvent);
      target.removeEventListener('bridgemate:error', handleWidgetEvent);
    };
  }, []);

  const triggerOpen = () => {
    const el = document.querySelector('bridgemate-assistant') as any;
    if (el && typeof el.open === 'function') {
      el.open();
    }
  };

  const copyEmbedCode = () => {
    const snippet = `<!-- 1. Include BridgeMate Drop-in Widget -->
<script src="${typeof window !== 'undefined' ? window.location.origin : 'https://bridgemate.et'}/widget.js" defer></script>

<!-- 2. Drop into any LMS, Canvas, Moodle, or ALX Savannah page -->
<bridgemate-assistant 
  theme="${theme}" 
  lang="${lang}" 
  course-id="${courseId}">
</bridgemate-assistant>`;
    navigator.clipboard.writeText(snippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2500);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Load the Drop-in Web Component */}
      <Script src="/widget.js" strategy="afterInteractive" />

      {/* Hero / Header */}
      <div className="rounded-2xl border border-slate-700/60 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Puzzle className="w-3.5 h-3.5" />
              <span>Door 1: Drop-in Web Component</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              ALX Savannah & LMS Drop-in Integration Demo
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Experience how BridgeMate embeds into any third-party educational platform (ALX Savannah, Canvas, Moodle, Ethiojobs) via <strong>2 lines of HTML</strong>. Fully isolated with Shadow DOM, WCAG 2.2 AA keyboard accessibility, and instant Live Human Help escalation.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={triggerOpen}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900"
              aria-label="Launch BridgeMate Web Component on this page"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Widget (Alt+M)</span>
            </button>
            <button
              onClick={copyEmbedCode}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-400"
              aria-label="Copy 2-line embed code snippet"
            >
              {copiedSnippet ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSnippet ? 'Copied to Clipboard!' : 'Copy Embed Tag'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Widget Controls & Event Stream */}
        <div className="space-y-6">
          {/* Controls Box */}
          <section 
            aria-labelledby="controls-heading"
            className="rounded-xl border border-slate-700/80 bg-slate-900/90 p-5 space-y-4 shadow-md"
          >
            <h2 id="controls-heading" className="text-base font-semibold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Live Attribute Controls</span>
            </h2>

            {/* Language */}
            <div className="space-y-1.5">
              <label htmlFor="select-lang" className="text-xs font-medium text-slate-400">
                Language (ቋንቋ)
              </label>
              <select
                id="select-lang"
                value={lang}
                onChange={(e) => setLang(e.target.value as 'am' | 'en')}
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="am">Amharic (አማርኛ)</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* Theme */}
            <div className="space-y-1.5">
              <label htmlFor="select-theme" className="text-xs font-medium text-slate-400">
                Display Theme
              </label>
              <select
                id="select-theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="dark">Dark Theme (Standard)</option>
                <option value="light">Light Theme</option>
                <option value="high-contrast">High Contrast (Yellow / Black - WCAG 7:1)</option>
              </select>
            </div>

            {/* Course Context ID */}
            <div className="space-y-1.5">
              <label htmlFor="input-course" className="text-xs font-medium text-slate-400">
                Host Course ID Context
              </label>
              <input
                id="input-course"
                type="text"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="e.g. alx-swe-cohort-2026"
              />
            </div>

            <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 space-y-1">
              <p className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Secrets In Browser</span>
              </p>
              <p>No host API keys or database tokens exposed in the client HTML.</p>
            </div>
          </section>

          {/* Real-time Custom Events Log */}
          <section 
            aria-labelledby="events-heading"
            className="rounded-xl border border-slate-700/80 bg-slate-900/90 p-5 space-y-3 shadow-md"
          >
            <div className="flex items-center justify-between">
              <h2 id="events-heading" className="text-sm font-semibold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-400" />
                <span>Host Event Bus Log</span>
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {events.length} events
              </span>
            </div>

            <div 
              role="log" 
              aria-live="polite"
              className="space-y-2 max-h-48 overflow-y-auto font-mono text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800"
            >
              {events.length === 0 ? (
                <p className="text-slate-500 italic">No events yet. Open or chat with the widget to stream events...</p>
              ) : (
                events.map((evt, idx) => (
                  <div key={idx} className="border-b border-slate-800/80 pb-1.5 last:border-0 last:pb-0">
                    <div className="flex justify-between text-slate-400">
                      <span className="text-emerald-400 font-bold">{evt.name}</span>
                      <span>{evt.time}</span>
                    </div>
                    {evt.detail && (
                      <p className="text-slate-500 truncate mt-0.5">
                        {JSON.stringify(evt.detail)}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Column (2 spans): Simulated ALX Savannah Learning Platform Page */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-700/80 bg-slate-900/90 overflow-hidden shadow-lg">
            {/* Mock LMS Browser Chrome / Topbar */}
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="h-4 w-[1px] bg-slate-800 mx-1" />
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-slate-500" />
                  <span>https://savannah.alxafrica.com/curriculum/software-engineering/module-4</span>
                </span>
              </div>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Simulated ALX Savannah
              </span>
            </div>

            {/* Simulated Course Content */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Module 4 • Frontend Development
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold text-white mt-1">
                    Building Accessible Web Applications with WCAG 2.2
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">
                    Course: ALX Software Engineering 2026 • Instructor: Technical Team
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-center shrink-0">
                  <BookOpen className="w-5 h-5 mx-auto text-emerald-400 mb-1" />
                  <span className="text-xs font-semibold block">Lesson 4.2</span>
                </div>
              </div>

              {/* Assignment Prompt with Potential Accessibility Barrier */}
              <div className="rounded-lg bg-slate-950 p-5 border border-slate-800 space-y-3">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-sky-400" />
                  <span>Project Task: Timed Interactive Quiz & Audio Comprehension</span>
                </h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  In this milestone, students must complete a 45-minute timed technical assessment consisting of code comprehension and audio-based debugging challenges. Submission requires passing within the single continuous test window.
                </p>
                
                {/* Note about accommodation */}
                <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
                  <Volume2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Need Accommodation?</strong> Under Ethiopian Proclamation 568/2008 and ALX Accessibility Policy, students requiring extra time, captions, or alternative text formats can ask BridgeMate (bottom right) or escalate directly to live learning support.
                  </div>
                </div>
              </div>

              {/* Embedded Widget Code Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Embedded HTML (Active in this view):</span>
                  <span className="text-emerald-400">Shadow DOM Active</span>
                </div>
                <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto">
{`<script src="/widget.js" defer></script>
<bridgemate-assistant 
  theme="${theme}" 
  lang="${lang}" 
  course-id="${courseId}">
</bridgemate-assistant>`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Render the actual custom element on this page */}
      <div ref={widgetRef as any}>
        {/* @ts-expect-error custom element JSX */}
        <bridgemate-assistant 
          theme={theme}
          lang={lang}
          course-id={courseId}
        />
      </div>
    </div>
  );
}
