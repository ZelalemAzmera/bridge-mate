import { z } from 'zod';

export const KeyRequirementSchema = z.object({
  skill: z.string(),
  isMandatory: z.boolean(),
  explanation: z.string(),
});

export const PotentialBarrierSchema = z.object({
  barrier: z.string(),
  category: z.enum(['physical', 'sensory', 'cognitive', 'credential']),
  severity: z.enum(['low', 'medium', 'high']),
  mitigation: z.string(),
});

export const ApplicationStepSchema = z.object({
  stepNumber: z.number(),
  instruction: z.string(),
  requiredDocuments: z.array(z.string()),
});

export const OpportunityAnalysisSchema = z.object({
  roleTitle: z.string(),
  organization: z.string(),
  location: z.string().optional().default('Addis Ababa, Ethiopia'),
  deadline: z.string().optional(),
  summaryPlainLanguageAm: z.string(),
  summaryPlainLanguageEn: z.string(),
  keyRequirements: z.array(KeyRequirementSchema),
  potentialBarriers: z.array(PotentialBarrierSchema),
  accommodationTips: z.array(z.string()),
  applicationSteps: z.array(ApplicationStepSchema),
  confidenceScore: z.number().min(0).max(1),
  isAccessibleEmployer: z.boolean().default(false),
});

export type OpportunityAnalysisData = z.infer<typeof OpportunityAnalysisSchema>;

export const AnalyzeRequestSchema = z.object({
  rawText: z.string().min(10, 'Job description text must be at least 10 characters.'),
  jobOpportunityId: z.string().optional(),
  language: z.enum(['am', 'en']).optional().default('am'),
});

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

