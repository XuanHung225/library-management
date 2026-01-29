// tailwind.config.js
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        surface: "#f3f4f6",
        "surface-dark": "#1e293b",
      },
    },
  },
  plugins: [],
};
