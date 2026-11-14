import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api/v1-auth';
import { OpportunityDecoderService } from '@/lib/ai/decoder.service';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/v1/decoder',
    description: 'BridgeMate Opportunity Decoder API — Analyzes job vacancies and assignments for functional accessibility barriers and legal accommodations.',
    authentication: 'Optional x-api-key or Authorization: Bearer <key> (Use demo_key_alx_2026)',
    version: '1.0.0',
  });
}

export async function POST(req: NextRequest) {
  const auth = validateApiKey(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'UNAUTHORIZED', message: auth.error },
      },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const text = body.text || body.rawText;

    if (!text || typeof text !== 'string' || text.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Provide a valid job vacancy or assignment announcement string (min 10 characters).',
          },
        },
        { status: 400 }
      );
    }

    const analysis = await OpportunityDecoderService.analyzeOpportunity(text, body.jobOpportunityId);

    return NextResponse.json({
      success: true,
      data: {
        roleTitle: analysis.roleTitle,
        organization: analysis.organization,
        deadline: analysis.deadline,
        plainLanguageSummary: {
          am: analysis.summaryPlainLanguageAm,
          en: analysis.summaryPlainLanguageEn,
        },
        barriersDetected: analysis.potentialBarriers,
        barrierCount: analysis.potentialBarriers.length,
        recommendedAccommodations: analysis.accommodationTips,
        applicationSteps: analysis.applicationSteps,
        isAccessibleEmployer: analysis.isAccessibleEmployer,
        confidenceScore: analysis.confidenceScore,
      },
      meta: {
        apiVersion: 'v1',
        authTier: auth.keyType,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('[API v1 Decoder Error]:', err);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: err?.message || 'Opportunity decoder failure' },
      },
      { status: 500 }
    );
  }
}
