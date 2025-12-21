/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'paper': '#f5f5f0',
        'ink': '#1c1917',
        'brand': {
          50: '#ecfdf5',
          100: '#d1fae5',
          800: '#065f46',
          900: '#064e3b',
        }
      },
      fontFamily: {
        serif: ['"Merriweather"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
