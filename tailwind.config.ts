import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        'loading-bar': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(400%)' },
        },
      },
      animation: {
        'loading-bar': 'loading-bar 1.5s infinite',
      },
    },
  },
  plugins: [
    require('daisyui')
  ],
  safelist: [
    'page-transition-enter',
    'page-transition-enter-active',
    'page-transition-exit',
    'page-transition-exit-active',
  ],
} satisfies Config;
