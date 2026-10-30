import { createContext, useContext, useEffect, useState, useMemo } from 'react'

const DARK = {
  tick: '#94a3b8', tickStrong: '#cbd5e1', axis: '#334155', grid: '#1e293b',
  label: '#64748b', labelActive: '#e2e8f0', bar: '#334155', accent: '#34d399',
  accentSoft: '#6ee7b7', amber: '#fbbf24', amberSoft: '#fcd34d', rose: '#fb7185',
  dotStroke: '#ecfdf5', cursor: '#475569', cursorFill: 'rgba(148,163,184,0.08)',
}

const LIGHT = {
  tick: '#475569', tickStrong: '#334155', axis: '#cbd5e1', grid: '#e2e8f0',
  label: '#94a3b8', labelActive: '#0f172a', bar: '#cbd5e1', accent: '#059669',
  accentSoft: '#047857', amber: '#d97706', amberSoft: '#b45309', rose: '#e11d48',
  dotStroke: '#064e3b', cursor: '#94a3b8', cursorFill: 'rgba(100,116,139,0.08)',
}

const ThemeContext = createContext(null)

function stored(key, fallback) {
  try {
    return window.localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

function store(key, value) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // storage blocked — the choice just won't be remembered
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => stored('green-ai-theme', 'dark'))
  const [presenter, setPresenter] = useState(() => stored('green-ai-presenter', 'off') === 'on')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    store('green-ai-theme', theme)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f1f5f9' : '#020617')
  }, [theme])

  useEffect(() => {
    document.documentElement.dataset.presenter = presenter ? 'on' : 'off'
    store('green-ai-presenter', presenter ? 'on' : 'off')
  }, [presenter])

  const value = useMemo(() => {
    const scale = presenter ? 1.2 : 1
    return {
      theme, setTheme, presenter, setPresenter,
      chart: { ...(theme === 'light' ? LIGHT : DARK), fs: n => Math.round(n * scale) },
    }
  }, [theme, presenter])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useThemeSettings() {
  return useContext(ThemeContext)
}

export function useChartTheme() {
  return useContext(ThemeContext).chart
}
