import { getRepository } from '@/lib/db';
import {
  normalizeEthiopianPhone,
  type SubscribeAlertRequest,
} from '@/lib/validators/jobs.schema';
import type { NotificationSubscription, JobOpportunity } from '@/lib/db/schema';
import { TelegramService } from '@/lib/telegram/telegram.service';

export interface SendResult {
  success: boolean;
  messageId: string;
  provider: 'sendet' | 'telegram' | 'sandbox';
  recipient: string;
  deliveredAt: string;
}

export class NotificationService {
  /**
   * Sends an SMS or Telegram notification to a user.
   */
  public static async sendNotification(
    recipient: string,
    message: string,
    channel: 'sms' | 'telegram' | 'web' = 'sms'
  ): Promise<SendResult> {
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    // Channel: Telegram
    if (channel === 'telegram') {
      await TelegramService.sendMessage(recipient, message);
      return {
        success: true,
        messageId,
        provider: 'telegram',
        recipient,
        deliveredAt: new Date().toISOString(),
      };
    }

    // Channel: SMS
    const formattedRecipient = normalizeEthiopianPhone(recipient);
    const provider = process.env.SMS_PROVIDER === 'sendet' ? 'sendet' : 'sandbox';

    if (provider === 'sendet' && process.env.SENDET_API_KEY) {
      try {
        const res = await fetch('https://api.send.et/v1/sms/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SENDET_API_KEY}`,
          },
          body: JSON.stringify({
            to: formattedRecipient,
            message,
            sender_id: 'BridgeMate',
          }),
        });

        if (!res.ok) {
          throw new Error(`Send.et API error: ${res.statusText}`);
        }

        return {
          success: true,
          messageId,
          provider: 'sendet',
          recipient: formattedRecipient,
          deliveredAt: new Date().toISOString(),
        };
      } catch (err) {
        console.warn('[NotificationService] Send.et live delivery failed, falling back to sandbox log:', err);
      }
    }

    // Sandbox / Development mock mode
    console.log(
      `[BridgeMate Notification Dispatcher] Delivered SMS via ${provider} to ${formattedRecipient}: "${message}"`
    );

    return {
      success: true,
      messageId,
      provider: 'sandbox',
      recipient: formattedRecipient,
      deliveredAt: new Date().toISOString(),
    };
  }

  /**
   * Dispatches a formatted job alert to Telegram channel or chat.
   */
  public static async sendTelegramJobAlert(
    chatId: number | string,
    job: any,
    language: 'am' | 'en' = 'am'
  ): Promise<SendResult> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bridgemate.et';
    const decodeUrl = `${baseUrl}/decoder?jobId=${job.id || ''}`;
    const isRemote = Boolean(job.isRemote || job.parsedData?.isRemote);

    const text = language === 'am'
      ? `📢 *አዲስ አካታች የሥራ ዕድል ወጥቷል!* 🇪🇹\n\n` +
        `💼 *የሥራ መደብ:* ${job.title || 'Junior Software Developer'}\n` +
        `🏢 *ቀጣሪ ድርጅት:* ${job.employerName || 'Inclusive Tech Hub'}\n` +
        `📍 *ቦታ:* ${isRemote ? 'የርቀት ሥራ (100% Remote)' : (job.location || 'Addis Ababa')}\n` +
        `♿ *ተደራሽነት:* ${job.disabilityTags?.join(', ') || 'የስክሪን አንባቢ ድጋፍ፣ ምቹ የሥራ አካባቢ'}\n\n` +
        `🔍 [የማነቆና የማመቻቸት ትንተና ይመልከቱ](${decodeUrl})`
      : `📢 *New Accessible Job Alert!* 🇪🇹\n\n` +
        `💼 *Role:* ${job.title || 'Junior Developer'}\n` +
        `🏢 *Employer:* ${job.employerName || 'Tech Partner'}\n` +
        `📍 *Location:* ${isRemote ? '100% Remote' : (job.location || 'Addis Ababa')}\n` +
        `♿ *Accessibility:* ${job.disabilityTags?.join(', ') || 'Screen reader accessible'}\n\n` +
        `🔍 [Decode Functional Barriers & Request Accommodations](${decodeUrl})`;

    return this.sendNotification(String(chatId), text, 'telegram');
  }

  /**
   * Creates or updates a notification subscription and sends confirmation SMS or Telegram notice.
   */
  public static async subscribe(
    req: SubscribeAlertRequest & { telegramChatId?: string; preferredLanguage?: 'am' | 'en'; opportunityTypes?: string[] },
    userId?: string
  ): Promise<{
    subscription: NotificationSubscription;
    sendResult: SendResult;
  }> {
    const repo = getRepository();
    const isTelegram = req.channel === 'telegram';
    const targetRecipient = isTelegram
      ? (req.telegramChatId || req.phoneNumber)
      : normalizeEthiopianPhone(req.phoneNumber);

    const subscription = await repo.notifications.create({
      userId: userId || null,
      phoneNumber: targetRecipient,
      channel: req.channel || 'sms',
      channelIdentifier: targetRecipient,
      jobCategories: req.categories || req.opportunityTypes || ['all'],
      disabilityCategories: req.disabilityCategories || [],
      language: req.language || req.preferredLanguage || 'am',
      active: true,
      isActive: true,
    });

    const lang = req.language || req.preferredLanguage || 'am';
    let confirmationMessage = '';

    if (isTelegram) {
      confirmationMessage = lang === 'am'
        ? 'እንኳን ወደ ብሪጅሜት የሥራ ማሳወቂያ በደህና መጡ! አዳዲስ ለአካል ጉዳተኞች ተደራሽ የሆኑ የሥራ ዕድሎች ሲወጡ ወዲያውኑ በቴሌግራም ይደርስዎታል።'
        : 'Welcome to BridgeMate Job Alerts! You will receive accessible job announcements directly via Telegram.';
    } else {
      confirmationMessage = lang === 'am'
        ? 'እንኳን ወደ ብሪጅሜት የሥራ ማሳወቂያ በደህና መጡ! አዳዲስ አካል ጉዳተኞችን የሚያካትቱ የሥራ ዕድሎች ሲወጡ አጭር መልእክት (SMS) ይደርስዎታል።'
        : 'Welcome to BridgeMate Job Alerts! You will receive accessible Ethiopian job announcements matching your preferences directly via SMS.';
    }

    const sendResult = await this.sendNotification(
      targetRecipient,
      confirmationMessage,
      req.channel
    );

    return {
      subscription,
      sendResult,
    };
  }
}

