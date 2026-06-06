/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5', // Indigo 600
        primaryHover: '#4338ca', // Indigo 700
        background: {
          light: '#f8fafc', // slate 50
          dark: '#0a0a0a',  // neutral 950
        },
        surface: {
          light: '#ffffff', // white
          dark: '#171717',  // neutral 900
        },
        border: {
          light: '#e2e8f0', // slate 200
          dark: '#262626',  // neutral 800
        },
        text: {
          primaryLight: '#0f172a', // slate 900
          secondaryLight: '#64748b', // slate 500
          primaryDark: '#f8fafc', // slate 50
          secondaryDark: '#94a3b8', // slate 400
        },
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      blur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
