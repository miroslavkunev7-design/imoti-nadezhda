'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export function useFullscreenTour(containerRef: React.RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const enter = useCallback(async () => {
    const el = containerRef.current
    if (!el) return false
    try {
      if (el.requestFullscreen) {
        await el.requestFullscreen()
      } else if ((el as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
        await (el as HTMLElement & { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen()
      }
      return true
    } catch {
      return false
    }
  }, [containerRef])

  const exit = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  return { isFullscreen, enter, exit }
}

/** Auto-enter fullscreen once when tour opens (CRM + property page) */
export function useAutoFullscreenOnMount(
  containerRef: React.RefObject<HTMLElement | null>,
  enabled: boolean
) {
  const entered = useRef(false)
  const { enter } = useFullscreenTour(containerRef)

  useEffect(() => {
    if (!enabled || entered.current) return
    entered.current = true
    const t = setTimeout(() => {
      enter().catch(() => {})
    }, 450)
    return () => clearTimeout(t)
  }, [enabled, enter])
}
