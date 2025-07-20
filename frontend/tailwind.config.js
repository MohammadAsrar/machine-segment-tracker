/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        uptime: '#10b981', // green-500
        idle: '#fbbf24', // yellow-400
        downtime: '#ef4444', // red-500
      },
    },
  },
  plugins: [],
};
