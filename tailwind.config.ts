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
        darkVanilla: "#F3E1DD",
        beaver: "#E3B7B4",
        quincy: "#7A2C29",
        philBrown: "#6E120F",
        falu: "#A91B18",
        warmWhite: "#F8FAED",
        ink: "#181717",
        paleBlue: "#CEE7F3",
      },
      borderRadius: {
        card: "16px",
        hero: "24px",
        pill: "9999px",
      },
      transitionTimingFunction: {
        "ease-vigilante": "cubic-bezier(.19,1,.22,1)",
      },
      fontFamily: {
        heading: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
