import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          50:  "var(--pink-50)",
          100: "var(--pink-100)",
          200: "var(--pink-200)",
          300: "var(--pink-300)",
          400: "var(--pink-400)",
          500: "var(--pink-500)",
          600: "var(--pink-600)",
          700: "var(--pink-700)",
          800: "var(--pink-800)",
          900: "var(--pink-900)",
        },
        neutral: {
          50:  "var(--neutral-50)",
          100: "var(--neutral-100)",
          200: "var(--neutral-200)",
          300: "var(--neutral-300)",
          400: "var(--neutral-400)",
          500: "var(--neutral-500)",
          600: "var(--neutral-600)",
          700: "var(--neutral-700)",
          800: "var(--neutral-800)",
          900: "var(--neutral-900)",
        },
        bg: {
          DEFAULT: "var(--bg)",
          alt:     "var(--bg-alt)",
          muted:   "var(--bg-muted)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          alt:     "var(--surface-alt)",
        },
        border: {
          DEFAULT: "var(--border)",
          strong:  "var(--border-strong)",
        },
        text: {
          DEFAULT: "var(--text)",
          muted:   "var(--text-muted)",
          subtle:  "var(--text-subtle)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover:   "var(--accent-hover)",
          soft:    "var(--accent-soft)",
        },
        success: "var(--success)",
        warning: "var(--warning)",
        error:   "var(--error)",
        info:    "var(--info)",
      },
      fontFamily: {
        sans: ["var(--font-figtree)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-fragment-mono)", "ui-monospace"],
      },
      borderRadius: {
        xs:   "4px",
        sm:   "6px",
        md:   "10px",
        lg:   "16px",
        xl:   "24px",
        full: "9999px",
      },
      boxShadow: {
        sm:   "var(--shadow-sm)",
        md:   "var(--shadow-md)",
        lg:   "var(--shadow-lg)",
        pink: "var(--shadow-pink)",
      },
      spacing: {
        1:  "4px",
        2:  "8px",
        3:  "12px",
        4:  "16px",
        5:  "20px",
        6:  "24px",
        8:  "32px",
        10: "40px",
        12: "48px",
        16: "64px",
        20: "80px",
        24: "96px",
        32: "128px",
      },
    },
  },
  plugins: [],
};

export default config;
