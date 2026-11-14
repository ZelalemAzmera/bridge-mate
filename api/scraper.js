/**
 * BridgeMate — Multi-Tier Web Scraper
 * Tier 1: crawl4ai container (http://localhost:11235/crawl)
 * Tier 2: Jina Reader (https://r.jina.ai/)
 * Tier 3: Local @mozilla/readability + jsdom
 * Tier 4: Offline fallback corpus
 */

'use strict';

const https = require('https');
const http = require('http');

// Conditionally require jsdom + readability (may not be installed)
let Readability, JSDOM;
try {
  ({ Readability } = require('@mozilla/readability'));
  ({ JSDOM } = require('jsdom'));
} catch (e) {
  // Not available — will skip Tier 3
}

const JINA_TIMEOUT = 15000;
const CRAWL4AI_URL = process.env.CRAWL4AI_URL || 'http://localhost:11235/crawl';

/**
 * Offline knowledge base — cited content usable without internet.
 */
const OFFLINE_CORPUS = [
  {
    id: 'proc-1156-2019-art29',
    heading: 'Ethiopian Labour Proclamation No. 1156/2019 — Article 29: Rights of Workers with Disabilities',
    content: 'Article 29 of Proclamation No. 1156/2019 requires employers to provide reasonable adjustments for workers with disabilities, including accessible workplaces, adapted tools, and flexible working arrangements. Employers may not require disclosure of medical diagnosis as a precondition for employment or adjustment.',
    url: 'https://www.ilo.org/dyn/natlex/natlex4.detail?p_lang=en&p_isn=109368',
    section: 'Article 29'
  },
  {
    id: 'proc-568-2008',
    heading: 'Ethiopian Disability Rights Proclamation No. 568/2008',
    content: 'Proclamation No. 568/2008 provides for the rights of persons with disabilities in Ethiopia, prohibiting discrimination in employment, education, and public services, and mandating accessible infrastructure and reasonable accommodation.',
    url: 'https://www.refworld.org/docid/4b8f1f7a2.html',
    section: 'Full text'
  },
  {
    id: 'wcag22-overview',
    heading: 'WCAG 2.2 Level AA — Accessibility Requirements',
    content: 'WCAG 2.2 Level AA requires: perceivable content (text alternatives, captions), operable interfaces (keyboard accessible, 44×44px targets, no keyboard traps, visible focus), understandable content (language declared, error identification), and robust markup (valid ARIA, role compatibility). All digital tools in Ethiopia\'s public sector should meet this standard.',
    url: 'https://www.w3.org/WAI/WCAG22/quickref/',
    section: 'Overview'
  },
  {
    id: 'alx-va-future',
    heading: 'ALX — What is Shaping the Future of VA Work?',
    content: 'The virtual assistant industry is transforming rapidly through AI, shifting client expectations, and remote-work adoption. Ethiopian professionals have strong opportunities: multilingual skills, ALX training, and growing internet access. VAs who learn AI tools and specialize in a niche will have the highest demand.',
    url: '/savanna/pages/concept-with-navigation.html',
    section: 'Module overview'
  }
];

/**
 * Fetch a URL as text using Node's built-in https/http.
 */
function fetchText(urlStr, headers = {}, timeoutMs = JINA_TIMEOUT) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlStr);
    const lib = parsed.protocol === 'https:' ? https : http;
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: { 'User-Agent': 'BridgeMate/2.0 (Accessibility Bot)', ...headers }
    };
    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => resolve(data));
    });
    req.setTimeout(timeoutMs, () => { req.destroy(); reject(new Error('Timeout')); });
    req.on('error', reject);
    req.end();
  });
}

/**
 * Post JSON to a URL and get JSON response.
 */
function postJson(urlStr, body, timeoutMs = JINA_TIMEOUT) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlStr);
    const lib = parsed.protocol === 'https:' ? https : http;
    const data = JSON.stringify(body);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'User-Agent': 'BridgeMate/2.0 (Accessibility Bot)'
      }
    };
    const req = lib.request(options, (res) => {
      let raw = '';
      res.on('data', c => { raw += c; });
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { resolve({ content: raw }); }
      });
    });
    req.setTimeout(timeoutMs, () => { req.destroy(); reject(new Error('Timeout')); });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

