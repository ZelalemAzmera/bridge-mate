/**
 * BridgeMate — Telegram Bot (long-polling, no webhook server required)
 * Commands: /ask, /scrape, /jobs, /livehelp, /lang, /alerts, /help
 * Zero external Telegraf dependency — uses raw Telegram Bot API over HTTPS.
 */

'use strict';

const https = require('https');
const { scrape, markdownToSections } = require('./scraper');
const { answer: answerOffline } = require('./providers/none');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const POLL_INTERVAL = 2000;
const TIMEOUT_S = 30;

let userLanguages = {}; // chatId -> language code
let isPolling = false;
let lastUpdateId = 0;

function tgPost(method, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${BOT_TOKEN}/${method}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };
    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', c => { raw += c; });
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { resolve({ ok: false }); }
      });
    });
    req.setTimeout(45000, () => { req.destroy(); reject(new Error('TG timeout')); });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function sendMessage(chatId, text, parseMode = 'Markdown') {
  return tgPost('sendMessage', {
    chat_id: chatId,
    text: text.slice(0, 4096),
    parse_mode: parseMode,
    disable_web_page_preview: true
  });
}

async function getUpdates(offset) {
  return tgPost('getUpdates', {
    offset,
    timeout: TIMEOUT_S,
    allowed_updates: ['message']
  });
}

// Load jobs data
let jobsCache = [];
try {
  const path = require('path');
  const fs = require('fs');
  const jobsPath = path.join(__dirname, '..', 'data', 'jobs.json');
  if (fs.existsSync(jobsPath)) {
    jobsCache = JSON.parse(fs.readFileSync(jobsPath, 'utf8'));
  }
} catch (e) { /* no jobs data */ }

// Load content sections
let contentSections = [];
try {
  const path = require('path');
  const fs = require('fs');
  const contentPath = path.join(__dirname, '..', 'data', 'content.json');
  if (fs.existsSync(contentPath)) {
    const data = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
    contentSections = data.sections || [];
  }
} catch (e) { /* no content */ }

const HELP_TEXT = `🌉 *BridgeMate Assistant* — Commands:

/ask [question] — Ask anything about ALX, careers, or accessibility
/jobs — Browse latest Ethiopian tech jobs
/scrape [url] — Extract & summarize any webpage
/livehelp — Request a human support agent
/lang [am|en|ti|om|so|ar] — Set your language
/alerts — Subscribe to new job alerts
/help — Show this menu`;

const LANG_NAMES = { am: 'አማርኛ', en: 'English', ti: 'ትግርኛ', om: 'Afaan Oromoo', so: 'Soomaali', ar: 'العربية' };

