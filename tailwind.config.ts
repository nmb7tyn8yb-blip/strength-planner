import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        graphite: "#1C1B1A",
        graphite2: "#26241F",
        chalk: "#F2EFE9",
        chalkDim: "#B8B3A8",
        steel: "#4C6B8A",
        steelLight: "#7C97B0",
        amber: "#E8A33D",
        rust: "#B4472A",
      },
      fontFamily: {
        display: ["'Oswald'", "sans-serif"], // тежък кондензиран - за числа/проценти
        body: ["'Inter'", "sans-serif"],
      },
      borderRadius: {
        none: "0px",
      },
    },
  },
  plugins: [],
} satisfies Config;
