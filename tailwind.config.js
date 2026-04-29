/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        isla: {
          blue: '#0a65b7',
          navy: '#053b70',
          green: '#2f7d4f',
          gold: '#c9952f',
          ink: '#122033',
        },
      },
      boxShadow: {
        isla: '0 24px 70px rgba(12, 48, 78, 0.16)',
      },
      borderRadius: {
        isla: '8px',
      },
      keyframes: {
        'float-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-scale': {
          '0%': { opacity: '0', transform: 'scale(.96) translateY(12px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
      animation: {
        'float-soft': 'float-soft 5s ease-in-out infinite',
        'fade-scale': 'fade-scale .45s cubic-bezier(.2,.8,.2,1) both',
      },
    },
  },
  plugins: [],
};
