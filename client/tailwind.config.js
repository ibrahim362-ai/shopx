/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Luxury Perfume & Cosmetics Color Palette
        primary: {
          50: '#fdf2f5',   // Very light blush
          100: '#fce7ed',  // Light blush
          200: '#f9d0db',  // Soft blush
          300: '#f4a2b8',  // Medium blush
          400: '#f6c1cc',  // Main Soft Blush Pink
          500: '#f6c1cc',  // Main Soft Blush Pink
          600: '#e8a5b3',  // Deeper blush
          700: '#d4899a',  // Rich blush
          800: '#b86d81',  // Deep blush
          900: '#9c5568',  // Darkest blush
        },
        // Deep Charcoal Black for luxury contrast
        charcoal: {
          50: '#f7f7f7',
          100: '#e3e3e3',
          200: '#c8c8c8',
          300: '#a4a4a4',
          400: '#818181',
          500: '#666666',
          600: '#515151',
          700: '#434343',
          800: '#383838',
          900: '#1c1c1c',  // Deep Charcoal Black
        },
        // Gold Champagne for premium highlights
        gold: {
          50: '#fefdf8',
          100: '#fefbf0',
          200: '#fdf6e0',
          300: '#fbedc4',
          400: '#f7de9f',
          500: '#d4af37',  // Gold Champagne
          600: '#c19b2f',
          700: '#a18527',
          800: '#826b1f',
          900: '#6b5619',
        },
        // Cream backgrounds
        cream: {
          50: '#ffffff',    // Pure White
          100: '#fff6f0',   // Light Cream
          200: '#ffeee0',
          300: '#ffe4d1',
          400: '#ffd9c2',
          500: '#fff6f0',   // Light Cream
          600: '#f0e7db',
          700: '#e1d8cc',
          800: '#d2c9bd',
          900: '#c3baae',
        },
        // Updated grays for better contrast
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        // Keep accent for alerts/notifications
        accent: {
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
        }
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      }
    },
  },
  plugins: [],
}