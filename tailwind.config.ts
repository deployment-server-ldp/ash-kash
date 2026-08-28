import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        noir: "#171410",
        ivory: "#faf8f4",
        stone: "#efe8db",
        clay: {
          50: "#faf5ec",
          100: "#f3e8d3",
          200: "#e6cea3",
          300: "#d7b071",
          400: "#c6934c",
          500: "#a97a3b",
          600: "#8a6130",
          700: "#6b4a26",
          800: "#4c351d",
          900: "#2f2113",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        wide2: "0.15em",
        wide3: "0.25em",
      },
      maxWidth: {
        "8xl": "90rem",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
