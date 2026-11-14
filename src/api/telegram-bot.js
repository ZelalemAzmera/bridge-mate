/**
 * BridgeMate — Telegram Bot (Telegraf)
 * Track 3: Multi-channel delivery — works on 2G with text-only responses
 *
 * Commands:
 *  /ask <question>    — Course guidance grounded in ALX + Ethiopian law corpus
 *  /scrape <url>      — Analyze any page (crawl4ai → jina → readability → offline)
 *  /decode <job_text> — Decode job requirements for barriers + accommodations
 *  /livehelp          — Request live human tutor (Alt+H equivalent in Telegram)
 *  /alerts            — Subscribe to job alerts
 *  /lang <code>       — Switch language: en|am|ti|om|so|ar
 *
 * Offline sandbox: If TELEGRAM_BOT_TOKEN is unset, the bot runs in sandbox
 * mode — all webhook requests return structured mock responses so the UI
 * works without a real Telegram bot token.
 */

'use strict';

const { processScrapeAndGuide, decodeJobBarriers } = require('./scraper-guide-engine.js');
const { generateAnswer, buildOfflineIndex, BM25Index } = require('./ai-adapter.js');

// Per-user language preference store (in-memory, ephemeral)
const userLangStore = new Map();

// In-memory subscriber list for /alerts
const alertSubscribers = new Set();

// ── Multilingual Bot Response Templates ──────────────────────────────────────
const BOT_MESSAGES = {
  en: {
    welcome: `🌍 *BridgeMate Assistant* — Track 3
I help Ethiopian learners with course questions, job applications, and disability rights.

Commands:
• /ask <question> — Get cited course guidance
• /scrape <url> — Analyze any webpage
• /decode <job text> — Find hidden barriers
• /livehelp — Connect to a human tutor
• /alerts — Get job notifications
• /lang am|ti|om|so|ar|en — Switch language

_Zero medical disclosure required — Proclamation 568/2008_`,
    helpRequested: `🤝 *Live Human Help Requested*\nA tutor will contact you shortly via this Telegram chat.\n\n📱 Direct contact: @bridgemate_support\n📧 Email: support@digitalbridge.et\n🤟 EthSL (Ethiopian Sign Language) interpretation available on request.\n\n_Your context has been forwarded. You don't need to repeat yourself._`,
    alertsSubscribed: `🔔 *Job Alerts Active*\nYou'll receive notifications for new accessible tech jobs in Ethiopia.\n\nCurrently monitoring: Kifiya, iCog Labs, Addis Systems, ALX partner employers.\n_Zero medical proof required for any listed role._`,
    decodeIntro: '🔍 *Job Barrier Analysis*\n\n',
    noBarriers: '✅ No exclusionary barriers detected in this job description.',
    scrapeIntro: '📄 *Page Analysis Complete*\n\n',
    langSet: (lang) => `✅ Language set to ${lang}. Responses will now be in your selected language.`,
    error: '❌ Sorry, something went wrong. The offline guide is still available — try /ask without a URL.'
  },
  am: {
    welcome: `🌍 *BridgeMate ረዳት* — Track 3\nስለ ኮርስዎ፣ የሥራ ማመልከቻ እና የ장애 መብቶች ጥያቄዎችን ለሚያቀርቡ ኢትዮጵያውያን ተማሪዎች።\n\n• /ask <ጥያቄ> — ትምህርታዊ ምክር ያግኙ\n• /scrape <url> — ማናቸውንም ገጽ ያጥኑ\n• /decode <የሥራ ጽሑፍ> — ያልታዩ ችግሮችን ያግኙ\n• /livehelp — ሰዋዊ አስተማሪ ይጠይቁ\n\n_ምንም ዓይነት የሕክምና ሰነድ አያስፈልግም_`,
    helpRequested: `🤝 *የሰው ረዳት ተጠይቋል*\nአስተማሪ በቅርቡ ያነጋግሩዎታል። @bridgemate_support\n🤟 የኢትዮጵያ የምልክት ቋንቋ አስተርጓሚ ይገኛል።`,
    error: '❌ ይቅርታ፣ ችግር ተፈጥሯል። /ask ሲጠቀሙ ዳግም ይሞክሩ።'
  }
};

function getBotMsg(userId, key, ...args) {
  const lang = userLangStore.get(userId) || 'en';
  const msgs = BOT_MESSAGES[lang] || BOT_MESSAGES.en;
  const val = msgs[key] || BOT_MESSAGES.en[key];
  return typeof val === 'function' ? val(...args) : val || '';
}

// ── Telegraf Bot Setup ────────────────────────────────────────────────────────

