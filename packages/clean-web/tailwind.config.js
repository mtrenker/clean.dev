/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{tsx,mdx}',
    './common/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
  ],
  theme: {
    fontFamily: {
      sans: ['depot-new-web', 'sans-serif'],
      condensed: ['depot-new-condensed-web', 'sans-serif'],
    },
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
