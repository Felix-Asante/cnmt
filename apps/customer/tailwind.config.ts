import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

/**
 * The customer app is on Tailwind v3 (not v4 like the dashboard) so it works
 * on older phones: iOS 14–16.3 (e.g. iPhone X) and Android Chrome < 111.
 * Tailwind v4 relies on @layer, @property and color-mix(), which those
 * browsers don't support.
 *
 * Colours are plain hex here so opacity modifiers (`bg-navy/40`) compile to
 * rgb(… / 0.4) instead of color-mix(). Values mirror
 * packages/tailwind-config/shared-styles.css — keep them in sync.
 */
const palette = {
  brand: "#d01018",
  "brand-hover": "#b00e15",
  "brand-pressed": "#8f0b12",
  "brand-soft": "#fde8e9",
  "brand-muted": "#f7c5c7",

  navy: "#0a1a2f",
  "navy-hover": "#13263f",
  "navy-soft": "#e8edf4",
  "navy-muted": "#3d4f66",

  gold: "#e8a317",
  "gold-soft": "#fdf3dd",

  background: "#ffffff",
  surface: "#f7f8fa",
  "surface-elevated": "#ffffff",
  foreground: "#0a1a2f",
  muted: "#5a6577",
  subtle: "#8b95a5",
  border: "#e2e5ea",
  "border-strong": "#c5ccd6",
  ring: "#d01018",
  success: "#0f7a4a",
  "success-soft": "#ecf8f1",
  warning: "#c47a00",
  danger: "#d01018",
} as const;

const radius = {
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  "2xl": "1.25rem",
  pill: "9999px",
} as const;

const shadow = {
  sm: "0 1px 2px rgb(10 26 47 / 0.05)",
  md: "0 4px 16px rgb(10 26 47 / 0.08)",
  lg: "0 12px 40px rgb(10 26 47 / 0.12)",
} as const;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    // v4 supports bare `data-disabled:` / `aria-invalid:` variants; v3 needs
    // them declared. These are the ones the Radix-based @repo/ui uses.
    data: {
      disabled: "disabled",
      highlighted: "highlighted",
      placeholder: "placeholder",
    },
    extend: {
      aria: {
        invalid: 'invalid="true"',
      },
      colors: palette,
      // v4 default: borders and rings use the current colour, not blue/gray.
      borderColor: { DEFAULT: palette.border },
      ringColor: { DEFAULT: "currentColor" },
      // v4 accepts any number; v3 only knows the steps in its scale.
      opacity: { 3: "0.03", 8: "0.08" },
      // Shared width for page content, header and footer.
      maxWidth: { page: "83rem" },
      zIndex: { 100: "100" },
      borderRadius: radius,
      boxShadow: shadow,
      fontFamily: {
        display: [
          "var(--font-display-family)",
          '"Barlow Condensed"',
          "sans-serif",
        ],
        sans: ["var(--font-sans-family)", '"Schibsted Grotesk"', "sans-serif"],
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [
    // Expose the same tokens as CSS variables for hand-written CSS.
    plugin(({ addBase }) => {
      addBase({
        ":root": {
          ...Object.fromEntries(
            Object.entries(palette).map(([k, v]) => [`--${k}`, v]),
          ),
          ...Object.fromEntries(
            Object.entries(radius).map(([k, v]) => [`--radius-${k}`, v]),
          ),
          ...Object.fromEntries(
            Object.entries(shadow).map(([k, v]) => [`--shadow-${k}`, v]),
          ),
          "--ease-out": "cubic-bezier(0.22, 1, 0.36, 1)",
          "--duration-fast": "150ms",
          "--duration-normal": "250ms",
        },
      });
    }),
  ],
};

export default config;
