/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        surface: 'rgba(24, 24, 27, 0.75)',
        accent: '#10b981',
      }
    },
  },
  plugins: [],
}