/**
 * Tier 1: crawl4ai container
 */
async function scrapeTierCrawl4ai(url) {
  const result = await postJson(CRAWL4AI_URL, {
    urls: [url],
    extraction_config: { type: 'markdown' },
    chunking_strategy: { type: 'regex', pattern: '\n\n' }
  }, 10000);
  const md = result.results && result.results[0] && result.results[0].markdown;
  if (!md || md.length < 100) throw new Error('crawl4ai: insufficient content');
  return { markdown: md, tier: 'crawl4ai' };
}

/**
 * Tier 2: Jina Reader
 */
async function scrapeTierJina(url) {
  const jinaUrl = `https://r.jina.ai/${url}`;
  const md = await fetchText(jinaUrl, { 'X-With-Generated-Alt': 'true' }, JINA_TIMEOUT);
  if (!md || md.length < 100) throw new Error('Jina: insufficient content');
  return { markdown: md, tier: 'jina' };
}

/**
 * Tier 3: Local readability + jsdom
 */
async function scrapeTierReadability(url) {
  if (!Readability || !JSDOM) throw new Error('readability: not installed');
  const html = await fetchText(url, {}, JINA_TIMEOUT);
  const dom = new JSDOM(html, { url });
  const article = new Readability(dom.window.document).parse();
  if (!article || !article.textContent || article.textContent.length < 50) {
    throw new Error('readability: insufficient content');
  }
  return { markdown: `# ${article.title}\n\n${article.textContent}`, tier: 'readability' };
}

/**
 * Tier 4: Offline corpus search
 */
function scrapeTierOffline(url) {
  // Return all offline sections as markdown
  const md = OFFLINE_CORPUS.map(s => `## ${s.heading}\n${s.content}\n\nSource: ${s.url}`).join('\n\n---\n\n');
  return { markdown: md, tier: 'offline', sections: OFFLINE_CORPUS };
}

/**
 * Main scrape function — tries each tier in order.
 * @param {string} url
 * @returns {Promise<{markdown: string, tier: string, sections?: Array}>}
 */
async function scrape(url) {
  const tiers = [
    () => scrapeTierCrawl4ai(url),
    () => scrapeTierJina(url),
    () => scrapeTierReadability(url),
    () => Promise.resolve(scrapeTierOffline(url))
  ];

  let lastError;
  for (const tier of tiers) {
    try {
      return await tier();
    } catch (err) {
      lastError = err;
      console.warn(`[scraper] Tier failed: ${err.message}`);
    }
  }

  // Final fallback
  return scrapeTierOffline(url);
}

/**
 * Convert markdown to sections array for RAG.
 * @param {string} markdown
 * @returns {Array<{id, heading, content, url}>}
 */
function markdownToSections(markdown, sourceUrl = '') {
  const sections = [];
  const lines = markdown.split('\n');
  let currentHeading = 'Introduction';
  let currentId = 'introduction';
  let contentLines = [];

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,3}\s+(.+)/);
    if (headingMatch) {
      if (contentLines.length > 0) {
        sections.push({
          id: currentId,
          heading: currentHeading,
          content: contentLines.join('\n').trim(),
          url: `${sourceUrl}#${currentId}`
        });
      }
      currentHeading = headingMatch[1].trim();
      currentId = currentHeading.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');
      contentLines = [];
    } else {
      contentLines.push(line);
    }
  }

  if (contentLines.length > 0) {
    sections.push({
      id: currentId,
      heading: currentHeading,
      content: contentLines.join('\n').trim(),
      url: `${sourceUrl}#${currentId}`
    });
  }

  return sections.filter(s => s.content.length > 30);
}

module.exports = { scrape, markdownToSections, OFFLINE_CORPUS };
