/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#0E0E0D",
        surface: {
          DEFAULT: "#161614",
          border: "#262522",
          hover: "#1D1C19",
        },
        well: {
          DEFAULT: "#0A0A09",
          border: "#1F1E1B",
        },
        ink: {
          primary: "#F2F0EA",
          secondary: "#8A8780",
          muted: "#5A5852",
        },
        amber: {
          braun: "#E59838",
          glow: "rgba(229, 152, 56, 0.15)",
        },
        rust: {
          DEFAULT: "#D65A47",
          glow: "rgba(214, 90, 71, 0.15)",
        },
        oscilloscope: {
          DEFAULT: "#4E9A6F",
          glow: "rgba(78, 154, 111, 0.15)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        pulseBorder: {
          "0%, 100%": { borderColor: "#262522" },
          "50%": { borderColor: "#E59838" },
        },
      },
      animation: {
        "pulse-amber": "pulseBorder 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
