import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  DEFAULT_MOCK_USER,
  getAuthUser,
  requireAuthUser,
  setMockAuthUser,
  resetMockAuthUser,
  UnauthorizedError,
  type AuthUser,
} from '@/lib/auth';

describe('Auth Helper (src/lib/auth.ts)', () => {
  beforeEach(() => {
    resetMockAuthUser();
  });

  afterEach(() => {
    resetMockAuthUser();
  });

  it('defines DEFAULT_MOCK_USER with required accessibility preferences', () => {
    expect(DEFAULT_MOCK_USER.userId).toBe('user_mock_selamawit_01');
    expect(DEFAULT_MOCK_USER.fullName).toBe('Selamawit Tadesse');
    expect(DEFAULT_MOCK_USER.email).toBe('selamawit@example.com');
    expect(DEFAULT_MOCK_USER.preferredLanguage).toBe('am');
    expect(DEFAULT_MOCK_USER.accessibilityPreferences.screenReaderOptimized).toBe(true);
    expect(DEFAULT_MOCK_USER.accessibilityPreferences.highContrast).toBe(true);
    expect(DEFAULT_MOCK_USER.accessibilityPreferences.fontSizeScale).toBe(1.25);
    expect(DEFAULT_MOCK_USER.isMock).toBe(true);
  });

  it('returns DEFAULT_MOCK_USER in mock environment by default', async () => {
    const user = await getAuthUser();
    expect(user).toEqual(DEFAULT_MOCK_USER);
  });

  it('requireAuthUser succeeds when authenticated', async () => {
    const user = await requireAuthUser();
    expect(user.userId).toBe(DEFAULT_MOCK_USER.userId);
  });

  it('allows overriding mock user for testing specific personas', async () => {
    const englishUser: AuthUser = {
      userId: 'user_mock_kebede_02',
      fullName: 'Kebede Michael',
      email: 'kebede@example.com',
      preferredLanguage: 'en',
      accessibilityPreferences: {
        screenReaderOptimized: false,
        highContrast: false,
        fontSizeScale: 1.0,
        reducedMotion: true,
      },
      isMock: true,
    };

    setMockAuthUser(englishUser);

    const user = await getAuthUser();
    expect(user?.userId).toBe('user_mock_kebede_02');
    expect(user?.preferredLanguage).toBe('en');
    expect(user?.accessibilityPreferences.reducedMotion).toBe(true);
  });

  it('simulates unauthenticated user and throws UnauthorizedError on requireAuthUser', async () => {
    setMockAuthUser(null);

    const user = await getAuthUser();
    expect(user).toBeNull();

    await expect(requireAuthUser()).rejects.toThrow(UnauthorizedError);
  });

  it('resets override cleanly', async () => {
    setMockAuthUser(null);
    expect(await getAuthUser()).toBeNull();

    resetMockAuthUser();
    expect(await getAuthUser()).toEqual(DEFAULT_MOCK_USER);
  });
});

