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
      },
      animation: {
        'fade-in-scale': 'fade-in-scale 0.3s ease-out',
      },
    },
  },
  plugins: [require("daisyui")],
};