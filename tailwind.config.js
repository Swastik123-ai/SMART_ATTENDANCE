/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'holographic': 'linear-gradient(135deg, #ff00cc, #3333ff, #00ffd5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s infinite ease-in-out',
      },
      blur: {
        xs: '2px',
        sm: '4px',
      },
      brightness: {
        120: '1.2',
        150: '1.5',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'), // for enhanced animation utilities (optional but useful)
  ],
};
