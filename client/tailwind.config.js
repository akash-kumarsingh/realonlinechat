/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Vercel-inspired monochromatic scale
        background: '#000000',
        surface: '#0a0a0a',
        'surface-2': '#111111',
        'surface-3': '#1a1a1a',
        border: '#222222',
        'border-2': '#333333',
        // Text scale
        'text-primary': '#ededed',
        'text-secondary': '#888888',
        'text-tertiary': '#555555',
        // Accent — single clean white/blue
        accent: '#ffffff',
        'accent-dim': 'rgba(255,255,255,0.08)',
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        // Blue accent (subtle)
        blue: {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        'sm': '6px',
        DEFAULT: '8px',
        'md': '10px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'fade-up': 'fadeUp 0.5s ease-out',
        'fade-up-delay': 'fadeUp 0.5s ease-out 0.1s both',
        'fade-up-delay-2': 'fadeUp 0.5s ease-out 0.2s both',
        'fade-up-delay-3': 'fadeUp 0.5s ease-out 0.3s both',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.8)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0,0,0,0.5)',
        DEFAULT: '0 2px 8px rgba(0,0,0,0.6)',
        'md': '0 4px 16px rgba(0,0,0,0.7)',
        'lg': '0 8px 32px rgba(0,0,0,0.8)',
        'glow': '0 0 0 1px rgba(255,255,255,0.08)',
        'glow-sm': '0 0 0 1px rgba(255,255,255,0.05)',
        'inset': 'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
    },
  },
  plugins: [],
};
