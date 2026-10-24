/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0F1416",
        surface: "#171D20",
        "surface-raised": "#1E2629",
        line: "#2A3337",
        muted: "#8A9699",
        paper: "#E8EDEE",
        safe: "#4FBF8B",
        "safe-dim": "#1B2B24",
        suspicious: "#E8A33D",
        "suspicious-dim": "#2E2616",
        scam: "#E85C4A",
        "scam-dim": "#2E1A16",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
}
