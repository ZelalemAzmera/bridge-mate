import { NextResponse } from 'next/server';
// @ts-ignore — CJS module
import { decodeJobBarriers } from '../../../../api/scraper-guide-engine.js';

interface BarrierFlag {
  barrier: string;
  recommendedAccommodation: string;
  legalCitation: string;
}

interface JobListing {
  id: string;
  title: string;
  organization: string;
  location: string;
  salary_etb: number;
  salary_band: string;
  date_posted_gregorian: string;
  date_posted_ec: string;
  audio_summary_url: string;
  accommodations_verified: string[];
  description: string;
  apply_url: string;
  remote: boolean;
  barrier_flags: BarrierFlag[];
  schema_org: Record<string, unknown>;
}

function buildJobs(): JobListing[] {
  const raw = [
    {
      id: 'job-001',
      title: 'Full-Stack Web Developer',
      organization: 'Kifiya Financial Technology',
      location: 'Addis Ababa',
      salary_etb: 35000,
      salary_band: 'ETB 25,000–35,000/mo',
      date_posted_gregorian: '2024-11-01T08:00:00.000Z',
      date_posted_ec: '22 Tikimt 2017 E.C.',
      apply_url: 'https://kifiya.com/careers/fullstack-dev',
      remote: false,
      accommodations_verified: [
        'Screen reader compatible application portal',
        'Keyboard-only navigation supported',
        'Sign language interpreter available on request',
      ],
      description:
        'Build accessible fintech web applications serving underbanked communities across Ethiopia. Proficiency in React and Node.js required.',
    },
    {
      id: 'job-002',
      title: 'Mobile App Developer (React Native)',
      organization: 'Safaricom Ethiopia',
      location: 'Addis Ababa',
      salary_etb: 42000,
      salary_band: 'ETB 35,000–42,000/mo',
      date_posted_gregorian: '2024-11-03T08:00:00.000Z',
      date_posted_ec: '24 Tikimt 2017 E.C.',
      apply_url: 'https://careers.safaricom.et/mobile-dev',
      remote: false,
      accommodations_verified: [
        'Accessible interview process via video relay',
        'Flexible working hours for disability-related medical appointments',
        'Ground-floor office workspace available',
      ],
      description:
        'Develop and maintain M-PESA and consumer apps for the Ethiopian market using React Native. TalkBack and VoiceOver accessibility testing experience is a plus.',
    },
    {
      id: 'job-003',
      title: 'Remote Data Analyst',
      organization: 'Gebeya Inc.',
      location: 'Remote',
      salary_etb: 28000,
      salary_band: 'ETB 22,000–28,000/mo',
      date_posted_gregorian: '2024-11-05T08:00:00.000Z',
      date_posted_ec: '26 Tikimt 2017 E.C.',
      apply_url: 'https://gebeya.com/jobs/data-analyst',
      remote: true,
      accommodations_verified: [
        'Fully async text-based workflows',
        'No video camera required',
        'Adjustable deadlines for flare-up days',
      ],
      description:
        'Analyse talent marketplace and gig-economy datasets to inform platform decisions. Proficiency in Python or SQL required; full remote role with flexible hours.',
    },
    {
      id: 'job-004',
      title: 'UX / Accessibility Designer',
      organization: 'Ethio Telecom Digital Lab',
      location: 'Addis Ababa',
      salary_etb: 32000,
      salary_band: 'ETB 26,000–32,000/mo',
      date_posted_gregorian: '2024-11-06T08:00:00.000Z',
      date_posted_ec: '27 Tikimt 2017 E.C.',
      apply_url: 'https://ethiotelecom.et/careers/ux-designer',
      remote: false,
      accommodations_verified: [
        'Accessible design tools provided (Figma with screen reader support)',
        'Ethiopian Sign Language interpreter on-site',
        'Quiet workspace zones for sensory sensitivities',
      ],
      description:
        'Design inclusive digital products for 50 M+ Ethio Telecom subscribers, ensuring WCAG 2.1 AA compliance and Amharic/Tigrinya localisation. Portfolio required.',
    },
    {
      id: 'job-005',
      title: 'Backend Engineer (Python / FastAPI)',
      organization: 'ALX Ethiopia / Holberton',
      location: 'Remote',
      salary_etb: 38000,
      salary_band: 'ETB 30,000–38,000/mo',
      date_posted_gregorian: '2024-11-08T08:00:00.000Z',
      date_posted_ec: '29 Tikimt 2017 E.C.',
      apply_url: 'https://alxafrica.com/ethiopia/jobs/backend-engineer',
      remote: true,
      accommodations_verified: [
        'Text-only async stand-ups via Telegram',
        'UNHCR Refugee ID accepted in lieu of Kebele ID',
        'Part-time track available (20 hrs/week)',
      ],
      description:
        'Build APIs and automation tooling that power ALX Savanna learner dashboards. 100% remote; experience with FastAPI or Django REST Framework required.',
    },
    {
      id: 'job-006',
      title: 'AI / ML Engineer',
      organization: 'iCog Labs',
      location: 'Addis Ababa',
      salary_etb: 55000,
      salary_band: 'ETB 45,000–55,000/mo',
      date_posted_gregorian: '2024-11-10T08:00:00.000Z',
      date_posted_ec: '1 Hidar 2017 E.C.',
      apply_url: 'https://icog-labs.com/careers/ml-engineer',
      remote: false,
      accommodations_verified: [
        'Noise-cancelling headset provided',
        'Ergonomic workstation assessment on hire',
        'Flexible start times (7 AM – 10 AM window)',
      ],
      description:
        'Research and deploy large language models and AGI alignment tools in Amharic and low-resource Ethiopian languages. PhD not required; strong GitHub portfolio valued.',
    },
  ];

  return raw.map((job) => ({
    ...job,
    audio_summary_url: `/api/v1/jobs/${job.id}/audio`,
    barrier_flags: decodeJobBarriers(job.description) as BarrierFlag[],
    schema_org: {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: job.title,
      description: job.description,
      identifier: {
        '@type': 'PropertyValue',
        name: job.organization,
        value: job.id,
      },
      hiringOrganization: {
        '@type': 'Organization',
        name: job.organization,
        sameAs: job.apply_url,
      },
      jobLocation: job.remote
        ? { '@type': 'VirtualLocation' }
        : {
            '@type': 'Place',
            address: {
              '@type': 'PostalAddress',
              addressLocality: job.location,
              addressCountry: 'ET',
            },
          },
      jobLocationType: job.remote ? 'TELECOMMUTE' : undefined,
      baseSalary: {
        '@type': 'MonetaryAmount',
        currency: 'ETB',
        value: {
          '@type': 'QuantitativeValue',
          value: job.salary_etb,
          unitText: 'MONTH',
        },
      },
      datePosted: job.date_posted_gregorian,
      validThrough: new Date(
        new Date(job.date_posted_gregorian).getTime() + 60 * 24 * 60 * 60 * 1000
      ).toISOString(),
      employmentType: 'FULL_TIME',
      applicantLocationRequirements: job.remote
        ? { '@type': 'Country', name: 'Ethiopia' }
        : undefined,
      url: job.apply_url,
    },
  }));
}

const JOB_LISTINGS = buildJobs();

export async function GET() {
  return NextResponse.json(JOB_LISTINGS);
}
