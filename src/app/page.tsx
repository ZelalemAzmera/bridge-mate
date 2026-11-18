'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Headphones,
  Briefcase,
  FileSearch,
  FileCheck,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  Bot,
  Puzzle,
  Globe,
  Sliders,
  Sparkles,
  Lock,
  ChevronRight,
  Scale,
  Hand,
  Volume2,
  FileText,
  Search,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { SkipLink } from '@/components/layout/skip-link';
import { LiveAnnouncer } from '@/components/layout/live-announcer';
import { AccessibilityBar } from '@/components/layout/accessibility-bar';
import { Button } from '@/components/ui/button';
import { LiveSimulator } from '@/components/ui/live-simulator';
import { MultimodalSearchAssistant } from '@/components/search/multimodal-search-assistant';
import { useAccessibility } from '@/hooks/use-accessibility';

export default function HomePage() {
  const { language } = useAccessibility();
  const [activeBandwidthView, setActiveBandwidthView] = useState<'low' | 'standard'>('low');

  const isAm = language === 'am';

  const entryways = [
    {
      num: '01',
      title: isAm ? 'የሳቫና ድልድይ ረዳት' : 'Savannah LMS Drop-in Widget',
      category: isAm ? 'ነጠላ ስክሪፕት' : 'Zero-Bundle Plugin',
      description: isAm
        ? 'በአንድ መስመር ኮድ (<db-assistant>) ወደ ALX ሳቫና ወይም ወደ ማንኛውም የትምህርት ፖርታል የሚከተት ራሱን የቻለ ዌብ ኮምፖነንት።'
        : 'Embeds into ALX Savannah or any educational LMS with a single <db-assistant> Web Component tag. Zero host CSS pollution.',
      href: '/embed-demo',
      icon: Puzzle,
      meta: '<500 KB Shadow DOM',
      highlights: isAm
        ? ['ፈጣን መክተት (<db-assistant>)', 'የድምፅና የጽሑፍ ውይይት', 'ከመስመር ውጭ BM25 RAG']
        : ['Web Component (<db-assistant>)', 'Voice & Offline BM25 RAG', 'Zero Host Dependencies'],
    },
    {
      num: '02',
      title: isAm ? 'የቀጥታ የሰው ድጋፍ' : 'Live Help & Escort Room',
      category: isAm ? 'የአቋራጭ ቁልፍ Alt+H' : '1-Click Escalation',
      description: isAm
        ? 'አውድ ሳይጠፋ በ1-ጠቅታ (Alt+H) ወደ ሰው አጋዥ የሚያስተላልፍ፤ ተጠቃሚው የሚቆጣጠረው WebRTC ስክሪን ሼሪንግ።'
        : 'Dedicated accessible workspace with WebRTC learner-controlled screen sharing and context-preserving tutor queues.',
      href: '/support',
      icon: Headphones,
      meta: 'Alt+H Instant',
      highlights: isAm
        ? ['በ1-ጠቅታ የሰው ድጋፍ (Alt+H)', 'የስክሪን ሼሪንግ (WebRTC)', 'ምስጢራዊነት የተጠበቀ']
        : ['1-Click Escalation (Alt+H)', 'Learner-Controlled Screen Share', 'Zero Repetition Handoff'],
    },
    {
      num: '03',
      title: isAm ? 'የቴሌግራም ረዳት ቦት' : 'Telegram 2G/3G Channel',
      category: isAm ? 'ለቀላል ስልኮች' : 'Low-Bandwidth Bot',
      description: isAm
        ? 'ለዝቅተኛ ኢንተርኔት ፍጥነት፤ ትምህርትን፣ የሥራ ማስታወቂያዎችን እና ድጋፍን በቴሌግራም ወይም በኤስኤምኤስ ያቀርባል።'
        : 'Ultra-resilient Telegram bot handling curriculum RAG, job barrier decoding, and instant SMS push alerts over Ethio Telecom 2G.',
      href: '/telegram',
      icon: Bot,
      meta: '2G/3G Resilient',
      highlights: isAm
        ? ['ቀጥተኛ የትምህርት ጥያቄዎች (/ask)', 'የማስታወቂያ መመርመሪያ (/decode)', 'የሥራ ማሳወቂያዎች (/alerts)']
        : ['Curriculum RAG (/ask)', 'Job Barrier Decoder (/decode)', 'Instant Push Alerts (/alerts)'],
    },
  ];

  const barriers = [
    {
      id: '01',
      law: 'Proclamation 568/2008',
      title: isAm ? 'ያልተገለጹ አካላዊ ማነቆዎች በሥራ ማስታወቂያ' : 'Unstated Physical Job Barriers',
      problem: isAm
        ? 'የቴክኖሎጂ አሰሪዎች ለኮድ ጽሕፈት የማያስፈልጉ አካላዊ መስፈርቶችን (ለምሳሌ "20/20 ያልተስተካከለ እይታ" ወይም "የ4ኛ ፎቅ ደረጃ") በግዴለሽነት ያስቀምጣሉ።'
        : 'Tech job postings frequently include irrelevant physical stipulations (e.g., "perfect uncorrected 20/20 vision" or "stair access required") that exclude capable developers.',
      solution: isAm
        ? 'ብሪጅሜት ማስታወቂያውን በመመርመር በስክሪን አንባቢ ወይም በርቀት ሥራ ሊተኩ የሚችሉ ማነቆዎችን ለይቶ ያሳውቃል።'
        : 'BridgeMate extracts functional barriers and maps them to standard mitigations such as screen magnification or remote accommodation.',
    },
    {
      id: '02',
      law: 'Proclamation 1156/2019 Art. 29',
      title: isAm ? 'የፈተናና የምዘና የጊዜ ማመቻቸት ማጣት' : 'Assessment & Exam Time Inflexibility',
      problem: isAm
        ? 'በመስመር ላይ የሚሰጡ የቴክኖሎጂ ፈተናዎች ለስክሪን አንባቢ ተጠቃሚዎች ተጨማሪ ጊዜ አይሰጡም፤ ይህም ፍትሃዊ ያልሆነ ውድድር ይፈጥራል።'
        : 'Online coding tests enforce rigid, unadjusted timers that disadvantage blind programmers navigating code line-by-line via screen readers.',
      solution: isAm
        ? 'በአዋጁ መሠረት ከ25% እስከ 50% ተጨማሪ የፈተና ጊዜና የድምፅ ማብራሪያ የሚጠይቅ ይፋዊ ደብዳቤ ወዲያውኑ ያዘጋጃል።'
        : 'Generates legally grounded accommodation requests demanding 25%–50% exam extensions without disclosing personal medical diagnostics.',
    },
    {
      id: '03',
      law: 'Social Model of Disability',
      title: isAm ? 'በሥራ ቃለ-መጠይቅ ላይ የሚጠየቅ አድሎአዊ የህክምና ታሪክ' : 'Paternalistic Medical Diagnostic Inquiries',
      problem: isAm
        ? 'አሰሪዎች ችሎታን ከመገምገም ይልቅ የግል የህክምና ታሪክ እንዲገለጽ በመጠየቅ አድሎአዊ ጥያቄዎችን ያቀርባሉ።'
        : 'Recruiters inappropriately request invasive medical records rather than evaluating functional digital capabilities and reasonable workplace adjustments.',
      solution: isAm
        ? 'ማንኛውንም የህክምና ምርመራ ሳይገልጽ በተግባራዊ ማመቻቸት (Functional Accommodations) ላይ ብቻ የተመሠረተ ሕጋዊ አሠራር ይዘረጋል።'
        : 'Replaces medical disclosure with functional requirements (e.g., keyboard-only IDE access, dark mode high contrast) backed by labor proclamations.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors">
      <SkipLink />
      <LiveAnnouncer />
      {/* Art-Directed Accessibility Bar Above Header */}
      <AccessibilityBar />
      <Header />

      <main id="main-content" className="flex-1 w-full">
        {/* HERO SECTION: Editorial, Asymmetric & Art-Directed */}
        <section className="pt-12 pb-14 md:pt-20 md:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left 7 Columns: Editorial Headline, Mission & CTA */}
            <div className="lg:col-span-7 space-y-6">
              {/* Institutional Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm text-xs font-mono font-bold bg-[var(--brand-secondary)] text-[var(--brand-primary)] border border-[#C5D5C4]">
                <span className="w-2 h-2 rounded-full bg-[var(--brand-accent)]" />
                <span>ALX ETHIOPIA DIGITAL BRIDGE • TRACK 3 SUBMISSION</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-[var(--brand-primary)] leading-[1.15]">
                {isAm ? (
                  <>
                    <span className="font-ethiopic block mb-2 text-[var(--brand-primary)]">
                      ከመማር ወደ ገቢ፦ ለአካል ጉዳተኞች ተደራሽ ድልድይ
                    </span>
                    <span className="text-2xl sm:text-3xl text-[var(--brand-accent)] font-serif block">
                      From Learning to Earning.
                    </span>
                  </>
                ) : (
                  <>
                    <span className="block text-[var(--brand-primary)]">
                      Connecting Learning to Earning.
                    </span>
                    <span className="text-2xl sm:text-3xl font-ethiopic text-[var(--brand-accent)] block mt-1">
                      ከመማር ወደ ገቢ 🇪🇹
                    </span>
                  </>
                )}
              </h1>

              {/* Editorial Description */}
              <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl leading-relaxed font-sans">
                {isAm
                  ? 'በኢትዮጵያ ውስጥ ያሉ አካል ጉዳተኛ የቴክኖሎጂ ተማሪዎችና የሥራ ፈላጊዎች የትምህርት ይዘትን እንዲረዱ፣ የሥራ ማስታወቂያ ማነቆዎችን እንዲፈቱ፣ እና ፈጣን የሰው ድጋፍ እንዲያገኙ የተዘጋጀ ሁሉን-አቀፍ ሥርዓት።'
                  : 'An art-directed, accessible, multilingual bridge empowering Ethiopian youth with disabilities to master curriculum concepts, decode hidden employment barriers, and connect with live human tutors.'}
              </p>

              {/* Direct Action Entryways (Including Accommodation & Decoder as Requested) */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/learn">
                  <Button size="lg" className="gap-2 font-bold min-h-[46px]">
                    <BookOpen className="w-4 h-4 text-[var(--brand-accent)]" />
                    <span>{isAm ? 'የትምህርት ረዳቱን ክፈት' : 'Open Curriculum Tutor'}</span>
                  </Button>
                </Link>

                <Link href="/decoder">
                  <Button variant="outline" size="lg" className="gap-2 font-bold min-h-[46px] border-[var(--border-default)]">
                    <FileSearch className="w-4 h-4 text-[var(--brand-accent)]" />
                    <span>{isAm ? 'ማስታወቂያ መርምር (Decoder)' : 'Decode Notice'}</span>
                  </Button>
                </Link>

                <Link href="/translator">
                  <Button variant="outline" size="lg" className="gap-2 font-bold min-h-[46px] border-[var(--border-default)]">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>{isAm ? 'ማመቻቸት ጠይቅ' : 'Request Accommodation'}</span>
                  </Button>
                </Link>

                <Link href="/jobs">
                  <Button variant="outline" size="lg" className="gap-2 font-bold min-h-[46px] border-[var(--border-default)]">
                    <Briefcase className="w-4 h-4 text-[var(--brand-primary)]" />
                    <span>{isAm ? 'የሥራ በር (Jobs)' : 'Career Gateway'}</span>
                  </Button>
                </Link>

                <Link href="/support">
                  <Button variant="accent" size="lg" className="gap-2 min-h-[46px]">
                    <Headphones className="w-4 h-4" />
                    <span>{isAm ? 'የሰው ድጋፍ (Alt+H)' : 'Live Help (Alt+H)'}</span>
                  </Button>
                </Link>

                <Link href="/onboarding">
                  <Button variant="ghost" size="lg" className="gap-1.5 min-h-[46px] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                    <Sparkles className="w-4 h-4 text-[var(--brand-accent)]" />
                    <span>{isAm ? 'መገለጫ አብጅ' : 'Tailor Profile'}</span>
                  </Button>
                </Link>
              </div>

              {/* Trust Markers */}
              <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[var(--text-secondary)] font-mono border-t border-[var(--border-default)]">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-verified)]" />
                  <span>WCAG 2.2 Level AA Verified</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-verified)]" />
                  <span>ALX Savannah Drop-in</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-verified)]" />
                  <span>Telegram &amp; SMS 2G Resilient</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-verified)]" />
                  <span>Zero Diagnostic Disclosure</span>
                </span>
              </div>
            </div>

            {/* Right 5 Columns: Architectural Specimen / Live Simulator */}
            <div className="lg:col-span-5">
              <div className="rounded-md border-2 border-[var(--brand-primary)] bg-[var(--bg-surface)] p-2 shadow-editorial">
                <div className="p-3 bg-[var(--brand-primary)] text-[var(--brand-neutral)] rounded-sm flex items-center justify-between text-xs font-mono mb-2">
                  <span className="font-bold">SYSTEM RUNTIME: &lt;db-assistant&gt;</span>
                  <span className="text-[var(--brand-accent)] font-bold">PORT 8080 READY</span>
                </div>
                <LiveSimulator />
              </div>
            </div>
          </div>
        </section>

        {/* MULTIMODAL SEARCH ASSISTANT SECTION */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--border-default)]">
          <MultimodalSearchAssistant />
        </section>

        {/* SECTION: 3 ENTRYWAYS (THE THREE DOORS) */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--border-default)]">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--brand-accent)]">
              Architecture • Track 3 Spec
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--brand-primary)] mt-1 mb-3">
              {isAm ? 'ሦስቱ የተደራሽነት በሮች (The Three Doors)' : 'The Three Doors to Opportunity'}
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-sans">
              {isAm
                ? 'ብሪጅሜት ለአካል ጉዳተኛ ተማሪዎችና ሥራ ፈላጊዎች ሶስት እኩል ተደራሽ የሆኑ የመግቢያ መንገዶችን ያቀርባል፦'
                : 'Every learner accesses BridgeMate through their required channel without friction, device barriers, or cognitive overload.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {entryways.map((door) => {
              const Icon = door.icon;
              return (
                <article
                  key={door.num}
                  className="rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 flex flex-col justify-between hover:border-[var(--brand-primary)] transition-all shadow-xs"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
                      <span className="text-2xl font-serif font-black text-[var(--brand-accent)]">
                        {door.num}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--brand-primary)] font-bold">
                        {door.meta}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-mono text-[var(--text-secondary)] uppercase">
                        {door.category}
                      </span>
                      <h3 className="text-lg font-serif font-bold text-[var(--brand-primary)]">
                        {door.title}
                      </h3>
                    </div>

                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-sans">
                      {door.description}
                    </p>

                    <ul className="space-y-1.5 pt-2 border-t border-[var(--border-default)]">
                      {door.highlights.map((h, i) => (
                        <li key={i} className="text-xs text-[var(--text-primary)] flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-accent)] shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 mt-4">
                    <Link
                      href={door.href}
                      className="inline-flex items-center gap-2 text-xs font-bold text-[var(--brand-primary)] hover:text-[var(--brand-accent)] transition-colors min-target focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded"
                    >
                      <span>{isAm ? 'ዝርዝሩን ይመልከቱ' : 'Explore Integration'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* SECTION: FUNCTIONAL BARRIERS & STANDARD ACCOMMODATIONS */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--border-default)] bg-[var(--bg-subtle)]">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--brand-accent)]">
              Legal Grounding • Ethiopian Labor Law
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--brand-primary)] mt-1 mb-3">
              {isAm ? 'የሥራ ማነቆዎች እና የማመቻቸት መፍትሔዎች' : 'Decoded Barriers & Standard Accommodations'}
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-sans">
              {isAm
                ? 'በአዋጅ ቁጥር 1156/2019 አንቀጽ 29 እና በአዋጅ 568/2008 መሠረት አሰሪዎች የማመቻቸት ግዴታ አለባቸው። ብሪጅሜት ሕጋዊ መብትን በተግባር ይተረጉማል፦'
                : 'BridgeMate extracts discriminatory stipulations in job descriptions and maps them directly to legal remedies under Ethiopian Proclamation 1156/2019 and 568/2008.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {barriers.map((item) => (
              <div
                key={item.id}
                className="rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 space-y-4 shadow-xs"
              >
                <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-2 text-xs font-mono">
                  <span className="font-bold text-[var(--brand-primary)]">CASE #{item.id}</span>
                  <span className="text-[var(--brand-accent)] font-semibold">{item.law}</span>
                </div>

                <h3 className="font-serif font-bold text-base text-[var(--brand-primary)]">
                  {item.title}
                </h3>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="p-3 rounded bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                    <strong className="block text-[11px] font-mono uppercase tracking-wider text-rose-700">
                      {isAm ? 'የተገኘው ማነቆ (Barrier)' : 'Detected Problem:'}
                    </strong>
                    <p className="leading-relaxed">{item.problem}</p>
                  </div>

                  <div className="p-3 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                    <strong className="block text-[11px] font-mono uppercase tracking-wider text-emerald-700">
                      {isAm ? 'ሕጋዊ ማመቻቸት (Legal Mitigation)' : 'BridgeMate Solution:'}
                    </strong>
                    <p className="leading-relaxed">{item.solution}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION: 2G ULTRA-LOW-BANDWIDTH VERIFICATION SPECIMEN */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--border-default)]">
          <div className="rounded-md border-2 border-[var(--brand-primary)] bg-[var(--bg-surface)] p-8 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-default)] pb-4 mb-6">
              <div>
                <span className="text-xs font-mono text-[var(--brand-accent)] font-bold uppercase">
                  Zero Network Bias • 2G/3G Verified
                </span>
                <h3 className="text-xl font-serif font-bold text-[var(--brand-primary)] mt-0.5">
                  {isAm ? 'ለምን ከ15 KB በታች የሆነ ገጽ አስፈለገ?' : 'Why an Ultra-Lightweight <15 KB Route?'}
                </h3>
              </div>
              <Link
                href="/low-bandwidth"
                className="px-3.5 py-1.5 rounded-sm bg-[var(--brand-primary)] text-[var(--brand-neutral)] text-xs font-mono font-bold hover:bg-[#23453F] transition-colors shrink-0 text-center"
              >
                /low-bandwidth
              </Link>
            </div>

            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6 font-sans">
              {isAm
                ? 'በኢትዮጵያ ክልሎች በ2G የሞባይል ዳታ ግንኙነት ወቅት ከባድ የጃቫስክሪፕት ፋይሎች አይሰሩም። ብሪጅሜት በ12.4 KB ብቻ የሚሠራ ሙሉ ለሙሉ ንጹህ ኤችቲኤምኤል (HTML-only) ገጽ አዘጋጅቷል።'
                : 'In regional Ethiopian zones with intermittent 2G coverage, multi-megabyte JavaScript single-page apps fail completely. BridgeMate provides a zero-client-JS route delivering verified curriculum answers and job alerts in just 12.4 KB.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-center">
              <div className="p-4 rounded border border-[var(--border-default)] bg-[var(--bg-subtle)]">
                <span className="text-2xl font-black text-[var(--brand-primary)] block">12.4 KB</span>
                <span className="text-xs text-[var(--text-secondary)]">Total Payload Size</span>
              </div>
              <div className="p-4 rounded border border-[var(--border-default)] bg-[var(--bg-subtle)]">
                <span className="text-2xl font-black text-[var(--brand-primary)] block">0.4s</span>
                <span className="text-xs text-[var(--text-secondary)]">2G Cold Load Time</span>
              </div>
              <div className="p-4 rounded border border-[var(--border-default)] bg-[var(--bg-subtle)]">
                <span className="text-2xl font-black text-[var(--brand-accent)] block">SMS Callback</span>
                <span className="text-xs text-[var(--text-secondary)]">Ethio Telecom Push</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: SOCIAL MODEL MANIFESTO */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--border-default)]">
          <div className="bg-[var(--brand-primary)] text-[var(--brand-neutral)] rounded-md p-8 sm:p-12 space-y-6">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-[var(--brand-accent)] block">
              Core Accessibility Principle
            </span>
            <blockquote className="font-serif italic text-xl sm:text-2xl md:text-3xl leading-snug">
              {isAm
                ? '“ማነቆው ያለው በሰውየው ላይ ሳይሆን በአካባቢው እና በቴክኖሎጂው አሠራር ላይ ነው።”'
                : '“Disability is caused by the way society is organized, rather than by a person’s impairment or difference.”'}
            </blockquote>

            <p className="text-sm sm:text-base text-[var(--brand-secondary)] leading-relaxed max-w-3xl font-sans">
              {isAm
                ? 'ብሪጅሜት የተገነባው በማህበራዊ ሞዴል መርህ መሠረት ነው። ማንኛውንም ተጠቃሚ የግል የህክምና ምርመራ ወይም የበሽታ ታሪክ አንጠይቅም፤ አናከማችምም። የእኛ ተልዕኮ በሥራ ማስታወቂያዎች፣ በመማሪያ መድረኮች እና በመገናኛ ዘዴዎች ውስጥ ያሉትን እንቅፋቶች በማስወገድ እኩል የሥራ ዕድል መፍጠር ነው።'
                : 'BridgeMate operates strictly under the Social Model of Disability. We never solicit or store private medical diagnostics or impairment classifications. Our technology focuses exclusively on identifying structural and communication barriers and generating standard accommodations under Ethiopian Proclamation 1156/2019.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#23453F] text-xs">
              <div className="space-y-1">
                <div className="font-bold text-[var(--brand-neutral)] flex items-center gap-1.5 text-xs">
                  <Lock className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                  <span>Zero Diagnostic Disclosure</span>
                </div>
                <p className="text-[11px] text-[var(--brand-secondary)]">
                  {isAm ? 'የግል ህክምና መረጃ አይጠየቅም' : 'No medical history collected'}
                </p>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-[var(--brand-neutral)] flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                  <span>Ethiopian Law Grounded</span>
                </div>
                <p className="text-[11px] text-[var(--brand-secondary)]">
                  {isAm ? 'አዋጅ 1156/2019 እና 568/2008' : 'Proclamations 1156/2019 & 568/2008'}
                </p>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-[var(--brand-neutral)] flex items-center gap-1.5 text-xs">
                  <Globe className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                  <span>5 Regional Languages</span>
                </div>
                <p className="text-[11px] text-[var(--brand-secondary)]">
                  {isAm ? 'አማርኛ፣ ኦሮምኛ፣ ትግርኛ፣ ሶማሊኛ፣ እንግሊዝኛ' : 'Amharic, Oromo, Tigrinya, Somali, English'}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER: Editorial & High Contrast */}
      <footer className="border-t border-[var(--border-default)] bg-[var(--brand-primary)] text-[var(--brand-neutral)] py-10 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <span className="font-serif font-black text-sm text-[var(--brand-neutral)]">
              BridgeMate | ብሪጅሜት
            </span>
            <span className="text-[var(--brand-secondary)] hidden sm:inline">•</span>
            <span className="text-[var(--brand-secondary)]">From Learning to Earning</span>
            <span className="text-[var(--brand-secondary)] hidden sm:inline">•</span>
            <span className="text-[var(--brand-accent)] font-mono font-bold">
              Track 3: Multilingual Assistant &amp; Live Help
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[var(--brand-secondary)] font-medium">
            <Link href="/learn" className="hover:text-[var(--brand-neutral)] transition-colors">Tutor</Link>
            <Link href="/jobs" className="hover:text-[var(--brand-neutral)] transition-colors">Career Gateway</Link>
            <Link href="/decoder" className="hover:text-[var(--brand-neutral)] transition-colors">Decoder</Link>
            <Link href="/translator" className="hover:text-[var(--brand-neutral)] transition-colors">Accommodation</Link>
            <Link href="/support" className="hover:text-[var(--brand-neutral)] transition-colors">Live Help</Link>
            <Link href="/telegram" className="hover:text-[var(--brand-neutral)] transition-colors">Telegram</Link>
            <Link href="/low-bandwidth" className="hover:text-[var(--brand-neutral)] transition-colors">2G Mode</Link>
            <Link href="/docs" className="hover:text-[var(--brand-neutral)] transition-colors font-bold text-white">Docs</Link>
            <Link href="/developers" className="hover:text-[var(--brand-neutral)] transition-colors">APIs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
