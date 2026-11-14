'use client';

import React, { useState } from 'react';
import {
  FileCheck,
  Briefcase,
  GraduationCap,
  Home,
  Building,
  Eye,
  Computer,
  UserCheck,
  Volume2,
  Brain,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Sparkles,
} from 'lucide-react';
import type { GenerateAccommodationRequest } from '@/lib/validators/translator.schema';
import { useAccessibility } from '@/hooks/use-accessibility';

export interface AccommodationWizardProps {
  onGenerate: (data: GenerateAccommodationRequest) => void;
  isLoading?: boolean;
}

export function AccommodationWizard({
  onGenerate,
  isLoading = false,
}: AccommodationWizardProps) {
  const { language } = useAccessibility();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [formData, setFormData] = useState<GenerateAccommodationRequest>({
    context: 'interview',
    functionalImpact: 'low_vision',
    specificNeed: '',
    tone: 'collaborative',
    candidateName: '',
    employerName: '',
    jobTitle: '',
    language: language === 'en' ? 'en' : 'am',
  });

  const contextOptions = [
    {
      id: 'interview',
      labelAm: 'የሥራ ቃለ-መጠይቅ',
      labelEn: 'Job Interview',
      descAm: 'የቃለ-መጠይቅ ሰነዶች፣ የመግባቢያና የክፍል ተደራሽነት',
      descEn: 'Accessible documents, communication, and accessible rooms',
      icon: Briefcase,
    },
    {
      id: 'exam',
      labelAm: 'የፈተናና የምዘና ወቅት',
      labelEn: 'Exam & Assessment',
      descAm: 'ተጨማሪ የፈተና ጊዜ፣ ትልቅ ፊደል ወይም ስክሪን አንባቢ',
      descEn: 'Extended time, large print, or screen reader compatible testing',
      icon: GraduationCap,
    },
    {
      id: 'remote',
      labelAm: 'የርቀት ሥራ (Remote)',
      labelEn: 'Remote Office Work',
      descAm: 'ዲጂታል መሣሪያዎች፣ ተደራሽ ሶፍትዌርና የሥራ ሰዓት ምቾት',
      descEn: 'Accessible software licenses and flexible remote workflow',
      icon: Home,
    },
    {
      id: 'physical_office',
      labelAm: 'የቢሮና የሥራ ቦታ',
      labelEn: 'Physical Workspace',
      descAm: 'ራምፕ፣ አሳንሰር፣ ተስማሚ ወንበርና ፀጥ ያለ የሥራ ቦታ',
      descEn: 'Wheelchair ramps, elevators, ergonomic desks, or quiet zones',
      icon: Building,
    },
  ];

  const functionalOptions = [
    {
      id: 'low_vision',
      labelAm: 'የእይታ ውስንነት (Low Vision)',
      labelEn: 'Low Vision',
      icon: Eye,
      quickPill:
        language === 'am'
          ? 'ሰነዶች በትልቅ ፊደል (24pt) ወይም በዲጂታል ፎርማት እንዲደርሱኝ'
          : 'Documents in large font (24pt) or accessible digital format',
    },
    {
      id: 'screen_reader',
      labelAm: 'ስክሪን አንባቢ ተጠቃሚ (Screen Reader)',
      labelEn: 'Screen Reader User',
      icon: Computer,
      quickPill:
        language === 'am'
          ? 'የፈተና ፖርታሉ ከNVDA/JAWS ጋር ተኳሃኝ እንዲሆን'
          : 'Testing interface fully compatible with NVDA or JAWS',
    },
    {
      id: 'mobility',
      labelAm: 'የእንቅስቃሴ ውስንነት (Mobility / Wheelchair)',
      labelEn: 'Mobility / Wheelchair User',
      icon: UserCheck,
      quickPill:
        language === 'am'
          ? 'የፈተና ክፍሉ በምድር ወለል ወይም ራምፕ ባለው ክፍል እንዲዘጋጅ'
          : 'Accessible ground-floor room with step-free wheelchair ramp',
    },
    {
      id: 'deaf_hard_of_hearing',
      labelAm: 'የመስሚያ ውስንነት (Deaf / Hard of Hearing)',
      labelEn: 'Deaf / Hard of Hearing',
      icon: Volume2,
      quickPill:
        language === 'am'
          ? 'ብቁ የኢትዮጵያ የምልክት ቋንቋ አስተርጓሚ ወይም የጽሁፍ ቃለ-መጠይቅ'
          : 'Qualified Ethiopian Sign Language interpreter or written chat',
    },
    {
      id: 'neurodivergent',
      labelAm: 'የስሜትና የትኩረት ምቾት (Neurodivergent)',
      labelEn: 'Neurodivergent / Sensory',
      icon: Brain,
      quickPill:
        language === 'am'
          ? 'ፀጥ ያለ የፈተና ክፍልና ግልፅ የጽሁፍ መመሪያዎች'
          : 'Quiet, low-distraction room and written step-by-step instructions',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.specificNeed.trim()) return;
    onGenerate(formData);
  };

  return (
    <div className="bg-card border-2 border-border rounded-2xl p-6 shadow-sm">
      {/* Wizard Progress Indicator */}
      <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs transition-colors ${
                step === s
                  ? 'bg-primary text-white ring-4 ring-primary/20'
                  : step > s
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {s}
            </div>
            <span className="text-xs font-bold hidden sm:inline text-foreground">
              {s === 1
                ? language === 'am' ? 'ሁኔታ' : 'Context'
                : s === 2
                ? language === 'am' ? 'የተደራሽነት አይነት' : 'Impact'
                : s === 3
                ? language === 'am' ? 'የሚያስፈልግ ድጋፍ' : 'Need'
                : language === 'am' ? 'ዝርዝር መረጃ' : 'Details'}
            </span>
            {s < 4 && <div className="w-8 sm:w-16 h-0.5 bg-slate-200 hidden xs:block" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Context */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-base font-extrabold text-foreground">
              {language === 'am'
                ? 'ደረጃ 1፡ የማመቻቸት ድጋፉ የሚፈለገው በየትኛው ሁኔታ ውስጥ ነው?'
                : 'Step 1: In what context do you require accommodation?'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {contextOptions.map((opt) => {
                const isSelected = formData.context === opt.id;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, context: opt.id as any })}
                    className={`p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border bg-background hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-lg shrink-0 ${
                        isSelected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-foreground">
                        {language === 'am' ? opt.labelAm : opt.labelEn}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {language === 'am' ? opt.descAm : opt.descEn}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary shadow-sm"
              >
                <span>{language === 'am' ? 'ቀጣይ (Next)' : 'Next'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Functional Impact Category */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-base font-extrabold text-foreground">
              {language === 'am'
                ? 'ደረጃ 2፡ የትኛው የተደራሽነት መስክ የእርስዎን ሁኔታ ይገልጸዋል? (የሕክምና ምርመራ አይጠየቅም)'
                : 'Step 2: Which functional accessibility category applies? (No medical disclosure needed)'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {functionalOptions.map((opt) => {
                const isSelected = formData.functionalImpact === opt.id;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        functionalImpact: opt.id as any,
                        specificNeed: opt.quickPill,
                      });
                    }}
                    className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border bg-background hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-lg shrink-0 ${
                        isSelected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div className="font-bold text-sm text-foreground">
                      {language === 'am' ? opt.labelAm : opt.labelEn}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl border border-border text-sm font-bold hover:bg-slate-100 transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{language === 'am' ? 'ተመለስ' : 'Back'}</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary shadow-sm"
              >
                <span>{language === 'am' ? 'ቀጣይ (Next)' : 'Next'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Specific Support Needed */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-base font-extrabold text-foreground">
              {language === 'am'
                ? 'ደረጃ 3፡ የሚያስፈልግዎትን የተደራሽነት ድጋፍ በራስዎ ቃላት ይግለጹ'
                : 'Step 3: Describe the specific accommodation you need in your own words'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {language === 'am'
                ? 'ለምሳሌ፡ "በእይታ ድካም ምክንያት የፈተና ጥያቄዎች በኮምፒውተር ዲጂታል እንዲሆኑልኝ እፈልጋለሁ"'
                : 'Example: "I need exam questions in an accessible digital Word document because of low vision."'}
            </p>

            <textarea
              rows={4}
              value={formData.specificNeed}
              onChange={(e) => setFormData({ ...formData, specificNeed: e.target.value })}
              placeholder={
                language === 'am'
                  ? 'የሚያስፈልግዎትን ድጋፍ እዚህ ይጻፉ...'
                  : 'Describe your accessibility adjustment here...'
              }
              className="w-full rounded-xl border-2 border-border p-3 text-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary bg-background text-foreground leading-relaxed"
            />

            {/* Quick Suggestions */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
                <span>{language === 'am' ? 'ፈጣን የአማራጭ ናሙናዎች፡' : 'Suggested options:'}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {functionalOptions.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, specificNeed: f.quickPill })}
                    className="px-3 py-1.5 rounded-full text-xs bg-slate-100 hover:bg-primary hover:text-white border border-slate-300 transition-colors text-left"
                  >
                    {f.quickPill}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl border border-border text-sm font-bold hover:bg-slate-100 transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{language === 'am' ? 'ተመለስ' : 'Back'}</span>
              </button>
              <button
                type="button"
                disabled={!formData.specificNeed.trim()}
                onClick={() => setStep(4)}
                className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary shadow-sm"
              >
                <span>{language === 'am' ? 'ቀጣይ (Next)' : 'Next'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Details & Tone */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-base font-extrabold text-foreground">
              {language === 'am'
                ? 'ደረጃ 4፡ የአመልካችና የቀጣሪ ዝርዝር መረጃዎች'
                : 'Step 4: Candidate & Employer Information'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  {language === 'am' ? 'የአመልካች ስም' : 'Candidate Name'}
                </label>
                <input
                  type="text"
                  value={formData.candidateName}
                  onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                  placeholder="ሰላማዊት ታደሰ / Selamawit Tadesse"
                  className="w-full rounded-xl border-2 border-border p-2.5 text-sm bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  {language === 'am' ? 'የቀጣሪ ድርጅት ስም' : 'Employer / Organization Name'}
                </label>
                <input
                  type="text"
                  value={formData.employerName}
                  onChange={(e) => setFormData({ ...formData, employerName: e.target.value })}
                  placeholder="አካታች ቴክኖሎጂ ኢትዮጵያ / Inclusive Tech Ethiopia"
                  className="w-full rounded-xl border-2 border-border p-2.5 text-sm bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  {language === 'am' ? 'የሥራ መደብ (አማራጭ)' : 'Job Position (Optional)'}
                </label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  placeholder="ዳታ ኢንትሪና ድጋፍ / Data Entry & Support"
                  className="w-full rounded-xl border-2 border-border p-2.5 text-sm bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  {language === 'am' ? 'የደብዳቤው ድምፀት (Tone)' : 'Letter Tone'}
                </label>
                <select
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value as any })}
                  className="w-full rounded-xl border-2 border-border p-2.5 text-sm bg-background text-foreground"
                >
                  <option value="collaborative">
                    {language === 'am' ? 'የትብብርና ፕሮፌሽናል (Collaborative)' : 'Collaborative & Professional'}
                  </option>
                  <option value="formal_legal">
                    {language === 'am' ? 'ሕጋዊና ጥብቅ (Formal Statutory)' : 'Formal Legal (Citing Proclamations)'}
                  </option>
                  <option value="urgent">
                    {language === 'am' ? 'አስቸኳይ ለፈተና ዝግጅት (Urgent Exam Preparation)' : 'Urgent for Upcoming Exam'}
                  </option>
                </select>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-xl border border-border text-sm font-bold hover:bg-slate-100 transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{language === 'am' ? 'ተመለስ' : 'Back'}</span>
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary shadow-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>{language === 'am' ? 'ደብዳቤው እየተረቀቀ ነው...' : 'Drafting Letter...'}</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" aria-hidden="true" />
                    <span>{language === 'am' ? 'ደብዳቤ አዘጋጅ (Generate Letter)' : 'Generate Letter'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

