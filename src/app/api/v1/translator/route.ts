import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api/v1-auth';
import { AccommodationTranslatorService } from '@/lib/ai/translator.service';
import { GenerateAccommodationRequestSchema } from '@/lib/validators/translator.schema';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/v1/translator',
    description: 'BridgeMate Accommodation Translator API — Translates personal functional needs into professional, legally protected requests without disclosing private medical diagnoses.',
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
    const json = await req.json();
    const parsed = GenerateAccommodationRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request payload for accommodation letter generation.',
            details: parsed.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const letter = await AccommodationTranslatorService.generateLetter(parsed.data);

    return NextResponse.json({
      success: true,
      data: {
        id: letter.id,
        subject: {
          am: letter.subjectAm,
          en: letter.subjectEn,
        },
        letterBody: {
          am: letter.letterBodyAm,
          en: letter.letterBodyEn,
        },
        statutoryReferences: letter.statutoryCitations,
        suggestedNextSteps: letter.practicalRecommendations,
        tone: parsed.data.tone,
        status: letter.status,
      },
      meta: {
        apiVersion: 'v1',
        authTier: auth.keyType,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('[API v1 Translator Error]:', err);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: err?.message || 'Translator service failure' },
      },
      { status: 500 }
    );
  }
}
