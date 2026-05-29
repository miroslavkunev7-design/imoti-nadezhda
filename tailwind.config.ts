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
        crimson: {
          50:  '#fdf2f6',
          100: '#f8e0e8',
          200: '#eec0d0',
          300: '#d98aa8',
          400: '#b84d72',
          500: '#8B2548',
          600: '#CFA847',
          700: '#CFA847',
          800: '#421018',
          900: '#4E0B1F',
          950: '#2E0612',
        },
        bordeaux: {
          DEFAULT: '#4E0B1F',
          deep:    '#2E0612',
          dark:    '#3A0818',
          light:   '#6E2440',
        },
        gold: {
          DEFAULT: '#CFA847',
          light:   '#E5C978',
        },
        brand: {
          bg:       '#080810',
          surface:  '#0f0f1a',
          elevated: '#161625',
          border:   'rgba(255,255,255,0.07)',
          borderHover: 'rgba(78,11,31,0.45)',
        },
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        body:    ['var(--font-inter)',     'system-ui', 'sans-serif'],
        sans:    ['var(--font-inter)',     'system-ui', 'sans-serif'],
        serif:   ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      fontSize: {
        'hero':    ['clamp(2.5rem, 5vw, 4rem)',  { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'city':    ['clamp(2rem,   4vw, 3rem)',  { lineHeight: '1.15' }],
        'section': ['clamp(1.4rem, 2.5vw, 1.75rem)', { lineHeight: '1.2' }],
        'price':   ['1.5rem',  { lineHeight: '1',    fontWeight: '700' }],
        'label':   ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.1em' }],
      },
      backdropBlur: {
        glass: '24px',
      },
      backgroundImage: {
        'glass-dark':   'linear-gradient(135deg, rgba(8,6,18,0.85) 0%, rgba(12,10,24,0.80) 100%)',
        'card-overlay': 'linear-gradient(to top, rgba(4,2,12,0.92) 0%, rgba(4,2,12,0.4) 55%, transparent 100%)',
        'hero-overlay': 'linear-gradient(to bottom, rgba(8,8,16,0.45) 0%, rgba(8,8,16,0.25) 40%, rgba(8,8,16,0.65) 100%)',
        'crimson-glow': 'radial-gradient(ellipse at center, rgba(80,11,26,0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)',
        card:  '0 4px 24px rgba(0,0,0,0.45)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.65)',
        'crimson': '0 0 0 1px rgba(80,11,26,0.55), 0 8px 32px rgba(80,11,26,0.2)',
        'btn':  '0 4px 16px rgba(168,107,61,0.45)',
        'btn-hover': '0 6px 24px rgba(168,107,61,0.55)',
      },
      animation: {
        'fade-up':       'fadeUp 0.5s ease forwards',
        'fade-in':       'fadeIn 0.4s ease forwards',
        'ken-burns':     'kenBurns 8s ease-in-out forwards',
        'slide-down':    'slideDown 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'pulse-crimson': 'pulseCrimson 2s ease-in-out infinite',
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
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        pulseCrimson: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(168,107,61,0.4)' },
          '50%':      { boxShadow: '0 0 0 8px rgba(168,107,61,0)' },
        },
      },
      transitionTimingFunction: {
        'luxury': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}

export default config
