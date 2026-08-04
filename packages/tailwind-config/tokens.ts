export const fonts = {
  display: {
    family: "Barlow Condensed",
    cssVariable: "--font-display-family",
    role: "Brand wordmarks, condensed headlines, CTA labels",
  },
  sans: {
    family: "Schibsted Grotesk",
    cssVariable: "--font-sans-family",
    role: "Body copy, forms, navigation, UI chrome",
  },
} as const;

export const colors = {
  brand: "#d01018",
  navy: "#0a1a2f",
  gold: "#e8a317",
  background: "#ffffff",
  surface: "#f5f6f8",
  foreground: "#0a1a2f",
  muted: "#5a6577",
} as const;
