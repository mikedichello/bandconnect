import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0c0a14",
          soft: "#171327",
        },
        brand: {
          50: "#f3f1ff",
          100: "#e9e5ff",
          200: "#d6ceff",
          300: "#b7a6ff",
          400: "#9173ff",
          500: "#7c4dff",
          600: "#6d33f5",
          700: "#5d22d8",
          800: "#4d1eaf",
          900: "#401d8c",
        },
        accent: {
          DEFAULT: "#ff5da2",
          soft: "#ff8fc0",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px -12px rgba(124, 77, 255, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
