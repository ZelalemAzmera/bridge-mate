// tests/setup.ts
// Vitest global test setup

// Setup any global mocks or test harness extensions
if (typeof window !== 'undefined') {
  try {
    // Dynamic import to prevent Node.js runtime errors when running non-browser tests
    require('@testing-library/jest-dom');
  } catch {
    // Ignore in non-DOM environments
  }
}

