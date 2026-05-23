import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "purple-deep": "#0d0618",
        "purple-rich": "#1a0a2e",
        "purple-mid": "#2d1b69",
        "violet-mid": "#4a2c8f",
        "violet-light": "#6b46c1",
        "lavender-glow": "#9b72cf",
        "lavender-soft": "#c4b5fd",
        "gold-soft": "#d4af37",
        "gold-light": "#f5e09a",
        "gold-dim": "#a07c20",
        "cream-page": "#faf3e0",
        "cream-dark": "#e8d5b0",
        "cream-mid": "#f0e6c8",
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        cursive: ["Dancing Script", "cursive"],
        mono: ["EB Garamond", "serif"],
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 10s ease-in-out infinite",
        "float-slower": "float 14s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite alternate",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        shake: "shake 0.5s ease-in-out",
        "spin-slow": "spin 20s linear infinite",
        "fade-in": "fadeIn 1s ease forwards",
        "slide-up": "slideUp 0.8s ease forwards",
        "page-turn": "pageTurn 0.6s ease-in-out",
        breathe: "breathe 4s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 20px #9b72cf55" },
          "100%": { boxShadow: "0 0 60px #9b72cfaa, 0 0 100px #6b46c155" },
        },
        pulseGold: {
          "0%, 100%": { opacity: "0.7" },
          "50%": { opacity: "1" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-8px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(8px)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pageTurn: {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(-180deg)" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.03)" },
        },
      },
      backgroundImage: {
        "purple-gradient":
          "linear-gradient(135deg, #0d0618 0%, #1a0a2e 50%, #2d1b69 100%)",
        "gold-gradient":
          "linear-gradient(135deg, #a07c20 0%, #d4af37 50%, #f5e09a 100%)",
        "page-texture":
          "linear-gradient(135deg, #faf3e0 0%, #f0e6c8 50%, #e8d5b0 100%)",
      },
      boxShadow: {
        "glow-purple": "0 0 30px #9b72cf55, 0 0 60px #4a2c8f33",
        "glow-gold": "0 0 20px #d4af3755, 0 0 40px #d4af3733",
        "book-shadow":
          "0 25px 60px rgba(0,0,0,0.8), -5px 0 20px rgba(0,0,0,0.6)",
        "page-shadow": "inset -5px 0 15px rgba(0,0,0,0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
