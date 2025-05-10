/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#fab223',    // Your brand's main color
        secondary: '#00a8e8',   // Secondary accent
        accent: '#ca054d',      // Additional accent
        neutral: '#f7f4f3',     // Neutral dark color
        background: '#f7f4f3',  // Background color
        foreground: '#393e41',  // Text color
        destructive: '#ca054d'  // Destructive action color
      }
    }
  },
  plugins: [],
}