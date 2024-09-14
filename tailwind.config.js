module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'fade-in-scale': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-fast': {
          '50%': { opacity: '.5' },
        },
      },
      animation: {
        'fade-in-scale': 'fade-in-scale 0.3s ease-out',
        'pulse-fast': 'pulse-fast 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [require("daisyui")],
};