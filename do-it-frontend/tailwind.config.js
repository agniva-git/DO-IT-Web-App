/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ── Canvas tiers (Navy Mirage Architecture) ─────────────────────────
        ink:          '#0A1B2E',   // Deepest oceanic navy base (#01 Deep Navy)
        surface:      '#141E30',   // Navy Mirage card surface (Image 2)
        surfaceRaised:'#192A42',   // Floating elements / pills (#141E30 + #35577D midpoint)
        surfaceHigh:  '#1E3552',   // Modals / Elevated panels (#03 Ocean Depth)

        // ── Navy Mirage Accents ─────────────────────────────────────────────
        mirageDark:   '#141E30',   // Mirage gradient start
        mirageLight:  '#35577D',   // Mirage gradient end / luminous oceanic navy
        mirageMuted:  '#557392',   // Blue slate accent (#05 Blue Slate)

        // ── Borders ─────────────────────────────────────────────────────────
        line:         'rgba(53, 87, 125, 0.28)', // subtle Navy Mirage hairline
        lineStrong:   '#34506D',                 // explicit dividers (#04 Storm Blue)

        // ── Text tiers (Arctic & Cloud Blue ladder) ─────────────────────────
        paper:        '#F2F6FB',   // Primary text — Arctic Haze (#10)
        textSecondary:'#C4D2E1',   // Body & secondary — Cloud Blue (#08)
        textMuted:    '#7A8CA6',   // Captions & timestamps — Dusk Blue (#06)

        // ── Module accents ──────────────────────────────────────────────────
        focus:    '#00C9C8',   // electric cyan  — Focus module
        move:     '#F08C3A',   // warm ember     — Fitness module
        plan:     '#818CF8',   // soft indigo    — Tasks/Study module
        reflect:  '#B784C4',   // soft violet    — Analytics/AI

        // ── Semantic states ─────────────────────────────────────────────────
        good:   '#5FAE7A',
        warn:   '#E0A63C',
        danger: '#D9705A',

        // ── Legacy alias (keep for compatibility) ───────────────────────────
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
        'glow-focus':  '0 0 20px rgba(0, 201, 200, 0.25)',
        'glow-move':   '0 0 20px rgba(240, 140, 58,  0.25)',
        'glow-plan':   '0 0 20px rgba(129, 140, 248, 0.25)',
        'glow-mirage': '0 0 24px rgba(53, 87, 125, 0.40)',
        'cinematic':   '0 24px 80px rgba(10, 27, 46, 0.75)',
        'card-rim':    'inset 0 1px 0 rgba(196, 210, 225, 0.12), 0 8px 32px rgba(10, 27, 46, 0.55)',
      },
    },
  },
  plugins: [],
}