import { describe, it, expect, beforeEach } from 'vitest';
import {
  ETHIOPIAN_PHONE_REGEX,
  normalizeEthiopianPhone,
  SubscribeAlertSchema,
  JobQuerySchema,
} from '@/lib/validators/jobs.schema';
import { NotificationService } from '@/lib/services/notification.service';
import { getRepository } from '@/lib/db';
import { seedDatabase } from '@/lib/db/seed';

describe('Job Alerts & Notification Infrastructure (Milestone 7)', () => {
  beforeEach(async () => {
    const repo = getRepository();
    if ('reset' in repo && typeof (repo as any).reset === 'function') {
      (repo as any).reset();
    }
  });

  describe('Ethiopian Phone Number Formatting & Validation', () => {
    it('validates Ethiopian 09... numbers and normalizes to E.164 (+251)', () => {
      const input = '0911234567';
      expect(ETHIOPIAN_PHONE_REGEX.test(input)).toBe(true);
      expect(normalizeEthiopianPhone(input)).toBe('+251911234567');
    });

    it('validates Safaricom 07... numbers and normalizes', () => {
      const input = '0712345678';
      expect(ETHIOPIAN_PHONE_REGEX.test(input)).toBe(true);
      expect(normalizeEthiopianPhone(input)).toBe('+251712345678');
    });

    it('preserves valid +251 numbers', () => {
      const input = '+251911234567';
      expect(ETHIOPIAN_PHONE_REGEX.test(input)).toBe(true);
      expect(normalizeEthiopianPhone(input)).toBe('+251911234567');
    });

    it('rejects invalid or foreign numbers', () => {
      expect(ETHIOPIAN_PHONE_REGEX.test('0811234567')).toBe(false); // 08 not valid
      expect(ETHIOPIAN_PHONE_REGEX.test('123456')).toBe(false);
      expect(ETHIOPIAN_PHONE_REGEX.test('+14155552671')).toBe(false);
    });
  });

  describe('SubscribeAlertSchema', () => {
    it('validates a correct subscription request', () => {
      const data = {
        phoneNumber: '0911234567',
        channel: 'sms',
        categories: ['tech', 'customer_service'],
        language: 'am',
      };
      const res = SubscribeAlertSchema.safeParse(data);
      expect(res.success).toBe(true);
    });

    it('rejects subscription with invalid phone number', () => {
      const data = {
        phoneNumber: '12345',
        channel: 'sms',
        categories: ['tech'],
      };
      const res = SubscribeAlertSchema.safeParse(data);
      expect(res.success).toBe(false);
    });
  });

  describe('NotificationService', () => {
    it('sends notification via sandbox dispatcher without error', async () => {
      const res = await NotificationService.sendNotification(
        '0911234567',
        'Testing BridgeMate job alert delivery'
      );
      expect(res.success).toBe(true);
      expect(res.recipient).toBe('+251911234567');
      expect(res.provider).toBe('sandbox');
      expect(res.messageId).toBeDefined();
    });

    it('subscribes user and dispatches welcome confirmation message', async () => {
      const req = {
        phoneNumber: '0911234567',
        channel: 'sms' as const,
        categories: ['tech'],
        disabilityCategories: ['low_vision'],
        language: 'am' as const,
      };

      const result = await NotificationService.subscribe(req);
      expect(result.subscription.id).toBeDefined();
      expect(result.subscription.phoneNumber).toBe('+251911234567');
      expect(result.sendResult.success).toBe(true);
      expect(result.sendResult.recipient).toBe('+251911234567');

      // Verify stored in repository
      const repo = getRepository();
      const stored = await repo.notifications.getByChannelIdentifier('+251911234567');
      expect(stored).toBeDefined();
      expect(stored?.phoneNumber).toBe('+251911234567');
    });
  });

  describe('Job Query Filtering', () => {
    it('filters seeded jobs by search query and remote status', async () => {
      const repo = getRepository();
      await seedDatabase(repo);

      const allJobs = await repo.jobs.list();
      expect(allJobs.length).toBeGreaterThan(0);

      // Filter query for Commercial Bank or CBE
      const bankJobs = await repo.jobs.list({ query: 'Commercial Bank' });
      expect(bankJobs.length).toBeGreaterThan(0);
      expect(
        bankJobs.some((j) =>
          (j.employerName?.includes('Commercial Bank') || j.parsedData?.organization?.includes('Commercial Bank'))
        )
      ).toBe(true);

      // Filter query for remote jobs
      const remoteJobs = await repo.jobs.list({ isRemote: true });
      expect(remoteJobs.every((j) => j.parsedData?.isRemote === true)).toBe(true);
    });
  });
});

