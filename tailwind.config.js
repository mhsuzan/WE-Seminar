import colors from 'tailwindcss/colors'

// Colours read CSS variables so the light theme (index.css) can swap them.
const v = name => `rgb(var(--${name}) / <alpha-value>)`
const SLATE = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']
const ACCENT = ['200', '300', '400', '500', '600', '700', '800']

function themed(name, shades) {
  return { ...colors[name], ...Object.fromEntries(shades.map(s => [s, v(`${name}-${s}`)])) }
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: themed('slate', SLATE),
        emerald: themed('emerald', ACCENT),
        amber: themed('amber', ACCENT),
        rose: themed('rose', ACCENT),
        cyan: themed('cyan', ACCENT),
        violet: themed('violet', ACCENT),
        fuchsia: themed('fuchsia', ACCENT),
      },
    },
  },
  plugins: [],
}
