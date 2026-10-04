export const tokens = {
  colors: {
    background: "#FFFFFF",
    foreground: "#0F172A",

    primary: "#2563EB",
    primaryHover: "#1D4ED8",

    muted: "#64748B",
    mutedLight: "#F8FAFC",

    border: "#E2E8F0",

    success: "#16A34A",
    warning: "#D97706",
    danger: "#DC2626",
  },

  radius: {
    sm: "8px",
    md: "16px",
    lg: "24px",
    pill: "999px",
  },

  shadows: {
    card: "0 1px 2px rgba(15,23,42,0.06), 0 10px 30px rgba(15,23,42,0.08)",
    floating: "0 20px 50px rgba(15,23,42,0.12)",
    premium: "0 40px 80px rgba(15,23,42,0.14)",
  },

  spacing: {
    page: "32px",
    section: "96px",
    card: "24px",
  },

  motion: {
    fast: "150ms ease-out",
    normal: "250ms ease-out",
  },
} as const;
