plugins: [require('@tailwindcss/line-clamp')],
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // 👈 important pour React
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
