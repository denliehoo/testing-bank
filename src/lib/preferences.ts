import { useEffect, useSyncExternalStore } from 'react'
import { Segment } from '@/api/types'

export const Theme = { Light: 'light', Dark: 'dark' } as const
export type Theme = (typeof Theme)[keyof typeof Theme]

// public/theme-init.js reads the same keys and sets the same attributes
// before first paint. Keep the two in sync.
const STORAGE_KEY = {
  Theme: 'meridian-theme',
  Segment: 'meridian-segment',
} as const

const ATTRIBUTE = {
  Theme: 'data-theme',
  Segment: 'data-segment',
} as const

// The attributes on <html> are the source of truth: theme-init.js sets them
// before React runs, and the CSS tokens read them directly.
const root = document.documentElement

function subscribeTo(attribute: string) {
  return (onChange: () => void) => {
    const observer = new MutationObserver(onChange)
    observer.observe(root, { attributes: true, attributeFilter: [attribute] })
    return () => observer.disconnect()
  }
}

const subscribeToTheme = subscribeTo(ATTRIBUTE.Theme)
const subscribeToSegment = subscribeTo(ATTRIBUTE.Segment)

function readStored(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function remember(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Storage can be blocked; the choice just won't survive a reload.
  }
}

export function useTheme() {
  const theme = useSyncExternalStore<Theme>(subscribeToTheme, () =>
    root.getAttribute(ATTRIBUTE.Theme) === Theme.Dark ? Theme.Dark : Theme.Light,
  )

  function setTheme(next: Theme) {
    root.setAttribute(ATTRIBUTE.Theme, next)
    remember(STORAGE_KEY.Theme, next)
  }

  return { theme, setTheme }
}

export function useSegment() {
  const segment = useSyncExternalStore<Segment>(subscribeToSegment, () =>
    root.getAttribute(ATTRIBUTE.Segment) === Segment.Premium
      ? Segment.Premium
      : Segment.Retail,
  )

  function setSegment(next: Segment) {
    root.setAttribute(ATTRIBUTE.Segment, next)
    remember(STORAGE_KEY.Segment, next)
  }

  return { segment, setSegment }
}

/**
 * Applies the customer's default segment from the API, unless the user has
 * already chosen one. Only sets the attribute; it isn't saved, so it can't
 * override a later choice.
 */
export function useDefaultSegment(defaultSegment: Segment | undefined) {
  useEffect(() => {
    if (defaultSegment && readStored(STORAGE_KEY.Segment) === null) {
      root.setAttribute(ATTRIBUTE.Segment, defaultSegment)
    }
  }, [defaultSegment])
}
