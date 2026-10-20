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
        palette: {
          cream: '#F5F5DC',
          gold: '#FBC02D',
          orange: '#FF8F00',
          crimson: '#C62828',
        },
        brand: {
          50: '#FAF8F0',
          100: '#F5F5DC', // User palette: Warm Cream
          200: '#FEE79A',
          300: '#FDD835',
          400: '#FBC02D', // User palette: Golden Amber
          500: '#FFA000',
          600: '#FF8F00', // User palette: Sunset Orange
          700: '#E65100',
          800: '#C62828', // User palette: Crimson Red
          900: '#8A1515',
          950: '#450808',
        },
        risk: {
          low: '#10B981',       // Emerald
          medium: '#FBC02D',    // User palette: Golden Amber
          high: '#FF8F00',      // User palette: Sunset Orange
          critical: '#C62828',  // User palette: Crimson Red
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      }
    },
  },
  plugins: [],
}
