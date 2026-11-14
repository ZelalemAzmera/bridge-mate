import { NextRequest, NextResponse } from 'next/server';
import { OpportunityDecoderService } from '@/lib/ai/decoder.service';
import { AnalyzeRequestSchema } from '@/lib/validators/decoder.schema';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = AnalyzeRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid request payload.',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { rawText, jobOpportunityId } = parsed.data;
    const analysis = await OpportunityDecoderService.analyzeOpportunity(
      rawText,
      jobOpportunityId
    );

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    console.error('[Opportunity Decoder API Error]:', error);
    return NextResponse.json(
      { error: 'Failed to analyze opportunity notice.', message: error.message },
      { status: 500 }
    );
  }
}

