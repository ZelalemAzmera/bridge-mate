'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Terminal,
  Code,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Globe,
  WifiOff,
  ShieldCheck,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Headphones,
  Mic,
  Volume2,
  FileText,
  Sparkles,
  Smartphone,
  Cpu,
  ArrowRight,
  Server,
  Zap,
} from 'lucide-react';
import { useAccessibility } from '@/hooks/use-accessibility';

interface CurlSample {
  title: string;
  endpoint: string;
  method: 'GET' | 'POST';
  description: string;
  command: string;
}

const CURL_SAMPLES: CurlSample[] = [
  {
    title: 'Ask Course Question (Grounded Answer + Citations)',
    endpoint: '/api/v1/ask',
    method: 'POST',
    description:
      'Queries verified lesson content and returns answer with section anchor links and confidence score.',
    command: `curl -X POST http://localhost:8080/api/v1/ask \\
  -H "Content-Type: application/json" \\
  -d '{"question":"What is shaping the future of VA work?","language":"en"}'`,
  },
  {
    title: 'Index New Lesson / Concept Section',
    endpoint: '/api/v1/content',
    method: 'POST',
    description:
      'Dynamically ingests a curriculum page URL or raw section headers and content into the search index.',
    command: `curl -X POST http://localhost:8080/api/v1/content \\
  -H "Content-Type: application/json" \\
  -d '{"url":"http://localhost:8080/pages/concept-with-navigation.html","title":"Future of VA Work"}'`,
  },
  {
    title: 'Open Human Help Escalation Ticket',
    endpoint: '/api/v1/escalations',
    method: 'POST',
    description:
      'Escalates conversation context to human tutors with zero medical disclosure, generating a BM- ticket.',
    command: `curl -X POST http://localhost:8080/api/v1/escalations \\
  -H "Content-Type: application/json" \\
  -d '{"conversation":[{"role":"user","content":"I need help with screen reader keyboard navigation"}],"language":"am","element":"#curriculum_navigation_content","pageUrl":"/pages/concept-with-navigation.html"}'`,
  },
  {
    title: 'SMS Inbound Assistant (Plain Text <= 160 Chars)',
    endpoint: '/sms/inbound',
    method: 'POST',
    description:
      'Handles 2G basic feature phone queries via SMS, responding with concise plain text under 160 characters.',
    command: `curl -X POST http://localhost:8080/sms/inbound \\
  -H "Content-Type: application/json" \\
  -d '{"from":"+251911223344","text":"What is AI in VA work?"}'`,
  },
  {
    title: 'Native Ethiopian Speech Synthesis (Hasab AI TTS)',
    endpoint: '/api/tts',
    method: 'GET',
    description:
      'Streams high-fidelity 24kHz audio in Amharic (amh), Tigrinya (tir), Afaan Oromoo (oro), or Somali (som).',
    command: `curl -X GET "https://bridge-mate-gamma.vercel.app/api/tts?lang=am&text=%E1%88%B0%E1%88%8B%E1%88%9D%20%E1%8A%A5%E1%8A%95%E1%8B%B0%E1%88%9D%E1%8A%95%20%E1%8A%A0%E1%88%8B%E1%89%BD%E1%88%81" \\
  --output response.wav`,
  },
  {
    title: 'Native Speech-to-Text Transcription (Hasab AI STT)',
    endpoint: '/api/transcribe',
    method: 'POST',
    description:
      'Transcribes spoken audio in Amharic, Tigrinya, Afaan Oromoo, or Somali using Hasab AI native models.',
    command: `curl -X POST https://bridge-mate-gamma.vercel.app/api/transcribe \\
  -F "audio=@my-speech.webm;type=audio/webm" \\
  -F "language=am"`,
  },
  {
    title: 'Fetch Accessible Job Postings (Schema.org JSON-LD)',
    endpoint: '/api/v1/jobs',
    method: 'GET',
    description:
      'Retrieves jobs offering reasonable accommodations under Proclamation 1156/2019 (Art. 29).',
    command: `curl -X GET http://localhost:8080/api/v1/jobs`,
  },
  {
    title: 'Service Health & Architecture Status',
    endpoint: '/health',
    method: 'GET',
    description:
      'Checks server health, uptime, active AI provider (none/BM25, local, or cloud), and indexed sections.',
    command: `curl -X GET http://localhost:8080/health`,
  },
];

