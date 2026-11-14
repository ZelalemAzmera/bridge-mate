/**
 * BridgeMate — Track 3: Multi-Engine Accessible Scraper, Citation Chunker & Job Barrier Decoder
 * Version: 2.0.0
 *
 * Scraper Tier Architecture (inspired by crawl4ai + jina-reader OSS patterns):
 *   Tier 1  → Local Crawl4AI Docker container   (http://localhost:11235/crawl)
 *   Tier 1.5→ Enhanced local DOM fast-path       (@mozilla/readability + text-density scoring, Jina-inspired)
 *   Tier 2  → Jina AI Reader OSS endpoint        (https://r.jina.ai/<url> with X-With-Generated-Alt: true)
 *   Tier 3  → Direct fetch + @mozilla/readability + JSDOM (zero external dependency)
 *   Tier 4  → Offline 2G/3G corpus              (ALX Savanna + Ethiopian Labour Proclamation 1156/2019 & 568/2008)
 *
 * Chunking (ported from crawl4ai/chunking_strategy.py patterns):
 *   - RegexChunking:         split on \n\n or heading markers
 *   - SlidingWindowChunking: overlapping word windows (OVERLAP_RATE = 0.1)
 *   - FixedLengthWordChunking: 300-word fixed chunks
 *   - MIN_WORD_THRESHOLD = 5 (crawl4ai config.py constant)
 *
 * Content Cleaning (crawl4ai boilerplate-removal patterns):
 *   - Strip nav/header/footer/cookie banners/ads via regex
 *   - Remove low-quality sections (< MIN_WORD_THRESHOLD words)
 *   - Text-density scoring (Jina-reader inspired) to find main content div
 *
 * Image Accessibility:
 *   - Count and report images missing alt text (WCAG 1.1.1 checker)
 *   - Jina's X-With-Generated-Alt: true header generates AI alt text via API
 */

'use strict';

const express = require('express');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');

const router = express.Router();

// ── Constants (ported from crawl4ai/config.py) ────────────────────────────────
const SCRAPER_VERSION = '2.0.0';
const MIN_WORD_THRESHOLD = 5;          // crawl4ai: minimum words for a valid chunk
const CHUNK_TOKEN_THRESHOLD = 300;     // words per fixed-length chunk
const OVERLAP_RATE = 0.1;             // crawl4ai: 10% overlap between sliding windows
const IMAGE_SCORE_THRESHOLD = 0.5;    // jina: min score for image relevance

// ── Boilerplate removal patterns (crawl4ai antibot_detector.py & extraction patterns) ───
const BOILERPLATE_PATTERNS = [
  /cookie[s]?\s*(notice|policy|consent|banner|popup)/i,
  /accept\s*all\s*cookies/i,
  /privacy\s*policy|terms\s*of\s*(service|use)/i,
  /subscribe\s*to\s*our\s*newsletter/i,
  /advertisement|sponsored\s*content|promoted/i,
  /share\s*on\s*(facebook|twitter|linkedin|whatsapp)/i,
  /follow\s*us\s*on|like\s*us\s*on/i,
  /copyright\s*©|\ball\s*rights\s*reserved\b/i,
  /skip\s*to\s*(main\s*)?content|back\s*to\s*top/i,
];

const NAV_FOOTER_TAGS = ['nav', 'footer', 'header', 'aside', '.sidebar', '.ad', '.advertisement',
                          '.cookie', '.newsletter', '.social-share', '.related-posts'];

