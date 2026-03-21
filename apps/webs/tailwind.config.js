/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'iebc-green': '#1a5f2a',
        'iebc-gold': '#d4af37',
        'iebc-red': '#dc2626',
      },
    },
  },
  plugins: [],
}