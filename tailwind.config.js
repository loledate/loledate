/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lol: {
          cream: '#fff7fb',
          blush: '#ffe4f0',
          rose: '#f472b6',
          pink: '#ec4899',
          magenta: '#db2777',
          gold: '#fbbf24',
          'gold-dark': '#d97706',
          card: '#ffffff',
          border: '#fbcfe8',
        },
      },
      fontFamily: {
        display: ['"Segoe UI"', 'system-ui', 'sans-serif'],
        body: ['"Segoe UI"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(236, 72, 153, 0.35)',
        'glow-gold': '0 0 20px rgba(251, 191, 36, 0.45)',
        card: '0 8px 32px rgba(219, 39, 119, 0.12)',
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        shimmer: 'shimmer 3s ease-in-out infinite',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
      },
      backgroundImage: {
        'page-glow':
          'radial-gradient(ellipse at top, rgba(251, 191, 36, 0.18) 0%, transparent 55%), radial-gradient(ellipse at bottom right, rgba(244, 114, 182, 0.22) 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
}