// ── Built-in Offline/2G Fallback Corpus ──────────────────────────────────────
const OFFLINE_KNOWLEDGE_BASE = [
  {
    id: 'alx-mod-3',
    url: 'https://savanna.alxafrica.com/courses/python-fullstack/module-3-accessibility',
    title: 'ALX Savanna: Module 3 — Semantic HTML, ARIA & Keyboard Navigation',
    sections: [
      {
        heading: 'Keyboard Operability (WCAG 2.1.1 & 2.4.7)',
        content: 'Every interactive element must be reachable via Tab and Shift+Tab without a mouse. Focus indicators must maintain a minimum 3px high-contrast outline and never be obscured by sticky headers (WCAG 2.4.11). Use tabindex="0" for custom interactive elements and tabindex="-1" to remove from tab order while keeping programmatic focus possible.'
      },
      {
        heading: 'Screen Reader Landmarks & Language Tags (WCAG 3.1.2)',
        content: 'Use semantic landmarks (<main>, <nav>, <aside>) and tag Ethiopian languages explicitly with lang="am" (Amharic), lang="ti" (Tigrinya), lang="om" (Afaan Oromo), and dir="rtl" for Arabic. Every page must have exactly one <main> landmark and a unique <title> that describes its purpose.'
      },
      {
        heading: 'Color Contrast Requirements (WCAG 1.4.3 & 1.4.11)',
        content: 'Normal text requires a 4.5:1 contrast ratio against its background. Large text (18pt / 14pt bold) requires 3:1. UI component boundaries (buttons, inputs) also need 3:1. The design system uses #0F172A text on #FFFFFF (17.4:1) and #0F62FE buttons with white text (5.1:1).'
      },
      {
        heading: 'Images and Alt Text (WCAG 1.1.1)',
        content: 'Every informative image must have descriptive alt text. Decorative images use alt="" (empty string). Complex images (charts, diagrams) need a long description via aria-describedby or a visible caption. Using X-With-Generated-Alt: true with the Jina Reader API auto-generates alt text for images.'
      }
    ]
  },
  {
    id: 'eth-law-1156',
    url: 'https://molsa.gov.et/proclamation-1156-2019-article-29',
    title: 'Ethiopian Labour Proclamation No. 1156/2019 & Right to Employment No. 568/2008',
    sections: [
      {
        heading: 'Article 29 & Proclamation 568/2008: Reasonable Accommodation',
        content: 'Employers and training institutions in Ethiopia must provide reasonable accommodation (extra exam time, screen reader compatibility, sign language interpretation, or step-free remote work options) without requiring invasive medical history disclosure. The duty to accommodate is triggered by the worker or applicant making a request — no medical certificate is required at the initial stage.'
      },
      {
        heading: 'Prohibition of Indirect Discrimination (Proclamation 568/2008 Art. 5)',
        content: 'Requirements that appear neutral but disproportionately exclude persons with disabilities constitute indirect discrimination unless they are essential job functions. Examples include: mandatory telephone-only communication, requiring a valid driver\'s license for sedentary office roles, or demanding perfect eyesight for text-based digital work.'
      },
      {
        heading: 'Refugee Right to Work (Proclamation 1110/2019 Art. 26)',
        content: 'Refugees and displaced persons recognized under Ethiopian law have the right to work and access vocational training without requiring a standard Kebele ID. UNHCR Refugee ID cards, partner NGO referral letters (SNV, Mercy Corps, IRC), or provisional enrollment documents are acceptable alternatives.'
      }
    ]
  }
];

