import { NextRequest, NextResponse } from 'next/server';
import { LtiService } from '@/lib/lti/lti.service';

export const runtime = 'nodejs';

/**
 * LTI 1.3 Assignment and Grade Services (AGS) Endpoint
 * Enables BridgeMate to report accommodated quiz completion and engagement
 * directly back to Canvas / Moodle / ALX Savannah gradebook.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      userId,
      scoreGiven = 100,
      scoreMaximum = 100,
      comment = 'Accommodated assessment completed via BridgeMate',
      activityProgress = 'Completed',
      gradingProgress = 'FullyGraded',
      lineItemUrl = 'https://savannah.alxafrica.com/api/lti/ags/lineitem/101',
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required for LTI AGS score passback' },
        { status: 400 }
      );
    }

    const result = await LtiService.submitGrade(lineItemUrl, {
      userId,
      scoreGiven: Number(scoreGiven),
      scoreMaximum: Number(scoreMaximum),
      comment,
      activityProgress,
      gradingProgress,
    });

    return NextResponse.json({
      ...result,
      standard: '1EdTech LTI Assignment and Grade Services (AGS) v2.0',
    });
  } catch (err: any) {
    console.error('[LTI AGS Error]:', err);
    return NextResponse.json(
      { error: 'Grade passback failed', details: err?.message },
      { status: 500 }
    );
  }
}
