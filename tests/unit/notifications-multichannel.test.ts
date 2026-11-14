import { describe, it, expect, beforeEach } from 'vitest';
import { NotificationService } from '@/lib/services/notification.service';
import { TelegramService } from '@/lib/telegram/telegram.service';

describe('Track 3: Multi-Channel Alerts Engine (Telegram + SMS)', () => {
  beforeEach(() => {
    TelegramService.clearOutgoingLog();
  });

  it('delivers SMS notifications via sandbox or live gateway', async () => {
    const result = await NotificationService.sendNotification(
      '+251911445566',
      'Test SMS Alert message',
      'sms'
    );

    expect(result.success).toBe(true);
    expect(result.recipient).toBe('+251911445566');
    expect(result.provider).toBe('sandbox');
  });

  it('delivers Telegram notifications to Telegram chat target', async () => {
    const result = await NotificationService.sendNotification(
      '77889900',
      'Test Telegram Alert message',
      'telegram'
    );

    expect(result.success).toBe(true);
    expect(result.provider).toBe('telegram');
    expect(result.recipient).toBe('77889900');

    const log = TelegramService.getOutgoingLog();
    expect(log.length).toBe(1);
    expect(log[0].text).toContain('Test Telegram Alert');
  });

  it('dispatches rich formatted Telegram job alert with barrier analysis link', async () => {
    const result = await NotificationService.sendTelegramJobAlert(
      '77889900',
      {
        id: 'job-swe-101',
        title: 'Junior Cloud Software Associate',
        employerName: 'Ethio Telecom Tech Innovation Hub',
        isRemote: true,
        disabilityTags: ['Screen Reader Friendly', 'Flexible Hours'],
      },
      'am'
    );

    expect(result.success).toBe(true);
    const log = TelegramService.getOutgoingLog();
    expect(log.length).toBe(1);
    expect(log[0].text).toContain('አዲስ አካታች የሥራ ዕድል');
    expect(log[0].text).toContain('Ethio Telecom');
    expect(log[0].text).toContain('/decoder?jobId=job-swe-101');
  });

  it('subscribes user to Telegram channel and sends confirmation', async () => {
    const subResult = await NotificationService.subscribe({
      phoneNumber: '0911556677',
      telegramChatId: 'tg_user_9922',
      channel: 'telegram',
      categories: ['tech', 'remote'],
      disabilityCategories: ['vision'],
      language: 'am',
    });

    expect(subResult.subscription).toBeDefined();
    expect(subResult.sendResult.provider).toBe('telegram');
    expect(subResult.sendResult.recipient).toBe('tg_user_9922');

    const log = TelegramService.getOutgoingLog();
    expect(log[0].text).toContain('የሥራ ማሳወቂያ');
  });
});
