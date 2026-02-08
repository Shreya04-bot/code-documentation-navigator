/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Space Grotesk'", "ui-sans-serif", "system-ui"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      colors: {
        primary: {
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7"
        },
        accent: {
          400: "#f472b6",
          500: "#ec4899"
        },
        surface: {
          900: "#0b1020",
          800: "#111729",
          700: "#1b2338"
        }
      },
      boxShadow: {
        glow: "0 0 30px rgba(56, 189, 248, 0.25)",
        card: "0 20px 50px rgba(8, 12, 24, 0.55)"
      }
    }
  },
  plugins: []
};
