'use client'

interface MarblePageShellProps {
  children: React.ReactNode
  className?: string
}

export default function MarblePageShell({ children, className = '' }: MarblePageShellProps) {
  return (
    <div className={`lux-marble-page ${className}`.trim()}>
      {children}
    </div>
  )
}
