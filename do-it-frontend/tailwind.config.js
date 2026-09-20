/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ── Canvas tiers (3-level depth) ──────────────────────────────────
        ink:          '#070D18',   // void base — deepest midnight
        surface:      '#0E1A2D',   // card / panel surface
        surfaceRaised:'#14243D',   // floating elements (dropdowns, tooltips)
        surfaceHigh:  '#1A2E4A',   // modal sheet — highest elevation

        // ── Borders ───────────────────────────────────────────────────────
        line:         '#1E2D40',   // default hairline (use border-white/[0.07] via CSS where glass effect needed)
        lineStrong:   '#2A3949',   // explicit dividers

        // ── Text tiers ────────────────────────────────────────────────────
        paper:        '#F8FAFC',   // primary text — soft pearl (was #F5F3EE)
        textSecondary:'#94A3B8',   // body / secondary
        textMuted:    '#64748B',   // captions, timestamps

        // ── Module accents ────────────────────────────────────────────────
        focus:    '#00C9C8',   // electric cyan  — Focus module
        move:     '#F08C3A',   // warm ember     — Fitness module
        plan:     '#818CF8',   // soft indigo    — Tasks/Study module
        reflect:  '#B784C4',   // soft violet    — Analytics/AI

        // ── Semantic states ───────────────────────────────────────────────
        good:   '#5FAE7A',
        warn:   '#E0A63C',
        danger: '#D9705A',

        // ── Legacy alias (keep for compatibility) ─────────────────────────
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
        'glow-focus': '0 0 20px rgba(0, 201, 200, 0.25)',
        'glow-move':  '0 0 20px rgba(240, 140, 58,  0.25)',
        'glow-plan':  '0 0 20px rgba(129, 140, 248, 0.25)',
        'cinematic':  '0 24px 80px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
}