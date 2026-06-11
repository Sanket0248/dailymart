/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1a9e5c',
          50: '#f0fdf6',
          100: '#dcfce9',
          200: '#bbf7d4',
          300: '#86efac',
          400: '#4ade80',
          500: '#1a9e5c',
          600: '#16834c',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        accent: {
          DEFAULT: '#f97316',
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea6c0e',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        surface: {
          page: '#f8fafc',
          card: '#ffffff',
        },
        text: {
          heading: '#1e293b',
          sub: '#64748b',
          muted: '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        btn: '10px',
        pill: '999px',
        xl: '20px',
        '2xl': '24px',
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(0,0,0,0.05), 0 0 3px rgba(0,0,0,0.02)',
        'card-hover': '0 12px 24px -4px rgba(0,0,0,0.08), 0 4px 8px -2px rgba(0,0,0,0.04)',
        nav: '0 -4px 24px -4px rgba(0,0,0,0.06)',
        top: '0 4px 24px -4px rgba(0,0,0,0.04)',
        soft: '0 8px 30px rgba(0,0,0,0.04)',
        glow: '0 0 20px rgba(26,158,92,0.2)',
      },
      screens: {
        xs: '375px',
        sm: '430px',
      },
    },
  },
  plugins: [],
}
