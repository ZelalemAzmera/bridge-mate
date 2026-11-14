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
    <div className="w-full max-w-4xl mx-auto rounded-2xl border border-border bg-card text-card-foreground shadow-lg overflow-hidden transition-all duration-200">
      {/* Top Window Chrome / Bar */}
      <div className="px-4 py-3 bg-slate-900 text-slate-100 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-xs font-mono text-slate-400 pl-2 border-l border-slate-700">
            bridgemate-runtime-v2.et
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>WCAG 2.2 AA Verified</span>
          </span>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="grid grid-cols-3 bg-muted/60 border-b border-border p-1.5 gap-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col md:flex-row items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-card text-foreground shadow-xs border border-border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
              }`}
              role="tab"
              aria-selected={isActive}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              <div className="text-center md:text-left truncate">
                <div className="font-bold truncate">{tab.labelAm}</div>
                <div className="text-[10px] text-muted-foreground hidden sm:block truncate">{tab.labelEn}</div>
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
              <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border">
                <span className="flex items-center gap-1 font-mono">
                  <BookOpen className="w-3.5 h-3.5 text-primary" />
                  Course: ALX Full-Stack Python • Module 3 (Accessibility)
                </span>
                <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-0.5 rounded font-mono text-[11px]">
                  RAG Citation Active
                </span>
              </div>

              {/* Chat Exchange */}
              <div className="space-y-3">
                <div className="flex justify-end">
                  <div className="bg-primary text-primary-foreground max-w-[85%] rounded-2xl rounded-tr-xs px-4 py-2.5 text-sm shadow-xs">
                    <p className="font-medium font-ethiopic">
                      በኢትዮጵያ ሕግ መሠረት የአካል ጉዳተኛ ተማሪ የፈተና ጊዜ ማራዘሚያ መጠየቅ መብቱ ነው?
                    </p>
                    <span className="text-[10px] opacity-80 block text-right mt-1">10:42 AM</span>
                  </div>
                </div>

                <div className="flex justify-start items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-primary flex items-center justify-center shrink-0 border border-blue-200 font-bold text-xs">
                    BM
                  </div>
                  <div className="bg-muted max-w-[88%] rounded-2xl rounded-tl-xs p-4 text-sm border border-border shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        የተረጋገጠ የሥርዓተ-ትምህርትና የሕግ ምላሽ
                      </span>
                      <button
                        onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 bg-card px-2 py-1 rounded border border-border cursor-pointer active:scale-95 transition-all"
                        aria-label="ድምፅ አጫውት"
                      >
                        <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'text-primary animate-pulse' : ''}`} />
                        <span>{isPlayingAudio ? 'በማጫወት ላይ...' : 'ድምፅ (TTS)'}</span>
                      </button>
                    </div>

                    <p className="font-ethiopic text-foreground leading-relaxed">
                      አዎ! በአዋጅ ቁጥር <strong>1156/2019</strong> እና <strong>568/2008</strong> መሠረት፣ 
                      የትምህርት ተቋማት እና አሰሪዎች ለአካል ጉዳተኞች ምክንያታዊ ማመቻቸት (Reasonable Accommodation) 
                      የማድረግ ግዴታ አለባቸው። ይህም የተጨማሪ ፈተና ጊዜ ማግኘት፣ የኮምፒውተር ስክሪን አንባቢ (Screen Reader) መጠቀምን ያካትታል።
                    </p>

                    <div className="pt-2 border-t border-border/80 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-mono text-muted-foreground">ምንጭ / Citations:</span>
                      <span className="bg-card text-foreground px-2 py-0.5 rounded text-[11px] border border-border font-mono flex items-center gap-1">
                        <FileText className="w-3 h-3 text-primary" />
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
