'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Briefcase,
  Scale,
  Hand,
  Sliders,
  Eye,
  FileText,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useAccessibility } from '@/hooks/use-accessibility';
import { useLiveAnnouncer } from '@/hooks/use-live-announcer';

// Pre-grounded Knowledge Database
interface KnowledgeItem {
  id: string;
  category: 'curriculum' | 'jobs' | 'legal' | 'accessibility' | 'platform';
  titleEn: string;
  titleAm: string;
  summaryEn: string;
  summaryAm: string;
  detailsEn: string;
  detailsAm: string;
  citation: string;
  link?: string;
  keywords: string[];
  signConcepts: Array<{
    term: string;
    termAm: string;
    gestureDesc: string;
    movementVector: string;
    handShape: 'flat' | 'fist' | 'c-shape' | 'open-5' | 'pointing' | 'two-hands';
    regionalNote: string;
  }>;
}

const KNOWLEDGE_BASE: KnowledgeItem[] = [
  {
    id: 'kb-va-future',
    category: 'curriculum',
    titleEn: 'What is Shaping the Future of Virtual Assistant (VA) Work?',
    titleAm: 'የቨርቹዋል አሲስታንት (VA) ሥራ የወደፊት ሁኔታ ምን ይመስላል?',
    summaryEn: 'AI automation (ChatGPT, Copilot) is elevating client expectations: clients now seek VAs who operate AI tools with human judgment and empathy.',
    summaryAm: 'የአርቴፊሻል ኢንተለጀንስ መሳሪያዎች የተለመዱ ስራዎችን እያቀለሉ ሲሆን ደንበኞች የሰውኛ ግንዛቤና የቴክኖሎጂ ክህሎት ያላቸውን ባለሙያዎች ይፈልጋሉ።',
    detailsEn: 'To stay competitive, build a T-shaped skill set: broad digital tool competencies combined with specialized domain expertise (e.g. data analysis, project management, technical communication).',
    detailsAm: 'ተወዳዳሪ ለመሆን የT-ቅርጽ ክህሎት ይገንቡ፦ አጠቃላይ የዲጂታል እውቀት እና የተወሰነ ጥልቅ የሙያ መስክ (ለምሳሌ የዳታ ትንተና፣ የፕሮጀክት አስተዳደር) ይያዙ።',
    citation: 'ALX Savanna — Shaping the Future of VA Work (Section 1–4)',
    link: '/learn',
    keywords: ['va', 'virtual assistant', 'ai', 'future', 'work', 'savanna', 'curriculum', 'career', 'chatgpt'],
    signConcepts: [
      {
        term: 'WORK / JOB',
        termAm: 'ሥራ',
        gestureDesc: 'Both fists tapped together at the wrists, dominant hand tapping base fist twice.',
        movementVector: 'Downward rhythmic strike (2x)',
        handShape: 'fist',
        regionalNote: 'Standard Ethiopian Sign Language (EthSL) sign for general labor and tech profession.',
      },
      {
        term: 'COMPUTER / AI',
        termAm: 'ኮምፒውተር / ኤአይ',
        gestureDesc: 'Dominant "C" handshape arcs across the forehead or palm, symbolizing screen scanning.',
        movementVector: 'Horizontal arc left to right',
        handShape: 'c-shape',
        regionalNote: 'Universal technical sign for computing and smart digital interfaces.',
      },
      {
        term: 'LEARN / GROW',
        termAm: 'መማር',
        gestureDesc: 'Open palm gathers knowledge from horizontal plane and brings it up to the forehead.',
        movementVector: 'Upward gathering motion towards forehead',
        handShape: 'open-5',
        regionalNote: 'Reflects absorption of curriculum skills and knowledge acquisition.',
      },
    ],
  },
  {
    id: 'kb-jobs-junior-dev',
    category: 'jobs',
    titleEn: 'Junior Software Developer (Addis Ababa / Remote)',
    titleAm: 'ጀማሪ የሶፍትዌር ገንቢ (አዲስ አበባ / የርቀት ሥራ)',
    summaryEn: 'EthioTech Solutions PLC • ETB 15,000 – 25,000/month. JavaScript, React, Node.js, and REST APIs.',
    summaryAm: 'ኢትዮቴክ ሶሉሽንስ ኃ/የተ/የግ/ማ • 15,000 – 25,000 የኢትዮጵያ ብር በወር። ጃቫስክሪፕት፣ ሪአክት፣ ኖድ ጄኤስ።',
    detailsEn: 'Accommodations provided: Screen reader compatible dev tools, flexible core hours, and 100% remote work available for candidates with mobility impairments.',
    detailsAm: 'የቀረቡ ማመቻቸቶች፦ የስክሪን አንባቢ ድጋፍ ያላቸው መሳሪያዎች፣ ምቹ የሥራ ሰዓታት፣ እና ሙሉ የርቀት የሥራ ዕድል።',
    citation: 'Career Gateway • Verified schema.org/JobPosting (job-001)',
    link: '/jobs',
    keywords: ['job', 'developer', 'react', 'javascript', 'software', 'remote', 'salary', 'junior', 'ethiopia'],
    signConcepts: [
      {
        term: 'CODE / PROGRAMMING',
        termAm: 'ኮድ መጻፍ',
        gestureDesc: 'Fingers of both hands simulate dynamic keyboard typing followed by an upward expansion.',
        movementVector: 'Rapid alternating fingertip motion',
        handShape: 'two-hands',
        regionalNote: 'EthSL modern sign for software engineering and keyboard execution.',
      },
      {
        term: 'MONEY / SALARY',
        termAm: 'ደመወዝ / ብር',
        gestureDesc: 'Thumb rubs against index and middle fingertips repeatedly, pointing toward chest.',
        movementVector: 'Circular friction between fingers',
        handShape: 'pointing',
        regionalNote: 'Ethiopian monetary sign representing monthly compensation (ETB).',
      },
      {
        term: 'REMOTE / HOME',
        termAm: 'ከርቀት / ከቤት',
        gestureDesc: 'Fingertips form an apex roof gesture, then hands extend outward showing distance.',
        movementVector: 'Peak shape moving outward',
        handShape: 'two-hands',
        regionalNote: 'Indicates telecommuting and remote accessibility accommodations.',
      },
    ],
  },
  {
    id: 'kb-legal-1156',
    category: 'legal',
    titleEn: 'Ethiopian Labor Proclamation 1156/2019 (Article 29)',
    titleAm: 'የኢትዮጵያ የአሰሪና ሠራተኛ አዋጅ ቁጥር 1156/2019 (አንቀጽ 29)',
    summaryEn: 'Guarantees the legal right to reasonable workplace accommodations without forcing private medical or diagnostic disclosure.',
    summaryAm: 'የግል የህክምና ምርመራ ውጤት ሳይጠየቅ በሥራ ቦታ ተገቢውን ማመቻቸት የማግኘት ሕጋዊ መብትን ያረጋግጣል።',
    detailsEn: 'Employers are required to adjust evaluation criteria and physical/digital workstations for qualified workers. BridgeMate auto-generates official accommodation letters under this article.',
    detailsAm: 'አሰሪዎች ለተመራጩ ሠራተኛ የፈተና እና የሥራ አካባቢን የማመቻቸት ግዴታ አለባቸው። ብሪጅሜት በዚህ አዋጅ መሠረት ደብዳቤ ያዘጋጃል።',
    citation: 'Federal Democratic Republic of Ethiopia Labor Proclamation 1156/2019 Art. 29 & 568/2008',
    link: '/translator',
    keywords: ['law', 'proclamation', '1156', '568', 'rights', 'legal', 'medical', 'disclosure', 'accommodation'],
    signConcepts: [
      {
        term: 'LAW / LEGAL RIGHT',
        termAm: 'ሕግ / መብት',
        gestureDesc: 'Open dominant "L" hand strikes upright base palm firmly like a judge’s gavel.',
        movementVector: 'Crisp vertical downward contact',
        handShape: 'flat',
        regionalNote: 'Universal and EthSL sign for constitutional and labor statutes.',
      },
      {
        term: 'EQUAL / FAIR',
        termAm: 'እኩልነት',
        gestureDesc: 'Both bent hands held horizontally at equal height, tilting in balanced harmony.',
        movementVector: 'Horizontal leveling motion',
        handShape: 'two-hands',
        regionalNote: 'Emphasizes non-discrimination and parity under Ethiopian law.',
      },
      {
        term: 'PROTECTION / SHIELD',
        termAm: 'ጥበቃ / ዋስትና',
        gestureDesc: 'Forearms cross in front of the chest with hands open, creating a defensive posture.',
        movementVector: 'Crossed arm defensive lock',
        handShape: 'flat',
        regionalNote: 'Signifies privacy protections against intrusive diagnostic inquiries.',
      },
    ],
  },
  {
    id: 'kb-a11y-screenreader',
    category: 'accessibility',
    titleEn: 'Screen Reader Navigation & NVDA / TalkBack Setup',
    titleAm: 'የስክሪን አንባቢ (NVDA / TalkBack) አጠቃቀምና መመሪያ',
    summaryEn: 'BridgeMate provides full WCAG 2.2 AA conformance: ARIA live regions, 3px visible focus rings, skip-to-content, and 200% reflow.',
    summaryAm: 'ብሪጅሜት ሙሉ የWCAG 2.2 AA ደረጃን ያሟላ ሲሆን ለNVDA እና TalkBack ምቹ የሆኑ የአቋራጭ ቁልፎችን ያካትታል።',
    detailsEn: 'Key navigation shortcuts: Press "H" for next heading, "Tab" for interactive controls, and "Alt+H" from anywhere on the platform to instantly connect with a live human tutor.',
    detailsAm: 'ዋና ዋና አቋራጮች፦ "H" ለቀጣይ ርዕስ፣ "Tab" ለአዝራሮች፣ እና "Alt+H" በማንኛውም ጊዜ በቀጥታ የሰው ድጋፍ ለማግኘት።',
    citation: 'W3C WCAG 2.2 Level AA Standard & Section 508 Guidelines',
    link: '/support',
    keywords: ['screen reader', 'nvda', 'talkback', 'accessibility', 'shortcuts', 'voice', 'audio', 'blind', 'a11y'],
    signConcepts: [
      {
        term: 'VOICE / AUDIO / LISTEN',
        termAm: 'ድምፅ / መስማት',
        gestureDesc: 'Index finger points to the ear, then hand opens outward towards the speaker/device.',
        movementVector: 'Point to ear then forward projection',
        handShape: 'pointing',
        regionalNote: 'Signifies acoustic feedback and text-to-speech output.',
      },
      {
        term: 'HELP / ASSIST',
        termAm: 'እገዛ / ድጋፍ',
        gestureDesc: 'Dominant fist with thumbs-up placed on top of flat open base palm, both hands lifted upward.',
        movementVector: 'Upward elevating lift together',
        handShape: 'two-hands',
        regionalNote: 'The classic sign for human solidarity, tutoring, and peer escalation.',
      },
    ],
  },
];

