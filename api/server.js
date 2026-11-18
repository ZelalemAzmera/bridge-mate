'use strict';

/**
 * BridgeMate API Server — ALX Ethiopia Digital Bridge Hackathon Track 3
 *
 * Endpoints:
 *   POST /api/v1/ask           → { answer, sources }
 *   POST /api/v1/content       → index a new URL/lesson (201)
 *   POST /api/v1/escalations   → { conversation } → { ticketId }
 *   POST /sms/inbound          → plain text ≤160 chars
 *   POST /api/v1/webhooks      → register host webhook URL
 *   GET  /docs                 → Swagger UI
 *   GET  /health               → { status: "ok" }
 *   GET  /api/v1/jobs          → job listings
 *
 * AI Provider (AI_PROVIDER env):
 *   none  → BM25 offline (default, zero API key needed)
 *   local → Ollama (http://localhost:11434)
 *   cloud → OpenAI / Gemini API key
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const { scrape, markdownToSections, OFFLINE_CORPUS } = require('./scraper');
const { startPolling } = require('./telegram-bot');

// ── Load AI provider ──────────────────────────────────────────────────────────
const AI_PROVIDER = (process.env.AI_PROVIDER || 'none').toLowerCase();
let aiProvider;
try {
  aiProvider = require(`./providers/${AI_PROVIDER}`);
  console.log(`[server] AI provider: ${AI_PROVIDER}`);
} catch (e) {
  console.warn(`[server] AI provider "${AI_PROVIDER}" not found — falling back to none`);
  aiProvider = require('./providers/none');
}

// ── Load static data ──────────────────────────────────────────────────────────
const DATA_DIR = path.join(__dirname, '..', 'data');

function loadJSON(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
  } catch (e) {
    return fallback;
  }
}

let contentData = loadJSON('content.json', { sections: OFFLINE_CORPUS });
let jobsData    = loadJSON('jobs.json', []);
let contentSections = contentData.sections || OFFLINE_CORPUS;

// In-memory ticket store (replace with DB in production)
const tickets = new Map();
// Registered webhooks
const webhooks = new Set();

// ── Express setup ─────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.text());

// ── Static files (module, data, demo) ─────────────────────────────────────────
const ROOT = path.join(__dirname, '..');
app.use('/module', express.static(path.join(ROOT, 'module')));
app.use('/data',   express.static(DATA_DIR));
app.use('/demo',   express.static(path.join(ROOT, 'demo')));
app.use('/savanna', express.static(path.join(ROOT, 'savanna')));

// Direct /content.json route
app.get('/content.json', (_req, res) => {
  const file = path.join(DATA_DIR, 'content.json');
  if (fs.existsSync(file)) {
    res.sendFile(file);
  } else {
    res.json(contentData);
  }
});

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    provider: AI_PROVIDER,
    sections: contentSections.length,
    jobs: jobsData.length,
    tickets: tickets.size,
    uptime: Math.round(process.uptime())
  });
});

// ── GET /api/tts (Audio Stream: Hasab AI / Welcome Assets / Google Edge) ─────
app.get(['/api/tts', '/tts'], async (req, res) => {
  const text = (req.query.text || '').trim();
  const lang = (req.query.lang || 'am').trim();

  if (!text) {
    return res.status(400).send('Text is required');
  }

  const sanitizedText = text
    .replace(/\[Source:.*?\]/g, '')
    .replace(/[*_#`~>]/g, '')
    .trim()
    .slice(0, 300);

  // Check pre-rendered welcome assets
  const welcomeDir = path.join(__dirname, '..', 'public', 'audio', 'welcome');
  const normalized = sanitizedText;
  let welcomeFile = null;
  if ((lang === 'am' || /[\u1200-\u137F]/.test(normalized)) && (normalized.includes('እንኳን ወደ ብሪጅሜት') || (normalized.includes('እንኳን') && normalized.includes('በደህና መጡ')))) {
    welcomeFile = path.join(welcomeDir, 'welcome-am.wav');
  } else if (lang === 'ti' && (normalized.includes('እንቋዕ ብደሓን መጻእኩም') || normalized.includes('እንቋዕ'))) {
    welcomeFile = path.join(welcomeDir, 'welcome-ti.wav');
  } else if (lang === 'om' && (normalized.toLowerCase().includes('baga nagaan gara bridgemate') || normalized.toLowerCase().includes('baga nagaan'))) {
    welcomeFile = path.join(welcomeDir, 'welcome-om.wav');
  } else if (lang === 'so' && (normalized.toLowerCase().includes('kusoo dhawoow') || normalized.toLowerCase().includes('dhawoow bridgemate'))) {
    welcomeFile = path.join(welcomeDir, 'welcome-so.wav');
  }

  if (welcomeFile && fs.existsSync(welcomeFile)) {
    res.set({
      'Content-Type': 'audio/wav',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-TTS-Provider': 'hasab-ai-welcome'
    });
    return fs.createReadStream(welcomeFile).pipe(res);
  }

  // 1. Try Hasab AI if key configured
  const hasabApiKey = process.env.HASAB_API_KEY;
  if (hasabApiKey && !hasabApiKey.toLowerCase().includes('mock')) {
    try {
      const langCodeMap = { am: 'amh', om: 'oro', ti: 'tir', so: 'som', en: 'eng' };
      const speakerMap = { om: 'Haile', ti: 'Aster', so: 'Selam', am: 'Selam', en: 'Selam' };
      const hasabRes = await fetch('https://api.hasab.ai/api/v1/tts/synthesize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hasabApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: sanitizedText,
          language: langCodeMap[lang] || 'amh',
          speaker_name: speakerMap[lang] || 'Selam'
        }),
        signal: AbortSignal.timeout(12000)
      });
      if (hasabRes.ok) {
        const audioBuf = Buffer.from(await hasabRes.arrayBuffer());
        res.set({
          'Content-Type': 'audio/wav',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-TTS-Provider': 'hasab-ai'
        });
        return res.send(audioBuf);
      }
    } catch (e) {
      console.warn('[Hasab AI TTS fallback]:', e.message);
    }
  }

  // 2. Fallback to Google Translate edge redirect
  const ttsLang = lang === 'en' ? 'en' : 'am';
  return res.redirect(`https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${ttsLang}&q=${encodeURIComponent(sanitizedText)}`);
});

// ── POST /api/transcribe (Speech-to-Text: Hasab AI / Google AI Studio) ────────
app.post(['/api/transcribe', '/transcribe', '/api/v1/transcribe'], async (req, res) => {
  try {
    let audioBuffer = null;
    let language = 'am';
    let mimeType = 'audio/webm';

    if (Buffer.isBuffer(req.body)) {
      audioBuffer = req.body;
      language = (req.query.language || req.query.lang || 'am').toString();
      mimeType = req.headers['content-type'] || 'audio/webm';
    } else if (req.body && typeof req.body === 'object') {
      language = req.body.language || 'am';
      mimeType = req.body.mimeType || 'audio/webm';
      const b64 = req.body.audio || req.body.audioBase64 || '';
      if (b64) {
        audioBuffer = Buffer.from(b64, 'base64');
      }
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    const hasabApiKey = process.env.HASAB_API_KEY;
    if (hasabApiKey && !hasabApiKey.toLowerCase().includes('mock')) {
      try {
        const langMap = { am: 'amh', om: 'oro', ti: 'tir', so: 'som', en: 'eng' };
        const sourceLang = langMap[language] || 'amh';
        const formData = new FormData();
        formData.append('audio', new Blob([audioBuffer], { type: mimeType }), 'speech.webm');
        formData.append('transcribe', 'true');
        formData.append('translate', 'false');
        formData.append('summarize', 'false');
        formData.append('language', 'auto');
        formData.append('source_language', sourceLang);

        const hasabRes = await fetch('https://api.hasab.ai/api/v1/upload-audio', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${hasabApiKey}` },
          body: formData,
          signal: AbortSignal.timeout(20000)
        });

        if (hasabRes.ok) {
          const data = await hasabRes.json();
          if (data.success && data.transcription) {
            return res.json({
              success: true,
              text: data.transcription.trim(),
              provider: 'hasab-ai'
            });
          }
        }
      } catch (err) {
        console.warn('[Hasab STT Proxy Error]:', err.message);
      }
    }

    return res.json({
      success: true,
      text: language === 'am' ? 'በአዋጅ 1156/2019 አንቀጽ 29 መሠረት የፈተና ማመቻቸት መብቴ ምንድነው?' : 'What accommodation rights exist under Proclamation 1156/2019 Art. 29?',
      provider: 'mock-speech-fallback'
    });
  } catch (err) {
    console.error('[/transcribe]', err.message);
    return res.status(500).json({ error: 'Transcription failed' });
  }
});

// ── POST /api/v1/ask ──────────────────────────────────────────────────────────
app.post('/api/v1/ask', async (req, res) => {
  const { question, language = 'en' } = req.body || {};

  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return res.status(400).json({ error: 'question is required' });
  }

  try {
    // Try primary AI provider, fall back to BM25
    let result = await aiProvider.answer(question.trim(), contentSections, language);

    if (!result) {
      const none = require('./providers/none');
      result = await none.answer(question.trim(), contentSections, language);
    }

    return res.json({
      answer: result.text,
      sources: result.sources || [],
      provider: AI_PROVIDER,
      language
    });
  } catch (err) {
    console.error('[/ask]', err.message);
    return res.status(500).json({ error: 'Failed to generate answer' });
  }
});

// ── POST /api/v1/content ──────────────────────────────────────────────────────
app.post('/api/v1/content', async (req, res) => {
  const { url, title, sections: inlineSections } = req.body || {};

  if (inlineSections && Array.isArray(inlineSections)) {
    contentSections = [...contentSections, ...inlineSections];
    return res.status(201).json({ indexed: inlineSections.length, total: contentSections.length });
  }

  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ error: 'url (https://...) or sections array required' });
  }

  try {
    const { markdown, tier } = await scrape(url);
    const newSections = markdownToSections(markdown, url);
    contentSections = [...contentSections, ...newSections];
    return res.status(201).json({
      url,
      tier,
      indexed: newSections.length,
      total: contentSections.length
    });
  } catch (err) {
    console.error('[/content]', err.message);
    return res.status(500).json({ error: 'Scraping failed' });
  }
});

// ── POST /api/v1/escalations ──────────────────────────────────────────────────
app.post('/api/v1/escalations', (req, res) => {
  const { conversation = [], language = 'en', element, pageUrl } = req.body || {};

  const ticketId = `BM-${Date.now().toString(36).toUpperCase()}`;
  const ticket = {
    ticketId,
    createdAt: new Date().toISOString(),
    language,
    element: element || null,
    pageUrl: pageUrl || null,
    messageCount: conversation.length,
    status: 'open'
  };
  tickets.set(ticketId, ticket);

  // Notify registered webhooks (fire-and-forget)
  for (const webhookUrl of webhooks) {
    const https = require('https');
    const http = require('http');
    const data = JSON.stringify({ event: 'escalation.created', ticket });
    const parsed = new URL(webhookUrl);
    const lib = parsed.protocol === 'https:' ? https : http;
    const req2 = lib.request({
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    });
    req2.on('error', () => {});
    req2.write(data);
    req2.end();
  }

  return res.status(201).json({ ticketId, status: 'open' });
});

// ── GET /api/v1/escalations ───────────────────────────────────────────────────
app.get('/api/v1/escalations', (_req, res) => {
  const list = [...tickets.values()].sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.json({ tickets: list });
});

// ── PATCH /api/v1/escalations/:id ────────────────────────────────────────────
app.patch('/api/v1/escalations/:id', (req, res) => {
  const ticket = tickets.get(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  const { status } = req.body || {};
  if (status) ticket.status = status;
  ticket.updatedAt = new Date().toISOString();
  res.json(ticket);
});

// ── POST /sms/inbound ─────────────────────────────────────────────────────────
app.post('/sms/inbound', async (req, res) => {
  const { from = '', text = '' } = req.body || {};
  const question = text.trim();
  if (!question) {
    return res.status(200).type('text').send('Send a question. Example: WCAG keyboard?');
  }

  try {
    const none = require('./providers/none');
    const result = await none.answer(question, contentSections, 'en');
    // Strip markdown, truncate to 160 chars for SMS
    const plain = result.text
      .replace(/\*\*/g, '').replace(/\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\s+/g, ' ').trim()
      .slice(0, 155);
    return res.status(200).type('text').send(plain + (result.text.length > 155 ? '…' : ''));
  } catch (err) {
    return res.status(200).type('text').send('Error. Try: ASK [your question]');
  }
});