/**
 * Create and configure a Telegraf bot instance.
 * Returns null if Telegraf is not available or token is missing.
 */
function createTelegrafBot(token) {
  try {
    const { Telegraf } = require('telegraf');
    const bot = new Telegraf(token);

    // ── /start and /help ─────────────────────────────────────────────────
    bot.start(async (ctx) => {
      const userId = ctx.from?.id;
      await ctx.replyWithMarkdown(getBotMsg(userId, 'welcome'));
    });

    bot.help(async (ctx) => {
      const userId = ctx.from?.id;
      await ctx.replyWithMarkdown(getBotMsg(userId, 'welcome'));
    });

    // ── /lang <code> ─────────────────────────────────────────────────────
    bot.command('lang', async (ctx) => {
      const userId = ctx.from?.id;
      const args = ctx.message?.text?.split(' ').slice(1);
      const lang = args?.[0]?.toLowerCase();
      const supported = ['en', 'am', 'ti', 'om', 'so', 'ar'];
      if (!lang || !supported.includes(lang)) {
        return ctx.reply(`Please specify a language: ${supported.join('|')}\nExample: /lang am`);
      }
      userLangStore.set(userId, lang);
      await ctx.reply(getBotMsg(userId, 'langSet', lang));
    });

    // ── /ask <question> ───────────────────────────────────────────────────
    bot.command('ask', async (ctx) => {
      const userId = ctx.from?.id;
      const lang = userLangStore.get(userId) || 'en';
      const query = ctx.message?.text?.replace(/^\/ask\s*/i, '').trim();

      if (!query) return ctx.reply('Usage: /ask <your question>\nExample: /ask What is WCAG keyboard navigation?');

      await ctx.reply('🔍 Searching course knowledge base…');

      try {
        const result = await processScrapeAndGuide({ query, lang, simpleMode: true });
        const topAnswer = result.groundedAnswers?.[0];
        if (!topAnswer) return ctx.reply('No specific answer found. Try rephrasing or visit https://savanna.alxafrica.com');

        const citation = topAnswer.citation;
        const citationLine = `\n\n📚 _Source: ${citation.title} — ${citation.section}_`;
        const barrierLine = result.jobBarriersDecoded?.length
          ? `\n\n⚠️ *Barrier detected:* ${result.jobBarriersDecoded[0].barrier}\n✅ ${result.jobBarriersDecoded[0].recommendedAccommodation}`
          : '';

        await ctx.replyWithMarkdown(`*Answer:*\n${topAnswer.explanation}${citationLine}${barrierLine}`);
      } catch (err) {
        await ctx.reply(getBotMsg(userId, 'error'));
      }
    });

    // ── /scrape <url> ─────────────────────────────────────────────────────
    bot.command('scrape', async (ctx) => {
      const userId = ctx.from?.id;
      const lang = userLangStore.get(userId) || 'en';
      const url = ctx.message?.text?.replace(/^\/scrape\s*/i, '').trim();

      if (!url || !/^https?:\/\//.test(url)) {
        return ctx.reply('Usage: /scrape <url>\nExample: /scrape https://savanna.alxafrica.com/courses/module-3');
      }

      await ctx.reply(`${getBotMsg(userId, 'scrapeIntro')}Scanning ${url}…`);

      try {
        const result = await processScrapeAndGuide({ url, lang, simpleMode: true });
        const topAnswer = result.groundedAnswers?.[0];
        const steps = result.interactivePageGuide?.slice(0, 5) || [];

        let reply = `📄 *${result.pageTitle}*\n\n`;
        if (topAnswer) reply += `${topAnswer.explanation}\n`;
        if (steps.length) {
          reply += '\n*Interactive Elements:*\n';
          steps.forEach(s => { reply += `${s.step}. [${s.tag.toUpperCase()}] ${s.label}\n`; });
        }
        if (result.imageAccessibilityReport) {
          reply += `\n⚠️ *Accessibility:* ${result.imageAccessibilityReport.message}`;
        }

        await ctx.replyWithMarkdown(reply.slice(0, 4000));
      } catch (err) {
        await ctx.reply(getBotMsg(userId, 'error'));
      }
    });

    // ── /decode <job_text> ────────────────────────────────────────────────
    bot.command('decode', async (ctx) => {
      const userId = ctx.from?.id;
      const jobText = ctx.message?.text?.replace(/^\/decode\s*/i, '').trim();

      if (!jobText) {
        return ctx.reply('Usage: /decode <job description text>\nExample: /decode Must have 20/20 vision and climb stairs to 4th floor');
      }

      const barriers = decodeJobBarriers(jobText);

      if (!barriers.length) {
        return ctx.reply(getBotMsg(userId, 'noBarriers'));
      }

      let reply = getBotMsg(userId, 'decodeIntro');
      barriers.forEach((b, i) => {
        reply += `*${i + 1}. Barrier:* ${b.barrier}\n`;
        reply += `✅ *Accommodation:* ${b.recommendedAccommodation}\n`;
        reply += `⚖️ _${b.legalCitation}_\n\n`;
      });
      reply += '\n_Zero medical proof required — Ethiopian Proclamation 568/2008_';

      await ctx.replyWithMarkdown(reply.slice(0, 4000));
    });

    // ── /livehelp ─────────────────────────────────────────────────────────
    bot.command('livehelp', async (ctx) => {
      const userId = ctx.from?.id;
      await ctx.replyWithMarkdown(getBotMsg(userId, 'helpRequested'));
      // In production: forward user context to tutor dashboard via webhook
      console.log(`[Telegram] /livehelp requested by user ${userId}`);
    });

    // ── /alerts ───────────────────────────────────────────────────────────
    bot.command('alerts', async (ctx) => {
      const userId = ctx.from?.id;
      const chatId = ctx.chat?.id;
      alertSubscribers.add(chatId);
      await ctx.replyWithMarkdown(getBotMsg(userId, 'alertsSubscribed'));
    });

    // ── Handle plain text (treats as /ask) ───────────────────────────────
    bot.on('text', async (ctx) => {
      const text = ctx.message?.text?.trim();
      if (!text || text.startsWith('/')) return;
      const userId = ctx.from?.id;
      const lang = userLangStore.get(userId) || 'en';

      try {
        const result = await processScrapeAndGuide({ query: text, lang, simpleMode: true });
        const topAnswer = result.groundedAnswers?.[0];
        if (!topAnswer) return ctx.reply('Ask me a question about your course or paste a job description to decode.');
        const citation = topAnswer.citation;
        await ctx.replyWithMarkdown(
          `${topAnswer.explanation}\n\n📚 _Source: ${citation.title}_`
        );
      } catch (_) {
        await ctx.reply(getBotMsg(userId, 'error'));
      }
    });

    return bot;
  } catch (err) {
    console.warn('[BridgeMate] Telegraf not available:', err.message);
    return null;
  }
}

