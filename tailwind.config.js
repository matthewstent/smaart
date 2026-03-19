// tailwind.config.js
module.exports = {
  darkMode: "class", // must be 'class'
  content: [
    "./components/**/*.{vue,js}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./app.vue",
  ],
  theme: { extend: {} },
  plugins: [],
};
