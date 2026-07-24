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
    },
  },
  plugins: [
    // Ensures utilities like `outline`, `ring` respect forced-colors mode
    // rather than being silently stripped — see BUILD_GUIDE §14.
    require("./plugins/forced-colors")(),
  ],
};