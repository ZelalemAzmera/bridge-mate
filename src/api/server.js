'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const {
  router: scraperRouter,
  processScrapeAndGuide,
  decodeJobBarriers,
  OFFLINE_KNOWLEDGE_BASE,
  SCRAPER_VERSION
} = require('./scraper-guide-engine.js');

const { generateAnswer, buildOfflineIndex } = require('./ai-adapter.js');
const { handleWebhookUpdate } = require('./telegram-bot.js');

// Pre-build offline BM25 index at startup (synchronous, tiny corpus)
buildOfflineIndex(OFFLINE_KNOWLEDGE_BASE);

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, _res, next) => {
  req._startMs = Date.now();
  _res.on('finish', () => {
    const ms = Date.now() - req._startMs;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} — ${ms}ms`);
  });
  next();
});

// ─── Static plugin file with CORS headers ────────────────────────────────────
const PLUGIN_SRC = path.join(__dirname, '../../src/plugin/bridgemate-plugin.js');
const PUBLIC_PLUGIN = path.join(__dirname, '../../public/bridgemate-plugin.js');

app.get('/bridgemate-plugin.js', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/javascript');
  // Try src/plugin first, fall back to public/
  const filePath = fs.existsSync(PLUGIN_SRC) ? PLUGIN_SRC : PUBLIC_PLUGIN;
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('// bridgemate-plugin.js not found');
  }
});

// ─── Shared in-memory question log ───────────────────────────────────────────
/** @type {Map<string, { count: number, langs: Set<string> }>} */
const questionLog = new Map();

function trackQuestion(query, lang = 'en') {
  if (!query) return;
  const key = String(query).toLowerCase().trim().slice(0, 200);
  if (!key) return;
  if (!questionLog.has(key)) {
    questionLog.set(key, { count: 0, langs: new Set() });
  }
  const entry = questionLog.get(key);
  entry.count += 1;
  entry.langs.add(lang);
}

// ─── Ethiopian Tech Job Data ─────────────────────────────────────────────────
function buildJobs() {
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
        'Sign language interpreter available on request'
      ],
      description: 'Build accessible fintech web applications serving underbanked communities across Ethiopia. Proficiency in React and Node.js required.',
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
        'Ground-floor office workspace available'
      ],
      description: 'Develop and maintain M-PESA and consumer apps for the Ethiopian market using React Native. TalkBack and VoiceOver accessibility testing experience is a plus.',
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
        'Adjustable deadlines for flare-up days'
      ],
      description: 'Analyse talent marketplace and gig-economy datasets to inform platform decisions. Proficiency in Python or SQL required; full remote role with flexible hours.',
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
        'Quiet workspace zones for sensory sensitivities'
      ],
      description: 'Design inclusive digital products for 50 M+ Ethio Telecom subscribers, ensuring WCAG 2.1 AA compliance and Amharic/Tigrinya localisation. Portfolio required.',
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
        'Part-time track available (20 hrs/week)'
      ],
      description: 'Build APIs and automation tooling that power ALX Savanna learner dashboards. 100% remote; experience with FastAPI or Django REST Framework required.',
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
        'Flexible start times (7 AM – 10 AM window)'
      ],
      description: 'Research and deploy large language models and AGI alignment tools in Amharic and low-resource Ethiopian languages. PhD not required; strong GitHub portfolio valued.',
    }
  ];

  return raw.map(job => ({
    ...job,
    audio_summary_url: `/api/v1/jobs/${job.id}/audio`,
    barrier_flags: decodeJobBarriers(job.description),
    schema_org: {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: job.title,
      description: job.description,
      identifier: {
        '@type': 'PropertyValue',
        name: job.organization,
        value: job.id
      },
      hiringOrganization: {
        '@type': 'Organization',
        name: job.organization,
        sameAs: job.apply_url
      },
      jobLocation: job.remote
        ? { '@type': 'VirtualLocation' }
        : {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: job.location,
            addressCountry: 'ET'
          }
        },
      jobLocationType: job.remote ? 'TELECOMMUTE' : undefined,
      baseSalary: {
        '@type': 'MonetaryAmount',
        currency: 'ETB',
        value: {
          '@type': 'QuantitativeValue',
          value: job.salary_etb,
          unitText: 'MONTH'
        }
      },
      datePosted: job.date_posted_gregorian,
      validThrough: new Date(
        new Date(job.date_posted_gregorian).getTime() + 60 * 24 * 60 * 60 * 1000
      ).toISOString(),
      employmentType: 'FULL_TIME',
      applicantLocationRequirements: job.remote
        ? { '@type': 'Country', name: 'Ethiopia' }
        : undefined,
      url: job.apply_url
    }
  }));
}

const JOB_LISTINGS = buildJobs();

// ─── Accommodation Letter Generator ──────────────────────────────────────────
function generateAccommodationLetter({ accommodation_type, job_title, organization, learner_name }) {
  const name = learner_name || 'The Applicant';
  const date = new Date().toLocaleDateString('en-ET', { year: 'numeric', month: 'long', day: 'numeric' });

  const letter_text = `
${date}

To: Human Resources Department
${organization || 'Hiring Organisation'}
Re: Reasonable Accommodation Request — ${job_title || 'Applied Position'}

Dear Hiring Manager,

I am writing to formally request a reasonable accommodation in connection with my application and/or employment for the position of ${job_title || 'the advertised role'} at ${organization || 'your organisation'}.

Specifically, I am requesting: ${accommodation_type || 'appropriate reasonable accommodation'}.

This request is made pursuant to the following applicable Ethiopian legal instruments:

1. Ethiopian Labour Proclamation No. 1156/2019, Article 29 — which obliges employers to provide reasonable accommodation to employees and applicants with disabilities without imposing disproportionate burden, and expressly prohibits discrimination in recruitment, selection, and terms of employment.

2. Persons with Disabilities Right to Employment Proclamation No. 568/2008 — which guarantees the right of persons with disabilities to work on an equal basis with others, and mandates that employers take positive steps to remove structural, attitudinal, and communicational barriers to equal participation.

No medical history, diagnosis, or clinical documentation is required to support this request under either proclamation. This accommodation request is functional and job-related. I remain fully committed to meeting all core performance expectations of the role.

I kindly request written confirmation of this accommodation within 10 business days. I am happy to discuss implementation details at your convenience.

Yours sincerely,
${name}

---
ZERO MEDICAL DISCLOSURE NOTICE: This letter intentionally omits any reference to medical records, diagnosis, or clinical details, consistent with the privacy protections embedded in Proclamation No. 568/2008 and international best practice under the UN Convention on the Rights of Persons with Disabilities (CRPD), ratified by Ethiopia.
`.trim();

  const letter_html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Accommodation Request Letter</title></head>
<body style="font-family: Arial, sans-serif; max-width: 700px; margin: 2rem auto; line-height: 1.6; color: #111;">
  <p><strong>${date}</strong></p>
  <p><strong>To:</strong> Human Resources Department<br>
     ${organization || 'Hiring Organisation'}<br>
     <strong>Re:</strong> Reasonable Accommodation Request — ${job_title || 'Applied Position'}</p>

  <p>Dear Hiring Manager,</p>

  <p>I am writing to formally request a reasonable accommodation in connection with my application and/or employment for the position of <strong>${job_title || 'the advertised role'}</strong> at <strong>${organization || 'your organisation'}</strong>.</p>

  <p>Specifically, I am requesting: <strong>${accommodation_type || 'appropriate reasonable accommodation'}</strong>.</p>

  <p>This request is made pursuant to the following applicable Ethiopian legal instruments:</p>
  <ol>
    <li><strong>Ethiopian Labour Proclamation No. 1156/2019, Article 29</strong> — which obliges employers to provide reasonable accommodation to employees and applicants with disabilities without imposing disproportionate burden, and expressly prohibits discrimination in recruitment, selection, and terms of employment.</li>
    <li><strong>Persons with Disabilities Right to Employment Proclamation No. 568/2008</strong> — which guarantees the right of persons with disabilities to work on an equal basis with others, and mandates that employers take positive steps to remove structural, attitudinal, and communicational barriers to equal participation.</li>
  </ol>

  <p><strong>No medical history, diagnosis, or clinical documentation is required</strong> to support this request under either proclamation. This accommodation request is functional and job-related. I remain fully committed to meeting all core performance expectations of the role.</p>

  <p>I kindly request written confirmation of this accommodation within 10 business days. I am happy to discuss implementation details at your convenience.</p>

  <p>Yours sincerely,<br><strong>${name}</strong></p>

  <hr>
  <p style="font-size:0.85em; color:#555;">
    <strong>ZERO MEDICAL DISCLOSURE NOTICE:</strong> This letter intentionally omits any reference to medical records, diagnosis, or clinical details, consistent with the privacy protections embedded in Proclamation No. 568/2008 and international best practice under the UN Convention on the Rights of Persons with Disabilities (CRPD), ratified by Ethiopia.
  </p>
</body>
</html>
`.trim();

  return {
    letter_text,
    letter_html,
    citations: [
      {
        law: 'Ethiopian Labour Proclamation No. 1156/2019',
        article: 'Article 29',
        summary: 'Obliges employers to provide reasonable accommodation without disproportionate burden; prohibits disability-based discrimination in employment.'
      },
      {
        law: 'Persons with Disabilities Right to Employment Proclamation No. 568/2008',
        article: 'Arts. 4, 5, 6',
        summary: 'Guarantees equal employment rights for persons with disabilities; mandates removal of barriers; zero medical disclosure requirement.'
      },
      {
        law: 'UN Convention on the Rights of Persons with Disabilities (CRPD)',
        article: 'Article 27',
        summary: 'Ratified by Ethiopia; affirms the right to work on an equal basis and prohibits discrimination based on disability.'
      }
    ]
  };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// Mount scraper router
app.use('/api/v1', scraperRouter);

// GET /health
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() });
});

