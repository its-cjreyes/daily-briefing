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
        canvas: '#0f0f0f',
        ink: '#f0ede6',
        muted: '#8a8680',
        dim: '#4a4744',
        accent: '#c9a96e',
        'accent-bright': '#e0c080',
        'surface': '#141414',
        'surface-2': '#1a1a1a',
        'border-subtle': 'rgba(201, 169, 110, 0.15)',
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-ibm-plex)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        'widest-plus': '0.12em',
      },
    },
  },
  plugins: [],
};

export default config;
