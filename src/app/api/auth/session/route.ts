import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, DEFAULT_MOCK_USER, type AuthUser } from '@/lib/auth';
import { getRepository } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * GET /api/auth/session
 * Returns the currently active authenticated user and tailored disability profile.
 */
export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user,
  });
}

/**
 * POST /api/auth/session
 * Sets or updates the active user session and tailored profile.
 * Stores in database repository and persists via `bridgemate_session_user` HTTP cookie.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fullName = 'BridgeMate Learner',
      email = 'learner@bridgemate.et',
      preferredLanguage = 'en',
      userType = 'pwd',
      disabilityType = 'visual_blind',
      primaryGoal = 'learn_digital_skills',
      assistiveTech = [],
      accessibilityPreferences = {
        screenReaderOptimized: false,
        highContrast: false,
        fontSizeScale: 1.0,
        reducedMotion: false,
        dyslexiaFont: false,
      },
      onboardingCompleted = true,
    } = body;

    const repo = getRepository();
    const userId = body.userId || `user_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

    // Persist to database repository
    let dbUser = await repo.users.getById(userId);
    if (!dbUser) {
      dbUser = await repo.users.create({
        id: userId,
        clerkId: `clerk_${userId}`,
        fullName,
        email,
        preferredLanguage,
        userType: userType as any,
        disabilityType,
        primaryGoal,
        assistiveTech,
        onboardingCompleted,
        accessibilityPreferences,
      });
    } else {
      dbUser = await repo.users.updateProfile(userId, {
        fullName,
        email,
        preferredLanguage,
        userType: userType as any,
        disabilityType,
        primaryGoal,
        assistiveTech,
        onboardingCompleted,
        accessibilityPreferences,
      });
    }

    const sessionPayload: AuthUser = {
      userId: dbUser.id,
      fullName: dbUser.fullName || fullName,
      email: dbUser.email || email,
      preferredLanguage: (dbUser.preferredLanguage as any) || preferredLanguage,
      accessibilityPreferences: dbUser.accessibilityPreferences || accessibilityPreferences,
      profile: {
        isPersonWithDisability: userType === 'pwd',
        userType: userType as any,
        disabilityType: dbUser.disabilityType || disabilityType,
        primaryGoal: dbUser.primaryGoal || primaryGoal,
        assistiveTech: dbUser.assistiveTech || assistiveTech,
        onboardingCompleted: dbUser.onboardingCompleted,
        telegramChatId: dbUser.telegramChatId,
        telegramUsername: dbUser.telegramUsername,
      },
      isMock: true,
    };

    const cookieValue = encodeURIComponent(JSON.stringify(sessionPayload));

    const response = NextResponse.json({
      success: true,
      message: 'Session initialized and profile tailored successfully.',
      user: sessionPayload,
    });

    response.cookies.set('bridgemate_session_user', cookieValue, {
      path: '/',
      httpOnly: false, // Accessible client-side for immediate state hydration
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (err: any) {
    console.error('[Session API Error]:', err);
    return NextResponse.json(
      { error: 'Failed to update session profile', details: err?.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/session
 * Logs out and clears the session cookie.
 */
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully.',
  });

  response.cookies.set('bridgemate_session_user', '', {
    path: '/',
    maxAge: 0,
  });

  return response;
}