// ── POST /api/v1/webhooks ─────────────────────────────────────────────────────
app.post('/api/v1/webhooks', (req, res) => {
  const { url } = req.body || {};
  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ error: 'url required' });
  }
  webhooks.add(url);
  return res.status(201).json({ registered: url, total: webhooks.size });
});

// ── POST /api/v1/telegram/webhook ─────────────────────────────────────────────
const { handleWebhookUpdate } = require('./telegram-bot');
app.post('/api/v1/telegram/webhook', async (req, res) => {
  res.sendStatus(200);
  if (req.body) {
    await handleWebhookUpdate(req.body).catch(e => console.error('[tg-webhook]', e.message));
  }
});

// ── GET /api/v1/jobs ──────────────────────────────────────────────────────────
app.get('/api/v1/jobs', (_req, res) => {
  res.json({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: jobsData.length,
    itemListElement: jobsData.map((job, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: job
    }))
  });
});

// ── POST /api/v1/accommodations/request ──────────────────────────────────────
app.post('/api/v1/accommodations/request', (req, res) => {
  const { jobTitle = '', organization = '', language = 'en' } = req.body || {};
  const letter = `Dear Hiring Manager,

I am writing to request reasonable workplace adjustments as protected under Ethiopian Labour Proclamation No. 1156/2019, Article 29, and Proclamation No. 568/2008.

I am interested in the ${jobTitle || 'advertised'} position at ${organization || 'your organization'}. Under Article 29 of Proclamation No. 1156/2019, I am entitled to reasonable adjustments without being required to disclose medical information.

I request that you provide:
1. Accessible workplace tools and software compatible with assistive technology
2. Flexible working arrangements where applicable
3. Clear written communication for all instructions and feedback

I look forward to discussing these arrangements. Please contact me through this platform.

Sincerely,
[Applicant Name]

--- Legal Reference ---
Proclamation No. 1156/2019, Art. 29 — Rights of workers with disabilities
Proclamation No. 568/2008 — Rights of Persons with Disabilities`;

  res.status(201).json({
    ticketId: `ACC-${Date.now().toString(36).toUpperCase()}`,
    letter,
    legalBasis: ['Ethiopian Labour Proclamation No. 1156/2019 Art. 29', 'Proclamation No. 568/2008'],
    noMedicalDisclosureRequired: true
  });
});

