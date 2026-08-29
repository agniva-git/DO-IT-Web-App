/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // DO-IT palette — kept out of the default Tailwind slate/blue defaults
        // on purpose so the app doesn't read as a generic dashboard template.
        ink: '#0F172A',       // near-black background, calmer than pure black
        surface: '#16202E',   // card/panel background
        surfaceRaised: '#1F2B3A',
        line: '#2A3949',      // borders/dividers
        paper: '#F5F3EE',     // warm off-white for light surfaces
        focus: '#4F8A8B',     // muted teal — Focus module accent
        move: '#D98E4A',      // warm amber — Fitness module accent
        plan: '#7C8CF8',      // soft indigo — Tasks/Study module accent
        reflect: '#B784C4',   // soft violet — Analytics/AI accent
        good: '#5FAE7A',
        warn: '#E0A63C',
        danger: '#D9705A'
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace']
      },
      borderRadius: {
        card: '14px'
      }
    }
  },
  plugins: []
}