interface MarbleDissolveOverlayProps {
  direction?: 'ltr' | 'rtl' | 'bottom'
  intensity?: 'card' | 'hero'
  className?: string
}

export default function MarbleDissolveOverlay({
  direction = 'ltr',
  intensity = 'card',
  className = '',
}: MarbleDissolveOverlayProps) {
  const gradients = {
    ltr: `
      linear-gradient(to right,
        rgba(250,247,242,0.98) 0%,
        rgba(250,247,242,0.82) 18%,
        rgba(207,165,74,0.28) 42%,
        rgba(207,165,74,0.08) 62%,
        transparent 100%
      )
    `,
    rtl: `
      linear-gradient(to left,
        rgba(250,247,242,0.98) 0%,
        rgba(250,247,242,0.82) 18%,
        rgba(207,165,74,0.28) 42%,
        rgba(207,165,74,0.08) 62%,
        transparent 100%
      )
    `,
    bottom: `
      linear-gradient(to top,
        rgba(250,247,242,0.96) 0%,
        rgba(250,247,242,0.75) 22%,
        rgba(207,165,74,0.22) 48%,
        rgba(207,165,74,0.06) 68%,
        transparent 100%
      )
    `,
  }

  const particleOpacity = intensity === 'hero' ? 0.35 : 0.22

  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      aria-hidden
      style={{
        background: gradients[direction],
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          opacity: particleOpacity,
          backgroundImage: `
            radial-gradient(circle at 12% 45%, rgba(207,165,74,0.9) 0.5px, transparent 0.6px),
            radial-gradient(circle at 18% 62%, rgba(250,247,242,0.95) 0.4px, transparent 0.5px),
            radial-gradient(circle at 24% 38%, rgba(169,122,31,0.8) 0.5px, transparent 0.6px),
            radial-gradient(circle at 30% 55%, rgba(207,165,74,0.7) 0.3px, transparent 0.4px),
            radial-gradient(circle at 36% 48%, rgba(250,247,242,0.85) 0.4px, transparent 0.5px),
            radial-gradient(circle at 42% 65%, rgba(169,122,31,0.6) 0.3px, transparent 0.4px)
          `,
          backgroundSize: '100% 100%',
          maskImage: direction === 'bottom'
            ? 'linear-gradient(to top, black 0%, transparent 85%)'
            : 'linear-gradient(to right, black 0%, transparent 75%)',
          WebkitMaskImage: direction === 'bottom'
            ? 'linear-gradient(to top, black 0%, transparent 85%)'
            : 'linear-gradient(to right, black 0%, transparent 75%)',
        }}
      />
    </div>
  )
}
