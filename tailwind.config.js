/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        duo: {
          green: '#58cc02',
          'green-dark': '#58a700',
          blue: '#1cb0f6',
          'blue-dark': '#1899d6',
          red: '#ff4b4b',
          'red-dark': '#ea2b2b',
          yellow: '#ffc800',
          'yellow-dark': '#e5a500',
          purple: '#ce82ff',
          'purple-dark': '#a559d8',
          orange: '#ff9600',
          'orange-dark': '#e07900',
        },
      },
      fontFamily: {
        feather: ['DIN Round Pro', 'Nunito', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        '3d-green': '0 4px 0 #58a700',
        '3d-blue': '0 4px 0 #1899d6',
        '3d-purple': '0 4px 0 #a559d8',
        '3d-yellow': '0 4px 0 #e5a500',
        '3d-red': '0 4px 0 #ea2b2b',
        '3d-gray': '0 4px 0 #e5e7eb',
      },
    },
  },
  plugins: [],
}