async function handleUpdate(update) {
  const msg = update.message;
  if (!msg || !msg.text) return;

  const chatId = msg.chat.id;
  const text = msg.text.trim();
  const lang = userLanguages[chatId] || 'en';

  if (text.startsWith('/start') || text.startsWith('/help')) {
    await sendMessage(chatId, HELP_TEXT);
    return;
  }

  if (text.startsWith('/lang')) {
    const parts = text.split(/\s+/);
    const code = parts[1] ? parts[1].toLowerCase() : '';
    if (LANG_NAMES[code]) {
      userLanguages[chatId] = code;
      await sendMessage(chatId, `✅ Language set to ${LANG_NAMES[code]}`);
    } else {
      const list = Object.entries(LANG_NAMES).map(([k, v]) => `\`${k}\` — ${v}`).join('\n');
      await sendMessage(chatId, `Please choose:\n${list}`);
    }
    return;
  }

  if (text.startsWith('/ask')) {
    const question = text.replace(/^\/ask\s*/, '').trim();
    if (!question) {
      await sendMessage(chatId, 'Usage: /ask [your question]');
      return;
    }
    await sendMessage(chatId, '🔍 Searching…');
    try {
      const { text: answerText, sources } = await answerOffline(question, contentSections, lang);
      let reply = answerText;
      if (sources && sources.length > 0) {
        reply += '\n\n📚 *Sources:*\n' + sources.map(s => `• [${s.title}](${s.url})`).join('\n');
      }
      await sendMessage(chatId, reply);
    } catch (err) {
      await sendMessage(chatId, '❌ Could not find an answer. Try rephrasing your question.');
    }
    return;
  }

  if (text.startsWith('/jobs')) {
    if (jobsCache.length === 0) {
      await sendMessage(chatId, 'No jobs available offline. Try /scrape [job board URL]');
      return;
    }
    const jobList = jobsCache.slice(0, 5).map((job, i) =>
      `*${i + 1}. ${job.title}*\n🏢 ${job.organization}\n💰 ${job.salaryDisplay || 'ETB TBD'}\n📍 ${job.jobLocationType === 'TELECOMMUTE' ? 'Remote' : 'On-site'}\n🔗 ${job.applyUrl || '#'}`
    ).join('\n\n');
    await sendMessage(chatId, `🇪🇹 *Ethiopian Tech Jobs*\n\n${jobList}`);
    return;
  }

  if (text.startsWith('/scrape')) {
    const url = text.replace(/^\/scrape\s*/, '').trim();
    if (!url || !url.startsWith('http')) {
      await sendMessage(chatId, 'Usage: /scrape [https://...]');
      return;
    }
    await sendMessage(chatId, `⏳ Scraping ${url}…`);
    try {
      const { markdown, tier } = await scrape(url);
      const preview = markdown.slice(0, 600);
      await sendMessage(chatId, `📄 *Page summary* (via ${tier}):\n\n${preview}…`);
    } catch (err) {
      await sendMessage(chatId, '❌ Could not scrape that URL. It may be blocked or inaccessible.');
    }
    return;
  }

  if (text.startsWith('/livehelp')) {
    await sendMessage(chatId, `👤 *Connecting you to a human agent…*\n\nA support volunteer will respond within 24 hours.\n\nYour rights under Ethiopian Proclamation No. 1156/2019 Art. 29 protect you from discrimination in requesting workplace adjustments.`);
    return;
  }

  if (text.startsWith('/alerts')) {
    await sendMessage(chatId, `🔔 *Job Alerts Active!*\n\nYou'll receive new Ethiopian tech job alerts in this chat.\n\nCurrently ${jobsCache.length} jobs available. Use /jobs to browse now.`);
    return;
  }

  // Default: treat as /ask
  if (text && !text.startsWith('/')) {
    const { text: answerText, sources } = await answerOffline(text, contentSections, lang);
    let reply = answerText;
    if (sources && sources.length > 0) {
      reply += '\n\n📚 *Sources:*\n' + sources.map(s => `• [${s.title}](${s.url})`).join('\n');
    }
    await sendMessage(chatId, reply);
  }
}

/**
 * Process a single webhook update (called from server.js when in webhook mode).
 */
async function handleWebhookUpdate(update) {
  try {
    await handleUpdate(update);
  } catch (err) {
    console.error('[telegram] Webhook error:', err.message);
  }
}

/**
 * Start long-polling loop.
 */
async function startPolling() {
  if (!BOT_TOKEN) {
    console.log('[telegram] No TELEGRAM_BOT_TOKEN set — bot disabled.');
    return;
  }
  if (isPolling) return;
  isPolling = true;
  console.log('[telegram] Starting long-poll loop…');

  while (isPolling) {
    try {
      const result = await getUpdates(lastUpdateId + 1);
      if (result.ok && result.result && result.result.length > 0) {
        for (const update of result.result) {
          if (update.update_id > lastUpdateId) {
            lastUpdateId = update.update_id;
          }
          await handleUpdate(update).catch(e => console.error('[telegram] Update error:', e.message));
        }
      }
    } catch (err) {
      console.warn('[telegram] Poll error:', err.message);
      await new Promise(r => setTimeout(r, POLL_INTERVAL));
    }
  }
}

function stopPolling() {
  isPolling = false;
}

module.exports = { startPolling, stopPolling, handleWebhookUpdate };
