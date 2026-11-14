'use client';

import React, { useState } from 'react';
import { 
  GraduationCap, 
  Layers, 
  Key, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink, 
  Laptop, 
  ShieldCheck, 
  FileCheck,
  RefreshCw
} from 'lucide-react';

interface LmsOption {
  id: string;
  name: string;
  issuer: string;
  courseTitle: string;
  courseId: string;
  learnerName: string;
  learnerEmail: string;
}

const LMS_OPTIONS: LmsOption[] = [
  {
    id: 'savannah',
    name: 'ALX Savannah (Official Partner LMS)',
    issuer: 'https://savannah.alxafrica.com',
    courseTitle: 'ALX Software Engineering 2026',
    courseId: 'alx-swe-cohort-2026',
    learnerName: 'ዳዊት ታደሰ (Dawit Tadesse)',
    learnerEmail: 'dawit.t@alxstudent.et',
  },
  {
    id: 'canvas',
    name: 'Instructure Canvas LMS',
    issuer: 'https://canvas.instructure.com',
    courseTitle: 'Introduction to Web Accessibility (WAI-ARIA)',
    courseId: 'canvas-wai-2026',
    learnerName: 'Bethlehem Alemu',
    learnerEmail: 'b.alemu@university.edu.et',
  },
  {
    id: 'moodle',
    name: 'Moodle Open LMS',
    issuer: 'https://moodle.aau.edu.et',
    courseTitle: 'Computer Science Department: Data Structures',
    courseId: 'aau-cs-301',
    learnerName: 'ዮናስ ሃይሌ (Yonas Haile)',
    learnerEmail: 'yonas.h@aau.edu.et',
  },
];

