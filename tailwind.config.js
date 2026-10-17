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
        obsidian: {
          DEFAULT: "#0B0F17",
          panel: "#111827",
          border: "#1F2937",
          hover: "#1E293B",
          recessed: "#070A10",
        },
        ledger: {
          emerald: "#10B981",
          emeraldGlow: "rgba(16, 185, 129, 0.15)",
          blue: "#3B82F6",
          blueGlow: "rgba(59, 130, 246, 0.15)",
          amber: "#F59E0B",
          amberGlow: "rgba(245, 158, 11, 0.15)",
          rose: "#EF4444",
        },
        ink: {
          primary: "#F9FAFB",
          secondary: "#9CA3AF",
          muted: "#6B7280",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
