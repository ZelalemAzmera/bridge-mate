'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ExternalLink, Bot, ShieldCheck, Zap, QrCode } from 'lucide-react';

interface CommandResult {
  status: string;
  answer?: string;
  message?: string;
  citations?: string[];
}

export default function TelegramPage() {
  const [command, setCommand] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CommandResult[]>([]);
  const [deepLink, setDeepLink] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'BridgeMate_Assistant_Bot';

  const handleConnectTelegram = async () => {
    setIsLinking(true);
    try {
      const res = await fetch('/api/telegram/link-token');
      const data = await res.json();
      if (data.success && data.deepLink) {
        setDeepLink(data.deepLink);
        window.open(data.deepLink, '_blank');
      } else {
        window.open(`https://t.me/${botUsername}`, '_blank');
      }
    } catch {
      window.open(`https://t.me/${botUsername}`, '_blank');
    } finally {
      setIsLinking(false);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!command.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: command, language: 'am' }),
      });
      const data = await res.json();
      setResults((prev) => [
        ...prev,
        {
          status: 'success',
          answer: data.answer || data.response,
          citations: data.citations?.map((c: any) => typeof c === 'string' ? c : c.title || c.citation) || [],
        },
      ]);
    } catch {
      setResults((prev) => [
        ...prev,
        { status: 'error', message: 'Network error — please try again.' },
      ]);
    } finally {
      setLoading(false);
      setCommand('');
    }
  }

  const botCommands = [
    { cmd: '/ask <ጥያቄ/question>', desc: 'Get grounded course & legal guidance' },
    { cmd: '/decode <ማስታወቂያ/job_text>', desc: 'Decode job barriers and required accommodations' },
    { cmd: '/livehelp', desc: 'Request 1-click human specialist session' },
    { cmd: '/alerts', desc: 'Subscribe to accessible job announcements' },
  ];

  const steps = [
    { n: '1', title: 'Open in Telegram or 2G', desc: 'Type a /command into Telegram or use the live simulator below.' },
    { n: '2', title: 'Engine processes', desc: 'BridgeMate retrieves and cites from Ethiopian law and ALX curriculum.' },
    { n: '3', title: 'Get cited answer', desc: 'Receive structured, screen-reader friendly answers with zero diagnostic disclosure.' },
  ];

  return (
    <main id="main-content" className="max-w-4xl mx-auto px-4 py-10" style={{ color: 'var(--text-primary)' }}>
      {/* Hero */}
      <section aria-labelledby="hero-heading" className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--brand-accent)] text-[var(--brand-primary)]">
            Track 3 Official Multi-Channel
          </span>
          <span className="text-xs text-[var(--text-secondary)]">2G / 3G Ultra-Low Bandwidth</span>
        </div>
        <h1 id="hero-heading" className="text-3xl font-bold mb-3">
          Telegram &amp; 2G Assistant
        </h1>
        <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)', maxWidth: '68ch' }}>
          BridgeMate operates offline and on slow 2G connections via Telegram. No heavy app required — works seamlessly on any device. Access course guidance, job barrier decoding, and human escalation from anywhere in Ethiopia.
        </p>

        <div className="mt-6 flex flex-wrap gap-4">
          <button
            onClick={handleConnectTelegram}
            disabled={isLinking}
            className="min-h-[44px] px-6 py-2.5 rounded-lg text-sm font-bold text-white flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            style={{ background: 'var(--brand-primary)' }}
          >
            <Bot className="w-4 h-4" />
            <span>{isLinking ? 'Linking Account...' : 'Open @BridgeMate_Assistant_Bot'}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </button>
        </div>
      </section>

      {/* Bot info card */}
      <section aria-labelledby="bot-heading" className="rounded-xl border p-6 mb-8" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
        <h2 id="bot-heading" className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          @{botUsername}
        </h2>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          Available 24/7 across Ethio Telecom &amp; Safaricom networks
        </p>
        <ul className="space-y-2" role="list">
          {botCommands.map(({ cmd, desc }) => (
            <li key={cmd} className="flex gap-3 text-sm items-center">
              <code
                className="font-mono px-2 py-1 rounded shrink-0 font-bold"
                style={{ background: 'var(--bg-subtle)', color: 'var(--brand-primary)' }}
              >
                {cmd}
              </code>
              <span style={{ color: 'var(--text-secondary)' }}>{desc}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* How it works */}
      <section aria-labelledby="steps-heading" className="rounded-xl border p-6 mb-8" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
        <h2 id="steps-heading" className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          How it Works
        </h2>
        <ol className="space-y-4" role="list">
          {steps.map(({ n, title, desc }) => (
            <li key={n} className="flex gap-4 items-start">
              <span
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                aria-hidden="true"
                style={{ background: 'var(--brand-primary)' }}
              >
                {n}
              </span>
              <div>
                <strong className="block text-sm font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>{title}</strong>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{desc}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 2G / Offline explanation */}
      <section aria-labelledby="offline-heading" className="rounded-xl border p-6 mb-8" style={{ background: 'var(--accent-verified-bg)', borderColor: 'var(--accent-verified)' }}>
        <h2 id="offline-heading" className="text-lg font-semibold mb-2" style={{ color: 'var(--accent-verified)' }}>
          2G &amp; Offline Resilience
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: '#065F46', maxWidth: '68ch' }}>
          BridgeMate&apos;s Telegram bot works over <strong>2G connections</strong> and even with intermittent connectivity. The entire Ethiopian law corpus (Proclamation 1156/2019, Proclamation 568/2008) and ALX module index are <strong>cached locally</strong> on the bot server — no external API calls required for core guidance.
        </p>
      </section>

      {/* Try it Now simulator */}
      <section aria-labelledby="simulator-heading" className="rounded-xl border p-6" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
        <h2 id="simulator-heading" className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Try It Now — Command Simulator
        </h2>
        <form onSubmit={handleSubmit} aria-label="Telegram command simulator" className="flex gap-2 mb-4 flex-wrap">
          <label htmlFor="command-input" className="sr-only">Enter a Telegram command</label>
          <input
            id="command-input"
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="/ask How do I request an accommodation under Ethiopian law?"
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={{ borderColor: 'var(--border-input)', minHeight: '44px', minWidth: '200px' }}
            onFocus={(e) => (e.currentTarget.style.outline = '3px solid var(--focus-ring)')}
            onBlur={(e) => (e.currentTarget.style.outline = '')}
            aria-label="Telegram command input"
          />
          <button
            type="submit"
            disabled={loading}
            aria-label="Send command to simulator"
            className="px-5 text-sm font-semibold text-white rounded-lg disabled:opacity-60 cursor-pointer"
            style={{ minHeight: '44px', background: 'var(--brand-primary)' }}
          >
            {loading ? 'Sending…' : 'Send'}
          </button>
        </form>

        {/* Response log */}
        <div
          ref={logRef}
          role="log"
          aria-live="polite"
          aria-label="Command responses"
          className="space-y-3 max-h-80 overflow-y-auto"
        >
          {results.length === 0 && (
            <p className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>
              Responses will appear here… Type e.g. <code className="font-mono font-bold">/ask How do I request accommodation?</code>
            </p>
          )}
          {results.map((r, i) => (
            <article
              key={i}
              className="rounded-lg p-4 border text-sm"
              style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border-default)' }}
            >
              {r.status === 'error' ? (
                <p style={{ color: '#DC2626' }}><strong>Error:</strong> {r.message}</p>
              ) : (
                <>
                  {r.answer && <p style={{ color: 'var(--text-primary)' }} className="leading-relaxed">{r.answer}</p>}
                  {r.message && <p style={{ color: 'var(--text-secondary)' }}>{r.message}</p>}
                  {r.citations && r.citations.length > 0 && (
                    <ul className="mt-2 space-y-1" role="list">
                      {r.citations.map((c, j) => (
                        <li key={j} className="text-xs" style={{ color: 'var(--accent-verified)' }}>
                          📚 {c}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
