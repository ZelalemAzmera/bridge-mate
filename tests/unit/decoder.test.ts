import { describe, it, expect } from 'vitest';
import { OpportunityDecoderService } from '@/lib/ai/decoder.service';
import {
  OpportunityAnalysisSchema,
  AnalyzeRequestSchema,
} from '@/lib/validators/decoder.schema';

describe('Opportunity Decoder Service (src/lib/ai/decoder.service.ts)', () => {
  it('extracts structured opportunity analysis from raw text', async () => {
    const rawJobNotice = `
      Position: Junior Data Entry Specialist
      Organization: Ethio Telecom
      Location: Addis Ababa / Remote
      Deadline: 2026-12-31
      Requirements:
      - Computer literacy and typing
      - Must hold driver's license for occasional errands
      - Good communication skills
      Application: Submit CV to hr@ethiotelecom.et before deadline.
    `;

    const result = await OpportunityDecoderService.analyzeOpportunity(rawJobNotice);

    expect(result).toBeDefined();
    expect(result.roleTitle).toContain('Junior Data Entry');
    expect(result.organization).toBeDefined();
    expect(result.summaryPlainLanguageAm).toBeDefined();
    expect(result.summaryPlainLanguageEn).toBeDefined();
    expect(result.confidenceScore).toBeGreaterThan(0.7);

    // Verify barrier detection (driver's license)
    const physicalBarrier = result.potentialBarriers.find((b) => b.category === 'physical');
    expect(physicalBarrier).toBeDefined();
    expect(physicalBarrier?.barrier).toMatch(/መንጃ ፈቃድ|driving license/i);

    // Schema validation
    const parsed = OpportunityAnalysisSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it('validates request payload schema correctly', () => {
    const valid = AnalyzeRequestSchema.safeParse({
      rawText: 'Position: Software Developer. Requires React and TypeScript.',
      language: 'am',
    });
    expect(valid.success).toBe(true);

    const invalid = AnalyzeRequestSchema.safeParse({
      rawText: 'Short',
    });
    expect(invalid.success).toBe(false);
  });
});
