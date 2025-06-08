/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./App.tsx", "./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        green: '#5f8b4c',
        pink: '#ff9a9a',
        cream: '#ffddab',
        brown: '#945034',
      }
    },
  },
  plugins: [],
}