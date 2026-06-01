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
        background: {
          dark: '#0D0F14',
          light: '#F8FAFC',
        },
        surface: {
          dark: '#161A22',
          light: '#FFFFFF',
          dark2: '#1E2330',
          light2: '#F1F5F9',
        },
        border: {
          dark: '#2A3144',
          light: '#E2E8F0',
        },
        primary: '#6C63FF',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
        text: {
          primaryDark: '#F1F5F9',
          secondaryDark: '#8B98B8',
          mutedDark: '#4B5568',
          primaryLight: '#0F172A',
          secondaryLight: '#475569',
          mutedLight: '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      blur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
