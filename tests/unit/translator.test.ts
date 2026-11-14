import { describe, it, expect } from 'vitest';
import {
  GenerateAccommodationRequestSchema,
  GeneratedAccommodationLetterSchema,
} from '@/lib/validators/translator.schema';
import { AccommodationTranslatorService } from '@/lib/ai/translator.service';

describe('Accommodation Translator Unit Tests', () => {
  it('validates a valid accommodation request payload', () => {
    const validData = {
      context: 'interview',
      functionalImpact: 'low_vision',
      specificNeed: 'Needs large print documents (24pt) or accessible PDF 48 hours prior',
      tone: 'collaborative',
      candidateName: 'Abebe Bikila',
      employerName: 'Commercial Bank of Ethiopia',
      jobTitle: 'Junior Data Analyst',
      language: 'en',
    };

    const result = GenerateAccommodationRequestSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateName).toBe('Abebe Bikila');
      expect(result.data.functionalImpact).toBe('low_vision');
    }
  });

  it('rejects an invalid request when candidateName is missing', () => {
    const invalidData = {
      context: 'exam',
      functionalImpact: 'screen_reader',
      specificNeed: 'Keyboard accessible portal',
      tone: 'firm',
      candidateName: '', // empty name
    };

    const result = GenerateAccommodationRequestSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('generates offline letter grounded in Ethiopian Proclamation 568/2008 & 1156/2019', async () => {
    const request = {
      context: 'interview' as const,
      functionalImpact: 'low_vision' as const,
      specificNeed: 'High contrast text and large print font',
      tone: 'collaborative' as const,
      candidateName: 'Almaz Ayana',
      employerName: 'Ethio Telecom',
      jobTitle: 'Network Operations Specialist',
      language: 'am' as const,
    };

    const letter = await AccommodationTranslatorService.generateLetter(request);

    expect(letter).toBeDefined();
    expect(letter.status).toBe('draft');
    expect(letter.subjectAm).toContain('አዋጅ ቁጥር 568/2008');
    expect(letter.subjectEn).toContain('568/2008');
    expect(letter.letterBodyAm).toContain('Almaz Ayana');
    expect(letter.letterBodyAm).toContain('Ethio Telecom');
    expect(letter.letterBodyEn).toContain('Almaz Ayana');
    expect(letter.statutoryCitations.length).toBeGreaterThan(0);
    expect(letter.statutoryCitations[0]).toContain('568/2008');
    expect(letter.practicalRecommendations.length).toBeGreaterThan(0);

    // Validate generated output schema
    const schemaValidation = GeneratedAccommodationLetterSchema.safeParse(letter);
    expect(schemaValidation.success).toBe(true);
  });

  it('generates letter with screen reader accommodations without medical disclosure', async () => {
    const request = {
      context: 'exam' as const,
      functionalImpact: 'screen_reader' as const,
      specificNeed: 'Assessment portal must be compatible with NVDA screen reader',
      tone: 'formal_legal' as const,
      candidateName: 'Kenisa Bekele',
      employerName: 'Ministry of Innovation and Technology (MInT)',
      jobTitle: 'Software Engineer',
      language: 'en' as const,
    };

    const letter = await AccommodationTranslatorService.generateLetter(request);
    expect(letter.letterBodyEn).toContain('NVDA');
    expect(letter.letterBodyEn).toContain('MInT');
    // Ensure no medical diagnosis language
    expect(letter.letterBodyEn.toLowerCase()).not.toContain('suffering from');
    expect(letter.letterBodyEn.toLowerCase()).not.toContain('patient');
    expect(letter.letterBodyEn.toLowerCase()).not.toContain('medical condition');
  });
});