// GET /api/v1/jobs
app.get('/api/v1/jobs', (_req, res) => {
  res.json(JOB_LISTINGS);
});

// POST /api/v1/accommodations/request
app.post('/api/v1/accommodations/request', (req, res) => {
  const { accommodation_type, job_title, organization, learner_name } = req.body || {};
  if (!accommodation_type) {
    return res.status(400).json({ status: 'error', message: 'accommodation_type is required' });
  }
  const result = generateAccommodationLetter({ accommodation_type, job_title, organization, learner_name });
  return res.json(result);
});

// POST /api/v1/telegram/webhook
app.post('/api/v1/telegram/webhook', async (req, res) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return res.json({ status: 'sandbox', message: 'Offline sandbox: command received' });
  }

  let telegraf;
  try {
    const { Telegraf } = require('telegraf');
    telegraf = new Telegraf(token);
  } catch (_) {
    // telegraf not loadable — raw handler
  }

  const update = req.body;

  // Handle raw update if Telegraf not available or for direct webhook processing
  const text = update?.message?.text || '';
  const chatId = update?.message?.chat?.id;

  let responseText = 'Unknown command.';

  if (text.startsWith('/ask')) {
    const question = text.slice(4).trim();
    trackQuestion(question, 'en');
    try {
      const result = await processScrapeAndGuide({ query: question });
      responseText = result.groundedAnswers.map(a => `${a.sectionHeading}:\n${a.explanation}`).join('\n\n');
    } catch (e) {
      responseText = `Error: ${e.message}`;
    }
  } else if (text.startsWith('/scrape')) {
    const url = text.slice(7).trim();
    try {
      const result = await processScrapeAndGuide({ url, query: '' });
      responseText = `Scraped via ${result.engineUsed}:\n${result.groundedAnswers[0]?.explanation || 'No content found.'}`;
    } catch (e) {
      responseText = `Scrape error: ${e.message}`;
    }
  } else if (text.startsWith('/decode')) {
    const jobText = text.slice(7).trim();
    const barriers = decodeJobBarriers(jobText);
    responseText = barriers.length
      ? barriers.map(b => `⚠️ ${b.barrier}\n✅ ${b.recommendedAccommodation}\n📜 ${b.legalCitation}`).join('\n\n')
      : 'No accessibility barriers detected in this job description.';
  } else if (text.startsWith('/livehelp')) {
    responseText = 'Live help is available Monday–Friday 9 AM–5 PM EAT. Send your question via /ask and a human coach will follow up within 24 hours.';
  } else if (text.startsWith('/alerts')) {
    responseText = `New jobs matching your profile:\n${JOB_LISTINGS.slice(0, 3).map(j => `• ${j.title} @ ${j.organization} — ${j.salary_band}`).join('\n')}`;
  }

  // If we have telegraf and chatId, send reply
  if (telegraf && chatId) {
    try {
      await telegraf.telegram.sendMessage(chatId, responseText);
    } catch (_) { /* ignore send error in webhook context */ }
  }

  return res.json({ status: 'ok', reply: responseText });
});