// SVG Fingerspelling Hand Glyphs (A-Z representations)
const FINGERSPELL_MAP: Record<string, { desc: string; paths: string }> = {
  A: { desc: 'Fist with thumb resting beside curled fingers', paths: 'M12 4 C9 4 7 7 7 12 C7 17 9 20 12 20 C15 20 17 17 17 12 Z M16 8 L19 11 L16 14' },
  B: { desc: 'Flat upright palm, 4 fingers straight up, thumb folded in front', paths: 'M8 20 L8 5 C8 4 9 3 10 3 C11 3 12 4 12 5 L12 20 M12 6 L14 6 C15 6 16 7 16 8 L16 20' },
  C: { desc: 'Curved hand forming a "C" arc facing sideways', paths: 'M16 6 C10 6 7 9 7 14 C7 19 10 22 16 22' },
  D: { desc: 'Index finger pointing straight up, other fingers curled touching thumb', paths: 'M10 22 L10 4 C10 3 11 2 12 2 C13 2 14 3 14 4 L14 22 M10 12 C7 12 6 15 6 18 C6 21 8 22 10 22' },
  E: { desc: 'All 4 fingers curled down touching thumb tip tightly', paths: 'M8 8 C8 6 10 5 13 5 C16 5 18 6 18 8 L8 8 M8 8 L8 18 C8 20 10 21 13 21 C16 21 18 20 18 18' },
  H: { desc: 'Index and middle fingers extended horizontally together', paths: 'M4 10 L20 10 M4 14 L20 14 M4 8 L4 16' },
  J: { desc: 'Pinky finger extended drawing a hook "J" curve in the air', paths: 'M16 4 L16 16 C16 19 14 21 11 21 C8 21 7 19 7 17' },
  L: { desc: 'Thumb and index finger form a sharp 90-degree "L" shape', paths: 'M8 4 L8 18 L18 18' },
  O: { desc: 'Fingers curved touching thumb forming an "O" loop', paths: 'M12 5 C8 5 6 8 6 13 C6 18 8 21 12 21 C16 21 18 18 18 13 C18 8 16 5 12 5 Z' },
  P: { desc: 'Index finger pointing forward, middle finger down, thumb resting between', paths: 'M7 4 L7 22 M7 5 C12 5 14 7 14 11 C14 15 12 17 7 17' },
  R: { desc: 'Index and middle fingers crossed tightly', paths: 'M9 4 L15 20 M15 4 L9 20' },
  S: { desc: 'Closed fist with thumb folded over front of knuckles', paths: 'M8 6 C8 4 10 3 13 3 C16 3 18 4 18 6 C18 9 8 11 8 15 C8 19 10 21 14 21 C17 21 18 19 18 17' },
  T: { desc: 'Thumb tucked under index finger in a closed fist', paths: 'M6 5 L18 5 M12 5 L12 21' },
  W: { desc: 'Three middle fingers straight up spread in a "W"', paths: 'M5 5 L8 20 L12 10 L16 20 L19 5' },
};

