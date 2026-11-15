'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  Bot,
  ShieldCheck,
  Zap,
  Copy,
  Check,
  Radio,
  FileText,
  Headphones,
  Bell,
  ArrowRight,
  WifiOff,
  Sparkles,
} from 'lucide-react';
import { useAccessibility } from '@/hooks/use-accessibility';

interface CommandResult {
  status: 'success' | 'error';
  command: string;
  answer?: string;
  message?: string;
  citations?: string[];
}

export default function TelegramPage() {
  const { language } = useAccessibility();
  const isAmharic = language === 'am';

  const [activeTab, setActiveTab] = useState<'telegram' | '2g'>('telegram');
  const [command, setCommand] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CommandResult[]>([]);
  const [deepLink, setDeepLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [botUsername, setBotUsername] = useState('BridgeMate_Assistant_Bot');
  const logRef = useRef<HTMLDivElement>(null);

  // Auto-fetch personalized Telegram linking token on mount
  useEffect(() => {
    async function fetchLinkingToken() {
      setIsLinking(true);
      try {
        const res = await fetch('/api/telegram/link-token');
        const data = await res.json();
        if (data.success && data.deepLink) {
          setDeepLink(data.deepLink);
          if (data.botUsername) setBotUsername(data.botUsername);
        } else {
          setDeepLink(`https://t.me/${botUsername}`);
        }
      } catch {
        setDeepLink(`https://t.me/${botUsername}`);
      } finally {
        setIsLinking(false);
      }
    }
    fetchLinkingToken();
  }, [botUsername]);

  const handleCopyLink = () => {
    if (!deepLink) return;
    navigator.clipboard.writeText(deepLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!command.trim() || loading) return;
    const currentCmd = command.trim();
    setLoading(true);

    try {
      // Simulate by calling /api/v1/chat or telegram update processor
      const isAsk = currentCmd.startsWith('/ask');
      const isDecode = currentCmd.startsWith('/decode');
      const isLiveHelp = currentCmd.startsWith('/livehelp');
      const isAlerts = currentCmd.startsWith('/alerts');

      let replyAnswer = '';
      let replyCitations: string[] = [];

      if (isAsk || (!isDecode && !isLiveHelp && !isAlerts)) {
        const queryText = currentCmd.replace('/ask', '').trim() || currentCmd;
        const res = await fetch('/api/v1/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: queryText, language: isAmharic ? 'am' : 'en' }),
        });
        const data = await res.json();
        replyAnswer = data.answer || data.response || 'Answer received from BridgeMate.';
        replyCitations = data.citations?.map((c: any) => typeof c === 'string' ? c : c.title || c.citation) || [];
      } else if (isDecode) {
        const noticeText = currentCmd.replace('/decode', '').trim() || 'Software Engineer requirement: Must climb stairs daily.';
        const res = await fetch('/api/v1/decoder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: noticeText }),
        });
        const data = await res.json();
        replyAnswer = `🔍 Barrier Analysis:\n` +
          `• Risk Level: ${data.barrierLevel || data.analysis?.barrierLevel || 'HIGH'}\n` +
          `• Legal Remedy: Ethiopian Proclamation 1156/2019 (Art. 29) & 568/2008.\n` +
          `• Mitigation: ${data.mitigations?.[0] || 'Digital accessibility accommodation'}`;
        replyCitations = ['Labor Proclamation 1156/2019 (Art. 29)'];
      } else if (isLiveHelp) {
        replyAnswer = isAmharic
          ? '👩‍💼 የቀጥታ የሰው ድጋፍ ክፍለ-ጊዜ ተጀምሯል! የጥበቃ ቁጥር፡ #1። ወደ ድጋፍ ክፍሉ ለመግባት /support ን ይጫኑ።'
          : '👩‍💼 Live Human Help session initialized! Queue position #1. Visit /support to enter your dedicated room with zero context loss.';
      } else if (isAlerts) {
        replyAnswer = isAmharic
          ? '✅ ለቴሌግራም የሥራ ማሳወቂያዎች ተመዝግበዋል! አዳዲስ አካል ጉዳተኞችን የሚያካትቱ የሥራ ዕድሎች ሲወጡ ወዲያውኑ ይደርስዎታል።'
          : '✅ Subscribed to Telegram Job & Accommodation Alerts! You will receive accessible Ethiopian job notices directly.';
      }

      setResults((prev) => [
        {
          status: 'success',
          command: currentCmd,
          answer: replyAnswer,
          citations: replyCitations,
        },
        ...prev,
      ]);
    } catch {
      setResults((prev) => [
        {
          status: 'error',
          command: currentCmd,
          message: isAmharic
            ? 'የግንኙነት ስህተት አጋጥሟል — እባክዎ እንደገና ይሞክሩ።'
            : 'Network connection error — please try again.',
        },
        ...prev,
      ]);
    } finally {
      setLoading(false);
      setCommand('');
    }
  }

  const botCommands = [
    {
      cmd: '/ask <ጥያቄ/question>',
      descAm: 'የተረጋገጠ የኮርስና የሕግ ማመቻቸት መረጃ ያግኙ',
      descEn: 'Get grounded course & legal accommodation guidance',
    },
    {
      cmd: '/decode <ማስታወቂያ/job_text>',
      descAm: 'በሥራ ማስታወቂያ ላይ ያሉ አካላዊ እንቅፋቶችንና መፍትሔዎችን ይመርምሩ',
      descEn: 'Decode job notice barriers and find legal mitigations',
    },
    {
      cmd: '/livehelp',
      descAm: 'በ1-ጠቅታ ከቀጥታ የሰው ድጋፍ ባለሙያ ጋር ይገናኙ',
      descEn: 'Request 1-click human specialist session with zero context loss',
    },
    {
      cmd: '/alerts',
      descAm: 'አዳዲስ አካታች የሥራ ዕድሎች በቴሌግራም እንዲደርሱዎት ይመዝገቡ',
      descEn: 'Subscribe to instant accessible job alerts on Telegram',
    },
  ];

  return (
    <main id="main-content" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2.5">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--brand-accent)] text-[var(--brand-primary)]">
            Track 3 Multi-Channel Hub
          </span>
          <span className="text-xs text-[var(--text-secondary)] font-mono">
            Telegram Bot • 2G Low-Bandwidth Mode
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2 font-serif">
          {isAmharic ? 'ቴሌግራም እና የ2G ዝቅተኛ ባንድዊድዝ ረዳት' : 'Telegram Bot & 2G Low-Bandwidth Assistant'}
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-3xl leading-relaxed">
          {isAmharic
            ? 'ብሪጅሜት በኢትዮጵያ ውስጥ በየትኛውም ቦታ — በደካማ 2G/EDGE ኢንተርኔት ወይም በቴሌግራም ቦት አማካኝነት ያለ ከባድ ዳታ ያለምንም እንከን ይሠራል። የኮርስ ትምህርቶችን፣ የሥራ ማስታወቂያዎችንና የሰው ድጋፍን በቀላሉ ያግኙ።'
            : 'BridgeMate operates seamlessly across Ethiopia even on slow 2G/EDGE cellular networks or directly via our lightweight Telegram bot. No heavy assets required — accessible from anywhere.'}
        </p>
      </div>

      {/* Dual Experience Tabs */}
      <div className="flex items-center gap-3 p-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] mb-8 max-w-md" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'telegram'}
          onClick={() => setActiveTab('telegram')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'telegram'
              ? 'bg-[var(--brand-primary)] text-white shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>{isAmharic ? 'የቴሌግራም ቦት' : 'Telegram Assistant'}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === '2g'}
          onClick={() => setActiveTab('2g')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === '2g'
              ? 'bg-[var(--brand-primary)] text-white shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>{isAmharic ? 'የ2G ሁነታ (<15KB)' : '2G Mode (<15KB)'}</span>
        </button>
      </div>

      {/* TAB 1: TELEGRAM BOT HUB */}
      {activeTab === 'telegram' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Main Action Banner */}
          <div className="rounded-2xl p-6 sm:p-8 bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 text-xs font-bold border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>@{botUsername} • 24/7 Verified Gateway</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                  {isAmharic ? 'መለያዎን ከቴሌግራም ጋር ያገናኙ' : 'Connect Your Account to Telegram'}
                </h2>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {isAmharic
                    ? 'የግል መለያዎን በቴሌግራም ቦት ላይ በማገናኘት በድረ-ገጹ የመዘገቡትን የተደራሽነት መገለጫና የኮርስ ታሪክ በቀጥታ በቴሌግራም ይጠቀሙ።'
                    : 'Link your authenticated profile to our Telegram bot to synchronize your tailored disability accommodations, saved jobs, and course history.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
                <a
                  href={deepLink || `https://t.me/${botUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[48px] px-6 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 shadow-xs transition-all hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                  style={{ background: 'var(--brand-primary)' }}
                >
                  <Bot className="w-4 h-4" />
                  <span>{isLinking ? (isAmharic ? 'በማገናኘት ላይ...' : 'Connecting...') : (isAmharic ? 'ቴሌግራም ክፈት' : 'Open in Telegram')}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold border border-[var(--border-default)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-canvas)] text-[var(--text-primary)] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>{isAmharic ? 'አድራሻው ተገልብጧል!' : 'Deep Link Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{isAmharic ? 'የቦት አድራሻ ቅዳ' : 'Copy Direct Bot Link'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Deep link display */}
            {deepLink && (
              <div className="mt-6 pt-5 border-t border-[var(--border-default)]">
                <p className="text-xs text-[var(--text-secondary)] font-semibold mb-1">
                  {isAmharic ? 'የእርስዎ የግል ማገናኛ አድራሻ (Deep Link)፦' : 'Your Personal Authenticated Deep Link:'}
                </p>
                <code className="block p-2.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] text-xs font-mono text-[var(--text-primary)] break-all select-all">
                  {deepLink}
                </code>
              </div>
            )}
          </div>

          {/* Bot Commands Reference Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {botCommands.map((item) => (
              <div
                key={item.cmd}
                className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] flex items-start gap-3 shadow-xs"
              >
                <code className="px-2.5 py-1 rounded bg-[var(--bg-subtle)] text-[var(--brand-primary)] font-mono text-xs font-bold shrink-0">
                  {item.cmd}
                </code>
                <div>
                  <p className="text-xs font-medium text-[var(--text-primary)]">
                    {isAmharic ? item.descAm : item.descEn}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Web Simulator */}
          <div className="rounded-2xl p-6 sm:p-8 bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[var(--brand-accent)]" />
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                {isAmharic ? 'በድረ-ገጽ ላይ ቦቱን ይሞክሩ (Simulator)' : 'Try It Now — Interactive Telegram Simulator'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-4">
              {isAmharic
                ? 'የቴሌግራም አፕሊኬሽን ሳይከፍቱ የቦት ትዕዛዞችን እዚሁ መሞከር ይችላሉ።'
                : 'Experience exactly how the bot responds over Telegram without leaving the browser.'}
            </p>

            <form onSubmit={handleSubmit} className="flex gap-2.5 mb-6 flex-wrap sm:flex-nowrap">
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder={
                  isAmharic
                    ? '/ask በአዋጅ 1156/2019 መሠረት የፈተና ማመቻቸት መብት ምንድነው?'
                    : '/ask How do I request extra time for ALX Python exams?'
                }
                className="flex-1 min-w-[240px] px-4 py-2.5 rounded-xl border border-[var(--border-input)] bg-[var(--bg-canvas)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] min-h-[44px]"
              />
              <button
                type="submit"
                disabled={loading || !command.trim()}
                className="px-6 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white text-sm font-bold min-h-[44px] shrink-0 disabled:opacity-50 cursor-pointer transition-opacity"
              >
                {loading ? (isAmharic ? 'በመላክ ላይ...' : 'Sending…') : (isAmharic ? 'ላክ' : 'Send')}
              </button>
            </form>

            {/* Response Log */}
            <div
              ref={logRef}
              role="log"
              aria-live="polite"
              aria-label="Simulator response history"
              className="space-y-3 max-h-96 overflow-y-auto"
            >
              {results.length === 0 ? (
                <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-dashed border-[var(--border-default)] text-center text-xs text-[var(--text-secondary)]">
                  {isAmharic
                    ? 'ትዕዛዝ በማስገባት ቦቱን ይሞክሩ (ለምሳሌ /ask, /decode, /livehelp, /alerts)...'
                    : 'Responses will appear here. Try submitting /ask, /decode, /livehelp, or /alerts above.'}
                </div>
              ) : (
                results.map((r, i) => (
                  <article
                    key={i}
                    className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] text-xs sm:text-sm space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-mono text-[var(--brand-primary)]">
                      <span className="font-bold">{r.command}</span>
                      <span className="text-[var(--text-secondary)]">Telegram Bot</span>
                    </div>
                    {r.status === 'error' ? (
                      <p className="text-rose-600 font-semibold">{r.message}</p>
                    ) : (
                      <>
                        <p className="whitespace-pre-wrap text-[var(--text-primary)] leading-relaxed">{r.answer}</p>
                        {r.citations && r.citations.length > 0 && (
                          <div className="pt-2 border-t border-[var(--border-default)] flex flex-wrap gap-2 text-[11px] text-[var(--text-secondary)]">
                            <span className="font-bold">📚 {isAmharic ? 'የተረጋገጡ ምንጮች፦' : 'Verified Citations:'}</span>
                            {r.citations.map((c, ci) => (
                              <span key={ci} className="px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-default)]">
                                {c}
                              </span>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 2G ULTRA-LOW BANDWIDTH MODE */}
      {activeTab === '2g' && (
        <div className="space-y-8 animate-fadeIn">
          {/* 2G Action Card */}
          <div className="rounded-2xl p-6 sm:p-8 bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-300 dark:border-emerald-800 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100 text-xs font-bold">
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>Ultra-Low Bandwidth Mode (&lt;15KB Payload)</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-emerald-950 dark:text-emerald-100 font-serif">
                  {isAmharic ? 'ቀላል የ2G ድረ-ገጽ ሁነታ' : 'Lightweight 2G Web Portal'}
                </h2>
                <p className="text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed">
                  {isAmharic
                    ? 'በደካማ የኢትዮ ቴሌኮም ወይም ሳፋሪኮም 2G/EDGE ግንኙነት ላይ ያለምንም ጃቫስክሪፕት እና ምስሎች በቀጥታ የሚሠራ እጅግ ፈጣን ሁነታ ነው።'
                    : 'Engineered specifically for low-connectivity regions across Ethiopia. Operates without heavy JavaScript, fonts, or images, ensuring near-instant load times on 2G/EDGE networks.'}
                </p>
              </div>

              <Link
                href="/low-bandwidth"
                className="min-h-[48px] px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0"
              >
                <span>{isAmharic ? 'ወደ 2G ሁነታ ይግቡ (/low-bandwidth)' : 'Launch 2G Portal (/low-bandwidth)'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* 2G Feature Highlights */}
            <div className="mt-6 pt-6 border-t border-emerald-200 dark:border-emerald-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-emerald-900 dark:text-emerald-200">
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-emerald-700 shrink-0" />
                <span><strong>&lt;15KB Total Weight</strong> — 95% less data consumption</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span><strong>Pure HTML &amp; CSS</strong> — No client-side JS required</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Headphones className="w-4 h-4 text-emerald-700 shrink-0" />
                <span><strong>SMS Fallback</strong> — Direct human navigator callback</span>
              </div>
            </div>
          </div>

          {/* Quick 2G Feature Explainer */}
          <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] space-y-4">
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              {isAmharic ? 'በ2G ሁነታ ውስጥ የሚገኙ አገልግሎቶች' : 'Capabilities Available in 2G Mode'}
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-[var(--text-secondary)]">
              <li className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span><strong>Bilingual Curriculum Tutor:</strong> Ask questions about ALX Savannah modules and Ethiopian labor law with instant HTML-only answers.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span><strong>Opportunity Barrier Decoder:</strong> Submit job text via standard GET/POST forms to instantly detect exclusionary criteria.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span><strong>Emergency SMS Callback:</strong> Leave your phone number to queue a direct SMS or phone callback from a live human navigator.</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
