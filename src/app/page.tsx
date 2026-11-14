'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Headphones,
  Briefcase,
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
      title: isAm ? 'የማመቻቸት ጥያቄ የማቅረብ ፍርሃትና ጭንቀት' : 'Pre-Hire Accommodation Anxiety',
      problem: isAm
        ? 'ሥራ ፈላጊዎች አካል ጉዳተኝነታቸውን ቢናገሩ ከቅጥር ውድድር ውጭ ሊደረጉ እንደሚችሉ በመስጋት ማመቻቸት ሳይጠይቁ ይቀራሉ።'
        : 'Jobseekers fear pre-hire stigma, leading them to withhold reasonable accommodation requests and struggle during technical evaluations.',
      solution: isAm
        ? 'የግል የህክምና መረጃ ሳይገለጽ፣ በኢትዮጵያ አዋጅ 1156/2019 አንቀጽ 29 መሠረት የተዘጋጀ ሕጋዊ የማመቻቸት ደብዳቤ ያዘጋጃል።'
        : 'Automated legal letter generation citing Ethiopian Labor Proclamation 1156/2019 (Art. 29) with zero diagnostic disclosure.',
    },
    {
      id: '03',
      law: 'WCAG 2.2 Level AA',
      title: isAm ? 'የስክሪን አንባቢ እና የሀገር ውስጥ ቋንቋ ተደራሽነት ማጣት' : 'Screen Reader & Regional Language Gaps',
      problem: isAm
        ? 'አብዛኛዎቹ የኤአይ ቻትቦቶች በአማርኛ፣ በኦሮምኛ ወይም በትግርኛ ትክክለኛ የሥርዓተ-ትምህርትና የሕግ ምላሽ አይሰጡም።'
        : 'Generic chatbots hallucinate on Ethiopian regional languages and fail basic screen-reader accessibility tests.',
      solution: isAm
        ? 'በተረጋገጠ ሥርዓተ-ትምህርት ላይ የተመሠረተ RAG በ5 ቋንቋዎች (አማርኛ፣ ኦሮምኛ፣ ትግርኛ፣ ሶማሊኛ ከነ-RTL፣ እንግሊዝኛ) ይመልሳል።'
        : 'Grounded RAG retriever operating across Amharic, Afaan Oromo, Tigrinya, Somali (with native RTL), and English.',
    },
    {
      id: '04',
      law: 'Ethio Telecom 2G Resilient',
      title: isAm ? 'የኢንተርኔት መቆራረጥ እና ከፍተኛ የዳታ ወጪ' : 'Bandwidth Dropouts & High Data Costs',
      problem: isAm
        ? 'ዘመናዊ የድር ገጾች ከ3MB በላይ ዳታ ስለሚፈልጉ በ2G/3G ፍጥነት ለመክፈት አስቸጋሪ ናቸው።'
        : 'Heavy client-side web applications (>3MB) fail to load over 2G/3G connections in regional Ethiopian hubs.',
      solution: isAm
        ? 'ከ15KB በታች የሆነ እጅግ ቀላል የጽሑፍ ገጽ (/low-bandwidth) እና የቴሌግራም/ኤስኤምኤስ ማሳወቂያዎች ተዘጋጅተዋል።'
        : 'Ultra-lightweight 12.4 KB server-rendered route (/low-bandwidth) and resilient SMS callback notifications.',
    },
    {
      id: '05',
      law: 'Social Model of Disability',
      title: isAm ? 'የኤአይ የተሳሳተ ምላሽ እና የሰው እገዛ ማጣት' : 'Automated AI Dead Ends & Hallucinations',
      problem: isAm
        ? 'ተጠቃሚው በኤአይ ምላሽ ግራ ሲጋባ ወይም ቴክኒካዊ ችግር ሲገጥመው የሚያግዘው ሰው አያገኝም።'
        : 'Generic automated chatbots leave learners stranded when automated answers fail or when nuanced accommodations are needed.',
      solution: isAm
        ? 'በ1-ጠቅታ (Alt+H) የአውድ መረጃ ሳይጠፋ በቀጥታ ወደ ሰው አጋዥ የሚያስተላልፍ የዌብአርቲሲ ስክሪን ሼሪንግ።'
        : 'Zero-repetition escalation to human support navigators with WebRTC learner-controlled screen sharing.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors duration-200">
      <SkipLink />
      <LiveAnnouncer />
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

              {/* Direct Action Entryways */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/learn">
                  <Button size="lg" className="gap-2 font-bold min-h-[46px]">
                    <BookOpen className="w-4 h-4 text-[var(--brand-accent)]" />
                    <span>{isAm ? 'የትምህርት ረዳቱን ክፈት' : 'Open Curriculum Tutor'}</span>
                  </Button>
                </Link>

                <Link href="/jobs">
                  <Button variant="outline" size="lg" className="gap-2 font-bold min-h-[46px]">
                    <Briefcase className="w-4 h-4 text-[var(--brand-primary)]" />
                    <span>{isAm ? 'የሥራ በር (Career Gateway)' : 'Career Gateway'}</span>
                  </Button>
                </Link>

                <Link href="/support">
                  <Button variant="accent" size="lg" className="gap-2 min-h-[46px]">
                    <Headphones className="w-4 h-4" />
                    <span>{isAm ? 'የሰው ድጋፍ (Alt+H)' : 'Live Help (Alt+H)'}</span>
                  </Button>
                </Link>
              </div>

              {/* Trust Ledger */}
              <div className="pt-4 border-t border-[var(--border-default)] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono text-[var(--text-secondary)]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                  <span>WCAG 2.2 AA</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                  <span>Savanna Static</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                  <span>Proclamation 1156</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                  <span>2G / SMS Resilient</span>
                </div>
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

        {/* SECTION 2: MULTIMODAL SEARCH & ASSISTANT (Voice & Sign Language) */}
        <MultimodalSearchAssistant />

        {/* SECTION 3: THE THREE ARCHITECTURAL ENTRYWAYS */}
        <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--border-default)]">
          <div className="max-w-3xl mb-10 space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--brand-accent)] font-bold">
              {isAm ? 'የሥነ-ሕንጻ አሠራር' : 'Track 3 Core Architecture'}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-[var(--text-primary)]">
              {isAm ? 'ሶስቱ የተደራሽነት በሮች' : 'The Three Gateways to Opportunity'}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] font-sans">
              {isAm
                ? 'በማንኛውም መሣሪያ፣ የሃርድዌር አቅም እና የኢንተርኔት ፍጥነት ተደራሽ የሚሆን ሁለገብ ሥርዓት።'
                : 'Engineered so no learner or jobseeker is locked out by device limitations, visual impairment, or regional connectivity.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {entryways.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.num}
                  className="rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 flex flex-col justify-between space-y-6 shadow-xs hover:border-[var(--brand-primary)] transition-colors"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
                      <span className="font-mono text-2xl font-black text-[var(--brand-primary)]">
                        {item.num}
                      </span>
                      <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-sm bg-[var(--brand-secondary)] text-[var(--brand-primary)] border border-[#C5D5C4]">
                        {item.meta}
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-sm bg-[var(--brand-primary)] text-[var(--brand-neutral)] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[var(--brand-accent)]" />
                    </div>

                    <div>
                      <h3 className="text-lg font-serif font-bold text-[var(--text-primary)]">
                        {item.title}
                      </h3>
                      <span className="text-xs text-[var(--text-secondary)] font-mono block mt-0.5">
                        {item.category}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                      {item.description}
                    </p>

                    <ul className="space-y-1.5 pt-2 border-t border-[var(--border-default)]">
                      {item.highlights.map((h, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-[var(--text-primary)]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link href={item.href}>
                    <Button variant="outline" size="sm" className="w-full justify-between text-xs font-bold">
                      <span>{isAm ? 'ይመልከቱ' : 'Launch Gateway'}</span>
                      <ChevronRight className="w-4 h-4 text-[var(--brand-accent)]" />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 4: GROUNDED ETHIOPIAN REALITY (5 BARRIERS AS A LEGAL LEDGER) */}
        <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--border-default)] bg-[var(--bg-subtle)]">
          <div className="max-w-3xl mb-10 space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--brand-primary)] font-bold">
              {isAm ? 'ተጨባጭ ችግሮች' : 'Grounded In Ethiopian Reality'}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-[var(--text-primary)]">
              {isAm ? 'የገቢ ማነቆዎች እና የብሪጅሜት መፍትሔዎች' : 'The 5 Employment Barriers & System Interventions'}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] font-sans">
              {isAm
                ? 'አካል ጉዳተኛ ተማሪዎች ከትምህርት ወደ ሥራ በሚሸጋገሩበት ጊዜ የሚያጋጥሟቸው 5ቱ ዋና ዋና እንቅፋቶች እና ሕጋዊ መፍትሔዎቻቸው።'
                : 'Why qualified candidates with disabilities drop out before hiring, and how BridgeMate systematically eliminates each barrier.'}
            </p>
          </div>

          <div className="space-y-4">
            {barriers.map((barrier) => (
              <div
                key={barrier.id}
                className="p-5 sm:p-6 rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] grid grid-cols-1 md:grid-cols-12 gap-4 items-start shadow-xs"
              >
                {/* Ledger Number & Legal Header */}
                <div className="md:col-span-3 space-y-1 border-b md:border-b-0 md:border-r border-[var(--border-default)] pb-3 md:pb-0 md:pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded-sm bg-[var(--brand-primary)] text-[var(--brand-neutral)]">
                      BARRIER #{barrier.id}
                    </span>
                  </div>
                  <h3 className="text-base font-serif font-bold text-[var(--text-primary)] mt-1.5 leading-snug">
                    {barrier.title}
                  </h3>
                  <span className="text-[11px] font-mono text-[var(--text-secondary)] block">
                    {barrier.law}
                  </span>
                </div>

                {/* Problem Statement */}
                <div className="md:col-span-4 p-3.5 rounded-sm bg-[#FAF6F3] border border-[#EBDDD5] text-xs leading-relaxed text-[#5C2B1D]">
                  <strong className="block text-[10px] uppercase font-mono tracking-wider font-bold text-[#7A3420] mb-1">
                    {isAm ? 'ማነቆው (The Barrier):' : 'The Structural Barrier:'}
                  </strong>
                  {barrier.problem}
                </div>

                {/* Solution Statement */}
                <div className="md:col-span-5 p-3.5 rounded-sm bg-[var(--brand-secondary)]/40 border border-[#C5D5C4] text-xs leading-relaxed text-[var(--brand-primary)]">
                  <strong className="block text-[10px] uppercase font-mono tracking-wider font-bold text-[var(--brand-primary)] mb-1">
                    {isAm ? 'የብሪጅሜት መፍትሔ:' : 'BridgeMate Intervention:'}
                  </strong>
                  {barrier.solution}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: BANDWIDTH ENGINEERING BENCHMARK */}
        <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-[var(--border-default)]">
          <div className="p-6 sm:p-8 rounded-md border-2 border-[var(--brand-primary)] bg-[var(--bg-surface)] space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-wider text-[var(--brand-accent)] font-bold">
                  Bandwidth Engineering &amp; 2G Telemetry
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-black text-[var(--text-primary)]">
                  {isAm ? 'ለምን ከ15 KB በታች የሆነ ገጽ አስፈለገ?' : 'Why an Ultra-Lightweight <15 KB Route?'}
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  {isAm
                    ? 'በክልሎችና በገጠር አካባቢዎች የኢንተርኔት ግንኙነት ሲቋረጥም አገልግሎቱ ሳይቋረጥ ይቀጥላል።'
                    : 'Ethio Telecom 2G/3G connections frequently drop heavy SPAs. BridgeMate guarantees zero downtime.'}
                </p>
              </div>

              {/* View Switcher */}
              <div className="inline-flex p-1 rounded-sm bg-[var(--bg-subtle)] border border-[var(--border-default)] text-xs font-bold shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveBandwidthView('low')}
                  className={`px-3 py-1.5 rounded-xs transition-all cursor-pointer ${
                    activeBandwidthView === 'low'
                      ? 'bg-[var(--brand-primary)] text-[var(--brand-neutral)] font-bold shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  BridgeMate 2G (&lt;15 KB)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveBandwidthView('standard')}
                  className={`px-3 py-1.5 rounded-xs transition-all cursor-pointer ${
                    activeBandwidthView === 'standard'
                      ? 'bg-[var(--brand-primary)] text-[var(--brand-neutral)] font-bold shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Standard App (3+ MB)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-sm bg-[var(--bg-canvas)] border border-[var(--border-default)]">
                <div className="text-[11px] text-[var(--text-secondary)] font-mono">
                  {isAm ? 'የፋይል መጠን' : 'Payload Size'}
                </div>
                <div className={`text-2xl font-black mt-1 font-mono ${activeBandwidthView === 'low' ? 'text-[var(--brand-primary)]' : 'text-red-700'}`}>
                  {activeBandwidthView === 'low' ? '12.4 KB' : '3,240 KB'}
                </div>
                <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                  {activeBandwidthView === 'low' ? '99.6% less data' : 'Heavy bundle timeout'}
                </div>
              </div>

              <div className="p-4 rounded-sm bg-[var(--bg-canvas)] border border-[var(--border-default)]">
                <div className="text-[11px] text-[var(--text-secondary)] font-mono">
                  {isAm ? 'የ2G መጫኛ ጊዜ' : '2G Network Latency'}
                </div>
                <div className={`text-2xl font-black mt-1 font-mono ${activeBandwidthView === 'low' ? 'text-[var(--brand-primary)]' : 'text-red-700'}`}>
                  {activeBandwidthView === 'low' ? '0.4s' : '18.5s (Drop)'}
                </div>
                <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                  {activeBandwidthView === 'low' ? 'Instant SSR render' : 'Frequent TCP drops'}
                </div>
              </div>

              <div className="p-4 rounded-sm bg-[var(--bg-canvas)] border border-[var(--border-default)]">
                <div className="text-[11px] text-[var(--text-secondary)] font-mono">
                  {isAm ? 'ከመስመር ውጭ ድጋፍ' : 'Offline Fallback'}
                </div>
                <div className="text-2xl font-black text-[var(--brand-accent)] mt-1 font-mono">
                  {activeBandwidthView === 'low' ? 'SMS Callback' : 'Web Only'}
                </div>
                <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                  {activeBandwidthView === 'low' ? 'Zero-internet fallback' : 'Fails offline'}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[var(--border-default)]">
              <span className="text-xs text-[var(--text-secondary)]">
                {isAm
                  ? 'ቀላል ገጹ ያለ ጃቫስክሪፕት በየትኛውም የሞባይል አሳሽ ይከፈታል።'
                  : 'Works on legacy feature-phones, Opera Mini, and low-connectivity browsers.'}
              </span>
              <Link href="/low-bandwidth">
                <Button size="sm" variant="secondary" className="gap-1.5 shrink-0 text-xs font-bold">
                  <Smartphone className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                  <span>{isAm ? 'ቀላል ገጹን ይክፈቱ' : 'Open 2G Mode (<15 KB)'}</span>
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 6: SOCIAL MODEL MANIFESTO */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--border-default)]">
          <div className="p-8 sm:p-10 rounded-md bg-[var(--brand-primary)] text-[var(--brand-neutral)] space-y-6">
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--brand-accent)]">
              <ShieldCheck className="w-4 h-4" />
              <span>THE SOCIAL MODEL OF DISABILITY • የሰብዓዊ ተደራሽነት መርህ</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-[var(--brand-neutral)] leading-tight max-w-4xl">
              {isAm
                ? '“ማነቆው ያለው በሰውየው ላይ ሳይሆን በአካባቢው እና በቴክኖሎጂው አሠራር ላይ ነው።”'
                : '“The disability exists in the environment and process, never in the person.”'}
            </h2>

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
            <Link href="/developers" className="hover:text-[var(--brand-neutral)] transition-colors">APIs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
