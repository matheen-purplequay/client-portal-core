/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,css,scss,sass,html}',
  ],
  theme: {
    extend: {
      colors: {
        newcolor: "#0088ff",
        "primary": {
          '50': '#fff1f1',
          '100': '#ffe4e5',
          '200': '#fecdd1',
          '300': '#fca5ac',
          '400': '#fa7280',
          '500': '#f34057',
          '600': '#df1f41',
          '700': '#bd1336',
          '800': '#9e1333',
          '900': '#811330',
          '950': '#4b0616'
        },
        "secondary": {
          '50': '#e9f7ff',
          '100': '#cfebff',
          '200': '#a9dfff',
          '300': '#6fcdff',
          '400': '#2baeff',
          '500': '#0085ff',
          '600': '#005cff',
          '700': '#0041ff',
          '800': '#0035e1',
          '900': '#0035af',
          '950': '#022169'
        },
      }
    },
  },
  plugins: [],
};
