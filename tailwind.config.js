/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
        "./index.html",
  "./restaurant.html",
  "./hebergement.html",
  "./formation.html",
  "./contact.html",
    './frontend/**/*.html',
    './frontend/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#004aad',
        'secondary-red': '#c32e27',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}