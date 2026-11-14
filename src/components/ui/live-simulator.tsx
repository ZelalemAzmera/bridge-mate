'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  FileSearch,
  Headphones,
  CheckCircle2,
  AlertTriangle,
  Send,
  Volume2,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Radio,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type SimulatorTab = 'learn' | 'decode' | 'support';

export function LiveSimulator() {
  const [activeTab, setActiveTab] = useState<SimulatorTab>('learn');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [decodedState, setDecodedState] = useState(false);

  const tabs = [
    {
      id: 'learn' as SimulatorTab,
      labelAm: '1. የትምህርት ረዳት',
      labelEn: 'Bilingual AI Tutor',
      icon: BookOpen,
      badge: 'Savannah LMS RAG',
    },
    {
      id: 'decode' as SimulatorTab,
      labelAm: '2. ዕድል መፍቻ',
      labelEn: 'Barrier Decoder',
      icon: FileSearch,
      badge: 'Law 1156/2019',
    },
    {
      id: 'support' as SimulatorTab,
      labelAm: '3. የሰው ድጋፍ (Alt+H)',
      labelEn: 'Live Escalation',
      icon: Headphones,
      badge: 'Zero Context Loss',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm overflow-hidden transition-all duration-200">
      {/* Top Window Chrome / Bar */}
      <div className="px-4 py-3 bg-[var(--brand-primary)] text-[var(--brand-neutral)] flex items-center justify-between border-b border-[#25433D]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--brand-accent)] inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--brand-secondary)] inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--brand-neutral)] inline-block" />
          </div>
          <span className="text-xs font-mono text-[var(--brand-secondary)] pl-2 border-l border-[#2E524A]">
            bridgemate-runtime-v2.et
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-[var(--brand-accent)] bg-[#0C1B18] px-2 py-0.5 rounded-sm border border-[#23453F]">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>WCAG 2.2 AA Verified</span>
          </span>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="grid grid-cols-3 bg-[var(--bg-subtle)] border-b border-[var(--border-default)] p-1.5 gap-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col md:flex-row items-center justify-center gap-2 px-3 py-2.5 rounded-sm text-xs md:text-sm font-semibold transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-[var(--brand-primary)] text-[var(--brand-neutral)] shadow-xs font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--brand-secondary)]/30'
              }`}
              role="tab"
              aria-selected={isActive}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[var(--brand-accent)]' : 'text-[var(--text-secondary)]'}`} />
              <div className="text-center md:text-left truncate">
                <div className="font-bold truncate">{tab.labelAm}</div>
                <div className="text-[10px] opacity-80 hidden sm:block truncate">{tab.labelEn}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Panes */}
      <div className="p-4 md:p-6 min-h-[320px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {activeTab === 'learn' && (
            <motion.div
              key="learn"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Context Pill */}
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] pb-2 border-b border-[var(--border-default)]">
                <span className="flex items-center gap-1 font-mono">
                  <BookOpen className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                  Course: ALX Full-Stack Python • Module 3 (Accessibility)
                </span>
                <span className="bg-[var(--brand-secondary)] text-[var(--brand-primary)] px-2 py-0.5 rounded-sm font-mono text-[11px] font-bold border border-[#C5D5C4]">
                  RAG Citation Active
                </span>
              </div>

              {/* Chat Exchange */}
              <div className="space-y-3">
                <div className="flex justify-end">
                  <div className="bg-[var(--brand-primary)] text-[var(--brand-neutral)] max-w-[85%] rounded-md px-4 py-2.5 text-sm shadow-xs">
                    <p className="font-medium font-ethiopic">
                      በኢትዮጵያ ሕግ መሠረት የአካል ጉዳተኛ ተማሪ የፈተና ጊዜ ማራዘሚያ መጠየቅ መብቱ ነው?
                    </p>
                    <span className="text-[10px] text-[var(--brand-secondary)] block text-right mt-1">10:42 AM</span>
                  </div>
                </div>

                <div className="flex justify-start items-start gap-2.5">
                  <div className="w-8 h-8 rounded-sm bg-[var(--brand-secondary)] text-[var(--brand-primary)] flex items-center justify-center shrink-0 border border-[#C5D5C4] font-bold text-xs">
                    BM
                  </div>
                  <div className="bg-[var(--bg-canvas)] max-w-[88%] rounded-md p-4 text-sm border border-[var(--border-default)] shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--brand-primary)] flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                        የተረጋገጠ የሥርዓተ-ትምህርትና የሕግ ምላሽ
                      </span>
                      <button
                        onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                        className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 bg-[var(--bg-surface)] px-2 py-1 rounded-sm border border-[var(--border-default)] cursor-pointer active:scale-95 transition-all"
                        aria-label="ድምፅ አጫውት"
                      >
                        <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'text-[var(--brand-accent)] animate-pulse' : ''}`} />
                        <span>{isPlayingAudio ? 'በማጫወት ላይ...' : 'ድምፅ (TTS)'}</span>
                      </button>
                    </div>

                    <p className="font-ethiopic text-[var(--text-primary)] leading-relaxed">
                      አዎ! በአዋጅ ቁጥር <strong>1156/2019</strong> እና <strong>568/2008</strong> መሠረት፣ 
                      የትምህርት ተቋማት እና አሰሪዎች ለአካል ጉዳተኞች ምክንያታዊ ማመቻቸት (Reasonable Accommodation) 
                      የማድረግ ግዴታ አለባቸው። ይህም የተጨማሪ ፈተና ጊዜ ማግኘት፣ የኮምፒውተር ስክሪን አንባቢ (Screen Reader) መጠቀምን ያካትታል።
                    </p>

                    <div className="pt-2 border-t border-[var(--border-default)] flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-mono text-[var(--text-secondary)]">ምንጭ / Citations:</span>
                      <span className="bg-[var(--bg-surface)] text-[var(--text-primary)] px-2 py-0.5 rounded-sm text-[11px] border border-[var(--border-default)] font-mono flex items-center gap-1">
                        <FileText className="w-3 h-3 text-[var(--brand-accent)]" />
                        Ethiopian_Labour_Proclamation_1156_2019.pdf (Art. 29)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Banner */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Try asking in Amharic, Afaan Oromo, Tigrinya, Somali, or English.
                </span>
                <Link href="/learn">
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                    <span>ሙሉውን ረዳት ክፈት / Open Assistant</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}

          {activeTab === 'decode' && (
            <motion.div
              key="decode"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border">
                <span className="flex items-center gap-1 font-mono">
                  <FileSearch className="w-3.5 h-3.5 text-amber-600" />
                  Opportunity Barrier Diagnostic Tool
                </span>
                <span className="text-xs bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 px-2 py-0.5 rounded font-mono text-[11px]">
                  Proclamation 568/2008 & 1156/2019
                </span>
              </div>

              {/* Notice Snippet */}
              <div className="p-3.5 rounded-lg bg-muted/70 border border-border text-xs space-y-1 font-mono">
                <div className="text-muted-foreground text-[10px] uppercase tracking-wider font-bold">
                  ተንታኝ ናሙና / Sample Job Notice from Telegram Vacancy Channel:
                </div>
                <div className="text-foreground font-sans text-sm italic">
                  &ldquo;Junior Remote Software Associate — Addis Ababa. Requirements: Must have perfect uncorrected 20/20 vision, full physical mobility to handle server equipment on 4th floor non-elevator office, and fast typing speed.&rdquo;
                </div>
              </div>

              {/* Decoder Output */}
              {!decodedState ? (
                <div className="py-4 text-center">
                  <Button
                    onClick={() => setDecodedState(true)}
                    className="gap-2 bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>ማነቆዎችን ፈትሽ / Decode Functional Barriers</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="p-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900/50 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <strong className="text-red-900 dark:text-red-200 font-bold block">
                        ያልተገለጸ የስሜት ህዋሳት ማነቆ / Sensory Requirement
                      </strong>
                      <span className="text-red-800 dark:text-red-300">
                        &quot;20/20 vision&quot; ለሶፍትዌር ሥራ አያስፈልግም። በስክሪን አንባቢ (Screen Reader) ወይም አጉሊ መነጽር ማከናወን ይቻላል።
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900/50 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <strong className="text-red-900 dark:text-red-200 font-bold block">
                        የአካላዊ ተደራሽነት ማነቆ / Physical Mobility Barrier
                      </strong>
                      <span className="text-red-800 dark:text-red-300">
                        &quot;4th floor non-elevator office&quot; ዊልቸር ለሚጠቀሙ ሠራተኞች እንቅፋት ነው። የርቀት ሥራ (Remote work) ወይም የ1ኛ ፎቅ ቢሮ ማመቻቸት ይገባል።
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900/50 flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-emerald-900 dark:text-emerald-200 font-bold block">
                          የተዘጋጀ የሕግ ማመቻቸት ደብዳቤ / Pre-filled Accommodation Draft
                        </strong>
                        <span className="text-emerald-800 dark:text-emerald-300">
                          የኢትዮጵያ አሰሪና ሠራተኛ አዋጅ 1156/2019 አንቀጽ 29 የተጠቀሰበት ማመልከቻ ተዘጋጅቷል።
                        </span>
                      </div>
                    </div>
                    <Link href="/translator">
                      <Button size="sm" variant="default" className="text-xs shrink-0">
                        ደብዳቤ አዘጋጅ &rarr;
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Paste any Ethiopian job vacancy or upload PDF to analyze hidden barriers.
                </span>
                <Link href="/decoder">
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                    <span>ወደ መመርመሪያው ሂድ / Go to Decoder</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}

          {activeTab === 'support' && (
            <motion.div
              key="support"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border">
                <span className="flex items-center gap-1 font-mono">
                  <Headphones className="w-3.5 h-3.5 text-primary" />
                  Live Human Escalation • WebRTC Screen Sharing
                </span>
                <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded font-mono text-[11px]">
                  Queue Position: #1 (Ready)
                </span>
              </div>

              {/* Hand-off summary preview */}
              <div className="p-4 rounded-xl border border-border bg-muted/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      የድጋፍ ሰጪ ግንኙነት / Facilitator Available (Addis Ababa Tech Hub)
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground">Alt + H</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded bg-card border border-border">
                    <div className="text-[10px] text-muted-foreground uppercase font-bold">የአውድ ማስተላለፊያ / Preserved Context:</div>
                    <div className="font-medium text-foreground mt-0.5 truncate">
                      Python Module 3 Quiz + Barrier Accommodation
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-card border border-border">
                    <div className="text-[10px] text-muted-foreground uppercase font-bold">የተጠቃሚ ቁጥጥር / User Consent:</div>
                    <div className="font-medium text-emerald-600 mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Learner-Controlled Screen Share
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  አጋዥ ሠራተኛው የእርስዎን ስክሪን የሚያየው እርስዎ ግልጽ ፈቃድ (Affirmative Consent) ሲሰጡ ብቻ ነው። 
                  ማንኛውም የግል መረጃ አይቀረጽም፤ በማንኛውም ሰከንድ ማቆም ይችላሉ።
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Instant escalation across Web, Widget, and Telegram Bot.
                </span>
                <Link href="/support">
                  <Button size="sm" variant="default" className="gap-1.5 text-xs bg-primary">
                    <span>ቀጥታ ድጋፍ ጀምር / Connect Live Help</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
