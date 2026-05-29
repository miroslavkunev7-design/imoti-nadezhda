'use client'

import Link from 'next/link'

/** Мраморна лента в цялата горна част на страницата (1:1 mockup). */
export default function HomeTopMarbleBand() {
  return (
    <div className="m1-top-marble">
      <div className="m1-top-marble__inner">
        <Link href="/" className="m1-top-marble__logo" aria-label="Имоти Надежда — начало">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-icon-hq.png"
            alt=""
            className="m1-top-marble__logo-img"
            width={998}
            height={2048}
            decoding="async"
          />
          <span className="m1-top-marble__logo-tag">
            Недвижими имоти
            <br />
            • Надежда •
          </span>
        </Link>
      </div>
      <svg className="m1-top-marble__wave" viewBox="0 0 1200 40" preserveAspectRatio="none" aria-hidden>
        <path d="M0,0 L0,24 Q200,42 400,28 T800,32 T1200,26 L1200,0 Z" fill="var(--m1-marble, #faf7f2)" />
        <path
          d="M0,0 L0,18 Q280,38 560,24 T1200,20 L1200,0 Z"
          fill="none"
          stroke="url(#m1TopGold)"
          strokeWidth="2.5"
        />
        <defs>
          <linearGradient id="m1TopGold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E8C878" />
            <stop offset="50%" stopColor="#CFA54A" />
            <stop offset="100%" stopColor="#E8C878" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
