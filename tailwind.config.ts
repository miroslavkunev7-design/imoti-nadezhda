import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        burgundy: {
          DEFAULT: '#6B001C',
          light:   '#7A0D28',
        },
        marble: {
          DEFAULT: '#FAF7F2',
          dark:    '#F5F0E8',
        },
        gold: {
          DEFAULT: '#CFA54A',
          deep:    '#A97A1F',
          light:   '#E8C872',
        },
        crimson: {
          700: '#6B001C',
          800: '#6B001C',
          900: '#6B001C',
        },
        brand: {
          bg:       '#FAF7F2',
          surface:  '#FFFFFF',
          elevated: '#F5F0E8',
          border:   'rgba(107,0,28,0.12)',
          borderHover: 'rgba(207,165,74,0.55)',
        },
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        body:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
        sans:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif:   ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      fontSize: {
        hero:    ['clamp(2.5rem, 5vw, 4rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        city:    ['clamp(2rem, 4vw, 3rem)', { lineHeight: '1.15' }],
        section: ['clamp(1.4rem, 2.5vw, 1.75rem)', { lineHeight: '1.2' }],
        price:   ['1.5rem', { lineHeight: '1', fontWeight: '700' }],
        label:   ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.1em' }],
      },
      boxShadow: {
        luxury: '0 8px 32px rgba(107,0,28,0.12)',
        'luxury-hover': '0 12px 40px rgba(107,0,28,0.2)',
        gold: '0 4px 16px rgba(169,122,31,0.35)',
      },
      transitionTimingFunction: {
        luxury: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        'fade-up':    'fadeUp 0.5s ease forwards',
        'fade-in':    'fadeIn 0.4s ease forwards',
        'ken-burns':  'kenBurns 8s ease-in-out forwards',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        kenBurns: {
          from: { transform: 'scale(1.06)' },
          to:   { transform: 'scale(1.0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
