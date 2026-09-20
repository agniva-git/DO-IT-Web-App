/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ── Canvas tiers (Midnight Blue Palette — #0B1D3A System) ─────────
        ink:          '#06101F',   // Swatch 1: Deepest inky void
        surface:      '#0B1D3A',   // Swatch 2: Core Bang Chan Midnight Blue
        surfaceRaised:'#102A4C',   // Swatch 3: Lifted cards & panels
        surfaceHigh:  '#1B4167',   // Swatch 4: Modals, elevated drawers & highlight rims

        // ── Midnight Blue Accents & Metals ──────────────────────────────────
        midnightCore: '#0B1D3A',   // Swatch 2
        midnightCard: '#102A4C',   // Swatch 3
        midnightRim:  '#1B4167',   // Swatch 4: Brushed steel-navy
        slateDusk:    '#6E88A3',   // Swatch 5: Dusk slate

        // ── Borders ─────────────────────────────────────────────────────────
        line:         'rgba(27, 65, 103, 0.38)', // Hairline border derived from #1B4167
        lineStrong:   '#1B4167',                 // Explicit dividers

        // ── Text tiers (Archival Parchment & Platinum scale) ───────────────
        paper:        '#F4F1EA',   // Archival warm parchment from the labels in reference
        paperWarm:    '#E5E0D5',   // Vintage ticket badge cream
        textSecondary:'#C8D6E5',   // Body text & descriptions — high contrast, gentle on eyes
        textMuted:    '#6E88A3',   // Swatch 5: Captions, metadata, inactive icons

        // ── Module accents ──────────────────────────────────────────────────
        focus:    '#00C9C8',   // Electric cyan  — Focus module
        move:     '#F08C3A',   // Warm ember     — Fitness module
        plan:     '#818CF8',   // Soft indigo    — Tasks/Study module
        reflect:  '#B784C4',   // Soft violet    — Analytics/AI

        // ── Semantic states ─────────────────────────────────────────────────
        good:   '#5FAE7A',
        warn:   '#E0A63C',
        danger: '#D9705A',

        // ── Legacy alias ────────────────────────────────────────────────────
        paper_old: '#F5F3EE',
      },

      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body:    ['"Inter"', 'sans-serif'],
        mono:    ['"IBM Plex Mono"', 'monospace'],
      },

      borderRadius: {
        card: '14px',
        pill: '999px',
      },

      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        ripple: {
          '0%':   { transform: 'scale(0.8)', opacity: '0.6' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        breathe: {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.35' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },

      animation: {
        fadeUp:  'fadeUp 0.35s ease-out both',
        shimmer: 'shimmer 1.8s linear infinite',
        ripple:  'ripple 0.7s ease-out forwards',
        breathe: 'breathe 2s ease-in-out infinite',
        slideUp: 'slideUp 0.3s ease-out both',
      },

      boxShadow: {
        'glow-focus':    '0 0 20px rgba(0, 201, 200, 0.25)',
        'glow-move':     '0 0 20px rgba(240, 140, 58,  0.25)',
        'glow-plan':     '0 0 20px rgba(129, 140, 248, 0.25)',
        'glow-mirage':   '0 0 24px rgba(27, 65, 103, 0.50)',
        'glow-midnight': '0 0 28px rgba(11, 29, 58, 0.65)',
        'cinematic':     '0 24px 80px rgba(6, 16, 31, 0.85)',
        'card-rim':      'inset 0 1px 0 rgba(244, 241, 234, 0.10), 0 8px 32px rgba(6, 16, 31, 0.60)',
      },
    },
  },
  plugins: [],
}