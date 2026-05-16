export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#09090b",
        panel: "#121216",
        muted: "#a1a1aa",
        brand: "#38bdf8",
        accent: "#f43f5e"
      },
      boxShadow: {
        glow: "0 0 40px rgba(56, 189, 248, 0.16)"
      }
    }
  },
  plugins: []
};