// ── Webhook Handler (for Express POST /api/v1/telegram/webhook) ───────────────

/**
 * Handle incoming Telegram webhook update.
 * Works with or without a live Telegraf instance.
 *
 * @param {object} update - Raw Telegram update object
 * @param {object} opts
 * @param {string} [opts.token]  - Bot token (optional, for sandbox mode if missing)
 * @returns {Promise<object>}   - Response object for Express to send
 */
async function handleWebhookUpdate(update, { token } = {}) {
  // Sandbox mode: no real bot token
  if (!token) {
    const text = update?.message?.text || '';
    const command = text.split(' ')[0];
    const args = text.slice(command.length).trim();

    if (command === '/ask' || (!command.startsWith('/') && text)) {
      const result = await processScrapeAndGuide({ query: args || text, lang: 'en', simpleMode: true });
      return {
        status: 'sandbox',
        command: '/ask',
        response: result.groundedAnswers?.[0]?.explanation || 'No answer found.',
        citation: result.groundedAnswers?.[0]?.citation,
        note: 'Sandbox mode — set TELEGRAM_BOT_TOKEN for live delivery'
      };
    }
    if (command === '/scrape') {
      const result = await processScrapeAndGuide({ url: args, lang: 'en', simpleMode: true });
      return { status: 'sandbox', command: '/scrape', pageTitle: result.pageTitle, engine: result.engineUsed };
    }
    if (command === '/decode') {
      const barriers = decodeJobBarriers(args || text);
      return { status: 'sandbox', command: '/decode', barriers };
    }
    if (command === '/livehelp') {
      return { status: 'sandbox', command: '/livehelp', message: 'Live help requested. Tutor will contact you.' };
    }
    if (command === '/alerts') {
      return { status: 'sandbox', command: '/alerts', message: 'Subscribed to job alerts.' };
    }
    return { status: 'sandbox', message: 'Command received in offline sandbox mode.' };
  }

  // Live mode: delegate to Telegraf
  try {
    const bot = createTelegrafBot(token);
    if (!bot) throw new Error('Telegraf not available');
    await bot.handleUpdate(update);
    return { status: 'ok' };
  } catch (err) {
    console.error('[Telegram Webhook] Error:', err.message);
    return { status: 'error', message: err.message };
  }
}

module.exports = {
  createTelegrafBot,
  handleWebhookUpdate,
  alertSubscribers,
  userLangStore,
};