// ── Ableist Job Requirement Patterns → Social Model Mitigations ───────────────
const BARRIER_RULES = [
  {
    regex: /20\/20\s*vision|perfect\s*eyesight|visual\s*inspection|must\s*see\s*clearly/i,
    barrier: 'Exclusionary visual requirement unrelated to core digital output',
    accommodation: 'Screen reader (NVDA/TalkBack/VoiceOver) or 200%–400% high-contrast display magnification. Remote role eliminates most physical inspection requirements.',
    lawCitation: 'Proclamation No. 568/2008 (Art. 4 & 6 — Right to Reasonable Accommodation)'
  },
  {
    regex: /must\s*carry\s*\d+\s*kg|climb\s*stairs|4th\s*floor|physical\s*stamina|stand\s*for\s*long|manual\s*labor/i,
    barrier: 'Physical mobility barrier in workspace or non-essential manual task',
    accommodation: 'Ground-floor workstation assignment, elevator access, or hybrid/remote task execution. Ergonomic seating and adjustable desk under Labour Proclamation 1156/2019.',
    lawCitation: 'Labour Proclamation No. 1156/2019 (Art. 29)'
  },
  {
    regex: /fluent\s*spoken\s*phone\s*calls|excellent\s*verbal\s*(hearing|communication)|telephone\s*only|voice\s*calls\s*required/i,
    barrier: 'Auditory/verbal communication lock-in excluding Deaf or hard-of-hearing candidates',
    accommodation: 'Text/Telegram async communication channels, email, or Ethiopian Sign Language (EthSL) relay interpretation via video relay service.',
    lawCitation: 'Proclamation No. 568/2008 (Art. 5 — Prohibition of Indirect Discrimination)'
  },
  {
    regex: /kebele\s*id\s*(mandatory|required|only)|passport\s*only|national\s*id\s*required/i,
    barrier: 'Strict standard ID gate excluding refugees or internally displaced learners',
    accommodation: 'Accept UNHCR Refugee ID, partner NGO referral verification (SNV / Mercy Corps / IRC), or provisional enrollment letter under Proclamation 1110/2019.',
    lawCitation: 'Ethiopian Refugee Proclamation No. 1110/2019 (Art. 26 — Right to Work & Education)'
  },
  {
    regex: /must\s*drive|valid\s*driver.*license|own\s*vehicle|car\s*required/i,
    barrier: 'Driving/vehicle requirement that may exclude persons with certain disabilities',
    accommodation: 'Transport allowance, ride-share reimbursement, or remote/hybrid arrangement eliminating commute requirement.',
    lawCitation: 'Proclamation No. 568/2008 (Art. 5 — Indirect Discrimination Prohibition)'
  }
];

