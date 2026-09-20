/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // NestJS Brand Colors
        nest: {
          red: '#E0234E',
          'red-dark': '#C41E44',
          'red-light': '#FF2D55',
        },
        // DevTools Color Palette
        devtools: {
          bg: '#0b0909',
          'sidebar-bg': '#111010',
          'header-bg': '#1e1a1b',
          'toolbar-bg': '#242021',
          'hover-bg': 'rgba(255, 255, 255, 0.05)',
          'active-bg': 'rgba(224, 35, 78, 0.15)',
          border: '#2a2627',
          'icon-inactive': '#9d9d9d',
          'icon-hover': '#e0e0e0',
          accent: '#E0234E',
        },
        // Status Colors
        status: {
          green: '#89d185',
          blue: '#75beff',
          yellow: '#dcdcaa',
          red: '#f48771',
        },
        // Semantic Colors
        bg: {
          primary: '#0b0909',
          secondary: '#111010',
          tertiary: '#1e1a1b',
          elevated: '#242021',
        },
        text: {
          primary: '#f2f0ef',
          secondary: '#9d9d9d',
          tertiary: '#6e7681',
          eyebrow: '#867c7d',
        },
        border: {
          DEFAULT: '#2a2627',
          light: '#1e1a1b',
        },
        accent: {
          DEFAULT: '#E0234E',
          hover: '#C41E44',
          light: 'rgba(224, 35, 78, 0.15)',
        },
      },
      boxShadow: {
        'sm': '0 1px 3px rgba(0, 0, 0, 0.5)',
        'md': '0 4px 12px rgba(0, 0, 0, 0.6)',
        'lg': '0 8px 24px rgba(0, 0, 0, 0.7)',
      },
      keyframes: {
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'overlay-show': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'content-show': {
          from: { opacity: '0', transform: 'translate(-50%, -48%) scale(0.96)' },
          to: { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
        },
      },
      animation: {
        'slide-down': 'slide-down 0.2s ease',
        'slide-up': 'slide-up 0.2s ease',
        'fade-in': 'fade-in 0.2s ease',
        'overlay-show': 'overlay-show 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        'content-show': 'content-show 150ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

