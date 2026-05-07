export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#09090b",
        panel: "#121216",
        muted: "#a1a1aa",
        brand: "#22c55e",
        accent: "#ef4444"
      },
      boxShadow: {
        glow: "0 0 40px rgba(34, 197, 94, 0.16)"
      }
    }
  },
  plugins: []
};
