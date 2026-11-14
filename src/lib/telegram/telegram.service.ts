import { retrieveRelevantChunks } from '@/lib/ai/rag/retriever';
import { buildGroundedContext } from '@/lib/ai/rag/context-builder';
import { buildSystemPrompt } from '@/lib/ai/prompts/system-chat';
import { getAIProvider, isLiveAIConfigured } from '@/lib/ai/providers';
import { generateText } from 'ai';
import { OpportunityDecoderService } from '@/lib/ai/decoder.service';
import { SupportService } from '@/lib/services/support.service';
import { NotificationService } from '@/lib/services/notification.service';

export interface TelegramUser {
  id: number;
  first_name: string;
  username?: string;
  language_code?: string;
}

export interface TelegramChat {
  id: number;
  type: string;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

export interface OutgoingTelegramMessage {
  chat_id: number | string;
  text: string;
  parse_mode?: 'Markdown' | 'HTML';
  reply_markup?: any;
  timestamp: string;
}

export class TelegramService {
  private static outgoingLog: OutgoingTelegramMessage[] = [];

  /**
   * Retrieves logged outgoing Telegram messages for testing and simulator inspection.
   */
  public static getOutgoingLog(): OutgoingTelegramMessage[] {
    return [...this.outgoingLog];
  }

  public static clearOutgoingLog(): void {
    this.outgoingLog = [];
  }

  /**
   * Sends a message via Telegram Bot API (or records to sandbox log).
   */
  public static async sendMessage(
    chatId: number | string,
    text: string,
    options?: { parse_mode?: 'Markdown' | 'HTML'; reply_markup?: any }
  ): Promise<{ success: boolean; delivered: 'network' | 'sandbox' }> {
    const payload: OutgoingTelegramMessage = {
      chat_id: chatId,
      text,
      parse_mode: options?.parse_mode || 'Markdown',
      reply_markup: options?.reply_markup,
      timestamp: new Date().toISOString(),
    };

    this.outgoingLog.unshift(payload);
    if (this.outgoingLog.length > 50) this.outgoingLog.pop();

    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (botToken && !botToken.includes('sandbox')) {
      try {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          return { success: true, delivered: 'network' };
        }
      } catch (err) {
        console.warn('[Telegram Bot API] Live webhook dispatch failed, recorded in sandbox:', err);
      }
    }

    console.log(`[Telegram Sandbox] Delivered message to chat ${chatId}: "${text.slice(0, 80)}..."`);
    return { success: true, delivered: 'sandbox' };
  }

