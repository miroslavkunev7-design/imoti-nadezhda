'use client'

import { useTheme } from '@/components/providers/ThemeProvider'

interface ThemeToggleProps {
  /** Styled as gold ring inside luxury nav panel */
  inPanel?: boolean
}

export default function ThemeToggle({ inPanel = false }: ThemeToggleProps) {
  const { theme, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Превключи към светъл режим' : 'Превключи към тъмен режим'}
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      className={[
        'relative flex items-center justify-center transition-all duration-300',
        inPanel
          ? 'luxury-nav-theme-btn'
          : [
              'w-9 h-9 rounded-full',
              theme === 'dark'
                ? 'border border-[rgba(255,255,255,0.12)] text-[#9b8f82] hover:text-[#f5d97a] hover:border-[rgba(245,217,122,0.3)]'
                : 'border border-[rgba(0,0,0,0.12)] text-[#6b5e58] hover:text-bordeaux hover:border-[rgba(80,11,26,0.25)]',
            ].join(' '),
      ].join(' ')}
    >
      {/* Animated sun/moon swap */}
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-300"
        style={{
          opacity: theme === 'dark' ? 1 : 0,
          transform: theme === 'dark' ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0)',
        }}
      >
        <SunIcon />
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-300"
        style={{
          opacity: theme === 'light' ? 1 : 0,
          transform: theme === 'light' ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0)',
        }}
      >
        <MoonIcon />
      </span>
    </button>
  )
}

function SunIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  )
}
