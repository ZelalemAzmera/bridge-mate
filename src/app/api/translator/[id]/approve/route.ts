import { NextRequest, NextResponse } from 'next/server';
import { AccommodationTranslatorService } from '@/lib/ai/translator.service';

export const runtime = 'nodejs';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const json = await req.json().catch(() => ({}));
    const status = json.status === 'sent' ? 'sent' : 'approved';

    const success = await AccommodationTranslatorService.approveAccommodation(
      id,
      status
    );

    return NextResponse.json({
      success,
      id,
      status,
      message: `Accommodation request ${id} marked as ${status}.`,
    });
  } catch (error: any) {
    console.error('[Approve Accommodation Error]:', error);
    return NextResponse.json(
      { error: 'Failed to update accommodation request status.', message: error.message },
      { status: 500 }
    );
  }
}

