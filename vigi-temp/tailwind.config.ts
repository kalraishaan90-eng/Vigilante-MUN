import type { Config } from "tailwindcss";

/**
 * Fix #1: Tailwind color extensions map to CSS token variables ONLY.
 * No ad-hoc hex values anywhere in the config.
 * All brand colors derive from the 8 locked design tokens defined in globals.css.
 */
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Brand tokens — locked palette */
        "dark-vanilla": "var(--dark-vanilla)",
        beaver:         "var(--beaver)",
        quincy:         "var(--quincy)",
        "phil-brown":   "var(--phil-brown)",
        falu:           "var(--falu)",
        "warm-white":   "var(--warm-white)",
        ink:            "var(--ink)",
        "pale-blue":    "var(--pale-blue)",
      },
      fontFamily: {
        /* Fix #2: Tailwind font utilities resolve to the same locked vars */
        heading: ["var(--font-fraunces)", "Georgia", "serif"],
        body:    ["var(--font-inter)",    "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
