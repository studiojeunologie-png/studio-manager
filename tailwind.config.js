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
          50: '#F0EFFF',
          100: '#E0DEFF',
          200: '#C2BDFF',
          300: '#A39CFF',
          400: '#857BFF',
          500: '#6C63FF',
          600: '#5A52D9',
          700: '#4840B3',
          800: '#362F8C',
          900: '#1A1A2E',
        },
        accent: {
          green: '#00D4AA',
          red: '#FF6B6B',
          orange: '#FF9F43',
          blue: '#54A0FF',
        },
        surface: {
          50: '#FAFAFA',
          100: '#F5F5F7',
          200: '#EBEBF0',
          300: '#D6D6E0',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 10px 25px rgba(108,99,255,0.08), 0 4px 10px rgba(0,0,0,0.04)',
        'sidebar': '4px 0 24px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
