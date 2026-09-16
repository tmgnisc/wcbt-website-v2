/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        maroon: '#8B1A2B',
        'maroon-dark': '#5e101c',
        cream: '#f5f0e6',
      },
    },
  },
  plugins: [],
};
