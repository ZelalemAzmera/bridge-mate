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
  provider: 'smsethiopia' | 'smshub' | 'sendet' | 'africastalking' | 'twilio' | 'telegram' | 'sandbox';
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
    const rawProvider = (process.env.SMS_PROVIDER || 'mock').toLowerCase().trim();

    // 1. SMSEthiopia (smsethiopia.com - 100 free instant test SMS, Telebirr/CBE Birr reload)
    const isSmsEthiopia =
      rawProvider === 'smsethiopia' ||
      rawProvider === 'smsethiopia.com' ||
      Boolean(process.env.SMSETHIOPIA_API_KEY);
    const smsEthiopiaApiKey = process.env.SMSETHIOPIA_API_KEY || process.env.SMS_API_KEY;

    if (isSmsEthiopia && smsEthiopiaApiKey && !smsEthiopiaApiKey.includes('sample')) {
      try {
        // SMSEthiopia expects msisdn in 2519... format without leading '+'
        const msisdn = formattedRecipient.replace(/^\+/, '');
        const res = await fetch('https://smsethiopia.com/api/sms/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            KEY: smsEthiopiaApiKey,
          },
          body: JSON.stringify({
            msisdn,
            text: message,
          }),
        });

        if (res.ok) {
          return {
            success: true,
            messageId,
            provider: 'smsethiopia',
            recipient: formattedRecipient,
            deliveredAt: new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('[NotificationService] SMSEthiopia dispatch failed, trying fallbacks:', err);
      }
    }

    // 2. SMSHub (smshub.et - Ethio Telecom & Safaricom with KYC verification)
    const isSmsHub =
      rawProvider === 'smshub' ||
      rawProvider === 'smshub.et' ||
      Boolean(process.env.SMSHUB_API_KEY);
    const smsHubApiKey = process.env.SMSHUB_API_KEY || process.env.SMS_API_KEY;

    if (isSmsHub && smsHubApiKey && !smsHubApiKey.includes('sample')) {
      try {
        // SMSHub accepts standard local 09... or 2519... format
        const msisdn = formattedRecipient.replace(/^\+251/, '0');
        const res = await fetch('https://smshub.et/api/sms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${smsHubApiKey}`,
          },
          body: JSON.stringify({
            msisdn,
            text: message,
          }),
        });

        if (res.ok) {
          return {
            success: true,
            messageId,
            provider: 'smshub',
            recipient: formattedRecipient,
            deliveredAt: new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('[NotificationService] SMSHub dispatch failed, trying fallbacks:', err);
      }
    }

    // 1. Send.et (Ethiopian SMS Gateway for Ethio Telecom & Safaricom)
    const isSendEt = rawProvider === 'sendet' || rawProvider === 'send.et' || rawProvider === 'send_et';
    const sendEtApiKey = process.env.SENDET_API_KEY || process.env.SEND_ET_API_KEY || process.env.SMS_API_KEY;
    const sendEtSenderId = process.env.SENDET_SENDER_ID || process.env.SEND_ET_SENDER_ID || process.env.SMS_SENDER_ID || 'BridgeMate';

    if (isSendEt && sendEtApiKey && !sendEtApiKey.includes('sample')) {
      try {
        const res = await fetch('https://api.send.et/v1/sms/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sendEtApiKey}`,
          },
          body: JSON.stringify({
            to: formattedRecipient,
            message,
            sender_id: sendEtSenderId,
          }),
        });

        if (res.ok) {
          return {
            success: true,
            messageId,
            provider: 'sendet',
            recipient: formattedRecipient,
            deliveredAt: new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('[NotificationService] Send.et live dispatch failed, using sandbox fallback:', err);
      }
    }

    // 2. Africa's Talking (Regional Africa Gateway)
    const isAfricasTalking = rawProvider === 'africastalking' || rawProvider === 'africas_talking';
    const atUsername = process.env.AFRICASTALKING_USERNAME;
    const atApiKey = process.env.AFRICASTALKING_API_KEY || process.env.SMS_API_KEY;

    if (isAfricasTalking && atUsername && atApiKey && !atApiKey.includes('sample')) {
      try {
        const params = new URLSearchParams();
        params.append('username', atUsername);
        params.append('to', formattedRecipient);
        params.append('message', message);
        if (process.env.AFRICASTALKING_FROM) {
          params.append('from', process.env.AFRICASTALKING_FROM);
        }

        const res = await fetch('https://api.africastalking.com/version1/messaging', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            apiKey: atApiKey,
            Accept: 'application/json',
          },
          body: params.toString(),
        });

        if (res.ok) {
          return {
            success: true,
            messageId,
            provider: 'africastalking',
            recipient: formattedRecipient,
            deliveredAt: new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('[NotificationService] Africa\'s Talking dispatch failed, using sandbox fallback:', err);
      }
    }

    // 3. Twilio (Global Gateway)
    const isTwilio = rawProvider === 'twilio';
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

    if (isTwilio && twilioSid && twilioAuthToken && twilioFrom) {
      try {
        const params = new URLSearchParams();
        params.append('To', formattedRecipient);
        params.append('From', twilioFrom);
        params.append('Body', message);

        const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString('base64');
        const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: authHeader,
          },
          body: params.toString(),
        });

        if (res.ok) {
          return {
            success: true,
            messageId,
            provider: 'twilio',
            recipient: formattedRecipient,
            deliveredAt: new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('[NotificationService] Twilio dispatch failed, using sandbox fallback:', err);
      }
    }

    // Sandbox / Development mock mode
    console.log(
      `[BridgeMate Notification Dispatcher] Delivered SMS via sandbox to ${formattedRecipient}: "${message}"`
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