export default function LmsSimulatorPage() {
  const [selectedLms, setSelectedLms] = useState<LmsOption>(LMS_OPTIONS[0]);
  const [step, setStep] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [oidcResult, setOidcResult] = useState<any>(null);
  const [launchResult, setLaunchResult] = useState<any>(null);
  const [gradeResult, setGradeResult] = useState<any>(null);
  const [gradeScore, setGradeScore] = useState<number>(95);

  const handleSimulateOidc = async () => {
    setIsProcessing(true);
    setOidcResult(null);
    setLaunchResult(null);
    setGradeResult(null);

    try {
      const res = await fetch('/api/lti/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          iss: selectedLms.issuer,
          login_hint: selectedLms.learnerEmail,
          client_id: 'bridgemate-lti-client',
          target_link_uri: typeof window !== 'undefined' ? `${window.location.origin}/api/lti/launch` : '',
        }),
      });
      const data = await res.json();
      setOidcResult(data);
      setStep(2);
    } catch (err: any) {
      alert(`OIDC initiation failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulateLaunch = async () => {
    setIsProcessing(true);
    try {
      // Fetch sample token or trigger launch
      const tokenRes = await fetch('/api/lti/launch');
      const tokenData = await tokenRes.json();

      const launchRes = await fetch('/api/lti/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_token: tokenData.testToken,
          state: oidcResult?.state || 'state-1234',
        }),
      });

      const launchData = await launchRes.json();
      setLaunchResult(launchData);
      setStep(3);
    } catch (err: any) {
      alert(`Launch failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitGrade = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/lti/gradebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: launchResult?.user?.id || 'user-alx-8823',
          scoreGiven: gradeScore,
          scoreMaximum: 100,
          comment: `Accommodated assessment completed successfully via BridgeMate. Score: ${gradeScore}%`,
        }),
      });
      const data = await res.json();
      setGradeResult(data);
    } catch (err: any) {
      alert(`Gradebook passback failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-700/60 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 md:p-8 shadow-xl">
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Door 3: Level 3 LTI 1.3 LMS Interoperability</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            1EdTech LTI 1.3 Core Advantage LMS Simulator
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Test seamless Single Sign-On (SSO), cryptographic RSA-SHA256 token verification, course context extraction, and <strong>Assignment & Grade Services (AGS)</strong> passback without requiring an external Canvas server setup.
          </p>

          <div className="pt-2 flex flex-wrap gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-sky-400">
              <ShieldCheck className="w-4 h-4" />
              <span>JWKS Endpoint: <code className="text-slate-300 font-mono">/api/lti/jwks</code></span>
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Zero Separate Logins Required for Students</span>
            </span>
          </div>
        </div>
      </div>

      {/* Interactive LMS Chooser & 3-Step Handshake */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Platform Selection */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            1. Select LMS Platform
          </h2>

          <div className="space-y-2.5">
            {LMS_OPTIONS.map((lms) => {
              const isSelected = selectedLms.id === lms.id;
              return (
                <button
                  key={lms.id}
                  onClick={() => {
                    setSelectedLms(lms);
                    setStep(1);
                    setOidcResult(null);
                    setLaunchResult(null);
                    setGradeResult(null);
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-slate-800/95 border-emerald-500/60 ring-1 ring-emerald-500/40 shadow-lg'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-emerald-400 font-bold">{lms.name}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white">{lms.courseTitle}</h3>
                  <div className="mt-2 text-xs text-slate-400 space-y-0.5">
                    <p>Learner: <span className="text-slate-200">{lms.learnerName}</span></p>
                    <p className="font-mono text-[11px] text-slate-500">{lms.issuer}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
            <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5 text-sky-400" />
              <span>Deep Linking & Context Extraction</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When an ALX student clicks an assignment link in Savannah, BridgeMate automatically ingests their course ID, assignment prompt, and language preference without asking them to register again.
            </p>
          </div>
        </div>

        {/* Right: Step-by-Step Interactive Handshake Trace */}
        <div className="lg:col-span-8 space-y-5">
          {/* Step 1: OIDC Login Initiation */}
          <section className="rounded-xl border border-slate-700/80 bg-slate-900/90 p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step >= 1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  1
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">Step 1: OIDC Login Initiation</h3>
                  <p className="text-xs text-slate-400">LMS dispatches initiation request to BridgeMate (/api/lti/login)</p>
                </div>
              </div>

              <button
                onClick={handleSimulateOidc}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 text-xs font-semibold transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Trigger OIDC Login</span>
              </button>
            </div>

            {oidcResult && (
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 space-y-1 overflow-x-auto">
                <p className="text-slate-400">HTTP 200 OK — Redirect Target Generated:</p>
                <p className="text-slate-200 truncate">{oidcResult.authRedirectUrl}</p>
                <div className="text-slate-500 text-[11px] pt-1">
                  Nonce: {oidcResult.nonce} • State: {oidcResult.state}
                </div>
              </div>
            )}
          </section>

          {/* Step 2: LTI 1.3 Launch with Signed RSA Token */}
          <section className="rounded-xl border border-slate-700/80 bg-slate-900/90 p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step >= 2 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  2
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">Step 2: Resource Link Launch & JWT Signature Check</h3>
                  <p className="text-xs text-slate-400">Validate signed RSA-SHA256 ID Token and establish course session</p>
                </div>
              </div>

              <button
                onClick={handleSimulateLaunch}
                disabled={step < 2 || isProcessing}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-slate-950 text-xs font-semibold transition-colors"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Verify & Launch</span>
              </button>
            </div>

            {launchResult && (
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>LTI 1.3 JWT Authenticated Successfully</span>
                  </span>
                  <span className="text-slate-400 font-mono">{launchResult.sessionToken}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400 block">Authenticated Student:</span>
                    <strong className="text-white block">{launchResult.user?.name}</strong>
                    <span className="text-slate-400 font-mono text-[11px]">{launchResult.user?.email}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 block">Course & Context:</span>
                    <strong className="text-white block">{launchResult.courseContext?.title}</strong>
                    <span className="text-emerald-400 font-mono text-[11px]">{launchResult.courseContext?.id}</span>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Step 3: Assignment & Grade Services (AGS) Passback */}
          <section className="rounded-xl border border-slate-700/80 bg-slate-900/90 p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step >= 3 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  3
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">Step 3: LTI AGS Gradebook Passback</h3>
                  <p className="text-xs text-slate-400">Transmit accommodated completion score back to LMS gradebook</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradeScore}
                  onChange={(e) => setGradeScore(Number(e.target.value))}
                  className="w-16 px-2 py-1.5 rounded bg-slate-950 border border-slate-700 text-xs text-white text-center font-bold"
                  aria-label="Score to pass back"
                />
                <button
                  onClick={handleSubmitGrade}
                  disabled={step < 3 || isProcessing}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 text-xs font-semibold transition-colors"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Send Grade</span>
                </button>
              </div>
            </div>

            {gradeResult && (
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 space-y-1">
                <p className="text-emerald-400 font-bold">{gradeResult.message}</p>
                <pre className="text-slate-300 mt-1">{JSON.stringify(gradeResult.passbackRecord, null, 2)}</pre>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
