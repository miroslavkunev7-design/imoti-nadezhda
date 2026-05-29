'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { useRouter } from 'next/navigation'

type BrandLogoSize = 'sm' | 'md' | 'lg' | 'hc'

const WIDTHS: Record<BrandLogoSize, string> = {
  sm: 'w-[88px]',
  md: 'w-[108px]',
  lg: 'w-[128px]',
  hc: 'w-[clamp(100px,10vw,140px)]',
}

interface Props {
  size?: BrandLogoSize
  className?: string
  href?: string
  asLink?: boolean
}

export default function BrandLogo({ size = 'md', className = '', href = '/', asLink = true }: Props) {
  const w = WIDTHS[size]
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
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/logo-nadezhda-brand.png"
      alt="Имоти Надежда"
      className={`brand-logo block h-auto ${w} ${className}`.trim()}
      draggable={false}
    />
  )

  if (!asLink) return content

  return (
    <Link href={href} onClick={handleClick} className="brand-logo-link no-underline" aria-label="Имоти Надежда — начало">
      {content}
    </Link>
  )
}
