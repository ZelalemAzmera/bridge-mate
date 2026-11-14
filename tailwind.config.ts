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
        // Strict Four-Color Design System
        // Primary: #142B27 (Deep Forest Pine / Hunter Evergreen)
        // Secondary: #D9E5D8 (Soft Sage / Pale Laurel)
        // Accent: #D69B52 (Warm Ochre / Honey Amber)
        // Neutral: #F7F6F0 (Warm Bone / Architectural Off-White)
        brand: {
          primary: '#142B27',
          secondary: '#D9E5D8',
          accent: '#D69B52',
          neutral: '#F7F6F0',
          dark: '#0D1916',
          darkSurface: '#142521',
        },
        background: 'var(--background, #F7F6F0)',
        foreground: 'var(--foreground, #142B27)',
        card: {
          DEFAULT: 'var(--card, #FFFFFF)',
          foreground: 'var(--card-foreground, #142B27)',
        },
        primary: {
          DEFAULT: 'var(--primary, #142B27)',
          foreground: 'var(--primary-foreground, #F7F6F0)',
          hover: '#0E1E1B',
        },
        secondary: {
          DEFAULT: 'var(--secondary, #D9E5D8)',
          foreground: 'var(--secondary-foreground, #142B27)',
        },
        accent: {
          DEFAULT: 'var(--accent, #D69B52)',
          foreground: 'var(--accent-foreground, #142B27)',
        },
        warning: {
          DEFAULT: '#B45309',
          foreground: '#FFFFFF',
        },
        ring: 'var(--ring, #142B27)',
        muted: {
          DEFAULT: 'var(--muted, #EDEAE1)',
          foreground: 'var(--muted-foreground, #42524D)',
        },
        border: 'var(--border, #DDD9CD)',
        input: 'var(--input, #BBB5A4)',
      },
      transitionTimingFunction: {
        'ease-out-custom': 'cubic-bezier(0.23, 1, 0.32, 1)',
        'ease-in-out-custom': 'cubic-bezier(0.77, 0, 0.175, 1)',
        'ease-drawer': 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Charter', 'Iowan Old Style', 'Palatino Linotype', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        ethiopic: ['var(--font-ethiopic)', 'Noto Sans Ethiopic', 'Abyssinica SIL', 'Nyala', 'sans-serif'],
        dyslexic: ['var(--font-dyslexic)', 'sans-serif'],
      },
      borderRadius: {
        lg: '6px',
        md: '4px',
        sm: '2px',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(20, 43, 39, 0.05)',
        sm: '0 2px 4px 0 rgba(20, 43, 39, 0.06)',
        md: '0 4px 12px -2px rgba(20, 43, 39, 0.08)',
        lg: '0 12px 24px -4px rgba(20, 43, 39, 0.12)',
        editorial: '0 18px 40px -8px rgba(20, 43, 39, 0.14)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
