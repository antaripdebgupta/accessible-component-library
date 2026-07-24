// Semantic tokens — never reference raw hex in components, only these names.
// Values chosen to meet WCAG contrast targets against `surface`/`surface-inverse`.
module.exports = {
  colors: {
    // Surfaces
    surface: "#ffffff",
    "surface-raised": "#f8fafc",
    "surface-inverse": "#0f172a",

    // Text — verified 4.5:1+ against `surface`
    "text-primary": "#0f172a",   // ~16.1:1 on white
    "text-secondary": "#475569", // ~7.5:1 on white
    "text-disabled": "#94a3b8",  // decorative only — never sole conveyor of meaning
    "text-inverse": "#f8fafc",

    // Interactive / brand
    "accent-default": "#4f46e5",  // ~6.3:1 on white — safe for text + large UI
    "accent-hover": "#4338ca",
    "accent-active": "#3730a3",
    "accent-subtle": "#eef2ff",

    // Status — always paired with icon/text, never color alone
    "danger-default": "#dc2626",
    "danger-subtle": "#fef2f2",
    "success-default": "#16a34a",
    "success-subtle": "#f0fdf4",
    "warning-default": "#ca8a04",
    "warning-subtle": "#fefce8",

    // Borders / focus
    border: "#e2e8f0",
    "border-strong": "#cbd5e1",
    "focus-ring": "#4f46e5",
  },

  spacing: {
    "control-sm": "0.5rem",
    "control-md": "0.75rem",
    "control-lg": "1rem",
  },

  borderRadius: {
    control: "0.375rem",
    popover: "0.5rem",
  },

  fontSize: {
    xs: ["0.75rem", { lineHeight: "1rem" }],
    sm: ["0.875rem", { lineHeight: "1.25rem" }],
    base: ["1rem", { lineHeight: "1.5rem" }],
    lg: ["1.125rem", { lineHeight: "1.75rem" }],
  },

  // Motion tokens — always consumed via motion-safe:/motion-reduce: variants
  transitionDuration: {
    fast: "120ms",
    base: "200ms",
    slow: "320ms",
  },
  transitionTimingFunction: {
    "out-soft": "cubic-bezier(0.16, 1, 0.3, 1)",
  },

  // Focus ring width — used consistently so forced-colors mode overrides cleanly
  ringWidth: {
    focus: "2px",
  },
};
