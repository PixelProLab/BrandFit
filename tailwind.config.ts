import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./store/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "brand-bg": "#000000",
        "brand-surface": "#0D0D0D",
        "brand-purple": "#8A4C98",
        "brand-pink": "#DE558F",
        "brand-orange": "#F4A84D",
        "brand-text-main": "#FFFFFF",
        "brand-text-muted": "#A1A1AA",
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "Arial", "Helvetica", "sans-serif"],
      },
      boxShadow: {
        "brand-purple": "0 0 44px rgba(138, 76, 152, 0.22)",
        "brand-pink": "0 0 36px rgba(222, 85, 143, 0.18)",
      },
    },
  },
};

export default config;
