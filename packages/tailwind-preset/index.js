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
          "100%": { translate: "100% 0" },
        },
        rise: {
          from: { opacity: "0", translate: "0 4px" },
        },
        "fade-in": {
          from: { opacity: "0" },
        },
        "scale-in": {
          from: { opacity: "0", scale: "0.6" },
        },
        "pop-in": {
          from: { opacity: "0", scale: "0.97" },
        },
        "drop-in": {
          from: { opacity: "0", scale: "1 0.9" },
        },
        "expand-in": {
          from: { opacity: "0", "grid-template-rows": "0fr" },
        },
        "fade-scale-in": {
          from: { opacity: "0", scale: "0.97" },
        },
        "tip-in": {
          from: { opacity: "0", scale: "0.9" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s ease-in-out infinite",
        rise: "rise 200ms cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in": "fade-in 200ms cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scale-in 200ms cubic-bezier(0.16, 1, 0.3, 1)",
        "pop-in": "pop-in 200ms cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-scale-in": "fade-scale-in 120ms cubic-bezier(0.16, 1, 0.3, 1)",
        "tip-in": "tip-in 120ms cubic-bezier(0.16, 1, 0.3, 1)",
        "drop-in": "drop-in 200ms cubic-bezier(0.16, 1, 0.3, 1)",
        "expand-in": "expand-in 200ms cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [
    require("./plugins/forced-colors")(),
  ],
};