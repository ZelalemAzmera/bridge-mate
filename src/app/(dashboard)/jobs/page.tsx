'use client';

import React, { useState } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Laptop,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { useAccessibility } from '@/hooks/use-accessibility';
import { AccessibleJobCard, type AccessibleJob } from '@/components/jobs/accessible-job-card';

const SAMPLE_JOBS: AccessibleJob[] = [
  {
    id: 'job-1',
    title: 'Junior Full-Stack Python Developer',
    titleAm: 'ጀማሪ የፓይዘን ሙሉ-ስቴክ ሶፍትዌር አልሚ',
    organization: 'Ethio Telecom Innovation Hub',
    location: 'Addis Ababa (Bole Tech Park) • Hybrid',
    locationAm: 'አዲስ አበባ (ቦሌ ቴክኖሎጂ ፓርክ) • ከፊል-የርቀት',
    salaryEtb: '38,000 – 52,000 ETB / mo',
    dateGregorian: 'Nov 14, 2026',
    dateEthiopian: 'ህዳር 5, 2019 ዓ.ም.',
    isRemote: true,
    audioSummaryText: 'Ethio Telecom Innovation Hub is hiring a Junior Full-Stack Python Developer. This position is hybrid with 3 days remote work. Accommodations include JAWS and NVDA screen reader compatibility, flexible working hours, and 50 percent extended evaluation times for coding assessments.',
    audioSummaryTextAm: 'ኢትዮ ቴሌኮም ኢኖቬሽን ሀብ ጀማሪ የፓይዘን ሶፍትዌር አልሚ ይፈልጋል። ሥራው በሳምንት 3 ቀናት ከቤት የሚሠራ ሲሆን፣ የስክሪን አንባቢ (NVDA/JAWS) ድጋፍ፣ ተለዋዋጭ የሥራ ሰዓት እና በምዘና ላይ የ50% ተጨማሪ ጊዜ ማመቻቸትን ያካትታል።',
    verifiedAccommodations: [
      'NVDA / JAWS Screen Reader Tested',
      '50% Extended Assessment Time',
      'Elevator + Accessible Restrooms',
      'Flexible Core Hours',
    ],
    verifiedAccommodationsAm: [
      'የስክሪን አንባቢ (NVDA/JAWS) ድጋፍ',
      'የ50% ተጨማሪ የምዘና ጊዜ',
      'ሊፍትና ተደራሽ መጸዳጃ ቤቶች',
      'ተለዋዋጭ የሥራ ሰዓት',
    ],
    description: 'Collaborate with agile backend teams to design REST APIs, automate data pipelines, and develop accessible internal dashboards. Open to recent ALX software graduates with disabilities.',
    descriptionAm: 'የREST ኤፒአይዎችን ለመንደፍ፣ የዳታ አሠራሮችን በራስ-ሰር ለማንቀሳቀስ እና ተደራሽ ዳሽቦርዶችን ለማልማት ከአልሚ ቡድኖች ጋር ይሠራሉ። የALX ምሩቃን ይበረታታሉ።',
  },
  {
    id: 'job-2',
    title: 'Accessibility QA & Web Compliance Tester',
    titleAm: 'የዲጂታል ተደራሽነት እና የጥራት ቁጥጥር መርማሪ (QA)',
    organization: 'Commercial Bank of Ethiopia (CBE) Digital Lab',
    location: '100% Remote (Ethiopia)',
    locationAm: '100% የርቀት ሥራ (መላው ኢትዮጵያ)',
    salaryEtb: '45,000 – 60,000 ETB / mo',
    dateGregorian: 'Nov 12, 2026',
    dateEthiopian: 'ህዳር 3, 2019 ዓ.ም.',
    isRemote: true,
    audioSummaryText: 'Commercial Bank of Ethiopia Digital Lab is seeking an Accessibility QA Specialist to test mobile banking apps against WCAG 2.2 AA. Fully remote with assistive software allowances provided.',
    audioSummaryTextAm: 'የኢትዮጵያ ንግድ ባንክ የሞባይል ባንኪንግ መተግበሪያዎችን በWCAG 2.2 ደረጃ ለመፈተሽ የጥራት መርማሪ ይፈልጋል። ሙሉ በሙሉ ከቤት የሚሠራ ሲሆን የማመቻቸት መሣሪያዎች ድጋፍ ይሰጣል።',
    verifiedAccommodations: [
      '100% Work from Home',
      'Assistive Tech Equipment Stipend',
      'No Video Call Obligation (Async Chat)',
      'Mentorship from Senior Disabled Engineers',
    ],
    verifiedAccommodationsAm: [
      '100% ከቤት የሚሠራ ሥራ',
      'የማመቻቸት መሣሪያዎች አበል',
      'የጽሑፍ ውይይት (Async Communication)',
      'የከፍተኛ መሃንዲሶች የሥራ መመሪያ',
    ],
    description: 'Audit mobile and web fintech platforms for screen reader navigation, keyboard traps, color contrast, and Amharic voice synthesis compatibility.',
    descriptionAm: 'የባንኩን የሞባይል እና የድር ገጾች የስክሪን አንባቢ ተደራሽነት፣ የቁልፍ ሰሌዳ አጠቃቀምና የአማርኛ ድምፅ ተኳሃኝነትን ይፈትሹ።',
  },
  {
    id: 'job-3',
    title: 'Frontend React / Next.js Accessibility Engineer',
    titleAm: 'የፊት-ገጽ (React/Next.js) ተደራሽነት መሃንዲስ',
    organization: 'Africa CDC Digital Health Hub',
    location: 'Addis Ababa (HQ) • Remote Friendly',
    locationAm: 'አዲስ አበባ (ዋና መስሪያ ቤት) • የርቀት አማራጭ',
    salaryEtb: '50,000 – 68,000 ETB / mo',
    dateGregorian: 'Nov 10, 2026',
    dateEthiopian: 'ህዳር 1, 2019 ዓ.ም.',
    isRemote: true,
    audioSummaryText: 'Africa CDC is recruiting a Frontend Accessibility Engineer to build epidemiological monitoring tools across African Union member states. Accessible physical campus with wheelchair ramps and low-vision monitors.',
    audioSummaryTextAm: 'አፍሪካ ሲዲሲ የጤና መረጃ ዳሽቦርዶችን ለማልማት የፊት-ገጽ መሃንዲስ ይፈልጋል። ቢሮው የዊልቸር መንገዶችና የአጉሊ መነጽር ስክሪኖች የተሟሉለት ነው።',
    verifiedAccommodations: [
      'Wheelchair Accessible Campus & Transit',
      'Ergonomic Sit/Stand Workstations',
      'Sign Language Interpreter during Meetings',
      'Flexible Medical Leave Policy',
    ],
    verifiedAccommodationsAm: [
      'የዊልቸር መተላለፊያና የትራንስፖርት ድጋፍ',
      'ተስተካካይ የሥራ ጠረጴዛና ወንበር',
      'በስብሰባዎች ወቅት የምልክት ቋንቋ አስተርጓሚ',
      'ተለዋዋጭ የዕረፍት ፈቃድ',
    ],
    description: 'Implement modern, WCAG 2.2 AA compliant user interfaces with Next.js, Tailwind CSS, and Radix UI for health data visualizers.',
    descriptionAm: 'በNext.js እና Tailwind CSS በመጠቀም ሁሉንም የደኅንነትና የተደራሽነት መስፈርቶች ያሟሉ የሕክምና ዳታ መመልከቻ ገጾችን ይገንቡ።',
  },
  {
    id: 'job-4',
    title: 'Digital Content & Local Language AI Evaluator',
    titleAm: 'የአገር ውስጥ ቋንቋዎች የኤአይ መረጃ ገምጋሚ',
    organization: 'ALX Ventures Inclusive Labs',
    location: 'Hawassa / Addis Ababa / Remote',
    locationAm: 'ሀዋሳ / አዲስ አበባ / የርቀት',
    salaryEtb: '32,000 – 44,000 ETB / mo',
    dateGregorian: 'Nov 8, 2026',
    dateEthiopian: 'ጥቅምት 29, 2019 ዓ.ም.',
    isRemote: true,
    audioSummaryText: 'ALX Inclusive Labs is hiring AI evaluators for Amharic, Oromo, Tigrinya, and Somali translation and accessibility accuracy. Zero coding background required.',
    audioSummaryTextAm: 'ኤኤልኤክስ ኢንክሉሲቭ ላብስ ለአማርኛ፣ ኦሮምኛ፣ ትግርኛ እና ሶማሊኛ ቋንቋዎች የኤአይ ትክክለኛነትን የሚገመግሙ ባለሙያዎችን ይፈልጋል። የኮዲንግ ልምድ አያስፈልግም።',
    verifiedAccommodations: [
      'Screen Magnification Software Provided',
      'Part-Time & Flexible Hours Available',
      'Plain Language Documentation',
      'Audio-first Training Modules',
    ],
    verifiedAccommodationsAm: [
      'የስክሪን አጉሊ ሶፍትዌር ድጋፍ',
      'የትርፍ ሰዓትና ተለዋዋጭ የሥራ ሰዓት',
      'ቀላል የጽሑፍ መመሪያዎች',
      'የድምፅ ሥልጠና ሞጁሎች',
    ],
    description: 'Review and evaluate generative AI outputs in Ethiopian regional languages to ensure cultural nuance, accessibility safety, and grammatical accuracy.',
    descriptionAm: 'የኤአይ ረዳቶች በአገር ውስጥ ቋንቋዎች የሚሰጡትን ምላሽ ትክክለኛነትና ተደራሽነት ይገምግሙ።',
  },
];

