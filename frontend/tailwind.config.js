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
        sage: {
          50: '#f4f7f5',
          100: '#e5ece7',
          200: '#cbd8cf',
          300: '#a6bead',
          400: '#7fa189',
          500: '#5f846a',
          600: '#4a6953',
          700: '#3c5443',
          800: '#324438',
          900: '#2a392f',
          950: '#151e18',
        },
        darkbg: {
          900: '#0f1512',
          800: '#16201b',
          700: '#1e2b24',
          600: '#283830',
        }
      }
    },
  },
  plugins: [],
}
