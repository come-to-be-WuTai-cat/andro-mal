/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#F4F6F9",
        surface: "#FFFFFF",
        "surface-2": "#F8FAFC",
        border: "#E2E8F0",
        "border-strong": "#CBD5E1",
        text: "#0F172A",
        muted: "#64748B",
        accent: "#2563EB",
        danger: {
          DEFAULT: "#DC2626",
          tint: "#FFF1F2",
          border: "#FECDD3",
        },
        warning: {
          DEFAULT: "#D97706",
          tint: "#FFFBEB",
          border: "#FDE68A",
        },
        safe: {
          DEFAULT: "#059669",
          tint: "#ECFDF5",
          border: "#A7F3D0",
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        button: "8px",
        card: "12px",
        badge: "999px",
      },
    },
  },
  plugins: [],
}
