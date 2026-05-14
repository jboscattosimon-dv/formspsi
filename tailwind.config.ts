import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50:  "#FDF7EE",
          100: "#F9F0E2",
          200: "#F3E2CC",
          300: "#EAD4B4",
        },
        beige: {
          100: "#EFE0CA",
          200: "#E8D5B8",
          300: "#D9C4A2",
          400: "#C9B08C",
        },
        rose: {
          warm: "#C4897A",
          deep: "#A96B5C",
          light: "#D9A89B",
          muted: "#E8C4BB",
        },
        coffee: {
          100: "#A07060",
          200: "#8B5E4E",
          300: "#6B4C3B",
          400: "#4A3328",
          500: "#2E1F18",
        },
        stone: {
          warm: "#9B9088",
          muted: "#B5ABA3",
          light: "#CEC8C2",
        },
        dark: {
          bg:      "#1A1614",
          surface: "#231C1A",
          card:    "#2C2320",
          border:  "#3D302C",
        },
      },
      fontFamily: {
        serif:  ["var(--font-playfair)", "Georgia", "serif"],
        sans:   ["var(--font-inter)", "system-ui", "sans-serif"],
        italic: ["var(--font-playfair)", "Georgia", "serif"],
      },
      animation: {
        "fade-in":      "fadeIn 0.8s ease-out forwards",
        "fade-up":      "fadeUp 0.6s ease-out forwards",
        "float":        "float 6s ease-in-out infinite",
        "breathe":      "breathe 4s ease-in-out infinite",
        "grain":        "grain 0.5s steps(1) infinite",
        "shimmer":      "shimmer 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        breathe: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%":      { opacity: "0.7", transform: "scale(1.05)" },
        },
        grain: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%":      { transform: "translate(-1%, -1%)" },
          "20%":      { transform: "translate(1%, 1%)" },
          "30%":      { transform: "translate(-2%, 1%)" },
          "40%":      { transform: "translate(2%, -1%)" },
          "50%":      { transform: "translate(-1%, 2%)" },
          "60%":      { transform: "translate(1%, -2%)" },
          "70%":      { transform: "translate(-2%, -1%)" },
          "80%":      { transform: "translate(2%, 1%)" },
          "90%":      { transform: "translate(-1%, 1%)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        "soft":   "0 2px 20px rgba(107, 76, 59, 0.06)",
        "warm":   "0 4px 30px rgba(196, 137, 122, 0.12)",
        "glass":  "0 8px 32px rgba(107, 76, 59, 0.08)",
        "lifted": "0 12px 40px rgba(107, 76, 59, 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
