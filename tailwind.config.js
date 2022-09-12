/** @type {import('tailwindcss').Config} */

const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        grey: "#bababa",
        bluePrimary: "#1A237E",
        yellowButton: "#F29C38",
        codeBack: "#242424",
        drawerBlue: "#171F6F",
        textBlack: "#4a4a4a",
        iconGrey: "#9ca3af",
        gray: {
          DEFAULT: "#E0E0E0",
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#EEEEEE",
          300: "#E0E0E0",
          400: "#BDBDBD",
          500: "#9E9E9E",
          600: "#757575",
          700: "#616161",
          800: "#424242",
          900: "#212121",
        },
        primary: {
          DEFAULT: "#1A237E",
          200: "#4192DF",
          400: "#1A237E",
          700: "#10143E",
        },
        secondary: {
          DEFAULT: "#F29C38",
          200: "#f6ba74",
          400: "#F29C38",
          700: "#c27d2d",
        },
      },
      backgroundImage: {
        "login-back": "url('assets/images/Path 369.svg')",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("tailwind-scrollbar")],
  variants: {
    scrollbar: ["rounded"],
  },
};
