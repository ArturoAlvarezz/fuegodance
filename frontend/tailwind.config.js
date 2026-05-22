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
          coral: '#FF4D6D',
        },
        dark: {
          obsidian: '#070707',
          charcoal: '#131018',
          slate: '#18111F',
          ash: '#2A2235',
        },
        silver: '#E8E8E8',
        muted: '#9A8FA8',
      },
      fontFamily: {
        heading: ['"Bebas Neue"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        accent: ['"Dancing Script"', 'cursive'],
      },
      animation: {
        glow: 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'fade-up': 'fadeUp 0.7s cubic-bezier(.16,1,.3,1) both',
        'spin-slow': 'spin 24s linear infinite',
        'gradient-x': 'gradientX 4s ease infinite',
        magma: 'magma 8s ease-in-out infinite alternate',
        orbit: 'orbit 12s ease-in-out infinite',
        blob: 'blob 9s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 8px #E63946, 0 0 18px #E6394666, inset 0 0 0 rgba(252,191,73,0)' },
          '100%': { boxShadow: '0 0 14px #F77F00, 0 0 34px #F77F0077, inset 0 0 18px rgba(252,191,73,.18)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px) scale(.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        magma: {
          '0%': { transform: 'translate3d(0,0,0) scale(1)' },
          '100%': { transform: 'translate3d(-40px,-30px,0) scale(1.18)' },
        },
        orbit: {
          '0%, 100%': { transform: 'translate3d(0,0,0) rotate(0deg)' },
          '50%': { transform: 'translate3d(50px,35px,0) rotate(12deg)' },
        },
        blob: {
          '0%, 100%': { borderRadius: '40% 60% 50% 50%', transform: 'rotate(0deg) scale(1)' },
          '33%': { borderRadius: '62% 38% 44% 56%', transform: 'rotate(35deg) scale(1.04)' },
          '66%': { borderRadius: '43% 57% 65% 35%', transform: 'rotate(-20deg) scale(.96)' },
        },
      },
    },
  },
  plugins: [],
}
