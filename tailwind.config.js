/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.tsx",
    "./components/**/*.tsx",
    "./hooks/**/*.ts",
    "./styles/**/*.css",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Custom dark theme colors matching the app design
        slate: {
          850: '#1a2332',
          950: '#0d1520',
        },
      },
      animation: {
        'pulse-slow': 'pulse 10s ease-in-out infinite',
        'pulse-slower': 'pulse 12s ease-in-out infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
