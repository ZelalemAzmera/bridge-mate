'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAccessibility } from '@/hooks/use-accessibility';
import { useLiveAnnouncer } from '@/hooks/use-live-announcer';
import { LogIn, ArrowRight } from 'lucide-react';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/learn';
  const { language } = useAccessibility();
  const { announce } = useLiveAnnouncer();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isAmharic = language === 'am';

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    announce(isAmharic ? 'በመግባት ላይ...' : 'Signing in...');

    try {
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: email.split('@')[0] || 'BridgeMate Learner',
          email: email || 'learner@bridgemate.et',
          preferredLanguage: language,
          userType: 'pwd',
          disabilityType: 'visual_blind',
          primaryGoal: 'learn_digital_skills',
          onboardingCompleted: true,
        }),
      });

      router.push(redirectUrl);
    } catch {
      setIsLoading(false);
    }
  };

  const handleQuickPersonaSignIn = async (persona: {
    name: string;
    email: string;
    disabilityType: string;
    primaryGoal: string;
  }) => {
    setIsLoading(true);
    announce(isAmharic ? `${persona.name} በመግባት ላይ...` : `Signing in as ${persona.name}...`);

    try {
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: persona.name,
          email: persona.email,
          preferredLanguage: language,
          userType: 'pwd',
          disabilityType: persona.disabilityType,
          primaryGoal: persona.primaryGoal,
          onboardingCompleted: true,
        }),
      });

      router.push(redirectUrl);
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-lg space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
          <LogIn className="w-6 h-6 text-primary" />
          <span>{isAmharic ? 'ወደ ብሪጅሜት ይግቡ' : 'Sign In to BridgeMate'}</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isAmharic
            ? 'ወደ ተዘጋጀው የተደራሽነትና የትምህርት መገለጫዎ ለመግባት መረጃዎን ያስገቡ።'
            : 'Access your tailored learning tracks, accommodation letters, and Telegram companion.'}
        </p>
      </div>

      {/* 1-Click Quick Persona Logins */}
      <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2.5">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
          {isAmharic ? '⚡ ፈጣን መግቢያ በናሙና መገለጫዎች (1-Click Test Personas)' : '⚡ Instant Test Sign-In (1-Click)'}
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            {
              name: 'Abebe Bikila',
              email: 'abebe@bridgemate.et',
              labelEn: 'Abebe (Blind / Screen Reader)',
              labelAm: 'አበበ (Screen Reader)',
              disabilityType: 'visual_blind',
              primaryGoal: 'learn_digital_skills',
            },
            {
              name: 'Yared Hagos',
              email: 'yared@bridgemate.et',
              labelEn: 'Yared (Low Vision / Contrast)',
              labelAm: 'ያሬድ (ከፍተኛ ንፅፅር)',
              disabilityType: 'visual_low',
              primaryGoal: 'find_accessible_jobs',
            },
            {
              name: 'Meron Alemu',
              email: 'meron@bridgemate.et',
              labelEn: 'Meron (Deaf / EthSL)',
              labelAm: 'ሜሮን (የምልክት ቋንቋ)',
              disabilityType: 'hearing_deaf',
              primaryGoal: 'request_accommodations',
            },
            {
              name: 'Dawit Tadesse',
              email: 'dawit@bridgemate.et',
              labelEn: 'Dawit (Mobility Impairment)',
              labelAm: 'ዳዊት (የርቀት ሥራ)',
              disabilityType: 'mobility_physical',
              primaryGoal: 'learn_digital_skills',
            },
          ].map((persona) => (
            <button
              key={persona.email}
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickPersonaSignIn(persona)}
              className="flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:bg-muted text-left text-xs font-bold text-foreground transition-all hover:scale-[1.01] active:scale-95 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <span>{isAmharic ? persona.labelAm : persona.labelEn}</span>
              <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Form Sign-In */}
      <form onSubmit={handleSignIn} className="space-y-4">
        <div>
          <label htmlFor="signin-email" className="block text-xs font-bold text-foreground mb-1">
            {isAmharic ? 'ኢሜይል ወይም ስልክ (Email or Phone)' : 'Email or Phone'}
          </label>
          <input
            id="signin-email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="signin-password" className="block text-xs font-bold text-foreground mb-1">
            {isAmharic ? 'የይለፍ ቃል ወይም ፒን (Password / PIN)' : 'Password or PIN'}
          </label>
          <input
            id="signin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-sm hover:bg-primary/90 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (isAmharic ? 'በመግባት ላይ...' : 'Signing in...') : (isAmharic ? 'ይግቡ' : 'Sign In')}
        </button>
      </form>

      {/* Link to Onboarding / Register */}
      <div className="pt-2 text-center text-xs text-muted-foreground">
        <span>{isAmharic ? 'አዲስ ተጠቃሚ ነዎት? ' : 'New to BridgeMate? '}</span>
        <Link href="/onboarding" className="text-primary font-bold hover:underline">
          {isAmharic ? 'መገለጫዎን ያብጁና ይመዝገቡ (Onboarding)' : 'Start Personalized Onboarding →'}
        </Link>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading sign-in...</div>}>
      <SignInForm />
    </Suspense>
  );
}