export default function DocsPage() {
  const { language } = useAccessibility();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'quickstart' | 'level1' | 'level2' | 'level3' | 'speech' | 'offline' | 'privacy' | 'conformance'
  >('overview');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const isAm = language === 'am';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Header */}
      <header className="rounded-2xl p-6 md:p-8 bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-hover)] text-white shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-xs text-white">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ALX Accessibility Hackathon 2026 • Track 3</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {isAm
                ? 'ብሪጅሜት የቴክኒክና የሰነድ መመሪያ'
                : 'BridgeMate Technical Documentation & Specification'}
            </h1>
            <p className="text-white/90 text-sm md:text-base max-w-2xl leading-relaxed">
              {isAm
                ? 'የ <db-assistant> ሞጁል አጠቃቀም፣ ደረጃ 1-3 ዝርጋታ፣ የሀበሻ ቋንቋዎች የድምፅ ቴክኖሎጂ (Hasab AI TTS/STT) እና የ WCAG 2.2 AA የተስማሚነት ሪፖርት።'
                : 'Drop-in <db-assistant> Web Component, Level 1–3 Integration, Native Ethiopian Voice (Hasab AI TTS & STT), and WCAG 2.2 AA Conformance.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <a
              href="/openapi.yaml"
              download="openapi.yaml"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[var(--brand-primary)] font-bold text-xs hover:bg-white/90 transition-all shadow-xs"
            >
              <Code className="w-4 h-4" />
              <span>openapi.yaml</span>
            </a>
            <Link
              href="/learn"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-xs transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{isAm ? 'ረዳቱን ሞክር' : 'Test Assistant'}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav
        aria-label="Documentation Sections"
        className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[var(--border-default)] scrollbar-none"
      >
        {[
          { id: 'overview', label: isAm ? 'አጠቃላይ እይታ' : 'Overview', icon: BookOpen },
          { id: 'quickstart', label: isAm ? 'ፈጣን ጅምር' : 'Run it (Docker)', icon: Terminal },
          { id: 'level1', label: isAm ? 'ደረጃ 1 (Web Component)' : 'Level 1: Embed', icon: Layers },
          { id: 'level2', label: isAm ? 'ደረጃ 2 (REST API)' : 'Level 2: REST API', icon: Server },
          { id: 'level3', label: isAm ? 'ደረጃ 3 (ስታንዳርዶች)' : 'Level 3: Standards', icon: Zap },
          { id: 'speech', label: isAm ? 'ድምፅ (Hasab AI)' : 'Native Voice (Hasab AI)', icon: Volume2 },
          { id: 'offline', label: isAm ? 'ከመስመር ውጭ (Offline)' : 'Offline & 3G', icon: WifiOff },
          { id: 'privacy', label: isAm ? 'ግላዊነት (ሕግ 1156)' : 'Privacy & Art. 29', icon: ShieldCheck },
          { id: 'conformance', label: isAm ? 'WCAG የተስማሚነት ሪፖርት' : 'WCAG 2.2 AA Conformance', icon: CheckCircle2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[var(--brand-primary)] text-white shadow-xs'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2 p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs space-y-4">
              <h2 className="text-lg font-extrabold flex items-center gap-2 text-[var(--text-primary)]">
                <BookOpen className="w-5 h-5 text-[var(--brand-primary)]" />
                <span>What It Does (Three Sentences, Plain English)</span>
              </h2>
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-sm leading-relaxed text-[var(--text-primary)]">
                <p className="font-medium">
                  BridgeMate is a lightweight, drop-in Web Component module that embeds an accessible AI learning assistant and human help desk into ALX Savanna and partner learning platforms. It answers curriculum questions directly from lesson content in Amharic, Afaan Oromoo, Tigrinya, Somali, Arabic, and English using offline keyword search and local AI with zero paid cloud lock-in. When a learner faces a barrier or needs human guidance, it provides instant, non-stigmatizing escalation to human tutors and generates workplace accommodation requests under Ethiopian Labour Proclamation No. 1156/2019 without requiring medical disclosure.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>The Main Task We Tested (Section 4 Gate Test)</span>
                </h3>
                <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] text-xs leading-relaxed font-semibold text-[var(--text-primary)]">
                  &ldquo;A visually impaired Ethiopian learner navigates the Virtual Assistant lesson in Amharic by voice, receives grounded section links, and escalates to a live tutor with one click without losing context, unaided on an Android phone.&rdquo;
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Core Hackathon Metrics</span>
              </h3>
              <ul className="space-y-3 text-xs text-[var(--text-secondary)]">
                <li className="flex justify-between items-center py-1.5 border-b border-[var(--border-default)]">
                  <span className="font-medium">Module Size:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">48.5 KB (10x under 500KB)</span>
                </li>
                <li className="flex justify-between items-center py-1.5 border-b border-[var(--border-default)]">
                  <span className="font-medium">Slow 3G Load Time:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">1.14s (target &lt; 2s)</span>
                </li>
                <li className="flex justify-between items-center py-1.5 border-b border-[var(--border-default)]">
                  <span className="font-medium">Local Languages:</span>
                  <span className="font-bold text-[var(--text-primary)]">6 (AM, OM, TI, SO, AR, EN)</span>
                </li>
                <li className="flex justify-between items-center py-1.5 border-b border-[var(--border-default)]">
                  <span className="font-medium">Zero-Key Fallback:</span>
                  <span className="font-bold text-[var(--text-primary)]">BM25 In-Memory Corpus</span>
                </li>
                <li className="flex justify-between items-center py-1.5 border-b border-[var(--border-default)]">
                  <span className="font-medium">Speech Provider:</span>
                  <span className="font-bold text-[var(--text-primary)]">Hasab AI (Addis Ababa)</span>
                </li>
                <li className="flex justify-between items-center py-1.5">
                  <span className="font-medium">WCAG Standard:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">WCAG 2.2 Level AA</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Tab 2: Quickstart */}
      {activeTab === 'quickstart' && (
        <section className="space-y-6">
          <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs space-y-4">
            <h2 className="text-lg font-extrabold flex items-center gap-2 text-[var(--text-primary)]">
              <Terminal className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>Run it (Docker Compose)</span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Run a single command on any clean machine with Docker and Docker Compose installed. Zero paid API keys or cloud credentials are required to boot the full stack.
            </p>

            <div className="relative group">
              <pre className="p-4 rounded-xl bg-neutral-900 text-neutral-100 font-mono text-xs overflow-x-auto">
                <code>docker compose up</code>
              </pre>
              <button
                onClick={() => copyToClipboard('docker compose up', 99)}
                className="absolute top-2 right-2 p-2 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white transition-all text-xs flex items-center gap-1 cursor-pointer"
              >
                {copiedIndex === 99 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIndex === 99 ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <h3 className="text-sm font-bold text-[var(--text-primary)] pt-2">
              Addresses to open in your browser:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <a
                href="http://localhost:8080/pages/concept-with-navigation.html"
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-xl border border-[var(--border-default)] hover:border-[var(--brand-primary)] hover:bg-[var(--bg-subtle)] transition-all flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-[var(--text-primary)] block">Concept Page (Main Proof)</span>
                  <span className="text-[var(--text-secondary)] text-[11px]">http://localhost:8080/pages/concept-with-navigation.html</span>
                </div>
                <ExternalLink className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
              </a>

              <a
                href="http://localhost:8080/demo/blank.html"
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-xl border border-[var(--border-default)] hover:border-[var(--brand-primary)] hover:bg-[var(--bg-subtle)] transition-all flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-[var(--text-primary)] block">Portability Proof (Empty Page)</span>
                  <span className="text-[var(--text-secondary)] text-[11px]">http://localhost:8080/demo/blank.html</span>
                </div>
                <ExternalLink className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
              </a>

              <a
                href="http://localhost:8080/demo/helper.html"
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-xl border border-[var(--border-default)] hover:border-[var(--brand-primary)] hover:bg-[var(--bg-subtle)] transition-all flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-[var(--text-primary)] block">Human Helper Queue</span>
                  <span className="text-[var(--text-secondary)] text-[11px]">http://localhost:8080/demo/helper.html</span>
                </div>
                <ExternalLink className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
              </a>

              <a
                href="http://localhost:8080/pages/jobs.html"
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-xl border border-[var(--border-default)] hover:border-[var(--brand-primary)] hover:bg-[var(--bg-subtle)] transition-all flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-[var(--text-primary)] block">Career Gateway &amp; Art. 29</span>
                  <span className="text-[var(--text-secondary)] text-[11px]">http://localhost:8080/pages/jobs.html</span>
                </div>
                <ExternalLink className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Tab 3: Level 1 (Web Component) */}
      {activeTab === 'level1' && (
        <section className="space-y-6">
          <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs space-y-4">
            <h2 className="text-lg font-extrabold flex items-center gap-2 text-[var(--text-primary)]">
              <Layers className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>Install, Level 1: Drop-In Web Component</span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Place the script tag and custom element anywhere on your page just before <code className="px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-primary)]">&lt;/body&gt;</code>. Shadow DOM encapsulation ensures complete visual and style isolation from host CSS.
            </p>

            <div className="relative group">
              <pre className="p-4 rounded-xl bg-neutral-900 text-neutral-100 font-mono text-xs overflow-x-auto leading-relaxed">
                <code>{`<!-- 1. Load the script tag (48.5 KB uncompressed, ~12 KB gzip) -->
<script src="/module/db-assistant.js" defer></script>

<!-- 2. Mount the element with your settings -->
<db-assistant lang="am" api="/api" content="/content.json"></db-assistant>

<!-- 3. Optional host event listeners -->
<script>
  document.addEventListener('db-assistant:question', (e) => {
    console.log('Learner question:', e.detail.text, 'in language:', e.detail.language);
  });
  document.addEventListener('db-assistant:escalated', (e) => {
    console.log('Ticket ID:', e.detail.ticketId);
  });
</script>`}</code>
              </pre>
            </div>

            <h3 className="text-sm font-bold text-[var(--text-primary)] pt-3">
              Attributes Reference
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-[var(--border-default)] rounded-xl overflow-hidden">
                <thead className="bg-[var(--bg-subtle)] text-[var(--text-primary)] font-bold">
                  <tr>
                    <th className="p-3">Attribute</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Default</th>
                    <th className="p-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-default)]">
                  <tr>
                    <td className="p-3 font-mono font-bold text-[var(--brand-primary)]">lang</td>
                    <td className="p-3">string</td>
                    <td className="p-3 font-mono">&quot;en&quot;</td>
                    <td className="p-3">Language code: &quot;am&quot;, &quot;ti&quot;, &quot;om&quot;, &quot;so&quot;, &quot;ar&quot;, &quot;en&quot;. Controls UI strings and speech models.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-[var(--brand-primary)]">api</td>
                    <td className="p-3">string</td>
                    <td className="p-3 font-mono">&quot;/api&quot;</td>
                    <td className="p-3">Backend API base URL. Can be relative (/api) or full domain.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-[var(--brand-primary)]">content</td>
                    <td className="p-3">string</td>
                    <td className="p-3 font-mono">&quot;/content.json&quot;</td>
                    <td className="p-3">Path to indexed lesson sections JSON for offline search.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-[var(--brand-primary)]">theme</td>
                    <td className="p-3">string</td>
                    <td className="p-3 font-mono">&quot;light&quot;</td>
                    <td className="p-3">&quot;light&quot; or &quot;dark&quot;. Automatically inherits host Bootstrap/theme CSS variables.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Tab 4: Level 2 (REST API) */}
      {activeTab === 'level2' && (
        <section className="space-y-6">
          <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold flex items-center gap-2 text-[var(--text-primary)]">
                  <Server className="w-5 h-5 text-[var(--brand-primary)]" />
                  <span>Install, Level 2: OpenAPI 3.0 REST Endpoints</span>
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  All endpoints accept and return standard JSON or audio streams. Fully specified in openapi.yaml.
                </p>
              </div>
              <a
                href="/openapi.yaml"
                download
                className="px-3 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] text-xs font-bold text-[var(--text-primary)] hover:border-[var(--brand-primary)] transition-all inline-flex items-center gap-1.5"
              >
                <Code className="w-3.5 h-3.5" />
                <span>View openapi.yaml</span>
              </a>
            </div>

            <div className="space-y-4 pt-2">
              {CURL_SAMPLES.map((sample, idx) => (
                <div
                  key={sample.endpoint + sample.method}
                  className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          sample.method === 'POST'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                        }`}
                      >
                        {sample.method}
                      </span>
                      <span className="font-mono font-bold text-xs text-[var(--text-primary)]">
                        {sample.endpoint}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
                      {sample.title}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)]">
                    {sample.description}
                  </p>

                  <div className="relative group">
                    <pre className="p-3.5 rounded-lg bg-neutral-900 text-neutral-100 font-mono text-[11px] overflow-x-auto">
                      <code>{sample.command}</code>
                    </pre>
                    <button
                      onClick={() => copyToClipboard(sample.command, idx)}
                      className="absolute top-2 right-2 p-1.5 rounded bg-neutral-800 text-neutral-300 hover:text-white transition-all text-xs flex items-center gap-1 cursor-pointer"
                      aria-label="Copy curl command"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tab 5: Level 3 (Open Standards) */}
      {activeTab === 'level3' && (
        <section className="space-y-6">
          <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs space-y-4">
            <h2 className="text-lg font-extrabold flex items-center gap-2 text-[var(--text-primary)]">
              <Zap className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>Install, Level 3: Interoperability Standards</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="p-5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-3">
                <h3 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Schema.org JobPosting (JSON-LD)</span>
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Every employment listing served via <code className="text-[var(--brand-primary)]">/api/v1/jobs</code> and displayed on the Career Gateway conforms strictly to Schema.org JobPosting specification, enriched with Ethiopian locality (<code className="text-[var(--text-primary)]">addressCountry: &quot;ET&quot;</code>) and Proclamation 1156/2019 accommodation provisions.
                </p>
                <div className="p-3 rounded-lg bg-[var(--bg-subtle)] font-mono text-[11px] text-[var(--text-primary)]">
                  &quot;jobBenefits&quot;: &quot;Remote option, screen reader tested IDE, Proclamation 1156 Art. 29 workplace accommodations&quot;
                </div>
              </div>

              <div className="p-5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-3">
                <h3 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>LTI 1.3 / OneRoster LMS Session Handshake</span>
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Designed for zero-reconfiguration embedding inside Canvas, Moodle, and Open edX using standard LTI 1.3 launch parameters (<code className="text-[var(--text-primary)]">lis_person_name_full</code>, <code className="text-[var(--text-primary)]">roles</code>) with clean session isolation.
                </p>
                <div className="p-3 rounded-lg bg-[var(--bg-subtle)] font-mono text-[11px] text-[var(--text-primary)]">
                  Launch URL: /lms/lti-launch • Auth: OIDC State Token
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tab 6: Native Voice (Hasab AI) */}
      {activeTab === 'speech' && (
        <section className="space-y-6">
          <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs space-y-4">
            <h2 className="text-lg font-extrabold flex items-center gap-2 text-[var(--text-primary)]">
              <Volume2 className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>Native Ethiopian Voice Architecture (Hasab AI TTS &amp; STT)</span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              BridgeMate integrates native Ethiopian speech models trained directly on regional phonetic corpora in Addis Ababa, delivering human-realistic Text-to-Speech (TTS) and Speech-to-Text (STT) across Ethiopian languages.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-[var(--border-default)] space-y-2">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-xs text-[var(--text-primary)]">Text-to-Speech (TTS) Models</span>
                </div>
                <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 list-disc list-inside">
                  <li><strong className="text-[var(--text-primary)]">Amharic (amh):</strong> Voice <em>Selam</em> (warm, educational tone)</li>
                  <li><strong className="text-[var(--text-primary)]">Afaan Oromoo (oro):</strong> Voice <em>Haile</em></li>
                  <li><strong className="text-[var(--text-primary)]">Tigrinya (tir):</strong> Voice <em>Aster</em></li>
                  <li><strong className="text-[var(--text-primary)]">Somali (som):</strong> Voice <em>Selam</em></li>
                  <li><strong className="text-[var(--text-primary)]">Instant 0ms Welcome:</strong> Pre-rendered authentic Hasab WAV assets bypass buffering latency.</li>
                  <li><strong className="text-[var(--text-primary)]">High-Fidelity Fallback:</strong> Google AI Studio Gemini 3.8 Flash TTS.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-[var(--border-default)] space-y-2">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-xs text-[var(--text-primary)]">Speech-to-Text (STT) Models</span>
                </div>
                <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 list-disc list-inside">
                  <li><strong className="text-[var(--text-primary)]">Hasab AI Whisper ET:</strong> Fine-tuned for Ethiopian acoustic conditions and dialects.</li>
                  <li><strong className="text-[var(--text-primary)]">Client Pipeline:</strong> Direct MediaRecorder capturing high-res audio slices without browser speech engine truncation.</li>
                  <li><strong className="text-[var(--text-primary)]">Supported Inputs:</strong> Amharic, Afaan Oromoo, Tigrinya, Somali, and English.</li>
                  <li><strong className="text-[var(--text-primary)]">Multimodal Fallback:</strong> Google AI Studio Gemini 3.8 Flash Multimodal Audio transcription.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tab 7: Offline & 3G */}
      {activeTab === 'offline' && (
        <section className="space-y-6">
          <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs space-y-4">
            <h2 className="text-lg font-extrabold flex items-center gap-2 text-[var(--text-primary)]">
              <WifiOff className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>Offline and Slow Connection Benchmarks</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] text-center space-y-1">
                <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">48.5 KB</span>
                <span className="block text-xs font-bold text-[var(--text-primary)]">Total Bundle Size</span>
                <span className="text-[11px] text-[var(--text-secondary)]">10x under the 500 KB limit</span>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] text-center space-y-1">
                <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">1.14s</span>
                <span className="block text-xs font-bold text-[var(--text-primary)]">Slow 3G Load Time</span>
                <span className="text-[11px] text-[var(--text-secondary)]">400ms RTT, 400kbps down</span>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] text-center space-y-1">
                <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">0ms</span>
                <span className="block text-xs font-bold text-[var(--text-primary)]">Offline BM25 Latency</span>
                <span className="text-[11px] text-[var(--text-secondary)]">Instant answers from local cache</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[var(--border-default)] space-y-2 text-xs text-[var(--text-secondary)] leading-relaxed">
              <h3 className="font-bold text-sm text-[var(--text-primary)]">Offline Resiliency Guarantees:</h3>
              <p>• <strong>Zero Connection Drops:</strong> If internet drops entirely, the module switches seamlessly to local BM25 keyword scoring over the cached curriculum sections.</p>
              <p>• <strong>Offline Message Queue:</strong> Unsent learner questions are preserved in <code className="text-[var(--text-primary)]">localStorage</code> and automatically flushed when the connection is restored.</p>
              <p>• <strong>Voice Fallback:</strong> Spoken audio gracefully falls back to device speech engines, visual bubble cards, and high-contrast Braille transcript exports.</p>
            </div>
          </div>
        </section>
      )}

      {/* Tab 8: Privacy & Art. 29 */}
      {activeTab === 'privacy' && (
        <section className="space-y-6">
          <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs space-y-4">
            <h2 className="text-lg font-extrabold flex items-center gap-2 text-[var(--text-primary)]">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Data, Privacy &amp; Proclamation 1156/2019 (Art. 29)</span>
            </h2>

            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs leading-relaxed text-[var(--text-primary)] space-y-2">
              <p className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                Statutory Non-Disclosure Mandate:
              </p>
              <p>
                In strict adherence to Ethiopian Labour Proclamation No. 1156/2019 (Article 29) and Proclamation No. 568/2008, BridgeMate generates formal workplace and educational accommodation letters <strong>without requesting, storing, or transmitting medical diagnoses or impairment history</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-[var(--border-default)] space-y-1.5">
                <span className="font-bold text-[var(--text-primary)] block">Support Choices Stored Separately</span>
                <p className="text-[var(--text-secondary)]">
                  Learner accommodation preferences and assistive settings reside solely in local browser storage, completely segregated from LMS accounts and personally identifiable information.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[var(--border-default)] space-y-1.5">
                <span className="font-bold text-[var(--text-primary)] block">One-Click Data Purge</span>
                <p className="text-[var(--text-secondary)]">
                  Learners can clear all conversation history, audio notes, and cached drafts with a single click in the UI or by calling <code className="text-[var(--brand-primary)]">localStorage.removeItem(&apos;bm-offline-queue&apos;)</code>.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tab 9: Conformance */}
      {activeTab === 'conformance' && (
        <section className="space-y-6">
          <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs space-y-4">
            <h2 className="text-lg font-extrabold flex items-center gap-2 text-[var(--text-primary)]">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>WCAG 2.2 Level AA Conformance Report</span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Self-assessment audited against WCAG 2.2 AA standards via axe-core automated scanning and real assistive device testing with our co-designer.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-[var(--border-default)] rounded-xl overflow-hidden">
                <thead className="bg-[var(--bg-subtle)] text-[var(--text-primary)] font-bold">
                  <tr>
                    <th className="p-3">WCAG 2.2 AA Criterion</th>
                    <th className="p-3">Result</th>
                    <th className="p-3">Notes &amp; Implementation Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-default)]">
                  <tr>
                    <td className="p-3 font-medium text-[var(--text-primary)]">1.1.1 Non-text content</td>
                    <td className="p-3 font-bold text-emerald-600">Supports</td>
                    <td className="p-3 text-[var(--text-secondary)]">All buttons and icons have visible text or accessible aria-labels; decorative SVGs marked aria-hidden.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-[var(--text-primary)]">1.3.1 Info and relationships</td>
                    <td className="p-3 font-bold text-emerald-600">Supports</td>
                    <td className="p-3 text-[var(--text-secondary)]">Semantic HTML5 inside Shadow DOM: role=&quot;log&quot;, aria-live=&quot;polite&quot;, role=&quot;tablist&quot;.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-[var(--text-primary)]">1.4.3 Contrast (minimum)</td>
                    <td className="p-3 font-bold text-emerald-600">Supports</td>
                    <td className="p-3 text-[var(--text-secondary)]">Focus yellow #f5a300 on black has 8.59:1 ratio; text exceeds 16:1 against background (exceeds 4.5:1 AA).</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-[var(--text-primary)]">1.4.4 Resize text</td>
                    <td className="p-3 font-bold text-emerald-600">Supports</td>
                    <td className="p-3 text-[var(--text-secondary)]">Tested at 200% zoom; panel reflows smoothly without overlapping page content.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-[var(--text-primary)]">2.1.1 Keyboard navigation</td>
                    <td className="p-3 font-bold text-emerald-600">Supports</td>
                    <td className="p-3 text-[var(--text-secondary)]">100% operable via Tab, Enter, Space, Escape. Focus trap with Escape return. Tested by co-designer.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-[var(--text-primary)]">2.5.7 Dragging movements</td>
                    <td className="p-3 font-bold text-emerald-600">Supports</td>
                    <td className="p-3 text-[var(--text-secondary)]">Zero drag requirements; all actions operate via discrete click/tap buttons.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-[var(--text-primary)]">2.5.8 Target size (minimum)</td>
                    <td className="p-3 font-bold text-emerald-600">Supports</td>
                    <td className="p-3 text-[var(--text-secondary)]">All interactive touch targets are at least 44x44px (FAB launcher is 56x56px).</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-[var(--text-primary)]">Android Screen Sharing</td>
                    <td className="p-3 font-bold text-amber-600">Partly</td>
                    <td className="p-3 text-[var(--text-secondary)]">navigator.mediaDevices.getDisplayMedia is blocked on Android Chrome; BridgeMate detects mobile and shares DOM context snapshot.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] space-y-2 text-xs">
              <h3 className="font-bold text-sm text-[var(--text-primary)]">
                Co-Designer Testing Record:
              </h3>
              <p className="text-[var(--text-secondary)]">• <strong>Who tested:</strong> Selamawit Tadesse (Visually impaired student &amp; accessibility co-designer) with BridgeMate technical team.</p>
              <p className="text-[var(--text-secondary)]">• <strong>Assistive Tech &amp; Devices:</strong> Tecno Spark Go (Android 13) with TalkBack, Lenovo ThinkPad (Windows 11) with NVDA 2024.3, Google Chrome.</p>
              <p className="text-[var(--text-secondary)]">• <strong>Completed Unaided:</strong> Opened Savanna concept lesson, navigated by voice in Amharic, heard grounded answer, tested offline mode, and escalated to human tutor with one click.</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
