import { headers } from 'next/headers';
import { env } from '@/lib/env';

export interface AccessibilityPreferences {
  screenReaderOptimized: boolean;
  highContrast: boolean;
  fontSizeScale: number;
  reducedMotion: boolean;
  dyslexiaFont?: boolean;
}

export interface AuthUser {
  userId: string;
  fullName: string;
  email: string;
  preferredLanguage: 'am' | 'en';
  accessibilityPreferences: AccessibilityPreferences;
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

  // 2. If mock mode is active, read headers or return DEFAULT_MOCK_USER
  if (env.isMockAuth) {
    try {
      const headerList = await headers();
      const isUnauth = headerList.get('x-bridgemate-mock-unauthenticated') === 'true';
      if (isUnauth) {
        return null;
      }

      const userId = headerList.get('x-bridgemate-user-id');
      if (userId) {
        return {
          userId,
          fullName: headerList.get('x-bridgemate-user-name') ?? DEFAULT_MOCK_USER.fullName,
          email: headerList.get('x-bridgemate-user-email') ?? DEFAULT_MOCK_USER.email,
          preferredLanguage: (headerList.get('x-bridgemate-user-lang') as 'am' | 'en') ?? DEFAULT_MOCK_USER.preferredLanguage,
          accessibilityPreferences: DEFAULT_MOCK_USER.accessibilityPreferences,
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

    return {
      userId,
      fullName,
      email: primaryEmail,
      preferredLanguage: (clerkUser?.unsafeMetadata?.preferredLanguage as 'am' | 'en') || 'am',
      accessibilityPreferences: (clerkUser?.unsafeMetadata?.accessibilityPreferences as AccessibilityPreferences) || {
        screenReaderOptimized: false,
        highContrast: false,
        fontSizeScale: 1.0,
        reducedMotion: false,
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
