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
        primary: "#3375BB",
        secondary: "#1E3A8A",
        background: "#FFFFFF",
        card: "#F8F9FA",
        trust: {
          blue: "#3375BB",
          dark: "#0B1426",
          light: "#F7FAFC",
        },
      },
    },
  },
  plugins: [],
};
export default config;
