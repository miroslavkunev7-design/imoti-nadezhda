import Link from 'next/link'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="breadcrumb" aria-label="Навигация">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && (
            <svg
              className="breadcrumb-sep flex-shrink-0"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          )}
          {item.href && i < items.length - 1 ? (
            <Link href={item.href}>{item.label}</Link>
          ) : (
            <span className={i === items.length - 1 ? 'text-[#f5f0e8]' : ''}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}