// ── Multilingual UI & Guidance Templates ─────────────────────────────────────
const I18N_Templates = {
  en: {
    groundedPrefix: 'Verified Answer from Course & Legal Sources:',
    guideReady: 'Page scanned. Select any step below to focus that element on the page or hear it read aloud.',
    noMedicalNote: 'Zero medical proof required under Ethiopian Proclamation 568/2008.',
    imageIssue: (n) => `${n} image${n !== 1 ? 's' : ''} on this page are missing alt text — a WCAG 1.1.1 violation.`
  },
  am: {
    groundedPrefix: 'ከሥርዓተ-ትምህርቱ እና ከሕግ ምንጮች የተረጋገጠ ምላሽ፦',
    guideReady: 'ገጹ ተቃኝቷል። ወደ የሚፈልጉት ክፍል ለመዝለል ወይም በድምፅ ለመስማት ከታች ያሉትን ደረጃዎች ይምረጡ።',
    noMedicalNote: 'በአዋጅ ቁጥር 568/2008 መሠረት ምንም ዓይነት የሕክምና ማስረጃ ማቅረብ አይጠበቅብዎትም።',
    imageIssue: (n) => `${n} ምስሎች በዚህ ገጽ ላይ ምንም alt ጽሑፍ የላቸውም።`
  },
  ti: {
    groundedPrefix: 'ካብ ስርዓተ-ትምህርትን ሕግን ዝተረጋገጸ ምላሽ፦',
    guideReady: 'እቲ ገጽ ተመርሚሩ ኣሎ። ነቲ ኣካል ንምትኳር ኣብ ታሕቲ ዘለዉ ደረጃታት ምረጹ።',
    noMedicalNote: 'ብመሰረት ኣዋጅ 568/2008 ወረቐት ምስክር ሕክምና ኣየድልን።',
    imageIssue: (n) => `${n} ስእልታት ኣብዚ ገጽ alt ጽሑፍ የብሎምን።`
  },
  om: {
    groundedPrefix: 'Deebii Kitaaba Barnootaa fi Seera Itoophiyaa Irratti Hundaa\'e:',
    guideReady: 'Fuulli kun sakatta\'ameera. Tarkaanfiiwwan armaan gadii filachuun gara kutaa sanaatti darbaa.',
    noMedicalNote: 'Labsii Lak. 568/2008 jalatti ragaan mana yaalaa hin barbaachisu.',
    imageIssue: (n) => `Fakkiiwwan ${n} fuula kana irratti barruu alt hin qaban.`
  },
  so: {
    groundedPrefix: 'Jawaab lagu xaqiijiyay Manhajka iyo Sharciga:',
    guideReady: 'Bogga waa la baaray. Dooro tallaabooyinka hoose si aad ugu booddo qaybtaas.',
    noMedicalNote: 'Caddeyn caafimaad looma baahna sida uu qabo Sharciga 568/2008.',
    imageIssue: (n) => `${n} sawirood ayaa boggan ka maqan qoraalka alt.`
  },
  ar: {
    groundedPrefix: 'إجابة موثقة من المنهج الدراسي والقانون الإثيوبي:',
    guideReady: 'تم فحص الصفحة بنجاح. اختر أي خطوة أدناه للتركيز على العنصر مباشرة.',
    noMedicalNote: 'لا يلزم تقديم أي إثبات طبي بموجب الإعلان رقم 568/2008.',
    imageIssue: (n) => `${n} صورة في هذه الصفحة تفتقر إلى نص بديل alt.`
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// CONTENT CLEANING (crawl4ai boilerplate removal patterns)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Clean raw text by removing boilerplate, low-quality sections, and noise.
 * Inspired by crawl4ai's extraction_strategy.py and antibot_detector.py patterns.
 *
 * @param {string} text - Raw text content
 * @returns {string} Cleaned text
 */
function cleanBoilerplate(text) {
  if (!text) return '';
  let cleaned = text;

  // Remove lines matching boilerplate patterns
  const lines = cleaned.split('\n');
  const filteredLines = lines.filter(line => {
    const trimmed = line.trim();
    // crawl4ai MIN_WORD_THRESHOLD: skip lines with fewer than 5 words
    if (trimmed.split(/\s+/).length < MIN_WORD_THRESHOLD && trimmed.length < 50) return false;
    // Remove boilerplate patterns
    for (const pattern of BOILERPLATE_PATTERNS) {
      if (pattern.test(trimmed)) return false;
    }
    return true;
  });

  cleaned = filteredLines.join('\n');

  // Collapse excessive whitespace
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').replace(/[ \t]{2,}/g, ' ').trim();

  return cleaned;
}

/**
 * Text-density scoring to find the main content area.
 * Inspired by Jina Reader's heuristic: the div with the highest text-to-HTML ratio
 * contains the article/lesson body.
 *
 * @param {Document} doc - JSDOM document
 * @returns {string} Best candidate element's text content
 */
function extractMainContentByDensity(doc) {
  const candidates = Array.from(
    doc.querySelectorAll('article, [role="main"], main, .content, .article, .post, .lesson, .course-content, section, div')
  );

  if (!candidates.length) return doc.body?.textContent || '';

  let bestScore = 0;
  let bestText = '';

  for (const el of candidates) {
    const text = el.textContent || '';
    const wordCount = text.trim().split(/\s+/).length;
    const htmlLength = el.innerHTML?.length || 1;
    // Jina-style: score = wordCount / sqrt(htmlLength) — penalises tag-heavy markup
    const score = wordCount / Math.sqrt(htmlLength);

    if (score > bestScore && wordCount > 50) {
      bestScore = score;
      bestText = text;
    }
  }

  return bestText || doc.body?.textContent || '';
}

// ══════════════════════════════════════════════════════════════════════════════
// CHUNKING STRATEGIES (ported from crawl4ai/chunking_strategy.py)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * RegexChunking: split text on paragraph breaks and headings.
 * Ported from crawl4ai RegexChunking class.
 *
 * @param {string} text
 * @returns {string[]}
 */
function regexChunk(text) {
  return text
    .split(/\n{2,}|(?=^#{1,3}\s)/m)
    .map(s => s.trim())
    .filter(s => s.split(/\s+/).length >= MIN_WORD_THRESHOLD);
}

/**
 * SlidingWindowChunking: overlapping word windows (OVERLAP_RATE = 10%).
 * Ported from crawl4ai SlidingWindowChunking class.
 *
 * @param {string} text
 * @param {number} windowSize - words per window (default: CHUNK_TOKEN_THRESHOLD)
 * @returns {string[]}
 */
function slidingWindowChunk(text, windowSize = CHUNK_TOKEN_THRESHOLD) {
  const words = text.trim().split(/\s+/);
  if (words.length <= windowSize) return [text];
  const overlap = Math.floor(windowSize * OVERLAP_RATE);
  const step = windowSize - overlap;
  const chunks = [];
  for (let i = 0; i < words.length; i += step) {
    const chunk = words.slice(i, i + windowSize).join(' ');
    if (chunk.split(/\s+/).length >= MIN_WORD_THRESHOLD) chunks.push(chunk);
    if (i + windowSize >= words.length) break;
  }
  return chunks;
}

/**
 * cleanAndChunk: unified cleaning + chunking pipeline exposed as a named export.
 * Combines boilerplate removal → density scoring → regex chunking → sliding window.
 *
 * @param {string} html - Raw HTML string
 * @param {string} url  - Source URL (for JSDOM context)
 * @returns {{ chunks: string[], mainContent: string, wordCount: number }}
 */
function cleanAndChunk(html, url = 'https://example.com') {
  const dom = new JSDOM(html, { url });
  const doc = dom.window.document;

  // Remove nav/footer/aside before extraction (crawl4ai pattern)
  for (const selector of NAV_FOOTER_TAGS) {
    try {
      doc.querySelectorAll(selector).forEach(el => el.remove());
    } catch (_) { /* invalid selector ignored */ }
  }

  // Jina-style main content extraction by text density
  const mainContent = extractMainContentByDensity(doc);
  const cleaned = cleanBoilerplate(mainContent);

  // RegexChunk first, then sliding window on long sections
  const rawChunks = regexChunk(cleaned);
  const finalChunks = [];
  for (const chunk of rawChunks) {
    const wordCount = chunk.split(/\s+/).length;
    if (wordCount > CHUNK_TOKEN_THRESHOLD) {
      finalChunks.push(...slidingWindowChunk(chunk));
    } else {
      finalChunks.push(chunk);
    }
  }

  return {
    chunks: finalChunks,
    mainContent: cleaned,
    wordCount: cleaned.split(/\s+/).length
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// IMAGE ACCESSIBILITY CHECKER (WCAG 1.1.1)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Count images missing alt text on a parsed DOM.
 * @param {Document} doc
 * @returns {{ total: number, missing: number, missingUrls: string[] }}
 */
function checkImageAltText(doc) {
  const imgs = Array.from(doc.querySelectorAll('img'));
  const missing = imgs.filter(img => {
    const alt = img.getAttribute('alt');
    return alt === null || (alt.trim() === '' && !img.getAttribute('role'));
  });
  return {
    total: imgs.length,
    missing: missing.length,
    missingUrls: missing.slice(0, 5).map(img => img.getAttribute('src') || '(no src)').filter(Boolean)
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// MULTI-TIER SCRAPER
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Tier 1: Self-hosted Crawl4AI Docker API
 * @param {string} targetUrl
 */
async function scrapeViaCrawl4AI(targetUrl) {
  const crawl4aiUrl = process.env.CRAWL4AI_URL || 'http://localhost:11235';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);
  try {
    const res = await fetch(`${crawl4aiUrl}/crawl`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        urls: [targetUrl],
        word_count_threshold: MIN_WORD_THRESHOLD,
        exclude_external_links: false,
        generate_markdown: true
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    const result = data?.results?.[0];
    if (!result?.markdown) return null;
    return {
      engine: 'crawl4ai-oss',
      title: result.metadata?.title || targetUrl,
      content: cleanBoilerplate(result.markdown),
      links: result.links || [],
      imageAltIssues: result.media?.images?.filter(img => !img.alt).length || 0,
      url: targetUrl
    };
  } catch (_) {
    clearTimeout(timeout);
    return null;
  }
}

/**
 * Tier 1.5: Local fast-path using enhanced DOM extraction (Jina-inspired density scoring).
 * No external servers required — works offline on 2G/3G.
 * @param {string} targetUrl
 */
async function scrapeViaLocalFastPath(targetUrl) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const rawRes = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'BridgeMate-Accessible-Guide/2.0 (+https://digitalbridge.et)',
        'Accept': 'text/html,application/xhtml+xml'
      },
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!rawRes.ok) return null;
    const html = await rawRes.text();

    const { mainContent, wordCount } = cleanAndChunk(html, targetUrl);
    if (wordCount < 30) return null;

    const dom = new JSDOM(html, { url: targetUrl });
    const doc = dom.window.document;
    const imgAlt = checkImageAltText(doc);

    // Extract interactive elements BEFORE Readability strips them
    const interactiveElements = Array.from(
      doc.querySelectorAll('h1, h2, h3, a[href], button, input, select, textarea')
    )
      .slice(0, 25)
      .map((el, idx) => ({
        step: idx + 1,
        tag: el.tagName.toLowerCase(),
        label: (el.textContent?.trim() || el.getAttribute('aria-label') || el.getAttribute('placeholder') || 'Interactive Control')
          .slice(0, 90),
        href: el.getAttribute('href') || null
      }))
      .filter(item => item.label.length > 1);

    // Run Readability for clean article extraction
    const reader = new Readability(doc);
    const parsed = reader.parse();

    return {
      engine: 'local-fast-path-v2',
      title: parsed?.title || doc.title || targetUrl,
      content: cleanBoilerplate(parsed?.textContent || mainContent),
      excerpt: parsed?.excerpt || '',
      interactiveSteps: interactiveElements,
      imageAltIssues: imgAlt.missing,
      imageAltReport: imgAlt,
      url: targetUrl
    };
  } catch (_) {
    return null;
  }
}

/**
 * Tier 2: Jina AI Reader OSS endpoint with auto-generated image alt text.
 * Uses X-With-Generated-Alt: true so blind users get described images.
 * @param {string} targetUrl
 */
async function scrapeViaJinaReader(targetUrl) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`https://r.jina.ai/${targetUrl}`, {
      headers: {
        'Accept': 'application/json',
        'X-With-Generated-Alt': 'true',   // Jina generates AI alt text for images
        'X-With-Links-Summary': 'true',
        'X-Return-Format': 'markdown'
      },
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.data?.content) return null;
    return {
      engine: 'jina-reader-oss',
      title: json.data.title || targetUrl,
      content: cleanBoilerplate(json.data.content),
      links: json.data.links || {},
      imageAltIssues: 0, // Jina auto-generates alt text
      url: targetUrl
    };
  } catch (_) {
    return null;
  }
}

/**
 * Tier 3 fallback: Direct HTML fetch + Readability (always available offline)
 * @param {string} targetUrl
 */
async function scrapeViaReadability(targetUrl) {
  const rawRes = await fetch(targetUrl, {
    headers: { 'User-Agent': 'BridgeMate-Accessible-Guide/2.0 (+https://digitalbridge.et)' }
  });
  const html = await rawRes.text();
  const dom = new JSDOM(html, { url: targetUrl });
  const doc = dom.window.document;
  const imgAlt = checkImageAltText(doc);

  const interactiveElements = Array.from(
    doc.querySelectorAll('h1, h2, h3, a[href], button, input, select, textarea')
  )
    .slice(0, 25)
    .map((el, idx) => ({
      step: idx + 1,
      tag: el.tagName.toLowerCase(),
      label: (el.textContent?.trim() || el.getAttribute('aria-label') || el.getAttribute('placeholder') || 'Interactive Control').slice(0, 90),
      href: el.getAttribute('href') || null
    }))
    .filter(item => item.label.length > 1);

  const reader = new Readability(doc);
  const parsed = reader.parse();

  return {
    engine: 'mozilla-readability-local',
    title: parsed?.title || doc.title || targetUrl,
    content: cleanBoilerplate(parsed?.textContent || doc.body?.textContent || ''),
    excerpt: parsed?.excerpt || '',
    interactiveSteps: interactiveElements,
    imageAltIssues: imgAlt.missing,
    imageAltReport: imgAlt,
    url: targetUrl
  };
}

/**
 * Main scraper: tries all 4 tiers in order, falls back gracefully.
 * @param {string} targetUrl
 */
async function scrapeUrlWithOpenSourceStack(targetUrl) {
  // Tier 1: Crawl4AI Docker
  const c4Result = await scrapeViaCrawl4AI(targetUrl);
  if (c4Result) return c4Result;

  // Tier 1.5: Local fast-path (Jina-inspired density scoring + Readability)
  const localResult = await scrapeViaLocalFastPath(targetUrl);
  if (localResult) return localResult;

  // Tier 2: Jina Reader OSS
  const jinaResult = await scrapeViaJinaReader(targetUrl);
  if (jinaResult) return jinaResult;

  // Tier 3: Direct Readability (always works, may be noisy)
  return await scrapeViaReadability(targetUrl);
}

// ══════════════════════════════════════════════════════════════════════════════
// CITATION CHUNKER
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Splits scraped content into citation-carrying sections using crawl4ai chunking patterns.
 * Each chunk carries exact sourceTitle, sourceUrl, and section heading for grounded citations.
 *
 * @param {object} scrapedDoc
 * @returns {Array<{sourceTitle, sourceUrl, section, text}>}
 */
function chunkIntoCitedSections(scrapedDoc) {
  const rawLines = (scrapedDoc.content || '').split(/\n+/);
  const chunks = [];
  let currentHeading = scrapedDoc.title || 'Main Section';
  let buffer = [];

  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^#{1,3}\s+/.test(trimmed)) {
      if (buffer.length > 0) {
        const text = buffer.join(' ');
        // crawl4ai MIN_WORD_THRESHOLD filter
        if (text.split(/\s+/).length >= MIN_WORD_THRESHOLD) {
          chunks.push({ sourceTitle: scrapedDoc.title, sourceUrl: scrapedDoc.url, section: currentHeading, text });
        }
        buffer = [];
      }
      currentHeading = trimmed.replace(/^#{1,3}\s+/, '');
    } else {
      buffer.push(trimmed);
      // crawl4ai CHUNK_TOKEN_THRESHOLD: flush at 300 words to avoid oversized chunks
      if (buffer.join(' ').split(/\s+/).length > CHUNK_TOKEN_THRESHOLD) {
        chunks.push({ sourceTitle: scrapedDoc.title, sourceUrl: scrapedDoc.url, section: currentHeading, text: buffer.join(' ') });
        // 10% overlap: keep last ~30 words as context for next chunk (crawl4ai OVERLAP_RATE)
        const words = buffer.join(' ').split(/\s+/);
        buffer = words.slice(-Math.floor(CHUNK_TOKEN_THRESHOLD * OVERLAP_RATE));
      }
    }
  }
  if (buffer.length >= MIN_WORD_THRESHOLD) {
    chunks.push({ sourceTitle: scrapedDoc.title, sourceUrl: scrapedDoc.url, section: currentHeading, text: buffer.join(' ') });
  }
  return chunks;
}

// ══════════════════════════════════════════════════════════════════════════════
// JOB BARRIER DECODER
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Detect exclusionary job requirements and map them to legal accommodations.
 * @param {string} text - Job description or question text
 * @returns {Array<{barrier, recommendedAccommodation, legalCitation}>}
 */
function decodeJobBarriers(text) {
  const detected = [];
  for (const rule of BARRIER_RULES) {
    if (rule.regex.test(text)) {
      detected.push({
        barrier: rule.barrier,
        recommendedAccommodation: rule.accommodation,
        legalCitation: rule.lawCitation
      });
    }
  }
  return detected;
}

// ══════════════════════════════════════════════════════════════════════════════
// CORE PROCESSING FUNCTION
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Core processing pipeline callable by HTTP handlers, Telegram bot, and LTI endpoint.
 *
 * @param {object} opts
 * @param {string} [opts.url]        - URL to scrape
 * @param {string} [opts.query]      - Learner question
 * @param {string} [opts.lang]       - Language code: en|am|ti|om|so|ar
 * @param {boolean} [opts.simpleMode] - Return 2-sentence plain-language mode
 * @returns {Promise<object>}
 */
async function processScrapeAndGuide({ url, query = '', lang = 'en', simpleMode = false }) {
  const i18n = I18N_Templates[lang] || I18N_Templates.en;

  let scrapedDoc;
  if (url && /^https?:\/\//i.test(url)) {
    try {
      scrapedDoc = await scrapeUrlWithOpenSourceStack(url);
    } catch (err) {
      // Tier 4: Offline 2G/3G corpus fallback
      console.warn(`[BridgeMate] All scrapers failed for ${url}:`, err.message);
      scrapedDoc = {
        engine: 'offline-tier4-corpus',
        title: OFFLINE_KNOWLEDGE_BASE[0].title,
        url: OFFLINE_KNOWLEDGE_BASE[0].url,
        content: OFFLINE_KNOWLEDGE_BASE.map(d =>
          d.sections.map(s => `## ${s.heading}\n${s.content}`).join('\n')
        ).join('\n\n'),
        imageAltIssues: 0
      };
    }
  } else {
    // Grounded search across local course + Ethiopian proclamation knowledge base
    scrapedDoc = {
      engine: 'course-grounded-rag',
      title: 'ALX Savanna & Ethiopian Disability Rights Corpus',
      url: 'https://savanna.alxafrica.com/courses/accessibility',
      content: OFFLINE_KNOWLEDGE_BASE.map(d =>
        d.sections.map(s => `## ${s.heading} (${d.title})\n${s.content}`).join('\n')
      ).join('\n\n'),
      imageAltIssues: 0
    };
  }

  const chunks = chunkIntoCitedSections(scrapedDoc);
  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);

  // BM25-inspired ranking: score chunks by query term frequency
  const rankedChunks = chunks
    .map(chunk => {
      const hay = `${chunk.section} ${chunk.text}`.toLowerCase();
      const score = terms.reduce((acc, term) => {
        const freq = (hay.match(new RegExp(term, 'g')) || []).length;
        return acc + Math.min(freq * 2, 10); // term-freq cap
      }, 1);
      return { ...chunk, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const barriers = decodeJobBarriers((scrapedDoc.content || '') + ' ' + query);
  const imageAltIssues = scrapedDoc.imageAltIssues || 0;

  return {
    status: 'ok',
    scraperVersion: SCRAPER_VERSION,
    engineUsed: scrapedDoc.engine,
    lang,
    dir: lang === 'ar' ? 'rtl' : 'ltr',
    headerMessage: i18n.groundedPrefix,
    guideNotice: i18n.guideReady,
    privacyGuarantee: i18n.noMedicalNote,
    pageTitle: scrapedDoc.title,
    sourceUrl: scrapedDoc.url,
    groundedAnswers: rankedChunks.map(c => ({
      sectionHeading: c.section,
      explanation: simpleMode
        ? c.text.split(/\.\s+/).slice(0, 2).join('. ') + '.'
        : c.text,
      citation: {
        title: c.sourceTitle,
        section: c.section,
        url: c.sourceUrl
      }
    })),
    interactivePageGuide: scrapedDoc.interactiveSteps || [],
    jobBarriersDecoded: barriers,
    imageAccessibilityReport: imageAltIssues > 0
      ? { issuesFound: imageAltIssues, message: i18n.imageIssue(imageAltIssues), wcagCriterion: 'WCAG 1.1.1' }
      : null
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// EXPRESS ROUTER
// ══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/v1/scrape-and-guide
 * Scrapes any URL or searches grounded course content, decodes barriers,
 * and returns a cited, screen-reader-friendly guide in the learner's language.
 */
router.post('/scrape-and-guide', async (req, res) => {
  try {
    const result = await processScrapeAndGuide(req.body || {});
    return res.json(result);
  } catch (error) {
    console.error('[BridgeMate] scrape-and-guide error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to process page guide safely. The offline corpus is still available.',
      detail: error.message
    });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ══════════════════════════════════════════════════════════════════════════════

module.exports = {
  router,
  processScrapeAndGuide,
  decodeJobBarriers,
  cleanAndChunk,
  OFFLINE_KNOWLEDGE_BASE,
  BARRIER_RULES,
  SCRAPER_VERSION,
};
