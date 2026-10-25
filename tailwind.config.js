/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base dark palette
        'void': {
          DEFAULT: '#0a0b1a',
          50: '#1a1b3a',
          100: '#141530',
          200: '#111233',
          300: '#0d0e24',
          400: '#0a0b1a',
          500: '#070812',
          600: '#04050a',
        },
        // MAXNET - Arena Gold
        'maxnet': {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
          glow: 'rgba(245, 158, 11, 0.3)',
          subtle: 'rgba(245, 158, 11, 0.1)',
        },
        // Mexican Hat - Emerald Field
        'mexhat': {
          DEFAULT: '#10b981',
          light: '#34d399',
          dark: '#059669',
          glow: 'rgba(16, 185, 129, 0.3)',
          subtle: 'rgba(16, 185, 129, 0.1)',
        },
        // SOM - Cosmic Indigo
        'som': {
          DEFAULT: '#6366f1',
          light: '#818cf8',
          dark: '#4f46e5',
          glow: 'rgba(99, 102, 241, 0.3)',
          subtle: 'rgba(99, 102, 241, 0.1)',
        },
        // Hamming - Memory Rose
        'hamming': {
          DEFAULT: '#f43f5e',
          light: '#fb7185',
          dark: '#e11d48',
          glow: 'rgba(244, 63, 94, 0.3)',
          subtle: 'rgba(244, 63, 94, 0.1)',
        },
        // Neutral text
        'text': {
          primary: '#f1f5f9',
          secondary: '#94a3b8',
          muted: '#64748b',
          dim: '#475569',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'hero': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'title': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'subtitle': ['1.5rem', { lineHeight: '1.4' }],
      },
      animation: {
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fade-in 0.6s ease-out',
        'slide-up': 'slide-up 0.6s ease-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
}
