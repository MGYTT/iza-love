import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Cormorant Garamond'", "Georgia", "serif"],
        body:    ["'DM Sans'", "system-ui", "sans-serif"],
      },
      colors: {
        love: {
          bg:       "#100508",
          surface:  "#1e0b12",
          card:     "#2a1019",
          border:   "rgba(240,160,184,0.12)",
          blush:    "#f0a0b8",
          petal:    "#f7cdd8",
          gold:     "#d4a853",
          muted:    "#9a6070",
          faint:    "rgba(240,160,184,0.25)",
        },
      },
      backgroundImage: {
        "rose-radial":  "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(212,168,83,0.15), transparent)",
        "hero-glow":    "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(240,100,140,0.08), transparent)",
        "card-shimmer": "linear-gradient(105deg, transparent 40%, rgba(240,160,184,0.06) 50%, transparent 60%)",
      },
      boxShadow: {
        "love-sm":  "0 2px 8px rgba(240,100,140,0.08), 0 1px 2px rgba(0,0,0,0.4)",
        "love-md":  "0 8px 32px rgba(240,100,140,0.12), 0 2px 8px rgba(0,0,0,0.5)",
        "love-lg":  "0 20px 60px rgba(240,100,140,0.16), 0 4px 16px rgba(0,0,0,0.6)",
        "gold-glow":"0 0 30px rgba(212,168,83,0.35), 0 0 60px rgba(212,168,83,0.15)",
      },
      animation: {
        "float":       "float 5s ease-in-out infinite",
        "pulse-soft":  "pulseSoft 3s ease-in-out infinite",
        "shimmer":     "shimmer 3s linear infinite",
        "spin-slow":   "spin 20s linear infinite",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%":     { transform: "translateY(-10px)" },
        },
        pulseSoft: {
          "0%,100%": { opacity: "0.5" },
          "50%":     { opacity: "1" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;