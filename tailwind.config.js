/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#38e07b",
        "secondary": "#2ecc71",
        "warning": "#f1c40f",
        "background-light": "#f6f8f7",
        "background-dark": "#122017",
        "text-light": "#ecf0f1",
        "text-dark": "#0e1a13",
        "border-light": "#d1e6d9",
        "border-dark": "#2a3f32",
      },
      fontFamily: {
        "display": ["Space Grotesk", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
