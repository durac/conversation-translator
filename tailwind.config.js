/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#e6eef7',
          100: '#c5d7eb',
          200: '#9bb8db',
          300: '#6f94c7',
          400: '#4d6fb0',
          500: '#3a5594',
          600: '#2e4378',
          700: '#253661',
          800: '#1e2b4d',
          900: '#17223d',
          950: '#0d1526',
        },
        secondary: {
          50: '#e6f4f2',
          100: '#c5e4df',
          200: '#9bcdc5',
          300: '#6fb0a6',
          400: '#4d8f85',
          500: '#3a7269',
          600: '#2e5a54',
          700: '#254743',
          800: '#1e3835',
          900: '#172b29',
          950: '#0d1a18',
        },
        accent: {
          50: '#f7e6e6',
          100: '#ebc5c5',
          200: '#db9b9b',
          300: '#c76f6f',
          400: '#b04d4d',
          500: '#943a3a',
          600: '#782e2e',
          700: '#612525',
          800: '#4d1e1e',
          900: '#3d1717',
          950: '#260d0d',
        },
        success: {
          50: '#f0fdf4',
          100: '#dbfde6',
          200: '#baf7ce',
          300: '#84f1aa',
          400: '#4bde7c',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};