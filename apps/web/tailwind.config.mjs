/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Oswald", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        // Paleta Juanma & The Center People
        black: {
          DEFAULT: "#0a0a0a",
          soft: "#111111",
        },
        bone: {
          DEFAULT: "#f5f0eb",
          muted: "#d4cfc9",
        },
        red: {
          band: "#c0392b",   // acento principal
          dark: "#922b21",
          muted: "#8b2e25",
        },
        urban: {
          50:  "#f8f8f7",
          100: "#e8e6e3",
          200: "#c8c4be",
          300: "#a8a29a",
          400: "#8a8278",
          500: "#6d6560",
          600: "#554e49",
          700: "#3e3834",
          800: "#292420",
          900: "#161210",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
