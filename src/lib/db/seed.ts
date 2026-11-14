// ==============================================================================
// File: src/lib/db/seed.ts
// BridgeMate Database Seed Script (Bilingual Knowledge Sources & Initial Jobs)
// Compatible with both Live PostgreSQL and MemoryDatabaseRepository
// ==============================================================================

import { getRepository, type IDatabaseRepository } from './index';

/**
 * Generates a normalized synthetic 1536-dimensional embedding vector.
 * Seeded with an angle for reproducible cosine similarity testing.
 */
export function createSyntheticEmbedding(seed: number): number[] {
  const dim = 1536;
  const vec: number[] = new Array(dim);
  let norm = 0;
  for (let i = 0; i < dim; i++) {
    const val = Math.sin(seed * (i + 1));
    vec[i] = val;
    norm += val * val;
  }
  const sqrtNorm = Math.sqrt(norm) || 1;
  return vec.map((v) => Number((v / sqrtNorm).toFixed(6)));
}

export async function seedDatabase(repo?: IDatabaseRepository): Promise<void> {
  const targetRepo = repo ?? getRepository();

  console.log('[BridgeMate Seed] Seeding knowledge sources and chunks...');

  // Source 1: Ethiopian Labor Law & Disability Accommodation Proclamation
  await targetRepo.knowledge.insertSourceWithChunks(
    {
      title: 'Ethiopian Labor Proclamation No. 1156/2019 & 568/2008 (Disability Rights)',
      type: 'policy',
      domain: 'policy',
      domainCategory: 'policy',
      url: 'https://www.ilo.org/dyn/natlex/docs/ELECTRONIC/110196/137000/F-1936854580/ETH110196.pdf',
      language: 'am',
    },
    [
      {
        content:
          'በአዋጅ ቁጥር 1156/2019 እና በአዋጅ ቁጥር 568/2008 መሠረት ማንኛውም ቀጣሪ ለአካል ጉዳተኛ ሠራተኞች ተገቢውን የማመቻቸት ሥራ (Reasonable Accommodation) የማድረግ ሕጋዊ ግዴታ አለበት። ይህም ተደራሽ የሥራ ቦታዎችን፣ የድምፅ ወይም የጽሑፍ መርጃ መሣሪያዎችን እና የጊዜ ማስተካከያዎችን ያካትታል።',
        embedding: createSyntheticEmbedding(1.0),
        language: 'am',
        chunkIndex: 0,
        metadata: { section: 'Proclamation 1156/2019 Article 29' },
      },
      {
        content:
          'Under Proclamation No. 1156/2019 and Proclamation No. 568/2008, employers in Ethiopia have a legal duty to provide reasonable workplace accommodations for qualified persons with disabilities. Accommodations include accessible digital materials, flexible assessment times, and physical workstation adjustments.',
        embedding: createSyntheticEmbedding(1.05), // ~0.98 similarity to chunk 0
        language: 'en',
        chunkIndex: 1,
        metadata: { section: 'Proclamation 1156/2019 Article 29 (English Summary)' },
      },
    ]
  );

  // Source 2: Digital Literacy Curriculum for Screen Reader Users
  await targetRepo.knowledge.insertSourceWithChunks(
    {
      title: 'Digital Accessibility & Screen Reader Navigation Guide',
      type: 'course',
      domain: 'vocational',
      domainCategory: 'vocational',
      url: 'https://bridgemate.et/learn/screen-reader-basics',
      language: 'am',
    },
    [
      {
        content:
          'NVDA ወይም ጃውስ (JAWS) ስክሪን ሪደር በመጠቀም የኮምፒውተር ስክሪንን ለማሰስ ዋና ዋና የቁልፍ ሰሌዳ አቋራጮች (Keyboard Shortcuts)፦ ታብ (Tab) ቁልፍ ወደ ቀጣዩ መስተጋብራዊ ክፍል ያሸጋግራል፤ ኤች (H) ቁልፍ ወደ ቀጣዩ ርዕስ (Heading) ይዘላል።',
        embedding: createSyntheticEmbedding(2.0),
        language: 'am',
        chunkIndex: 0,
        metadata: { section: 'Module 1: Screen Reader Basics' },
      },
      {
        content:
          'To navigate web applications using NVDA or JAWS screen readers: press Tab to cycle between focusable interactive controls, press H to skip between structural headings, and use Alt+H to trigger BridgeMate instant live human assistance.',
        embedding: createSyntheticEmbedding(2.05),
        language: 'en',
        chunkIndex: 1,
        metadata: { section: 'Module 1: Screen Reader Basics (English)' },
      },
    ]
  );

  console.log('[BridgeMate Seed] Seeding sample job opportunities...');

  // Sample Job 1
  await targetRepo.opportunities.create({
    title: 'Remote Data Entry & Catalog Specialist',
    employerName: 'Inclusive Technologies Ethiopia',
    location: 'Addis Ababa / 100% Remote',
    description:
      'Position: Remote Data Entry & Catalog Specialist. Organization: Inclusive Technologies Ethiopia. Location: Addis Ababa / 100% Remote. Requirements: Basic computer literacy, typing skills, screen-reader compatible workflow. Deadline: 2026-12-31.',
    sourceUrl: 'https://jobs.ethiojobs.net/sample-accessible-data-entry',
    rawContent:
      'Position: Remote Data Entry & Catalog Specialist. Organization: Inclusive Technologies Ethiopia. Location: Addis Ababa / 100% Remote. Requirements: Basic computer literacy, typing skills, screen-reader compatible workflow. Deadline: 2026-12-31.',
    parsedData: {
      title: 'Remote Data Entry & Catalog Specialist',
      organization: 'Inclusive Technologies Ethiopia',
      location: 'Addis Ababa / 100% Remote',
      deadline: '2026-12-31T23:59:59Z',
      accessibilityFeatures: [
        '100% Screen Reader Compatible',
        'Flexible Hours',
        'Remote Work',
      ],
      isRemote: true,
    },
    language: 'en',
    status: 'open',
  });

  // Sample Job 2 (Amharic)
  await targetRepo.opportunities.create({
    title: 'የደንበኞች ድጋፍ አገልግሎት ባለሙያ (Customer Support)',
    employerName: 'ዲጂታል ብሪጅ ኢትዮጵያ',
    location: 'አዲስ አበባ / የርቀት ሥራ',
    description:
      'የሥራ መደብ፦ የደንበኞች ድጋፍ አገልግሎት ባለሙያ (የርቀት ሥራ)። ድርጅት፦ ዲጂታል ብሪጅ ኢትዮጵያ። ቦታ፦ አዲስ አበባ / በቤት ውስጥ የሚሠራ። መስፈርቶች፦ ጥሩ የመግባባት ችሎታ፣ በስልክና በጽሑፍ መልስ መስጠት የሚችል/የምትችል፣ ለአካል ጉዳተኞች የተመቻቸ የሥራ አካባቢ።',
    sourceUrl: 'https://jobs.ethiojobs.net/sample-accessible-customer-support',
    rawContent:
      'የሥራ መደብ፦ የደንበኞች ድጋፍ አገልግሎት ባለሙያ (የርቀት ሥራ)። ድርጅት፦ ዲጂታል ብሪጅ ኢትዮጵያ። ቦታ፦ አዲስ አበባ / በቤት ውስጥ የሚሠራ። መስፈርቶች፦ ጥሩ የመግባባት ችሎታ፣ በስልክና በጽሑፍ መልስ መስጠት የሚችል/የምትችል፣ ለአካል ጉዳተኞች የተመቻቸ የሥራ አካባቢ።',
    parsedData: {
      title: 'የደንበኞች ድጋፍ አገልግሎት ባለሙያ (Customer Support)',
      organization: 'ዲጂታል ብሪጅ ኢትዮጵያ',
      location: 'አዲስ አበባ / የርቀት ሥራ',
      deadline: '2026-12-15T23:59:59Z',
      accessibilityFeatures: ['ለተንቀሳቃሽነት ጉዳት የተመቻቸ', 'የርቀት ሥራ'],
      isRemote: true,
    },
    language: 'am',
    status: 'open',
  });

  // Sample Job 3 (Commercial Bank of Ethiopia - In-Person with Verified Ramp & Elevator Access)
  await targetRepo.opportunities.create({
    title: 'Junior Database & IT Specialist',
    employerName: 'Commercial Bank of Ethiopia (CBE)',
    location: 'Addis Ababa (HQ - Accessible Premises)',
    description:
      'Position: Junior Database & IT Specialist. Organization: Commercial Bank of Ethiopia. Location: Addis Ababa, Head Office. Premises equipped with wheelchair ramps, tactile pathways, and accessible elevators. Under Proclamation 568/2008, affirmative accommodations are provided during examinations and onboarding.',
    sourceUrl: 'https://www.combanketh.et/careers/sample-junior-it',
    rawContent:
      'Position: Junior Database & IT Specialist. Organization: Commercial Bank of Ethiopia. Location: Addis Ababa, Head Office. Premises equipped with wheelchair ramps, tactile pathways, and accessible elevators. Under Proclamation 568/2008, affirmative accommodations are provided during examinations and onboarding.',
    parsedData: {
      title: 'Junior Database & IT Specialist',
      organization: 'Commercial Bank of Ethiopia (CBE)',
      location: 'Addis Ababa (HQ - Accessible Premises)',
      deadline: '2026-12-20T23:59:59Z',
      accessibilityFeatures: [
        'Wheelchair Ramp Access',
        'Elevators with Braille Buttons',
        'Screen Reader Testing Option',
      ],
      isRemote: false,
    },
    disabilityTags: ['mobility', 'visual', 'exam_accommodation'],
    language: 'en',
    status: 'open',
  });

  // Sample Job 4 (Ethio Telecom - NOC Support Engineer)
  await targetRepo.opportunities.create({
    title: 'NOC Tier-1 Operations Assistant',
    employerName: 'Ethio Telecom',
    location: 'Addis Ababa (Churchill Road NOC)',
    description:
      'Position: NOC Tier-1 Operations Assistant. Organization: Ethio Telecom. Location: Addis Ababa. Responsible for network monitoring and logging. Fully accessible dual-monitor setup with NVDA/JAWS support and adjustable desk workstations provided.',
    sourceUrl: 'https://ethiotelecom.et/careers/noc-tier1',
    rawContent:
      'Position: NOC Tier-1 Operations Assistant. Organization: Ethio Telecom. Location: Addis Ababa. Responsible for network monitoring and logging. Fully accessible dual-monitor setup with NVDA/JAWS support and adjustable desk workstations provided.',
    parsedData: {
      title: 'NOC Tier-1 Operations Assistant',
      organization: 'Ethio Telecom',
      location: 'Addis Ababa',
      deadline: '2026-12-25T23:59:59Z',
      accessibilityFeatures: [
        'NVDA & JAWS Screen Reader Ready',
        'Motorized Height-Adjustable Desks',
        'Quiet Lighting Ergonomic Zone',
      ],
      isRemote: false,
    },
    disabilityTags: ['visual', 'neurodivergent', 'mobility'],
    language: 'en',
    status: 'open',
  });

  // Sample Job 5 (Ministry of Innovation and Technology - Digital Skills Facilitator)
  await targetRepo.opportunities.create({
    title: 'የዲጂታል ክህሎት አሰልጣኝ (Digital Skills Facilitator)',
    employerName: 'የኢኖቬሽንና ቴክኖሎጂ ሚኒስቴር (MInT)',
    location: 'አዲስ አበባ',
    description:
      'የሥራ መደብ፦ የዲጂታል ክህሎት አሰልጣኝ። ተቋም፦ የኢኖቬሽንና ቴክኖሎጂ ሚኒስቴር (MInT)። ቦታ፦ አዲስ አበባ። መስፈርቶች፦ የመሠረታዊ ኮምፒውተር ሥልጠና የመስጠት ልምድ፣ የኢትዮጵያ የምልክት ቋንቋ ችሎታ ወይም ፍላጎት፣ በአዋጅ 568/2008 መሠረት ለአካል ጉዳተኞች ቅድሚያ ይሰጣል።',
    sourceUrl: 'https://mint.gov.et/careers/digital-trainer',
    rawContent:
      'የሥራ መደብ፦ የዲጂታል ክህሎት አሰልጣኝ። ተቋም፦ የኢኖቬሽንና ቴክኖሎጂ ሚኒስቴር (MInT)። ቦታ፦ አዲስ አበባ። መስፈርቶች፦ የመሠረታዊ ኮምፒውተር ሥልጠና የመስጠት ልምድ፣ የኢትዮጵያ የምልክት ቋንቋ ችሎታ ወይም ፍላጎት፣ በአዋጅ 568/2008 መሠረት ለአካል ጉዳተኞች ቅድሚያ ይሰጣል።',
    parsedData: {
      title: 'የዲጂታል ክህሎት አሰልጣኝ (Digital Skills Facilitator)',
      organization: 'የኢኖቬሽንና ቴክኖሎጂ ሚኒስቴር (MInT)',
      location: 'አዲስ አበባ',
      deadline: '2026-12-30T23:59:59Z',
      accessibilityFeatures: [
        'የኢትዮጵያ የምልክት ቋንቋ ድጋፍ',
        'የመንሸራተቻ (Ramp) መወጣጫ ያለው ሕንፃ',
      ],
      isRemote: false,
    },
    disabilityTags: ['auditory', 'mobility'],
    language: 'am',
    status: 'open',
  });

  console.log('[BridgeMate Seed] Seed complete!');
}

