import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./App.tsx",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./contexts/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./services/**/*.{ts,tsx}",
    "./types/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        primary: "#2F80ED",
        secondary: "#27AE60",
        accent: "#F2C94C",
        neutral: "#2D3748",
        "base-100": "#F9FAFB",
        "base-200": "#E2E8F0",
        "base-300": "#CBD5E1",
        info: "#2F80ED",
        success: "#27AE60",
        warning: "#F2C94C",
        error: "#E63946",
        "text-primary": "#2D3748",
        "text-secondary": "#718096",
      },
    },
  },
  plugins: [],
};

export default config;
