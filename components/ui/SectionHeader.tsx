import Link from 'next/link'

interface SectionHeaderProps {
  title: string
  linkHref?: string
  linkLabel?: string
}

export default function SectionHeader({
  title,
  linkHref,
  linkLabel,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 mb-5">
      <h2 className="font-display text-section text-[#f5f0e8]">
        {title}
      </h2>
      {linkHref && linkLabel && (
        <Link
          href={linkHref}
          className="flex items-center gap-1.5 text-sm text-crimson-700 hover:text-crimson-400 transition-colors duration-200 font-medium whitespace-nowrap"
        >
          {linkLabel}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  )
}
