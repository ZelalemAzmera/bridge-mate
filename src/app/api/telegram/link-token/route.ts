import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, DEFAULT_MOCK_USER } from '@/lib/auth';
import { getRepository } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * GET /api/telegram/link-token
 * Generates a secure single-use linking token for the authenticated user
 * and returns the Telegram deep link to @BridgeMate_Assistant_Bot.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    const effectiveUser = user || DEFAULT_MOCK_USER;

    const repo = getRepository();

    // Ensure user exists in repository
    let dbUser = await repo.users.getById(effectiveUser.userId);
    if (!dbUser) {
      dbUser = await repo.users.create({
        id: effectiveUser.userId,
        clerkId: `clerk_${effectiveUser.userId}`,
        fullName: effectiveUser.fullName,
        email: effectiveUser.email,
        preferredLanguage: effectiveUser.preferredLanguage,
        disabilityType: effectiveUser.profile?.disabilityType || 'visual_blind',
        primaryGoal: effectiveUser.profile?.primaryGoal || 'learn_digital_skills',
        onboardingCompleted: true,
      });
    }

    const token = await repo.users.createLinkingToken(dbUser.id);
    const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'BridgeMate_Assistant_Bot';
    const deepLink = `https://t.me/${botUsername}?start=${token}`;

    return NextResponse.json({
      success: true,
      token,
      botUsername,
      deepLink,
      expiresInHours: 24,
    });
  } catch (err: any) {
    console.error('[Telegram Link Token Error]:', err);
    return NextResponse.json(
      { error: 'Failed to generate linking token', details: err?.message },
      { status: 500 }
    );
  }
}