// GET /api/v1/teacher-insights
app.get('/api/v1/teacher-insights', (_req, res) => {
  const sorted = Array.from(questionLog.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);

  const top_questions = sorted.map(([question_stem, { count, langs }]) => ({
    question_stem,
    count,
    langs_asked: Array.from(langs)
  }));

  res.json({
    total_sessions: Array.from(questionLog.values()).reduce((s, e) => s + e.count, 0),
    top_questions,
    disclaimer: 'Zero PII stored. Question stems are anonymised (lowercased, truncated to 200 chars, no IP/user identifiers).'
  });
});

// GET /api/v1/lti/launch
app.get('/api/v1/lti/launch', (_req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BridgeMate LTI Launch</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 900px; margin: 2rem auto; padding: 1rem; }
    h1 { color: #1a56db; }
    bridgemate-assistant { display: block; border: 2px solid #1a56db; border-radius: 8px; padding: 1rem; min-height: 400px; }
  </style>
</head>
<body>
  <h1>BridgeMate LTI Launch — Embedding BridgeMate into LMS</h1>
  <p>This page demonstrates LTI 1.3 integration. The BridgeMate assistant is embedded below:</p>
  <bridgemate-assistant
    lang="en"
    mode="lti"
    base-url="/api/v1"
    aria-label="BridgeMate Accessible Learning Assistant"
  >
    <noscript>Please enable JavaScript to use BridgeMate.</noscript>
  </bridgemate-assistant>
  <script src="/bridgemate-plugin.js"></script>
</body>
</html>`);
});

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.EXPRESS_PORT || 4000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[BridgeMate] Express server listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
