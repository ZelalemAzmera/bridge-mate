import { NextRequest, NextResponse } from 'next/server';
import { AccommodationTranslatorService } from '@/lib/ai/translator.service';
import { GenerateAccommodationRequestSchema } from '@/lib/validators/translator.schema';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = GenerateAccommodationRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid accommodation request payload.',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const letter = await AccommodationTranslatorService.generateLetter(parsed.data);

    return NextResponse.json({
      success: true,
      data: letter,
    });
  } catch (error: any) {
    console.error('[Accommodation Translator API Error]:', error);
    return NextResponse.json(
      { error: 'Failed to generate accommodation letter.', message: error.message },
      { status: 500 }
    );
  }
}