export function MultimodalSearchAssistant() {
  const { language } = useAccessibility();
  const { announce } = useLiveAnnouncer();
  const isAm = language === 'am';

  const [query, setQuery] = useState('');
  const [activeItem, setActiveItem] = useState<KnowledgeItem>(KNOWLEDGE_BASE[0]);
  const [assistMode, setAssistMode] = useState<'voice' | 'sign' | 'both'>('both');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [activeSignIndex, setActiveSignIndex] = useState<number>(0);
  const [isPlayingSignCycle, setIsPlayingSignCycle] = useState<boolean>(false);
  const [signViewType, setSignViewType] = useState<'concepts' | 'fingerspell'>('concepts');

  const { speak, stop: stopSpeaking, isSpeaking } = useSpeechSynthesis();

  // Speech Recognition Hook for Voice Search Input
  const handleVoiceInputResult = (transcript: string) => {
    if (transcript.trim()) {
      setQuery(transcript);
      announce(isAm ? `ድምፅ ተቀብሏል፡ ${transcript}` : `Voice recognized: ${transcript}`);
    }
  };

  const {
    startListening,
    stopListening,
    isListening,
    isSupported: isSpeechRecognitionSupported,
  } = useSpeechRecognition(handleVoiceInputResult);

  // Filtered Results based on search query
  const filteredResults = useMemo(() => {
    if (!query.trim()) {
      return KNOWLEDGE_BASE;
    }
    const q = query.toLowerCase().trim();
    return KNOWLEDGE_BASE.filter((item) => {
      return (
        item.titleEn.toLowerCase().includes(q) ||
        item.titleAm.toLowerCase().includes(q) ||
        item.summaryEn.toLowerCase().includes(q) ||
        item.summaryAm.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [query]);

  // When query changes, update active item if current item is no longer in results
  useEffect(() => {
    if (filteredResults.length > 0 && !filteredResults.some((i) => i.id === activeItem.id)) {
      setActiveItem(filteredResults[0]);
      setActiveSignIndex(0);
    }
  }, [filteredResults, activeItem]);

  // Auto-cycle through signs when playing
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlayingSignCycle && activeItem.signConcepts.length > 0) {
      timer = setInterval(() => {
        setActiveSignIndex((prev) => (prev + 1) % activeItem.signConcepts.length);
      }, 2600);
    }
    return () => clearInterval(timer);
  }, [isPlayingSignCycle, activeItem]);

  // Voice narration handler
  const handleVoiceReadout = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    const textToSpeak = isAm
      ? `${activeItem.titleAm}። ${activeItem.summaryAm} ${activeItem.detailsAm}`
      : `${activeItem.titleEn}. ${activeItem.summaryEn} ${activeItem.detailsEn}`;

    speak(textToSpeak, isAm ? 'am' : 'en');
    announce(isAm ? 'የድምፅ ንባብ ተጀምሯል' : 'Voice readout started');
  };

  // Keyboard shortcut listener ('/' to focus search)
  const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || (e.ctrlKey && e.key === 'k')) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
        announce(isAm ? 'ፍለጋ ሳጥኑ ተመርጧል' : 'Search focused');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [announce, isAm]);

  // Current active sign concept
  const currentSign = activeItem.signConcepts[activeSignIndex] || activeItem.signConcepts[0];

  // Letters for fingerspelling demonstration
  const spellLetters = useMemo(() => {
    const word = (currentSign?.term || 'WORK').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 6);
    return word.split('');
  }, [currentSign]);

  return (
    <section
      aria-labelledby="multimodal-search-heading"
      className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--border-default)]"
    >
      {/* SECTION HEADER: Editorial, Distinctive & Purposeful */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm text-xs font-mono font-bold bg-[var(--brand-secondary)] text-[var(--brand-primary)] border border-[#C5D5C4]">
            <Sparkles className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
            <span>MULTIMODAL INTELLIGENCE • ድምፅና የምልክት ቋንቋ ረዳት</span>
          </div>
          <h2
            id="multimodal-search-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-[var(--text-primary)] leading-tight"
          >
            {isAm ? 'ፈልጉ፦ በድምፅ ወይም በምልክት ቋንቋ እገዛ ያግኙ' : 'Search Anything: Voice & Sign Language Assistance'}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
            {isAm
              ? 'የትምህርት ይዘትን፣ የቴክኖሎጂ ሥራ ማስታወቂያዎችን፣ የኢትዮጵያን የሕግ መብቶች ወይም የተደራሽነት መመሪያዎችን ይፈልጉ። ምላሹን በንባብ ድምፅ ወይም በእውነተኛ የእጅ ምልክት ትርጉም ይቀበሉ።'
              : 'Ask anything across ALX curriculum concepts, Ethiopian tech jobs, legal accommodations under Proclamation 1156/2019, or accessibility navigation.'}
          </p>
        </div>

        {/* Mode Selector Tabs (Voice | Sign | Both) */}
        <div
          role="tablist"
          aria-label={isAm ? 'የእገዛ ዓይነት መምረጫ' : 'Assistance Mode Selector'}
          className="inline-flex p-1 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-md text-xs font-bold shrink-0 self-start md:self-end"
        >
          <button
            role="tab"
            aria-selected={assistMode === 'both'}
            onClick={() => setAssistMode('both')}
            className={`px-3 py-1.5 rounded-sm transition-all cursor-pointer flex items-center gap-1.5 ${
              assistMode === 'both'
                ? 'bg-[var(--brand-primary)] text-[var(--brand-neutral)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
            <span>{isAm ? 'ሁለቱም (Dual)' : 'Dual Assist'}</span>
          </button>

          <button
            role="tab"
            aria-selected={assistMode === 'voice'}
            onClick={() => setAssistMode('voice')}
            className={`px-3 py-1.5 rounded-sm transition-all cursor-pointer flex items-center gap-1.5 ${
              assistMode === 'voice'
                ? 'bg-[var(--brand-primary)] text-[var(--brand-neutral)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
            <span>{isAm ? 'ድምፅ (Voice)' : 'Voice Mode'}</span>
          </button>

          <button
            role="tab"
            aria-selected={assistMode === 'sign'}
            onClick={() => setAssistMode('sign')}
            className={`px-3 py-1.5 rounded-sm transition-all cursor-pointer flex items-center gap-1.5 ${
              assistMode === 'sign'
                ? 'bg-[var(--brand-primary)] text-[var(--brand-neutral)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Hand className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
            <span>{isAm ? 'የምልክት ቋንቋ (Sign)' : 'Sign Interpreter'}</span>
          </button>
        </div>
      </div>

      {/* SEARCH INPUT BAR */}
      <div className="relative mb-6">
        <div className="relative flex items-center">
          <div className="absolute left-4 text-[var(--text-secondary)] pointer-events-none">
            <Search className="w-5 h-5 text-[var(--brand-primary)]" />
          </div>

          <input
            ref={searchInputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isAm
                ? 'ማንኛውንም ነገር ይፈልጉ (ለምሳሌ፡ የሥራ ማስታወቂያ፣ አዋጅ 1156፣ ቨርቹዋል አሲስታንት፣ ስክሪን አንባቢ)...'
                : 'Search curriculum concepts, Ethiopian tech jobs, legal protections, or accommodations... (Press /)'
            }
            aria-label={isAm ? 'የመድረክ ፍለጋ' : 'Search platform knowledge'}
            className="w-full pl-12 pr-28 py-3.5 text-sm sm:text-base bg-[var(--bg-surface)] border-2 border-[var(--border-input)] rounded-md text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus-visible:border-[var(--brand-primary)] focus-visible:outline-none transition-colors"
          />

          {/* Quick Clear Button */}
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-14 p-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              aria-label={isAm ? 'ፍለጋ አጽዳ' : 'Clear search'}
            >
              ✕
            </button>
          )}

          {/* Microphone Voice Search Button */}
          {isSpeechRecognitionSupported && (
            <button
              type="button"
              onClick={() => {
                if (isListening) {
                  stopListening();
                } else {
                  startListening(isAm ? 'am-ET' : 'en-US');
                }
              }}
              title={isListening ? 'Stop recording voice' : 'Search with your voice'}
              aria-label={isListening ? 'ድምፅ መቅዳት አቁም' : 'በድምፅ ይፈልጉ'}
              className={`absolute right-2 px-3 py-2 rounded-sm text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-[var(--brand-secondary)] text-[var(--brand-primary)] hover:bg-[#CCDACC]'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span className="hidden sm:inline">Listening...</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-[var(--brand-primary)]" />
                  <span className="hidden sm:inline">Voice</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs">
          <span className="text-[var(--text-secondary)] font-mono text-[11px] font-bold">
            {isAm ? 'ምሳሌዎች፡' : 'Suggested topics:'}
          </span>
          {[
            { label: isAm ? 'የVA የወደፊት ሁኔታ' : 'Future of VA Work', q: 'virtual assistant' },
            { label: isAm ? 'ጀማሪ ሶፍትዌር ገንቢ' : 'Junior Developer Jobs', q: 'junior software developer' },
            { label: isAm ? 'የሠራተኛ አዋጅ 1156' : 'Labor Law Art. 29', q: '1156' },
            { label: isAm ? 'ስክሪን አንባቢ (NVDA)' : 'Screen Reader Guide', q: 'screen reader' },
          ].map((tag) => (
            <button
              key={tag.q}
              type="button"
              onClick={() => setQuery(tag.q)}
              className="px-2.5 py-1 rounded-sm bg-[var(--bg-subtle)] hover:bg-[var(--brand-secondary)]/50 text-[var(--text-primary)] border border-[var(--border-default)] transition-colors cursor-pointer"
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* ASYMMETRICAL EDITORIAL WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Grounded Answer & Retrieval Dossier (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Query Results Selector Bar */}
          <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-2 text-xs font-mono text-[var(--text-secondary)]">
            <span className="font-bold text-[var(--text-primary)]">
              {isAm
                ? `የተገኙ ውጤቶች (${filteredResults.length})`
                : `Matched Findings (${filteredResults.length})`}
            </span>
            <span className="text-[11px]">
              {isAm ? 'ንጥል ይምረጡ' : 'Select topic to inspect'}
            </span>
          </div>

          {/* Quick Result Selector Pills */}
          <div className="flex flex-wrap gap-1.5 pb-2">
            {filteredResults.map((item) => {
              const isSelected = item.id === activeItem.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveItem(item);
                    setActiveSignIndex(0);
                    if (isSpeaking) stopSpeaking();
                  }}
                  className={`px-3 py-1.5 rounded-sm text-xs font-semibold text-left transition-colors cursor-pointer border ${
                    isSelected
                      ? 'bg-[var(--brand-primary)] text-[var(--brand-neutral)] border-[var(--brand-primary)] shadow-xs font-bold'
                      : 'bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-default)] hover:bg-[var(--brand-secondary)]/30'
                  }`}
                >
                  {isAm ? item.titleAm : item.titleEn}
                </button>
              );
            })}
          </div>

          {/* ACTIVE DOSSIER CARD: Editorial & High Contrast */}
          <div className="p-6 rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-[var(--brand-secondary)] text-[var(--brand-primary)] border border-[#C5D5C4]">
                {activeItem.category.toUpperCase()}
              </span>
              <span className="text-xs font-mono text-[var(--text-secondary)]">
                {activeItem.citation}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text-primary)] leading-snug">
              {isAm ? activeItem.titleAm : activeItem.titleEn}
            </h3>

            {/* Editorial Summary Box */}
            <div className="p-4 rounded-sm bg-[var(--bg-canvas)] border-l-4 border-[var(--brand-primary)] text-sm sm:text-base leading-relaxed text-[var(--text-primary)]">
              <p className="font-medium">
                {isAm ? activeItem.summaryAm : activeItem.summaryEn}
              </p>
            </div>

            {/* Extended Actionable Detail */}
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {isAm ? activeItem.detailsAm : activeItem.detailsEn}
            </p>

            {/* Audio Controller Toolbar (Inside Dossier) */}
            {(assistMode === 'voice' || assistMode === 'both') && (
              <div className="p-3.5 rounded-sm bg-[var(--bg-subtle)] border border-[var(--border-default)] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleVoiceReadout}
                    className={`font-bold text-xs gap-1.5 ${
                      isSpeaking
                        ? 'bg-[#8A2525] text-white hover:bg-[#721C1C]'
                        : 'bg-[var(--brand-primary)] text-[var(--brand-neutral)] hover:bg-[#0E1E1B]'
                    }`}
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-4 h-4" />
                        <span>{isAm ? 'ንባብ አቁም' : 'Stop Narration'}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 text-[var(--brand-accent)]" />
                        <span>{isAm ? 'ድምፅ አሰማ' : 'Listen with Voice'}</span>
                      </>
                    )}
                  </Button>

                  {/* Soundwave animation when actively reading */}
                  {isSpeaking && (
                    <div className="flex items-center gap-0.5 px-2 text-[var(--brand-primary)]" aria-label="Audio streaming">
                      <span className="w-1 bg-[var(--brand-primary)] rounded-full animate-wave-1 h-3" />
                      <span className="w-1 bg-[var(--brand-primary)] rounded-full animate-wave-2 h-5" />
                      <span className="w-1 bg-[var(--brand-primary)] rounded-full animate-wave-3 h-2" />
                      <span className="w-1 bg-[var(--brand-primary)] rounded-full animate-wave-4 h-4" />
                      <span className="w-1 bg-[var(--brand-primary)] rounded-full animate-wave-5 h-2" />
                    </div>
                  )}
                </div>

                {/* Speed Toggle */}
                <div className="flex items-center gap-1 text-xs font-mono text-[var(--text-secondary)]">
                  <span>{isAm ? 'ፍጥነት፡' : 'Speed:'}</span>
                  {[0.8, 1.0, 1.25].map((speed) => (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`px-2 py-0.5 rounded-sm cursor-pointer ${
                        playbackSpeed === speed
                          ? 'bg-[var(--brand-primary)] text-[var(--brand-neutral)] font-bold'
                          : 'bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--brand-secondary)]/30'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Link to Gateway / Support */}
            {activeItem.link && (
              <div className="pt-2 flex items-center justify-between border-t border-[var(--border-default)]">
                <span className="text-xs text-[var(--text-secondary)] font-mono">
                  {isAm ? 'ቀጣይ እርምጃ' : 'Official Portal Integration'}
                </span>
                <Link href={activeItem.link}>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold">
                    <span>{isAm ? 'ወደ ዋና ገጽ ሂድ' : 'Open in Platform'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Ethiopian & Universal Sign Language Interpreter Stage (5 Cols) */}
        {(assistMode === 'sign' || assistMode === 'both') && (
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-md border border-[var(--border-default)] bg-[var(--brand-primary)] text-[var(--brand-neutral)] space-y-4 shadow-sm">
              {/* Stage Top Bar */}
              <div className="flex items-center justify-between border-b border-[#24453F] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-sm bg-[var(--brand-accent)] text-[var(--brand-primary)] flex items-center justify-center font-bold">
                    <Hand className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-sm block leading-tight text-[var(--brand-neutral)]">
                      {isAm ? 'የምልክት ቋንቋ አጋዥ' : 'Sign Language Interpreter'}
                    </span>
                    <span className="text-[10px] text-[var(--brand-secondary)] font-mono block">
                      Ethiopian Sign Language (EthSL) &amp; Universal ASL
                    </span>
                  </div>
                </div>

                {/* Sub-mode toggle: Concept gestures vs Fingerspelling */}
                <div className="inline-flex p-0.5 bg-[#0C1B18] rounded-sm text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setSignViewType('concepts')}
                    className={`px-2 py-1 rounded-xs cursor-pointer ${
                      signViewType === 'concepts'
                        ? 'bg-[var(--brand-accent)] text-[var(--brand-primary)] font-bold'
                        : 'text-[var(--brand-secondary)] hover:text-white'
                    }`}
                  >
                    {isAm ? 'ፅንሰ-ሃሳብ' : 'Concepts'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignViewType('fingerspell')}
                    className={`px-2 py-1 rounded-xs cursor-pointer ${
                      signViewType === 'fingerspell'
                        ? 'bg-[var(--brand-accent)] text-[var(--brand-primary)] font-bold'
                        : 'text-[var(--brand-secondary)] hover:text-white'
                    }`}
                  >
                    {isAm ? 'ፊደላት' : 'Fingerspell'}
                  </button>
                </div>
              </div>

              {/* VIEW 1: CONCEPT GESTURE CARDS */}
              {signViewType === 'concepts' ? (
                <div className="space-y-4">
                  {/* Visual Sign Display Canvas */}
                  <div className="p-4 rounded-sm bg-[#0E1E1B] border border-[#24453F] space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[var(--brand-accent)] font-bold">
                        GESTURE {activeSignIndex + 1} OF {activeItem.signConcepts.length}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-[#1A332E] text-[var(--brand-secondary)] border border-[#2E524A]">
                        {currentSign.handShape.toUpperCase()}
                      </span>
                    </div>

                    {/* Central Artistic Gesture Glyph / Illustration */}
                    <div className="py-6 px-4 bg-[#142622] rounded-sm border border-[#23423B] flex flex-col items-center justify-center text-center space-y-2">
                      <div className="w-16 h-16 rounded-sm bg-[var(--brand-accent)]/15 border border-[var(--brand-accent)]/30 flex items-center justify-center text-[var(--brand-accent)] mb-1">
                        <Hand className="w-8 h-8" />
                      </div>
                      <div className="text-lg font-bold text-[var(--brand-neutral)] tracking-wide">
                        {currentSign.term}
                      </div>
                      <div className="text-xs font-ethiopic text-[var(--brand-accent)] font-bold">
                        {currentSign.termAm}
                      </div>
                    </div>

                    {/* Physical Gesture Description */}
                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--brand-secondary)] block">
                        {isAm ? 'የእጅ አቀማመጥና እንቅስቃሴ፦' : 'Handshape & Movement Vector:'}
                      </span>
                      <p className="text-[var(--brand-neutral)] leading-relaxed font-sans bg-[#13231F] p-2.5 rounded-sm border border-[#223F39]">
                        {currentSign.gestureDesc}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-[var(--brand-accent)] pt-1">
                        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                        <span>{currentSign.movementVector}</span>
                      </div>
                    </div>

                    {/* Ethiopian Sign Context Note */}
                    <p className="text-[11px] text-[var(--brand-secondary)] font-mono pt-1 border-t border-[#223E38]">
                      🇪🇹 {currentSign.regionalNote}
                    </p>
                  </div>

                  {/* Sign Concept Selector Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {activeItem.signConcepts.map((sign, idx) => (
                      <button
                        key={sign.term}
                        type="button"
                        onClick={() => {
                          setActiveSignIndex(idx);
                          setIsPlayingSignCycle(false);
                        }}
                        className={`px-2.5 py-1 rounded-sm text-xs font-semibold cursor-pointer border ${
                          idx === activeSignIndex
                            ? 'bg-[var(--brand-accent)] text-[var(--brand-primary)] border-[var(--brand-accent)] font-bold shadow-xs'
                            : 'bg-[#142622] text-[var(--brand-secondary)] border-[#24453F] hover:bg-[#1E3832]'
                        }`}
                      >
                        {sign.term}
                      </button>
                    ))}
                  </div>

                  {/* Sequencer Controls: Auto-Play cycle through all gestures */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#24453F] text-xs">
                    <Button
                      size="sm"
                      onClick={() => setIsPlayingSignCycle(!isPlayingSignCycle)}
                      className={`text-xs font-bold gap-1.5 min-h-[36px] ${
                        isPlayingSignCycle
                          ? 'bg-[var(--brand-accent)] text-[var(--brand-primary)]'
                          : 'bg-[#18332D] text-[var(--brand-neutral)] hover:bg-[#20423A] border border-[#2D564C]'
                      }`}
                    >
                      {isPlayingSignCycle ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>{isAm ? 'አፍታ አቁም' : 'Pause Cycle'}</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                          <span>{isAm ? 'ሁሉንም ምልክቶች አሳይ' : 'Play Sign Sequence'}</span>
                        </>
                      )}
                    </Button>

                    <button
                      type="button"
                      onClick={() => setActiveSignIndex(0)}
                      className="text-[11px] text-[var(--brand-secondary)] hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{isAm ? 'ከመጀመሪያ' : 'Reset'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* VIEW 2: VISUAL FINGERSPELLING CARDS (Letter-by-Letter SVG) */
                <div className="space-y-4">
                  <div className="p-3 bg-[#0E1E1B] rounded-sm border border-[#24453F] space-y-2">
                    <span className="text-[11px] font-mono text-[var(--brand-secondary)] block">
                      {isAm ? 'የፊደላት ቆጠራ (Fingerspelling Keyword):' : 'Spelling Keyword in Manual Alphabet:'}
                    </span>
                    <div className="text-xl font-mono font-black text-[var(--brand-accent)] tracking-widest">
                      {currentSign?.term || 'WORK'}
                    </div>
                  </div>

                  {/* Letter Cards Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {spellLetters.map((char, index) => {
                      const glyph = FINGERSPELL_MAP[char] || FINGERSPELL_MAP['A'];
                      return (
                        <div
                          key={`${char}-${index}`}
                          className="p-2.5 rounded-sm bg-[#132521] border border-[#23423B] flex flex-col items-center justify-center text-center space-y-1.5"
                        >
                          <span className="text-xs font-mono font-bold text-[var(--brand-accent)]">
                            {char}
                          </span>
                          <svg
                            className="w-10 h-10 text-[var(--brand-neutral)] stroke-current fill-none stroke-2"
                            viewBox="0 0 24 24"
                            aria-label={`Fingerspelling letter ${char}`}
                          >
                            <path d={glyph.paths} strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span className="text-[9px] text-[var(--brand-secondary)] line-clamp-2 leading-tight">
                            {glyph.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-[11px] text-[var(--brand-secondary)] font-mono leading-relaxed pt-1">
                    {isAm
                      ? 'የኢትዮጵያ የምልክት ቋንቋ ፊደላት ከዓለም አቀፉ የማኑዋል ፊደል (Manual Alphabet) ጋር የተጣጣሙ ናቸው።'
                      : 'Fingerspelling breaks down technical terms, acronyms, and proper nouns letter-by-letter.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
