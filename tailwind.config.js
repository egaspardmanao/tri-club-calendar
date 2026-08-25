/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        water: { 50: '#eef9ff', 100: '#d9f1ff', 200: '#b3e6ff', 300: '#6dd2ff', 400: '#36bdff', 500: '#0ca6f4', 600: '#0086d0', 700: '#016aa8', 800: '#065a8a', 900: '#0b4c71' },
        slate: { 850: '#1a2332' },
      },
      fontFamily: {
        display: ['Barlow Condensed', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
