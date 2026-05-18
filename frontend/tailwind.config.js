/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        fire: {
          red: '#E63946',
          orange: '#F77F00',
          gold: '#FCBF49',
          yellow: '#FFD166',
        },
        dark: {
          obsidian: '#0D0D0D',
          charcoal: '#1A1A2E',
          slate: '#16213E',
          ash: '#2A2A3E',
        },
      },
      fontFamily: {
        heading: ['"Bebas Neue"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        accent: ['"Dancing Script"', 'cursive'],
      },
      animation: {
        glow: 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'fade-up': 'fadeUp 0.6s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #E63946, 0 0 10px #E6394666' },
          '100%': { boxShadow: '0 0 10px #F77F00, 0 0 20px #F77F0066' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
