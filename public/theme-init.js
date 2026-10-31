// Applies the saved (or system) theme and segment to <html> before first paint.
// It must stay a plain, render-blocking script: a module would be deferred
// and the page would flash the wrong theme. It can't import from src/, so the
// storage keys and values below mirror src/lib/preferences.ts and
// src/api/types.ts. Keep them in sync.
;(function () {
  var theme = null
  var segment = null
  try {
    theme = localStorage.getItem('meridian-theme')
    segment = localStorage.getItem('meridian-segment')
  } catch (e) {
    // Storage can be blocked (private mode); fall through to the defaults.
  }

  if (theme !== 'light' && theme !== 'dark') {
    theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  var root = document.documentElement
  root.setAttribute('data-theme', theme)
  root.setAttribute('data-segment', segment === 'premium' ? 'premium' : 'retail')
})()
