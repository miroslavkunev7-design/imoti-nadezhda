'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import BrandLogoHouses from '@/components/ui/BrandLogoHouses'

type BrandLogoSize = 'sm' | 'md' | 'lg' | 'hc'

const SIZES: Record<BrandLogoSize, { icon: string; line1: string; line2: string; gap: string }> = {
  sm: { icon: 'w-[88px]', line1: 'text-[7px] tracking-[0.26em]', line2: 'text-[11px] tracking-[0.32em]', gap: 'gap-1' },
  md: { icon: 'w-[108px]', line1: 'text-[8px] tracking-[0.28em]', line2: 'text-[13px] tracking-[0.34em]', gap: 'gap-1.5' },
  lg: { icon: 'w-[128px]', line1: 'text-[9px] tracking-[0.28em]', line2: 'text-[15px] tracking-[0.36em]', gap: 'gap-2' },
  hc: { icon: 'w-[clamp(100px,10vw,140px)]', line1: 'text-[clamp(8px,0.8vw,10px)] tracking-[0.28em]', line2: 'text-[clamp(12px,1.1vw,16px)] tracking-[0.36em]', gap: 'gap-2' },
}

interface Props {
  size?: BrandLogoSize
  className?: string
  href?: string
  asLink?: boolean
}

export default function BrandLogo({ size = 'md', className = '', href = '/', asLink = true }: Props) {
  const s = SIZES[size]
  const router = useRouter()
  const clickCount = useRef(0)
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleClick(e: React.MouseEvent) {
    if (!asLink) return
    clickCount.current += 1
    if (clickTimer.current) clearTimeout(clickTimer.current)
    if (clickCount.current >= 3) {
      clickCount.current = 0
      e.preventDefault()
      router.push('/admin')
    } else {
      clickTimer.current = setTimeout(() => { clickCount.current = 0 }, 600)
    }
  }

  const content = (
    <div className={`brand-logo flex flex-col items-center ${s.gap} ${className}`.trim()}>
      <BrandLogoHouses className={`brand-logo__icon h-auto ${s.icon}`} />
      <div className="brand-logo__text flex flex-col items-center text-center leading-none">
        <span
          className={`brand-logo__line1 font-semibold uppercase text-[#6B001C] ${s.line1}`}
          style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}
        >
          НЕДВИЖИМИ ИМОТИ
        </span>
        <span
          className={`brand-logo__line2 mt-1.5 font-bold uppercase text-[#6B001C] ${s.line2}`}
          style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
        >
          • НАДЕЖДА •
        </span>
      </div>
    </div>
  )

  if (!asLink) return content

  return (
    <Link href={href} onClick={handleClick} className="brand-logo-link no-underline" aria-label="Имоти Надежда — начало">
      {content}
    </Link>
  )
}
