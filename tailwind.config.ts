import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#8a9490',
        ink: '#f0ede6',
        muted: 'rgba(240, 237, 230, 0.65)',
        dim: 'rgba(255, 255, 255, 0.35)',
        warm: '#E8DDD0',
        accent: '#C94F3A',
        'accent-hover': '#a83d2b',
        surface: '#7a8784',
        'surface-2': '#717e7a',
        'border-subtle': 'rgba(255, 255, 255, 0.15)',
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // No separate serif — everything is DM Sans
        serif: ['var(--font-dm-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        'label': '0.14em',
      },
    },
  },
  plugins: [],
};

export default config;
