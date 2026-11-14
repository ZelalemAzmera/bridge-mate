import { headers, cookies } from 'next/headers';
import { env } from '@/lib/env';

export interface AccessibilityPreferences {
  screenReaderOptimized: boolean;
  highContrast: boolean;
  fontSizeScale: number;
  reducedMotion: boolean;
  dyslexiaFont?: boolean;
}

export interface UserProfile {
  isPersonWithDisability?: boolean;
  userType?: 'pwd' | 'ally' | 'employer' | 'educator';
  disabilityType?: string; // 'visual_blind' | 'visual_low' | 'hearing_deaf' | 'hearing_hard_of_hearing' | 'mobility_physical' | 'neurodivergent_cognitive' | 'speech_communication' | 'none'
  primaryGoal?: string; // 'learn_digital_skills' | 'find_accessible_jobs' | 'request_accommodations' | 'connect_human_help'
  assistiveTech?: string[];
  onboardingCompleted?: boolean;
  telegramChatId?: string | null;
  telegramUsername?: string | null;
}

export interface AuthUser {
  userId: string;
  fullName: string;
  email: string;
  preferredLanguage: 'am' | 'en' | 'om' | 'ti' | 'so' | string;
  accessibilityPreferences: AccessibilityPreferences;
  profile?: UserProfile;
  isMock: boolean;
}

export const DEFAULT_MOCK_USER: AuthUser = {
  userId: 'user_mock_selamawit_01',
  fullName: 'Selamawit Tadesse',
  email: 'selamawit@example.com',
  preferredLanguage: 'am',
  accessibilityPreferences: {
    screenReaderOptimized: true,
    highContrast: true,
    fontSizeScale: 1.25,
    reducedMotion: false,
  },
  profile: {
    isPersonWithDisability: true,
    userType: 'pwd',
    disabilityType: 'visual_blind',
    primaryGoal: 'learn_digital_skills',
    assistiveTech: ['screen_reader', 'keyboard_only'],
    onboardingCompleted: true,
  },
  isMock: true,
};

export class UnauthorizedError extends Error {
  public readonly status = 401;
  constructor(message = 'Authentication required to access this resource') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

// In-memory test override for unit tests
let testMockUserOverride: AuthUser | null | undefined = undefined;

export function setMockAuthUser(user: AuthUser | null): void {
  testMockUserOverride = user;
}

export function resetMockAuthUser(): void {
  testMockUserOverride = undefined;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  // 1. Check if test override is active
  if (testMockUserOverride !== undefined) {
    return testMockUserOverride;
  }

  // 2. If mock mode is active, read session cookie or headers
  if (env.isMockAuth) {
    try {
      const headerList = await headers();
      const isUnauth = headerList.get('x-bridgemate-mock-unauthenticated') === 'true';
      if (isUnauth) {
        return null;
      }

      // Check session cookie first
      try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('bridgemate_session_user')?.value;
        if (sessionCookie) {
          const parsed = JSON.parse(decodeURIComponent(sessionCookie));
          return {
            userId: parsed.userId || 'user_' + Math.random().toString(36).slice(2, 8),
            fullName: parsed.fullName || 'BridgeMate User',
            email: parsed.email || 'user@example.com',
            preferredLanguage: parsed.preferredLanguage || 'en',
            accessibilityPreferences: parsed.accessibilityPreferences || DEFAULT_MOCK_USER.accessibilityPreferences,
            profile: parsed.profile || {
              isPersonWithDisability: parsed.isPersonWithDisability ?? true,
              userType: parsed.userType ?? 'pwd',
              disabilityType: parsed.disabilityType,
              primaryGoal: parsed.primaryGoal,
              assistiveTech: parsed.assistiveTech ?? [],
              onboardingCompleted: parsed.onboardingCompleted ?? true,
              telegramChatId: parsed.telegramChatId ?? null,
              telegramUsername: parsed.telegramUsername ?? null,
            },
            isMock: true,
          };
        }
      } catch {
        // Cookie parsing fallback
      }

      const userId = headerList.get('x-bridgemate-user-id');
      if (userId) {
        return {
          userId,
          fullName: headerList.get('x-bridgemate-user-name') ?? DEFAULT_MOCK_USER.fullName,
          email: headerList.get('x-bridgemate-user-email') ?? DEFAULT_MOCK_USER.email,
          preferredLanguage: (headerList.get('x-bridgemate-user-lang') as 'am' | 'en') ?? DEFAULT_MOCK_USER.preferredLanguage,
          accessibilityPreferences: DEFAULT_MOCK_USER.accessibilityPreferences,
          profile: {
            isPersonWithDisability: headerList.get('x-bridgemate-user-pwd') !== 'false',
            disabilityType: headerList.get('x-bridgemate-user-disability') || 'visual_blind',
            primaryGoal: headerList.get('x-bridgemate-user-goal') || 'learn_digital_skills',
            onboardingCompleted: true,
          },
          isMock: true,
        };
      }
    } catch {
      // Non-request context (e.g. background job or test run without headers)
    }

    return DEFAULT_MOCK_USER;
  }

  // 3. Live Clerk mode
  try {
    const { auth, currentUser } = await import('@clerk/nextjs/server');
    const { userId } = await auth();
    if (!userId) {
      return null;
    }

    const clerkUser = await currentUser();
    const primaryEmail = clerkUser?.emailAddresses?.[0]?.emailAddress ?? '';
    const fullName = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ') || 'BridgeMate User';
    const metadata = clerkUser?.unsafeMetadata || {};

    return {
      userId,
      fullName,
      email: primaryEmail,
      preferredLanguage: (metadata.preferredLanguage as string) || 'en',
      accessibilityPreferences: (metadata.accessibilityPreferences as AccessibilityPreferences) || {
        screenReaderOptimized: false,
        highContrast: false,
        fontSizeScale: 1.0,
        reducedMotion: false,
      },
      profile: {
        isPersonWithDisability: metadata.isPersonWithDisability as boolean ?? true,
        userType: (metadata.userType as any) || 'pwd',
        disabilityType: metadata.disabilityType as string,
        primaryGoal: metadata.primaryGoal as string,
        assistiveTech: (metadata.assistiveTech as string[]) || [],
        onboardingCompleted: metadata.onboardingCompleted as boolean ?? false,
      },
      isMock: false,
    };
  } catch (err) {
    console.error('[Auth] Failed to authenticate via Clerk:', err);
    return null;
  }
}

export async function requireAuthUser(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) {
    throw new UnauthorizedError();
  }
  return user;
}
