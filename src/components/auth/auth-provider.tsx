'use client';

import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';

const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isLiveClerk = Boolean(
  clerkPubKey &&
  (clerkPubKey.startsWith('pk_test_') || clerkPubKey.startsWith('pk_live_')) &&
  !clerkPubKey.includes('sample') &&
  clerkPubKey !== 'mock'
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (isLiveClerk && clerkPubKey) {
    return (
      <ClerkProvider
        publishableKey={clerkPubKey}
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/learn"
        afterSignUpUrl="/learn"
      >
        {children}
      </ClerkProvider>
    );
  }

  return <>{children}</>;
}
