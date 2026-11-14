'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  FileSearch,
  FileCheck,
  Headphones,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  Bot,
  Puzzle,
  Zap,
  Globe,
  Sliders,
  Sparkles,
  Lock,
  ChevronRight,
  FileText,
  AlertTriangle,
  Code2,
  Terminal,
  Activity,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { SkipLink } from '@/components/layout/skip-link';
import { LiveAnnouncer } from '@/components/layout/live-announcer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LiveSimulator } from '@/components/ui/live-simulator';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { useAccessibility } from '@/hooks/use-accessibility';

export default function HomePage() {
  const { language } = useAccessibility();
  const [activeBandwidthView, setActiveBandwidthView] = useState<'low' | 'standard'>('low');

  const isAm = language === 'am';

  const doors = [
    {
      doorNum: '01',
      title: isAm ? 'የሳቫና ድልድይ (Drop-in Widget)' : 'Savannah LMS Drop-in Widget',
      subtitle: isAm ? 'ለALX ሳቫና ፖርታል የተዘጋጀ' : 'Single-Script Integration',
      description: isAm
        ? 'በአንድ መስመር ኮድ (<script>) ወደ ALX ሳቫና ወይም ማንኛውም የትምህርት ገጽ የሚከተት ራሱን የቻለ ረዳት።'
        : 'Embeds into ALX Savannah or any educational LMS with a single <script> tag. Zero bundle bloat.',
      href: '/embed-demo',
      icon: Puzzle,
      badge: 'Zero Config',
      features: isAm
        ? ['ፈጣን መክተት (<bridgemate-assistant>)', 'የድምፅና የጽሑፍ ውይይት', 'የአውድ መረጃ ጠባቂ']
        : ['Web Component (<bridgemate-assistant>)', 'Voice & Text Support', 'Zero Host Dependencies'],
    },
    {
      doorNum: '02',
      title: isAm ? 'የቀጥታ ፖርታል እና የሰው ድጋፍ' : 'Web Portal & Live Help Room',
      subtitle: isAm ? 'ከ100% እስከ 200% የፊደል ማሳደጊያ' : 'Full WCAG 2.2 AA Suite',
      description: isAm
        ? 'ከፍተኛ ንፅፅር፣ የስክሪን አንባቢ ድጋፍ እና በ1-ጠቅታ (Alt+H) ወደ ሰው ድጋፍ የሚያሸጋግር ስክሪን ሼሪንግ።'
        : 'Dedicated accessible workspace with WebRTC screen sharing and context-preserving escalation queue.',
      href: '/support',
      icon: Headphones,
      badge: 'WebRTC Alt+H',
      features: isAm
        ? ['በ1-ጠቅታ የሰው ድጋፍ (Alt+H)', 'የስክሪን ሼሪንግ (Screen Share)', 'ምስጢራዊነት የተጠበቀ']
        : ['1-Click Escalation (Alt+H)', 'Learner-Controlled Screen Share', 'Zero Repetition Handoff'],
    },
    {
      doorNum: '03',
      title: isAm ? 'የቴሌግራም ረዳት ቦት' : 'Telegram Bot Assistant',
      subtitle: isAm ? 'ለቀላል ስልኮችና ዝቅተኛ ዳታ' : '2G/3G Low-Data Channel',
      description: isAm
        ? 'ለዝቅተኛ ኢንተርኔት ፍጥነት፤ ትምህርትን፣ የሥራ ማስታወቂያዎችን እና ድጋፍን በቴሌግራም ያቀርባል።'
        : 'Lightweight Telegram bot handling curriculum RAG, barrier decoding, and instant SMS/Telegram alerts.',
      href: '/telegram',
      icon: Bot,
      badge: 'Ethio Telecom 2G',
      features: isAm
        ? ['ቀጥተኛ የትምህርት ጥያቄዎች (/ask)', 'የማስታወቂያ መመርመሪያ (/decode)', 'የሥራ ማሳወቂያዎች (/alerts)']
        : ['Curriculum RAG (/ask)', 'Job Barrier Decoder (/decode)', 'Instant Push Alerts (/alerts)'],
    },
  ];

  const barriers = [
    {
      id: 1,
      title: isAm ? 'ያልተገለጹ አካላዊ ማነቆዎች በሥራ ማስታወቂያ' : 'Unstated Physical Job Barriers',
      problem: isAm
        ? 'የቴክኖሎጂ አሰሪዎች ለኮድ ጽሕፈት የማያስፈልጉ አካላዊ ሁኔታዎችን (ለምሳሌ "20/20 ያልተስተካከለ እይታ" ወይም "የ4ኛ ፎቅ ደረጃ") በግዴለሽነት ያስቀምጣሉ።'
        : 'Tech job notices often include unvetted physical demands (e.g., "perfect uncorrected 20/20 vision" or "4th floor stairs") irrelevant to software development.',
      solution: isAm
        ? 'ብሪጅሜት ማስታወቂያውን በመመርመር በስክሪን አንባቢ ወይም በርቀት ሥራ ሊተኩ የሚችሉ ማነቆዎችን ለይቶ ያሳውቃል።'
        : 'BridgeMate extracts functional barriers and maps them to standard mitigations like screen magnification or remote accommodation.',
      law: 'Proclamation 568/2008',
    },
    {
      id: 2,
      title: isAm ? 'የማመቻቸት ጥያቄ የማቅረብ ፍርሃትና ጭንቀት' : 'Accommodation Request Anxiety',
      problem: isAm
        ? 'ሥራ ፈላጊዎች አካል ጉዳተኝነታቸውን ቢናገሩ ከቅጥር ውድድር ውጭ ሊደረጉ እንደሚችሉ በመስጋት ማመቻቸት ሳይጠይቁ ይቀራሉ።'
        : 'Jobseekers fear pre-hire stigma, leading them to withhold accommodation requests and struggle during assessments.',
      solution: isAm
        ? 'የግል የህክምና መረጃ ሳይገለጽ፣ በኢትዮጵያ አዋጅ 1156/2019 አንቀጽ 29 መሠረት የተዘጋጀ ሕጋዊ የማመቻቸት ደብዳቤ ያዘጋጃል።'
        : 'Automated legal letter generation citing Ethiopian Labor Proclamation 1156/2019 (Art. 29) with zero diagnostic disclosure.',
      law: 'Proclamation 1156/2019 Art. 29',
    },
    {
      id: 3,
      title: isAm ? 'የስክሪን አንባቢ እና የሀገር ውስጥ ቋንቋ ተደራሽነት ማጣት' : 'Language & Screen Reader Gaps',
      problem: isAm
        ? 'አብዛኛዎቹ የኤአይ ቻትቦቶች በአማርኛ፣ በኦሮምኛ ወይም በትግርኛ ትክክለኛ የሥርዓተ-ትምህርትና የሕግ ምላሽ አይሰጡም።'
        : 'Standard generative AI tools lack grounded curriculum knowledge in Ethiopian regional languages and fail on screen readers.',
      solution: isAm
        ? 'በተረጋገጠ ሥርዓተ-ትምህርት ላይ የተመሠረተ RAG በ5 ቋንቋዎች (አማርኛ፣ ኦሮምኛ፣ ትግርኛ፣ ሶማሊኛ ከነ-RTL፣ እንግሊዝኛ) ይመልሳል።'
        : 'Grounded RAG retriever operating across Amharic, Afaan Oromo, Tigrinya, Somali (with native RTL), and English.',
      law: 'WCAG 2.2 Level AA',
    },
    {
      id: 4,
      title: isAm ? 'የኢንተርኔት መቆራረጥ እና ከፍተኛ የዳታ ወጪ' : 'Bandwidth Constraints & Data Costs',
      problem: isAm
        ? 'ዘመናዊ የድር ገጾች ከ3MB በላይ ዳታ ስለሚፈልጉ በ2G/3G ፍጥነት ለመክፈት አስቸጋሪ ናቸው።'
        : 'Heavy client-side web applications (>3MB) fail to load over 2G/3G connections in regional Ethiopian hubs.',
      solution: isAm
        ? 'ከ15KB በታች የሆነ እጅግ ቀላል የጽሑፍ ገጽ (/low-bandwidth) እና የቴሌግራም/ኤስኤምኤስ ማሳወቂያዎች ተዘጋጅተዋል።'
        : 'Ultra-lightweight 12.4 KB server-rendered route (/low-bandwidth) and resilient SMS callback notifications.',
      law: 'Ethio Telecom 2G Resilient',
    },
    {
      id: 5,
      title: isAm ? 'የኤአይ የተሳሳተ ምላሽ እና የሰው እገዛ ማጣት' : 'AI Hallucination & Dead Ends',
      problem: isAm
        ? 'ተጠቃሚው በኤአይ ምላሽ ግራ ሲጋባ ወይም ቴክኒካዊ ችግር ሲገጥመው የሚያግዘው ሰው አያገኝም።'
        : 'Generic chatbots leave learners stranded when automated answers fail or when nuanced accommodations are needed.',
      solution: isAm
        ? 'በ1-ጠቅታ (Alt+H) የአውድ መረጃ ሳይጠፋ በቀጥታ ወደ ሰው አጋዥ የሚያስተላልፍ የዌብአርቲሲ ስክሪን ሼሪንግ።'
        : 'Zero-repetition escalation to human support navigators with WebRTC learner-controlled screen sharing.',
      law: 'Social Model of Disability',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      <SkipLink />
      <LiveAnnouncer />
      <Header />

      <main id="main-content" className="flex-1 w-full">
        {/* HERO SECTION */}
        <section className="relative pt-10 pb-12 md:pt-16 md:pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            {/* Hackathon Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>Digital Bridge Accessibility Hackathon 2026 • Track 3</span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              {isAm ? (
                <>
                  <span className="font-ethiopic block mb-1">
                    ከመማር ወደ ገቢ፦ ለአካል ጉዳተኞች ተደራሽ ድልድይ
                  </span>
                  <span className="text-primary text-2xl sm:text-3xl font-bold font-sans">
                    From Learning to Earning.
                  </span>
                </>
              ) : (
                <>
                  <span className="block text-foreground mb-1">
                    From Learning to Earning.
                  </span>
                  <span className="text-primary text-xl sm:text-2xl font-bold font-ethiopic block">
                    ከመማር ወደ ገቢ 🇪🇹
                  </span>
                </>
              )}
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {isAm
                ? 'በኢትዮጵያ ውስጥ ያሉ አካል ጉዳተኛ የቴክኖሎጂ ተማሪዎችና የሥራ ፈላጊዎች የትምህርት ይዘትን እንዲረዱ፣ የሥራ ማስታወቂያ ማነቆዎችን እንዲፈቱ፣ እና ፈጣን የሰው ድጋፍ እንዲያገኙ የተዘጋጀ ሁሉን-አቀፍ ሥርዓት።'
                : 'An accessible, multilingual bridge empowering Ethiopian youth with disabilities to understand curriculum concepts, decode hidden employment barriers, and access 1-click human support.'}
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <Link href="/learn">
                <Button size="default" className="gap-2 shadow-xs bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white font-bold min-h-[44px]">
                  <BookOpen className="w-4 h-4" />
                  <span>{isAm ? 'የትምህርት ረዳቱን ክፈት' : 'Open AI Tutor'}</span>
                </Button>
              </Link>

              <Link href="/jobs">
                <Button size="default" variant="outline" className="gap-2 border-[var(--border-default)] font-bold min-h-[44px]">
                  <Briefcase className="w-4 h-4 text-[var(--brand-primary)]" />
                  <span>{isAm ? 'የሥራ በር (Career Gateway)' : 'Career Gateway'}</span>
                </Button>
              </Link>

              <Link href="/support">
                <Button size="default" className="gap-2 font-bold min-h-[44px] bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700 hover:bg-emerald-100">
                  <Headphones className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                  <span>{isAm ? 'የሰው ድጋፍ (Alt+H)' : 'Live Help (Alt+H)'}</span>
                </Button>
              </Link>

              <Link href="/low-bandwidth">
                <Button size="default" variant="ghost" className="gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] min-h-[44px]">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isAm ? 'ቀላል ገጽ (2G <15KB)' : '2G Mode (<15KB)'}</span>
                </Button>
              </Link>
            </div>

            {/* Trust Markers */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground font-mono">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                WCAG 2.2 Level AA
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ALX Savannah Compatible
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Telegram &amp; SMS Alerts
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Zero Medical Disclosure
              </span>
            </div>
          </div>

          {/* Interactive Live Simulator Preview */}
          <div className="mt-8">
            <LiveSimulator />
          </div>
        </section>

        {/* SECTION: THREE DOORS */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-border/60">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-mono uppercase tracking-wider text-primary font-bold">
              {isAm ? 'የሥነ-ሕንጻ አሠራር' : 'Track 3 Architecture'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1">
              {isAm ? 'ሶስቱ የተደራሽነት በሮች' : 'The Three Doors to Opportunity'}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {isAm
                ? 'በማንኛውም መሣሪያና የኢንተርኔት ፍጥነት ተደራሽ የሚሆን ሁለገብ ሥርዓት።'
                : 'Ensuring every learner has an entry point regardless of connectivity or hardware.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {doors.map((door) => {
              const Icon = door.icon;
              return (
                <Card key={door.doorNum} className="flex flex-col justify-between hover:border-slate-300">
                  <CardHeader className="p-5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xl font-black text-muted-foreground/40">
                        {door.doorNum}
                      </span>
                      <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border bg-muted text-foreground">
                        {door.badge}
                      </span>
                    </div>

                    <div className="w-9 h-9 rounded-lg flex items-center justify-center border shadow-xs text-primary bg-primary/5">
                      <Icon className="w-4 h-4" />
                    </div>

                    <div>
                      <CardTitle className="text-base font-bold text-foreground">
                        {door.title}
                      </CardTitle>
                      <span className="text-[11px] text-muted-foreground font-mono block">
                        {door.subtitle}
                      </span>
                    </div>

                    <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                      {door.description}
                    </CardDescription>

                    <ul className="space-y-1 pt-1 text-xs text-muted-foreground">
                      {door.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 text-[11px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </CardHeader>

                  <CardContent className="p-5 pt-0">
                    <Link href={door.href}>
                      <Button variant="outline" size="sm" className="w-full justify-between text-xs font-semibold">
                        <span>{isAm ? 'ይመልከቱ' : 'Launch Feature'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* SECTION: 5 REAL BARRIERS */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-border/60 bg-muted/20">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400 font-bold">
              {isAm ? 'ተጨባጭ ችግሮች' : 'Grounded In Ethiopian Reality'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1">
              {isAm ? 'የገቢ ማነቆዎች እና የብሪጅሜት መፍትሔዎች' : 'The 5 Real Barriers from Learning to Earning'}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {isAm
                ? 'አካል ጉዳተኛ ተማሪዎች ከትምህርት ወደ ሥራ በሚሸጋገሩበት ጊዜ የሚያጋጥሟቸው 5ቱ ዋና ዋና እንቅፋቶች።'
                : 'Why qualified candidates with disabilities drop out before hiring, and how BridgeMate solves it.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {barriers.map((barrier) => (
              <div
                key={barrier.id}
                className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="flex items-center gap-1.5 text-primary font-bold">
                      <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">
                        {barrier.id}
                      </span>
                      <span>Barrier #{barrier.id}</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                      {barrier.law}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-foreground">
                    {barrier.title}
                  </h3>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-red-50/80 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40 text-red-900 dark:text-red-300">
                    <strong className="block text-[10px] uppercase tracking-wider font-bold text-red-950 dark:text-red-200 mb-0.5">
                      {isAm ? 'ማነቆው' : 'The Barrier'}:
                    </strong>
                    {barrier.problem}
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-300">
                    <strong className="block text-[10px] uppercase tracking-wider font-bold text-emerald-950 dark:text-emerald-200 mb-0.5">
                      {isAm ? 'የብሪጅሜት መፍትሔ' : 'BridgeMate Intervention'}:
                    </strong>
                    {barrier.solution}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION: 2G BENCHMARK */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-border/60">
          <div className="p-6 sm:p-8 rounded-2xl border border-border bg-card text-card-foreground shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-600 font-bold">
                  Bandwidth Engineering
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-foreground mt-0.5">
                  {isAm ? 'ለምን ከ15 KB በታች የሆነ ገጽ አስፈለገ?' : 'Why an Ultra-Lightweight <15 KB Route?'}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isAm
                    ? 'በክልሎችና በገጠር አካባቢዎች የኢንተርኔት ግንኙነት ሲቋረጥም አገልግሎቱ ሳይቋረጥ ይቀጥላል።'
                    : 'Ethio Telecom 2G/3G connections drop heavy modern SPAs. BridgeMate guarantees zero downtime.'}
                </p>
              </div>

              {/* Interactive Toggle */}
              <div className="inline-flex p-1 rounded-lg bg-muted border border-border text-xs font-semibold shrink-0">
                <button
                  onClick={() => setActiveBandwidthView('low')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${activeBandwidthView === 'low'
                      ? 'bg-card text-emerald-600 shadow-xs border border-border font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  BridgeMate 2G (&lt;15 KB)
                </button>
                <button
                  onClick={() => setActiveBandwidthView('standard')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${activeBandwidthView === 'standard'
                      ? 'bg-card text-foreground shadow-xs border border-border font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  Standard App (3+ MB)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                <div className="text-[11px] text-muted-foreground font-mono">
                  {isAm ? 'የፋይል መጠን' : 'Payload Size'}
                </div>
                <div className={`text-xl font-black mt-0.5 font-mono ${activeBandwidthView === 'low' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {activeBandwidthView === 'low' ? '12.4 KB' : '3,240 KB'}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {activeBandwidthView === 'low' ? '99.6% less data' : 'Heavy bundle'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                <div className="text-[11px] text-muted-foreground font-mono">
                  {isAm ? 'የ2G መጫኛ ጊዜ' : '2G Load Time'}
                </div>
                <div className={`text-xl font-black mt-0.5 font-mono ${activeBandwidthView === 'low' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {activeBandwidthView === 'low' ? '0.4s' : '18.5s (Timeout)'}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {activeBandwidthView === 'low' ? 'Instant SSR' : 'Frequent dropouts'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                <div className="text-[11px] text-muted-foreground font-mono">
                  {isAm ? 'ከመስመር ውጭ ድጋፍ' : 'Offline Fallback'}
                </div>
                <div className="text-xl font-black text-primary mt-0.5 font-mono">
                  {activeBandwidthView === 'low' ? 'SMS Callback' : 'Web Only'}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {activeBandwidthView === 'low' ? 'Zero-internet fallback' : 'Fails offline'}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-border">
              <span className="text-xs text-muted-foreground">
                {isAm
                  ? 'ቀላል ገጹ ያለ ጃቫስክሪፕት በየትኛውም የሞባይል አሳሽ ይከፈታል።'
                  : 'Works on legacy feature-phones, Opera Mini, and low-connectivity browsers.'}
              </span>
              <Link href="/low-bandwidth">
                <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 text-xs">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{isAm ? 'ቀላል ገጹን ይክፈቱ' : 'Open 2G Route'}</span>
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION: ETHICS & SOCIAL MODEL */}
        <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-border/60">
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 text-slate-100 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>THE SOCIAL MODEL OF DISABILITY • የሰብዓዊ ተደራሽነት መርህ</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold">
              {isAm
                ? '“ማነቆው ያለው በሰውየው ላይ ሳይሆን በአካባቢው እና በቴክኖሎጂው አሠራር ላይ ነው።”'
                : '“The barrier exists in the environment and process, never in the person.”'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              {isAm
                ? 'ብሪጅሜት የተገነባው በማህበራዊ ሞዴል መርህ መሠረት ነው። ማንኛውንም ተጠቃሚ የግል የህክምና ምርመራ ወይም የበሽታ ታሪክ አንጠይቅም፤ አናከማችምም። የእኛ ተልዕኮ በሥራ ማስታወቂያዎች፣ በመማሪያ መድረኮች እና በመገናኛ ዘዴዎች ውስጥ ያሉትን እንቅፋቶች በማስወገድ እኩል የሥራ ዕድል መፍጠር ነው።'
                : 'BridgeMate operates strictly under the Social Model of Disability. We never solicit or store private medical diagnostics or impairment classifications. Our technology focuses exclusively on identifying structural and communication barriers and generating standard accommodations under Ethiopian Proclamation 1156/2019.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs">
              <div className="space-y-0.5">
                <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Zero Diagnostic Disclosure</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {isAm ? 'የግል ህክምና መረጃ አይጠየቅም' : 'No medical history collected'}
                </p>
              </div>

              <div className="space-y-0.5">
                <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ethiopian Law Grounded</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {isAm ? 'አዋጅ 1156/2019 እና 568/2008' : 'Proclamations 1156/2019 & 568/2008'}
                </p>
              </div>

              <div className="space-y-0.5">
                <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>5 Regional Languages</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {isAm ? 'አማርኛ፣ ኦሮምኛ፣ ትግርኛ፣ ሶማሊኛ፣ እንግሊዝኛ' : 'Amharic, Oromo, Tigrinya, Somali, English'}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border bg-slate-900 text-slate-300 py-8 px-4 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <span className="font-bold text-white">BridgeMate | ብሪጅሜት</span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-400">From Learning to Earning</span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-amber-400 font-mono">Track 3: Multilingual Assistant &amp; Live Help</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-slate-400">
            <Link href="/learn" className="hover:text-white transition-colors">Tutor</Link>
            <Link href="/jobs" className="hover:text-white transition-colors">Career Gateway</Link>
            <Link href="/decoder" className="hover:text-white transition-colors">Decoder</Link>
            <Link href="/translator" className="hover:text-white transition-colors">Accommodation</Link>
            <Link href="/support" className="hover:text-white transition-colors">Live Help</Link>
            <Link href="/telegram" className="hover:text-white transition-colors">Telegram</Link>
            <Link href="/low-bandwidth" className="hover:text-white transition-colors">2G Mode</Link>
            <Link href="/developers" className="hover:text-white transition-colors">APIs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
