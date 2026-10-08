const tokens = require("../tokens");

function luminance(hex) {
    const [r, g, b] = hex.match(/\w\w/g).map((c) => {
        const v = parseInt(c, 16) / 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(hex1, hex2) {
    const l1 = luminance(hex1), l2 = luminance(hex2);
    const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];
    return (lighter + 0.05) / (darker + 0.05);
}

const pairs = [
    ["text-primary", "surface", 4.5],
    ["text-secondary", "surface", 4.5],
    ["text-primary", "surface-raised", 4.5],
    ["text-secondary", "surface-raised", 4.5],
    ["text-primary", "canvas", 4.5],
    ["text-secondary", "canvas", 4.5],
    ["accent-default", "surface", 4.5],
    ["text-inverse", "accent-default", 4.5],
    ["text-inverse", "surface-inverse", 4.5],
    ["text-inverse", "danger-default", 4.5],
    ["text-inverse", "danger-hover", 4.5],
    ["text-inverse", "danger-active", 4.5],
    ["text-inverse-dark", "danger-hover-dark", 4.5],
    ["text-inverse-dark", "danger-active-dark", 4.5],
    ["danger-default", "surface", 4.5],
    ["success-default", "surface", 4.5],
    ["warning-default", "surface", 4.5],
    ["info-default", "surface", 4.5],
    ["danger-default", "danger-subtle", 4.5],
    ["success-default", "success-subtle", 4.5],
    ["warning-default", "warning-subtle", 4.5],
    ["info-default", "info-subtle", 4.5],
    ["border-control", "surface", 3],
    ["border-control", "canvas", 3],
    ["focus-ring", "surface", 3],
];

let failed = false;
for (const [fg, bg, min] of pairs) {
    const ratio = contrast(tokens.colors[fg], tokens.colors[bg]);
    const pass = ratio >= min;
    if (!pass) failed = true;
    console.log(`${pass ? "Yes" : "No"} ${fg} on ${bg}: ${ratio.toFixed(2)}:1 (needs ${min}:1)`);
}
process.exit(failed ? 1 : 0);