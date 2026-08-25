/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        water: { 50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171', 500: '#dc2626', 600: '#b91c1c', 700: '#991b1b', 800: '#7f1d1d', 900: '#5c1414' },
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
