import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"] ,
  theme: {
    extend: {
      colors: {
        surface: "#f7f8fa",
        panel: "#ffffff",
        ink: "#0b1c2c",
        muted: "#6b7280",
        primary: {
          DEFAULT: "#0f6cbd",
          50: "#e6f2fb",
          100: "#cfe5f8",
          600: "#0f6cbd",
          700: "#0a4f8c"
        },
        accent: "#106ebe",
        warning: "#c57c00",
        danger: "#b42318",
        success: "#0f7b6c"
      },
      boxShadow: {
        blade: "0 10px 30px rgba(15, 23, 42, 0.12)",
        card: "0 1px 2px rgba(16, 24, 40, 0.06), 0 1px 3px rgba(16, 24, 40, 0.1)"
      }
    }
  },
  plugins: []
};

export default config;