  /**
   * Main entrypoint to process incoming Telegram updates.
   */
  public static async processUpdate(update: TelegramUpdate): Promise<{ handled: boolean; replyText: string }> {
    const msg = update.message;
    if (!msg || !msg.text) {
      return { handled: false, replyText: '' };
    }

    const chatId = msg.chat.id;
    const rawText = msg.text.trim();
    const isAmharic = /[\u1200-\u137F]/.test(rawText);

    // Command: /start
    if (rawText.startsWith('/start')) {
      const welcomeText = isAmharic
        ? `👋 *እንኳን ወደ ብሪጅሜት (BridgeMate) ቴሌግራም ረዳት በደህና መጡ!* 🇪🇹\n\n` +
          `ብሪጅሜት ለትምህርትና ለሥራ ዕድሎች ተደራሽነትን የሚያረጋግጥ ረዳት ነው። የሚከተሉትን ትዕዛዞች መጠቀም ይችላሉ፡\n\n` +
          `• /ask <ጥያቄ> — በሥርዓተ-ትምህርትና በሕግ የተደገፈ ማብራሪያ ማግኘት\n` +
          `• /decode <ማስታወቂያ> — የሥራ ማስታወቂያ ማነቆዎችን መፈተሽ\n` +
          `• /livehelp — ወዲያውኑ ከቀጥታ የሰው ረዳት ጋር መገናኘት (One-Click Help)\n` +
          `• /alerts — አዳዲስ አካታች የሥራ ማስታወቂያዎችን በቴሌግራም መመዝገብ\n` +
          `• /help — ዝርዝር መመሪያዎችን ማየት\n\n` +
          `_ጥያቄዎን ዝም ብለው በመጻፍም መልስ ማግኘት ይችላሉ!_`
        : `👋 *Welcome to BridgeMate Assistant on Telegram!* 🇪🇹\n\n` +
          `Your accessible tutor and disability advocate for learning and career growth.\n\n` +
          `*Available Commands:*\n` +
          `• /ask <question> — Ask course concepts or disability accommodation rights\n` +
          `• /decode <notice> — Analyze job or assignment notices for barriers\n` +
          `• /livehelp — Instant 1-click escalation to a live human specialist\n` +
          `• /alerts — Subscribe to accessible job & course alerts\n` +
          `• /help — Full instructions\n\n` +
          `_You can also just send any question directly!_`;

      await this.sendMessage(chatId, welcomeText);
      return { handled: true, replyText: welcomeText };
    }

    // Command: /help
    if (rawText.startsWith('/help')) {
      const helpText = isAmharic
        ? `📖 *የብሪጅሜት አጠቃቀም መመሪያ*\n\n` +
          `1️⃣ *ጥያቄ ለመጠየቅ:* \`/ask ለፈተና ተጨማሪ ጊዜ መጠየቅ እችላለሁ?\`\n` +
          `2️⃣ *ማስታወቂያ ለመፍታት:* \`/decode Junior Developer wanted with driving license\`\n` +
          `3️⃣ *የሰው ድጋፍ ለማግኘት:* \`/livehelp\` የሚለውን ይጫኑ\n` +
          `4️⃣ *ሥራ ማሳወቂያ:* \`/alerts\` ብለው ይላኩ`
        : `📖 *BridgeMate Quick Guide*\n\n` +
          `1️⃣ *Ask Course or Legal Question:* \`/ask Can I request extended exam time?\`\n` +
          `2️⃣ *Decode Job Notice:* \`/decode Office assistant wanted with driving license\`\n` +
          `3️⃣ *Live Human Help:* Send \`/livehelp\` for instant specialist routing\n` +
          `4️⃣ *Job Alerts:* Send \`/alerts\` to subscribe via Telegram`;

      await this.sendMessage(chatId, helpText);
      return { handled: true, replyText: helpText };
    }

    // Command: /livehelp
    if (rawText.startsWith('/livehelp') || rawText.includes('የሰው ድጋፍ')) {
      try {
        const supportRes = await SupportService.createSession({
          userGoal: `Telegram User Escalation: ${rawText.slice(0, 100)}`,
          userLanguage: isAmharic ? 'am' : 'en',
          disclosedAccommodations: ['Telegram Mobile User'],
          conversationHistorySummary: `User requested live assistance via Telegram chat ${chatId}`,
          consentTranscript: true,
          consentAudio: false,
          consentScreenShare: false,
        });

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bridgemate.et';
        const joinUrl = `${baseUrl}/support?sessionId=${supportRes.session.id}`;

        const escalationText = isAmharic
          ? `👩‍💼 *የቀጥታ የሰው ድጋፍ ጥያቄዎ ተመዝግቧል!* (ተራ ቁጥር፡ #${supportRes.queuePosition})\n\n` +
            `ልዩ የድጋፍ ባለሙያ ለመገናኘትና ስክሪንዎን ለማጋራት የሚከተለውን ሊንክ ይጫኑ፡\n` +
            `🔗 [ወደ ድጋፍ ክፍሉ ይግቡ](${joinUrl})\n\n` +
            `_ግምታዊ የጥበቃ ጊዜ፡ ~${supportRes.estimatedWaitMinutes} ደቂቃ_`
          : `👩‍💼 *Live Human Help Session Initialized!* (Queue Position: #${supportRes.queuePosition})\n\n` +
            `Click the secure link below to enter your live support room with learner-controlled screen sharing:\n` +
            `🔗 [Join Support Room](${joinUrl})\n\n` +
            `_Estimated wait: ~${supportRes.estimatedWaitMinutes} min_`;

        await this.sendMessage(chatId, escalationText);
        return { handled: true, replyText: escalationText };
      } catch (err: any) {
        const errorText = isAmharic
          ? `ይቅርታ፣ የሰው ድጋፍ መመደብ አልተቻለም። እባክዎ በቀጥታ በድህረ-ገጹ ይሞክሩ።`
          : `Unable to initialize live support session. Please try via the web dashboard.`;
        await this.sendMessage(chatId, errorText);
        return { handled: true, replyText: errorText };
      }
    }

    // Command: /alerts
    if (rawText.startsWith('/alerts')) {
      try {
        const phone = msg.from?.username ? `@${msg.from.username}` : `tg_${chatId}`;
        await NotificationService.subscribe({
          phoneNumber: phone,
          telegramChatId: String(chatId),
          channel: 'telegram',
          categories: ['tech', 'remote'],
          disabilityCategories: ['vision'],
          language: isAmharic ? 'am' : 'en',
          preferredLanguage: isAmharic ? 'am' : 'en',
          opportunityTypes: ['remote', 'inclusive_employer'],
        });

        const alertText = isAmharic
          ? `✅ *የቴሌግራም የሥራ ማሳወቂያ ተመዝግቧል!* 🔔\n\n` +
            `አዳዲስ ለአካል ጉዳተኞች ተደራሽ የሆኑ የሥራና የስልጠና ዕድሎች ሲወጡ ወዲያውኑ እዚህ መልእክት ይደርስዎታል።`
          : `✅ *Subscribed to Telegram Job & Content Alerts!* 🔔\n\n` +
            `You will receive immediate alerts for verified accessible jobs and courses right here.`;

        await this.sendMessage(chatId, alertText);
        return { handled: true, replyText: alertText };
      } catch (err: any) {
        const failText = isAmharic ? 'ማሳወቂያ መመዝገብ አልተቻለም።' : 'Subscription failed.';
        await this.sendMessage(chatId, failText);
        return { handled: true, replyText: failText };
      }
    }

    // Command: /decode <text>
    if (rawText.startsWith('/decode')) {
      const noticeText = rawText.replace('/decode', '').trim();
      if (!noticeText) {
        const promptText = isAmharic
          ? 'እባክዎ ከትዕዛዙ ቀጥሎ የሚፈተሸውን የሥራ ማስታወቂያ ጽሁፍ ያስገቡ።\nምሳሌ፡ `/decode Junior Developer with driver license`'
          : 'Please include the job or assignment text to decode.\nExample: `/decode Junior Developer with driver license`';
        await this.sendMessage(chatId, promptText);
        return { handled: true, replyText: promptText };
      }

      const analysis = await OpportunityDecoderService.analyzeOpportunity(noticeText);
      const barriersStr = analysis.potentialBarriers.length > 0
        ? analysis.potentialBarriers.map((b) => `• [${b.severity.toUpperCase()}] ${b.barrier}\n  💡 *መፍትሔ:* ${b.mitigation}`).join('\n\n')
        : (isAmharic ? '• ምንም ግልጽ ማነቆ አልተገኘም። አካታች ዕድል ይመስላል!' : '• No apparent functional barriers detected!');

      const decodeReply = isAmharic
        ? `🔍 *የዕድል መፍቻ ትንተና (Opportunity Decoder)*\n\n` +
          `📌 *የሥራ መደብ:* ${analysis.roleTitle}\n` +
          `🏢 *ቀጣሪ:* ${analysis.organization}\n\n` +
          `⚠️ *የተለዩ ማነቆዎችና አማራጮች:*\n${barriersStr}\n\n` +
          `_ለቀጣሪው የማመቻቸት ጥያቄ ደብዳቤ ለማዘጋጀት /livehelp ይጠቀሙ።_`
        : `🔍 *BridgeMate Opportunity Barrier Decoder*\n\n` +
          `📌 *Role:* ${analysis.roleTitle}\n` +
          `🏢 *Organization:* ${analysis.organization}\n\n` +
          `⚠️ *Identified Barriers & Accommodations:*\n${barriersStr}\n\n` +
          `_Use /livehelp to connect with a specialist to draft your accommodation letter._`;

      await this.sendMessage(chatId, decodeReply);
      return { handled: true, replyText: decodeReply };
    }

    // Default: /ask <query> or Plain Text Chat Tutor
    const query = rawText.startsWith('/ask') ? rawText.replace('/ask', '').trim() : rawText;
    if (!query) {
      const askPrompt = isAmharic ? 'እባክዎ ጥያቄዎን ይጻፉ።' : 'Please provide your question.';
      await this.sendMessage(chatId, askPrompt);
      return { handled: true, replyText: askPrompt };
    }

    // 1. RAG Retrieval from course curriculum and legal knowledge base
    const { chunks } = await retrieveRelevantChunks(query);
    const { promptContext, citations } = buildGroundedContext(chunks);

    let tutorAnswer = '';

    if (isLiveAIConfigured()) {
      try {
        const { model } = getAIProvider();
        if (model) {
          const system = buildSystemPrompt(promptContext);
          const aiResult = await generateText({
            model,
            system,
            prompt: query,
          });
          tutorAnswer = aiResult.text;
        }
      } catch (err) {
        console.warn('[Telegram Tutor AI] Live AI generation failed, using grounded fallback:', err);
      }
    }

    if (!tutorAnswer) {
      if (isAmharic) {
        tutorAnswer =
          `በብሪጅሜት የተረጋገጠ የሥርዓተ-ትምህርትና የሕግ መረጃ መሠረት፡\n\n` +
          `• በአዋጅ ቁጥር 568/2008 እና 1156/2019 መሠረት፣ ማንኛውም አካል ጉዳተኛ ተማሪ ወይም አመልካች ተገቢውን የማመቻቸት ድጋፍ (Reasonable Accommodation) የማግኘት ሕጋዊ መብት አለው [Source: ${citations[0]?.sourceTitle || 'የኢትዮጵያ የሥራና የአካል ጉዳት ሕግ'}]።\n` +
          `• ለኮድ ትምህርት ስክሪን አንባቢዎችን (NVDA/JAWS) እና ተጨማሪ የፈተና ጊዜ መጠየቅ የተፈቀደ አሰራር ነው [Source: ${citations[1]?.sourceTitle || 'ዲጂታል ክህሎት'}]።\n\n` +
          `ከሰው ረዳት ጋር ለመነጋገር /livehelp ብለው ይላኩ።`;
      } else {
        tutorAnswer =
          `Based on verified course curriculum and Ethiopian legal standards:\n\n` +
          `• Under Ethiopian Proclamation 568/2008 & 1156/2019, individuals with disabilities have an enforceable right to reasonable accommodation in both course evaluations and workplaces [Source: ${citations[0]?.sourceTitle || 'Ethiopian Labor Proclamation'}]。\n` +
          `• Accommodations include extended exam time, keyboard accessibility, and alternative format assessments [Source: ${citations[1]?.sourceTitle || 'Curriculum Standards'}]。\n\n` +
          `To speak with a live specialist, send /livehelp.`;
      }
    }

    const citationFooter = citations.length > 0
      ? `\n\n📚 *Citations:*\n` + citations.slice(0, 2).map((c, idx) => `[${idx + 1}] ${c.sourceTitle}`).join('\n')
      : '';

    const fullReply = `${tutorAnswer}${citationFooter}`;
    await this.sendMessage(chatId, fullReply);
    return { handled: true, replyText: fullReply };
  }
}