export default function JobsPage() {
  const { language } = useAccessibility();
  const isAm = language === 'am';

  const [searchQuery, setSearchQuery] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);

  const filteredJobs = SAMPLE_JOBS.filter((job) => {
    const textToMatch = `${job.title} ${job.titleAm} ${job.organization} ${job.location}`.toLowerCase();
    const matchesSearch = textToMatch.includes(searchQuery.toLowerCase());
    const matchesRemote = remoteOnly ? job.isRemote : true;
    return matchesSearch && matchesRemote;
  });

  return (
    <div className="space-y-6">
      {/* SaaS Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-default)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border border-[var(--brand-primary)]/20 flex items-center justify-center font-bold">
            <Briefcase className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)]">
                {isAm ? 'የሥራ ዕድሎች በር (Career Gateway)' : 'Career Gateway'}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[var(--accent-verified)] border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800">
                <ShieldCheck className="w-3 h-3" aria-hidden="true" />
                <span>{isAm ? 'አዋጅ 1156/2019 የተረጋገጠ' : 'Proclamation 1156/2019 Verified'}</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
              {isAm
                ? 'በኢትዮጵያ ውስጥ ያሉ የተረጋገጡ ተደራሽ የቴክኖሎጂ የሥራ ዕድሎች — ያለምንም የህክምና መረጃ ይፋ ማውጣት ያመልክቱ'
                : 'Inclusive Ethiopian tech vacancies with verified accommodations & 1-click legal request generator'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-xs font-mono text-[var(--text-secondary)] bg-[var(--bg-subtle)] px-3 py-1 rounded-lg border border-[var(--border-default)]">
            {filteredJobs.length} {isAm ? 'ተደራሽ የሥራ ዕድሎች' : 'Accessible Roles Listed'}
          </span>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isAm
                ? 'በሥራ ርዕስ፣ ድርጅት ወይም ከተማ ይፈልጉ...'
                : 'Search by role title, company, or location...'
            }
            className="w-full pl-9 pr-3 py-2 rounded-lg text-xs md:text-sm font-sans"
            aria-label={isAm ? 'የሥራ መፈለጊያ' : 'Search jobs'}
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] text-xs font-semibold text-[var(--text-primary)] cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={(e) => setRemoteOnly(e.target.checked)}
              className="w-4 h-4 rounded text-[var(--brand-primary)] focus:ring-[var(--focus-ring)] cursor-pointer"
            />
            <Laptop className="w-3.5 h-3.5 text-[var(--brand-primary)]" aria-hidden="true" />
            <span>{isAm ? 'የርቀት ሥራዎች ብቻ' : 'Remote Only'}</span>
          </label>
        </div>
      </div>

      {/* Grid of Accessible Job Cards (Single Column or 2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredJobs.map((job) => (
          <AccessibleJobCard key={job.id} job={job} />
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="p-12 text-center rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-2">
          <p className="text-sm font-bold text-[var(--text-primary)]">
            {isAm ? 'ምንም የሚዛመድ የሥራ ዕድል አልተገኘም' : 'No matching opportunities found'}
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            {isAm ? 'እባክዎ የፍለጋ ቃላትን ይቀይሩ ወይም ማጣሪያዎችን ያጽዱ።' : 'Try clearing your search query or toggling off filters.'}
          </p>
        </div>
      )}
    </div>
  );
}
