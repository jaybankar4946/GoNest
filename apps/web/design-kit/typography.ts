export const typography = {
  fontFamily: {
    sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },

  sizes: {
    display: "64px",
    h1: "48px",
    h2: "40px",
    h3: "32px",
    h4: "24px",
    bodyLarge: "20px",
    body: "16px",
    small: "14px",
    caption: "12px",
  },

  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: "1.1",
    normal: "1.5",
    relaxed: "1.7",
  },
} as const;
