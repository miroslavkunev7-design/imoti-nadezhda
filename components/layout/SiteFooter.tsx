'use client'

import Link from 'next/link'

const CELLS = [
  { href: '/buy?featured=1', label: 'Топ оферти', sub: 'Виж обяви', icon: <HouseIcon /> },
  { href: '/buy?new=1', label: 'Най-нови', sub: 'Виж обяви', icon: <TagIcon /> },
  { href: '/admin/login', label: 'CRM система', sub: 'За брокери', icon: <CrmIcon /> },
]

export default function SiteFooter() {
  return (
    <footer className="rd-footer" role="contentinfo">
      {CELLS.map(({ href, label, sub, icon }) => (
        <Link key={href} href={href} className="rd-footer__cell">
          <span className="rd-footer__icon">{icon}</span>
          <div>
            <p className="rd-footer__label">{label}</p>
            <p className="rd-footer__sub">{sub} <ArrowIcon /></p>
          </div>
        </Link>
      ))}
    </footer>
  )
}

function HouseIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
}
function TagIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
}
function CrmIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
}
function ArrowIcon() {
  return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
}
