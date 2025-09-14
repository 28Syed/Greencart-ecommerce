/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#80B82D',
        'primary-dull': '#6A9A25',
      },
    },
  },
  plugins: [],
}
