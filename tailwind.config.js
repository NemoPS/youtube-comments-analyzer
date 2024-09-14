module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6",    // Bright blue
        secondary: "#6B7280",  // Cool gray
        accent: "#10B981",     // Emerald green
        neutral: "#1F2937",    // Dark blue-gray
        "base-100": "#111827", // Very dark blue-gray (background)
        "base-200": "#1E293B", // Slightly lighter dark blue-gray
        "base-300": "#374151", // Even lighter dark blue-gray
      },
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
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#3B82F6",
          "secondary": "#6B7280",
          "accent": "#10B981",
          "neutral": "#1F2937",
          "base-100": "#111827",
          "base-200": "#1E293B",
          "base-300": "#374151",
          "info": "#3ABFF8",
          "success": "#36D399",
          "warning": "#FBBD23",
          "error": "#F87272",
        },
      },
    ],
  },
};