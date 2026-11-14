import { z } from 'zod';

export const AccommodationContextSchema = z.enum([
  'interview',
  'exam',
  'remote',
  'physical_office',
]);

export const FunctionalImpactSchema = z.enum([
  'low_vision',
  'screen_reader',
  'mobility',
  'deaf_hard_of_hearing',
  'neurodivergent',
  'other',
]);

export const AccommodationToneSchema = z.enum([
  'collaborative',
  'formal_legal',
  'urgent',
]);

export const GenerateAccommodationRequestSchema = z.object({
  context: AccommodationContextSchema,
  functionalImpact: FunctionalImpactSchema,
  specificNeed: z.string().min(5, 'Specific need must be at least 5 characters long.'),
  tone: AccommodationToneSchema.default('collaborative'),
  candidateName: z.string().optional().default('አመልካች / Candidate'),
  employerName: z.string().optional().default('የቀጣሪ ድርጅት / Employer'),
  jobTitle: z.string().optional(),
  language: z.enum(['am', 'en']).default('am'),
});

export type GenerateAccommodationRequest = z.infer<typeof GenerateAccommodationRequestSchema>;

export const GeneratedAccommodationLetterSchema = z.object({
  id: z.string().optional(),
  subjectAm: z.string(),
  subjectEn: z.string(),
  letterBodyAm: z.string(),
  letterBodyEn: z.string(),
  statutoryCitations: z.array(z.string()),
  practicalRecommendations: z.array(z.string()),
  status: z.enum(['draft', 'approved', 'sent']).default('draft'),
});

export type GeneratedAccommodationLetter = z.infer<typeof GeneratedAccommodationLetterSchema>;

