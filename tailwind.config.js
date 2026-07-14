/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Poppins", "Noto Sans Devanagari", "sans-serif"],
        body: ["Noto Sans Devanagari", "Poppins", "sans-serif"],
      },
      colors: {
        brand: {
          deep: "#0B3B2E",
          forest: "#0F5132",
          emerald: "#0E9F6E",
          teal: "#14B8A6",
          gold: "#F5A623",
          goldLight: "#FBC55C",
          amber: "#F59E0B",
          sky: "#2563EB",
          rose: "#E11D8F",
          cream: "#FFF9EE",
        },
      },
      boxShadow: {
        premium: "0 10px 40px -12px rgba(15,81,50,0.35)",
      },
      backgroundImage: {
        "furrow": "repeating-linear-gradient(115deg, rgba(255,255,255,0.07) 0px, rgba(255,255,255,0.07) 2px, transparent 2px, transparent 26px)",
      },
    },
  },
  plugins: [],
};
