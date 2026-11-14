import { z } from 'zod';

// Ethiopian phone number validation regex:
// Matches +2519..., +2517..., 09..., 07... (total 9 digits after 0 or +251)
export const ETHIOPIAN_PHONE_REGEX = /^(?:\+251|0)(9|7)\d{8}$/;

export function normalizeEthiopianPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('0')) {
    return '+251' + cleaned.slice(1);
  }
  if (!cleaned.startsWith('+')) {
    return '+' + cleaned;
  }
  return cleaned;
}

export const SubscribeAlertSchema = z.object({
  phoneNumber: z
    .string()
    .min(9, 'Phone number is too short')
    .refine((val) => ETHIOPIAN_PHONE_REGEX.test(val.replace(/[\s\-()]/g, '')), {
      message:
        'Please enter a valid Ethiopian mobile number (e.g., 0911234567 or +251911234567)',
    }),
  channel: z.enum(['sms', 'telegram', 'web']).default('sms'),
  categories: z.array(z.string()).min(1, 'Please select at least one job category').default(['all']),
  disabilityCategories: z.array(z.string()).optional().default([]),
  language: z.enum(['am', 'en']).default('am'),
});

export type SubscribeAlertRequest = z.infer<typeof SubscribeAlertSchema>;

export const JobQuerySchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  isRemote: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((val) => val === true || val === 'true')
    .optional(),
  disabilityFriendly: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((val) => val === true || val === 'true')
    .optional(),
  language: z.enum(['am', 'en']).optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

export type JobQueryParams = z.infer<typeof JobQuerySchema>;

