const plugin = require("tailwindcss/plugin");

module.exports = () =>
    plugin(({ addUtilities }) => {
        addUtilities({
            ".focus-ring-safe": {
                outline: "2px solid transparent",
                outlineOffset: "2px",
                "&:focus-visible": {
                    outline: "2px solid theme('colors.focus-ring')",
                    outlineOffset: "2px",
                },
                "@media (forced-colors: active)": {
                    "&:focus-visible": {
                        outline: "2px solid Highlight",
                    },
                },
            },
        });
    });