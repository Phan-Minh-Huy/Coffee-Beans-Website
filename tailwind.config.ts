import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: { cream: "#F9F6F0", espresso: "#2E211A", caramel: "#B88752", sage: "#72806C", milk: "#F0E6D7" },
      fontFamily: { sans: ["Arial", "sans-serif"], display: ["Georgia", "serif"] }
    }
  }, plugins: []
};
export default config;