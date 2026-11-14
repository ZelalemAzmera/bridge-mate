'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccessibility, type SupportedLanguage } from '@/hooks/use-accessibility';
import { useLiveAnnouncer } from '@/hooks/use-live-announcer';
import {
  Eye,
  EyeOff,
  Ear,
  Activity,
  Brain,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Bot,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Briefcase,
  GraduationCap,
  HeartHandshake,
  Copy,
  Check,
  Sliders,
  Send,
  ExternalLink,
} from 'lucide-react';

interface PersonaPreset {
  id: string;
  name: string;
  labelEn: string;
  labelAm: string;
  userType: 'pwd';
  disabilityType: string;
  primaryGoal: string;
  language: SupportedLanguage;
  assistiveTech: string[];
  settings: {
    highContrast: boolean;
    dyslexicFont: boolean;
    audioAssist: boolean;
    fontScale: 100 | 125 | 150 | 200;
  };
}

const PRESET_PERSONAS: PersonaPreset[] = [
  {
    id: 'abebe',
    name: 'Abebe Bikila',
    labelEn: 'Abebe • Blind Learner (Screen Reader & Audio)',
    labelAm: 'አበበ • ሙሉ ማየት የተሳነው (Screen Reader ተጠቃሚ)',
    userType: 'pwd',
    disabilityType: 'visual_blind',
    primaryGoal: 'learn_digital_skills',
    language: 'en',
    assistiveTech: ['screen_reader', 'keyboard_only', 'audio_assist'],
    settings: {
      highContrast: false,
      dyslexicFont: false,
      audioAssist: true,
      fontScale: 100,
    },
  },
  {
    id: 'yared',
    name: 'Yared Hagos',
    labelEn: 'Yared • Low Vision (High Contrast & Large Print)',
    labelAm: 'ያሬድ • በከፊል የሚያይ (ከፍተኛ ንፅፅርና ትልቅ ፊደል)',
    userType: 'pwd',
    disabilityType: 'visual_low',
    primaryGoal: 'find_accessible_jobs',
    language: 'am',
    assistiveTech: ['magnifier', 'high_contrast'],
    settings: {
      highContrast: true,
      dyslexicFont: false,
      audioAssist: false,
      fontScale: 125,
    },
  },
  {
    id: 'meron',
    name: 'Meron Alemu',
    labelEn: 'Meron • Deaf / Hard of Hearing (EthSL & Transcripts)',
    labelAm: 'ሜሮን • መስማት የተሳናት (የምልክት ቋንቋና ጽሁፍ)',
    userType: 'pwd',
    disabilityType: 'hearing_deaf',
    primaryGoal: 'request_accommodations',
    language: 'en',
    assistiveTech: ['ethsl_video', 'closed_captions', 'transcripts'],
    settings: {
      highContrast: false,
      dyslexicFont: false,
      audioAssist: false,
      fontScale: 100,
    },
  },
  {
    id: 'dawit',
    name: 'Dawit Tadesse',
    labelEn: 'Dawit • Mobility Impairment (Keyboard Only & Remote)',
    labelAm: 'ዳዊት • የእንቅስቃሴ ውስንነት (የርቀት ሥራ ፈላጊ)',
    userType: 'pwd',
    disabilityType: 'mobility_physical',
    primaryGoal: 'learn_digital_skills',
    language: 'am',
    assistiveTech: ['keyboard_only', 'ergonomic_input'],
    settings: {
      highContrast: false,
      dyslexicFont: false,
      audioAssist: false,
      fontScale: 100,
    },
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const {
    language,
    setLanguage,
    highContrast,
    toggleHighContrast,
    dyslexicFont,
    toggleDyslexicFont,
    audioAssist,
    toggleAudioAssist,
    fontScale,
    setFontScale,
  } = useAccessibility();
  const { announce } = useLiveAnnouncer();

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState<'pwd' | 'ally' | 'employer' | 'educator'>('pwd');
  const [disabilityType, setDisabilityType] = useState('visual_blind');
  const [primaryGoal, setPrimaryGoal] = useState('learn_digital_skills');
  const [assistiveTech, setAssistiveTech] = useState<string[]>(['screen_reader']);

  // Telegram integration state
  const [telegramLink, setTelegramLink] = useState('');
  const [telegramToken, setTelegramToken] = useState('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAmharic = language === 'am';

  // Apply preset persona in 1 click
  const handleSelectPreset = (preset: PersonaPreset) => {
    setFullName(preset.name);
    setUserType(preset.userType);
    setDisabilityType(preset.disabilityType);
    setPrimaryGoal(preset.primaryGoal);
    setLanguage(preset.language);
    setAssistiveTech(preset.assistiveTech);

    if (preset.settings.highContrast !== highContrast) toggleHighContrast();
    if (preset.settings.dyslexicFont !== dyslexicFont) toggleDyslexicFont();
    if (preset.settings.audioAssist !== audioAssist) toggleAudioAssist();
    setFontScale(preset.settings.fontScale);

    announce(isAmharic ? `${preset.name} መገለጫ ተመርጧል` : `Persona ${preset.name} applied`);
    setStep(4); // Advance to preview
  };

  // Automatically adapt accessibility features when disabilityType changes in step 2
  useEffect(() => {
    if (userType !== 'pwd') return;

    if (disabilityType === 'visual_blind') {
      if (!audioAssist) toggleAudioAssist();
      setAssistiveTech(['screen_reader', 'keyboard_only', 'audio_assist']);
    } else if (disabilityType === 'visual_low') {
      if (!highContrast) toggleHighContrast();
      setFontScale(125);
      setAssistiveTech(['magnifier', 'high_contrast']);
    } else if (disabilityType === 'neurodivergent_cognitive') {
      if (!dyslexicFont) toggleDyslexicFont();
      setAssistiveTech(['dyslexia_friendly', 'plain_language']);
    } else if (disabilityType === 'hearing_deaf') {
      if (audioAssist) toggleAudioAssist();
      setAssistiveTech(['ethsl_video', 'closed_captions']);
    } else if (disabilityType === 'mobility_physical') {
      setAssistiveTech(['keyboard_only']);
    }
  }, [disabilityType, userType]);

  // Save session profile and generate telegram deep-link on step 5
  const handleProceedToTelegram = async () => {
    setIsSubmitting(true);
    announce(isAmharic ? 'መገለጫዎ በመቀመጥ ላይ ነው...' : 'Saving your tailored profile...');

    try {
      // 1. Save profile to session API
      const sessionRes = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim() || (isAmharic ? 'የብሪጅሜት ተጠቃሚ' : 'BridgeMate Learner'),
          email: email.trim() || 'user@bridgemate.et',
          preferredLanguage: language,
          userType,
          disabilityType: userType === 'pwd' ? disabilityType : 'none',
          primaryGoal,
          assistiveTech,
          accessibilityPreferences: {
            screenReaderOptimized: disabilityType === 'visual_blind',
            highContrast,
            fontSizeScale: fontScale / 100,
            reducedMotion: false,
            dyslexiaFont: dyslexicFont,
          },
          onboardingCompleted: true,
        }),
      });

      // 2. Fetch telegram link token
      setIsGeneratingLink(true);
      const tokenRes = await fetch('/api/telegram/link-token');
      const tokenData = await tokenRes.json();

      if (tokenData.success) {
        setTelegramToken(tokenData.token);
        setTelegramLink(tokenData.deepLink);
      }

      setStep(5);
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
    } finally {
      setIsSubmitting(false);
      setIsGeneratingLink(false);
    }
  };

  const handleCopyLink = () => {
    if (!telegramLink) return;
    navigator.clipboard.writeText(telegramLink);
    setLinkCopied(true);
    announce(isAmharic ? 'ሊንኩ ተገልብጧል' : 'Telegram link copied');
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const finishAndGoToDashboard = () => {
    announce(isAmharic ? 'ወደ ረዳት ገጽ በማቅናት ላይ...' : 'Redirecting to your tailored dashboard...');
    router.push('/learn');
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-lg">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground mb-2">
          <span>{isAmharic ? `ደረጃ ${step} ከ 5` : `Step ${step} of 5`}</span>
          <span className="text-primary font-bold">
            {step === 1 && (isAmharic ? 'ማንነትና ስም' : 'Identity & Name')}
            {step === 2 && (isAmharic ? 'የተደራሽነት ፍላጎት' : 'Disability & Functional Need')}
            {step === 3 && (isAmharic ? 'ዋና ግብ' : 'Primary Goal')}
            {step === 4 && (isAmharic ? 'የተደራሽነት ማስተካከያ' : 'A11y Platform Tailoring')}
            {step === 5 && (isAmharic ? 'ቴሌግራም ቦት ማገናኘት' : 'Connect Telegram Bot')}
          </span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: '20%' }}
            animate={{ width: `${step * 20}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: Identity & Name */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {isAmharic ? 'እንኳን ወደ ብሪጅሜት በደህና መጡ! 🇪🇹' : 'Welcome to BridgeMate! 🇪🇹'}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {isAmharic
                  ? 'ተሞክሮዎን ለእርስዎ እንዲመች ለማድረግ መጀመሪያ ማንነትዎን እንወቅ።'
                  : 'Let\'s personalize your experience based on your background and accessibility needs.'}
              </p>
            </div>

            {/* Quick-Start Preset Personas */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2.5">
                {isAmharic ? 'ወይም በአንድ ጠቅታ የተዘጋጁ ተጠቃሚዎችን ይምረጡ (Quick Presets)' : '⚡ Quick Test Presets (1-Click Setup)'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_PERSONAS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p)}
                    className="flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:bg-muted text-left text-xs font-bold text-foreground transition-all hover:scale-[1.01] active:scale-95 cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <span>{isAmharic ? p.labelAm : p.labelEn}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0 ml-1" />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input Form */}
            <div className="space-y-4 pt-2">
              <div>
                <label htmlFor="fullname-input" className="block text-xs font-bold text-foreground mb-1">
                  {isAmharic ? 'ሙሉ ስም (Full Name)' : 'Full Name'}
                </label>
                <input
                  id="fullname-input"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={isAmharic ? 'ምሳሌ፡ አበበ ቢቂላ' : 'e.g. Abebe Bikila'}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-2">
                  {isAmharic ? 'እርስዎ ማን ነዎት? (Your Identity)' : 'Who are you?'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    {
                      id: 'pwd',
                      labelEn: 'Person with a Disability (PwD)',
                      labelAm: 'የአካል ጉዳት ያለብኝ ተጠቃሚ',
                      icon: UserCheck,
                      desc: 'Tailored screen reader, contrast, audio, and accommodation tools',
                    },
                    {
                      id: 'ally',
                      labelEn: 'Ally / Family / Advocate',
                      labelAm: 'ረዳት / ቤተሰብ / ጠበቃ',
                      icon: HeartHandshake,
                      desc: 'Supporting disabled learners and accessing legal guidance',
                    },
                    {
                      id: 'employer',
                      labelEn: 'Employer / Recruiter',
                      labelAm: 'ቀጣሪ / የሰው ኃይል ባለሙያ',
                      icon: Briefcase,
                      desc: 'Hiring inclusive talent and understanding accommodation law',
                    },
                    {
                      id: 'educator',
                      labelEn: 'Educator / TVET Instructor',
                      labelAm: 'አስተማሪ / የሙያ አሰልጣኝ',
                      icon: GraduationCap,
                      desc: 'Creating accessible curriculum and student support',
                    },
                  ].map((item) => {
                    const isSelected = userType === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setUserType(item.id as any)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-primary bg-primary/10 shadow-xs ring-2 ring-primary'
                            : 'border-border bg-card hover:bg-muted/60'
                        }`}
                        aria-pressed={isSelected}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className="font-bold text-xs text-foreground">
                            {isAmharic ? item.labelAm : item.labelEn}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-tight">
                          {item.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  if (userType === 'pwd') {
                    setStep(2);
                  } else {
                    setStep(3); // Skip disability breakdown for allies/employers
                  }
                }}
                className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs flex items-center gap-2 shadow-xs hover:bg-primary/90 cursor-pointer active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary"
              >
                <span>{isAmharic ? 'ቀጥል' : 'Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Disability / Functional Need Category */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                {isAmharic ? 'የተደራሽነትና የአካል ሁኔታዎን ይምረጡ' : 'Select Your Functional Disability Needs'}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {isAmharic
                  ? 'ይህ መረጃ ድህረ-ገጹንና የቴሌግራም ረዳቱን ለእርስዎ ምቹ ለማድረግ ብቻ ይውላል።'
                  : 'BridgeMate will calibrate contrast, fonts, screen-reader audio, and AI prompts specifically for this profile.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'visual_blind',
                  labelEn: 'Total Blindness / Screen Reader',
                  labelAm: 'ሙሉ ማየት የተሳነው (Screen Reader)',
                  icon: EyeOff,
                  desc: 'Auto-enables Audio Assist, keyboard focus rings, and NVDA/JAWS optimization',
                },
                {
                  id: 'visual_low',
                  labelEn: 'Low Vision / Partial Sight',
                  labelAm: 'በከፊል የሚያይ (Low Vision)',
                  icon: Eye,
                  desc: 'Auto-enables High Contrast theme and 125% font scale',
                },
                {
                  id: 'hearing_deaf',
                  labelEn: 'Deaf / EthSL Sign Language',
                  labelAm: 'መስማት የተሳነው (የኢትዮጵያ የምልክት ቋንቋ)',
                  icon: Ear,
                  desc: 'Visual captions, transcripts, and Ethiopian Sign Language support',
                },
                {
                  id: 'mobility_physical',
                  labelEn: 'Physical / Mobility Impairment',
                  labelAm: 'የእንቅስቃሴ / የሰውነት ውስንነት',
                  icon: Activity,
                  desc: 'Keyboard navigation, remote work focus, physical barrier decoding',
                },
                {
                  id: 'neurodivergent_cognitive',
                  labelEn: 'Neurodivergent / Dyslexia / ADHD',
                  labelAm: 'የአስተሳሰብ / የንባብ ልዩነት (Dyslexia)',
                  icon: Brain,
                  desc: 'Auto-enables OpenDyslexic font and structured plain text summaries',
                },
                {
                  id: 'speech_communication',
                  labelEn: 'Speech / Communication Limitation',
                  labelAm: 'የንግግር ውስንነት',
                  icon: MessageSquare,
                  desc: 'Text-first chat and automated written accommodation requests',
                },
              ].map((item) => {
                const isSelected = disabilityType === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDisabilityType(item.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-xs ring-2 ring-primary'
                        : 'border-border bg-card hover:bg-muted/60'
                    }`}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="font-bold text-xs text-foreground">
                        {isAmharic ? item.labelAm : item.labelEn}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-tight">
                      {item.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl border border-border text-foreground font-semibold text-xs flex items-center gap-1.5 hover:bg-muted"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isAmharic ? 'ተመለስ' : 'Back'}</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs flex items-center gap-2 shadow-xs hover:bg-primary/90 active:scale-95 transition-all"
              >
                <span>{isAmharic ? 'ቀጥል' : 'Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Primary Goal */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                {isAmharic ? 'ዋና ግብዎን ይምረጡ' : 'What is your primary goal on BridgeMate?'}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {isAmharic
                  ? 'ይህንን መሠረት በማድረግ ረዳቱ ተገቢ ትምህርቶችንና የሥራ ዕድሎችን ያቀርብልዎታል።'
                  : 'We will personalize the AI assistant prompts, quick actions, and recommendations for this track.'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  id: 'learn_digital_skills',
                  titleEn: 'Learn Tech & Programming Skills (ALX, AWS, Web Development)',
                  titleAm: 'የዲጂታልና ፕሮግራሚንግ ክህሎት መማር (ALX, AWS, ኮዲንግ)',
                  desc: 'Accessible tutor for programming logic, screen-reader shortcuts, and homework help.',
                },
                {
                  id: 'find_accessible_jobs',
                  titleEn: 'Find Inclusive Jobs & Decode Hidden Barriers',
                  titleAm: 'አካታች የሥራ ዕድሎችን ማግኘትና ማስታወቂያዎችን መመርመር',
                  desc: 'Decode job postings with /decode to uncover unstated physical demands before applying.',
                },
                {
                  id: 'request_accommodations',
                  titleEn: 'Draft Legal Accommodation Requests (Proclamations 568 & 1156)',
                  titleAm: 'ሕጋዊ የማመቻቸት ጥያቄ ደብዳቤ ማዘጋጀት (አዋጅ 568/2008 & 1156/2019)',
                  desc: 'Generate formal, non-stigmatizing letters for exam time or workplace adjustments.',
                },
                {
                  id: 'connect_human_help',
                  titleEn: 'Direct Escalation to Human Specialist Navigators',
                  titleAm: 'ከቀጥታ የሰው ድጋፍ ባለሙያ ጋር መገናኘት (1-Click Live Help)',
                  desc: 'One-click screen-sharing and zero-repetition handoff with certified navigators.',
                },
              ].map((item) => {
                const isSelected = primaryGoal === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPrimaryGoal(item.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-xs ring-2 ring-primary'
                        : 'border-border bg-card hover:bg-muted/60'
                    }`}
                    aria-pressed={isSelected}
                  >
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-foreground block">
                        {isAmharic ? item.titleAm : item.titleEn}
                      </span>
                      <span className="text-[11px] text-muted-foreground mt-0.5 block">
                        {item.desc}
                      </span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-primary shrink-0 ml-3" />}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(userType === 'pwd' ? 2 : 1)}
                className="px-4 py-2 rounded-xl border border-border text-foreground font-semibold text-xs flex items-center gap-1.5 hover:bg-muted"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isAmharic ? 'ተመለስ' : 'Back'}</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs flex items-center gap-2 shadow-xs hover:bg-primary/90 active:scale-95 transition-all"
              >
                <span>{isAmharic ? 'ቀጥል' : 'Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Live Platform Tailoring Preview */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                {isAmharic ? 'የተደራሽነት ማስተካከያዎች ለእርስዎ ተዘጋጅተዋል' : 'Platform Calibrated for Your Needs'}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {isAmharic
                  ? 'የተመረጡትን ማስተካከያዎች እዚህ መፈተሽና እንደ ፍላጎትዎ መቀየር ይችላሉ።'
                  : 'Review the settings auto-applied based on your selections. Adjust anytime via the top bar.'}
              </p>
            </div>

            {/* Live Toggles Card */}
            <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <span className="font-bold text-xs text-foreground block">
                    {isAmharic ? 'ከፍተኛ ንፅፅር (High Contrast)' : 'High Contrast Theme'}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Deep black background with sharp contrast borders
                  </span>
                </div>
                <button
                  type="button"
                  onClick={toggleHighContrast}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    highContrast ? 'bg-primary' : 'bg-muted'
                  }`}
                  aria-pressed={highContrast}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      highContrast ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <span className="font-bold text-xs text-foreground block">
                    {isAmharic ? 'ለዲስሌክሲያ ምቹ ፊደል (OpenDyslexic Font)' : 'Dyslexia-Friendly Font'}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Weighted bottom letterforms to prevent character inversion
                  </span>
                </div>
                <button
                  type="button"
                  onClick={toggleDyslexicFont}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    dyslexicFont ? 'bg-primary' : 'bg-muted'
                  }`}
                  aria-pressed={dyslexicFont}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      dyslexicFont ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <span className="font-bold text-xs text-foreground block">
                    {isAmharic ? 'የድምፅ እገዛ (Audio Assist)' : 'Audio Assist / Reading Companion'}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Amharic & English text-to-speech audio streams
                  </span>
                </div>
                <button
                  type="button"
                  onClick={toggleAudioAssist}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    audioAssist ? 'bg-primary' : 'bg-muted'
                  }`}
                  aria-pressed={audioAssist}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      audioAssist ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-foreground block">
                    {isAmharic ? 'የፊደል መጠን (Font Scale)' : 'Font Scale'}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Currently: {fontScale}%
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {[100, 125, 150].map((scale) => (
                    <button
                      key={scale}
                      type="button"
                      onClick={() => setFontScale(scale as any)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        fontScale === scale
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {scale}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2 rounded-xl border border-border text-foreground font-semibold text-xs flex items-center gap-1.5 hover:bg-muted"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isAmharic ? 'ተመለስ' : 'Back'}</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleProceedToTelegram}
                className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs flex items-center gap-2 shadow-xs hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                <span>{isSubmitting ? (isAmharic ? 'በማስቀመጥ ላይ...' : 'Saving...') : (isAmharic ? 'መገለጫዬን አጽድቅና ቀጥል' : 'Confirm & Connect Telegram')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 5: Telegram Mobile Deep Link & Launch */}
        {step === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 text-center"
          >
            <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-500/20 shadow-sm">
              <Bot className="w-9 h-9" />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                {isAmharic ? 'አካውንትዎን ከቴሌግራም ቦት ጋር ያገናኙ!' : 'Connect Your Telegram Companion!'}
              </h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mt-1.5">
                {isAmharic
                  ? 'የተዘጋጀው መገለጫዎ በቴሌግራም ላይ በራስ-ሰር እንዲሰራና 24/7 በስልክዎ የትምህርትና የሥራ ድጋፍ እንዲያገኙ ከታች ያለውን ሊንክ ይጫኑ።'
                  : 'Link your tailored profile with @BridgeMate_Assistant_Bot so you can ask real questions, decode jobs, and request live help 24/7 right from your mobile.'}
              </p>
            </div>

            {/* Single-Click Deep Link Action Box */}
            <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  {isAmharic ? 'የእርስዎ ልዩ የማገናኛ ሊንክ (Single-Use Deep Link)' : 'Your Secure Linking Token'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
                  Ready to Connect
                </span>
              </div>

              {/* One-Click Direct Telegram Launch Button */}
              {telegramLink && (
                <a
                  href={telegramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-[0.98] shadow-md cursor-pointer"
                >
                  <Bot className="w-4 h-4" />
                  <span>{isAmharic ? 'በቴሌግራም ክፈትና አገናኝ (Open in Telegram)' : 'Open in Telegram & Connect Profile'}</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </a>
              )}

              {/* Copyable Link Fallback */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  readOnly
                  value={telegramLink || 'Generating link...'}
                  className="flex-1 px-3 py-2 text-xs font-mono rounded-lg border border-border bg-background text-foreground"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  {linkCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{linkCopied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Continue to Web Dashboard Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={finishAndGoToDashboard}
                className="w-full py-3 rounded-xl border border-border hover:bg-muted font-bold text-xs text-foreground transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <span>{isAmharic ? 'ወደ ድህረ-ገጹ ረዳት ይቀጥሉ (Go to Web Assistant)' : 'Continue to Web Dashboard (/learn)'}</span>
                <ArrowRight className="w-4 h-4 text-primary" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
