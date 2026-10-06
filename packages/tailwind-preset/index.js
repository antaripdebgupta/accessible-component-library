const tokens = require("./tokens");

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: tokens.colors,
      spacing: tokens.spacing,
      borderRadius: tokens.borderRadius,
      fontSize: tokens.fontSize,
      transitionDuration: tokens.transitionDuration,
      transitionTimingFunction: tokens.transitionTimingFunction,
      ringWidth: tokens.ringWidth,
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "scale-in": {
          from: { transform: "scale(0)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s ease-in-out infinite",
        "scale-in": "scale-in 200ms ease-out",
      },
    },
  },
  plugins: [
    require("./plugins/forced-colors")(),
  ],
};