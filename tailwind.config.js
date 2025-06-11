/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./App.tsx", "./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        mygreen: '#5f8b4c',
        mypink: '#ff9a9a',
        mycream: '#ffddab',
        mybrown: '#945034',
      },
      fontFamily: {
        heading: ["Unna_700Bold", "serif"],
        body: ["Jost_400Regular", "sans-serif"],
        bodyBold: ["Jost_500Medium", "sans-serif"],
      }
    },
  },
  plugins: [],
}