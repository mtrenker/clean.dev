/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{tsx,mdx}',
    './common/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
