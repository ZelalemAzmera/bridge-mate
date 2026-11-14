import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background, #F8FAFC)',
        foreground: 'var(--foreground, #0F172A)',
        card: {
          DEFAULT: 'var(--card, #FFFFFF)',
          foreground: 'var(--card-foreground, #0F172A)',
        },
        primary: {
          DEFAULT: '#1D4ED8', // Accessible Blue 7:1 against white
          foreground: '#FFFFFF',
          highContrast: '#000000',
        },
        warning: {
          DEFAULT: '#B45309', // Alert Amber 4.5:1
          foreground: '#FFFFFF',
        },
        ring: 'var(--ring, #1D4ED8)', // 3px Focus Outline
        muted: {
          DEFAULT: 'var(--muted, #F1F5F9)',
          foreground: 'var(--muted-foreground, #475569)',
        },
        border: 'var(--border, #E2E8F0)',
        input: 'var(--input, #E2E8F0)',
      },
      transitionTimingFunction: {
        'ease-out-custom': 'cubic-bezier(0.23, 1, 0.32, 1)',
        'ease-in-out-custom': 'cubic-bezier(0.77, 0, 0.175, 1)',
        'ease-drawer': 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        ethiopic: ['var(--font-noto-ethiopic)', 'sans-serif'],
        dyslexic: ['var(--font-dyslexic)', 'sans-serif'],
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
