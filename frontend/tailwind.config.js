/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 温暖的米色/棕色系配色，避免AI味儿的蓝紫渐变
        cream: {
          50: '#FEFDFB',
          100: '#FDF9F3',
          200: '#FAF3E8',
          300: '#F5E6D3',
          400: '#E8D4BC',
          500: '#D4B896',
        },
        warm: {
          50: '#FAF7F5',
          100: '#F5EDE8',
          200: '#E8D9CE',
          300: '#D4BBA8',
          400: '#B8967A',
          500: '#96745A',
          600: '#7A5C48',
          700: '#5E4636',
          800: '#423024',
          900: '#2A1E17',
        },
        sage: {
          50: '#F6F7F4',
          100: '#E8EBE3',
          200: '#D1D7C7',
          300: '#B5BFA5',
          400: '#96A37F',
          500: '#7A8A63',
        },
        terracotta: {
          50: '#FBF5F3',
          100: '#F5E8E3',
          200: '#E8CFC5',
          300: '#D4AA96',
          400: '#C08B73',
          500: '#A66B50',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Noto Serif SC', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'warm': '0 4px 20px -2px rgba(150, 116, 90, 0.15)',
      }
    },
  },
  plugins: [],
}