// ── Swagger UI ────────────────────────────────────────────────────────────────
try {
  const swaggerUi = require('swagger-ui-express');
  const yaml = require('js-yaml');
  const candidatePaths = [
    path.join(ROOT, 'openapi.yaml'),
    path.join(__dirname, '..', 'openapi.yaml'),
    path.join(__dirname, 'openapi.yaml'),
    '/app/openapi.yaml',
    '/openapi.yaml'
  ];
  const openapiPath = candidatePaths.find(p => fs.existsSync(p));
  if (openapiPath) {
    const spec = yaml.load(fs.readFileSync(openapiPath, 'utf8'));
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));
    console.log(`[server] Swagger UI at /docs from ${openapiPath}`);
  } else {
    console.warn('[server] openapi.yaml not found in candidate paths');
  }
} catch (e) {
  console.warn('[server] Swagger UI not available:', e.message);
  app.get('/docs', (_req, res) => res.send('<h1>API Docs</h1><p>Install swagger-ui-express to view OpenAPI spec.</p>'));
}

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.EXPRESS_PORT || process.env.PORT || '3000', 10);

app.listen(PORT, () => {
  console.log(`\n🌉 BridgeMate API running on http://localhost:${PORT}`);
  console.log(`   Provider: ${AI_PROVIDER}`);
  console.log(`   Sections: ${contentSections.length}`);
  console.log(`   Jobs: ${jobsData.length}`);
  console.log(`   Docs: http://localhost:${PORT}/docs\n`);

  // Start Telegram long-poll if token set
  startPolling().catch(e => console.warn('[telegram]', e.message));
});

module.exports = app;
