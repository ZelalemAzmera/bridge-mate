'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SignUpPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to accessible onboarding wizard
    router.replace('/onboarding');
  }, [router]);

  return (
    <div className="text-center py-16 space-y-3">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-xs font-semibold text-muted-foreground">
        Redirecting to personalized onboarding...
      </p>
    </div>
  );
}
