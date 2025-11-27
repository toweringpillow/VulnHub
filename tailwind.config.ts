import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom VulnHub color scheme
        primary: {
          50: '#fee7e4',
          100: '#fccfc9',
          200: '#f99f93',
          300: '#f66f5d',
          400: '#f33f27',
          500: '#de3723', // Main brand color
          600: '#b22c1c',
          700: '#852115',
          800: '#59160e',
          900: '#2c0b07',
        },
        accent: {
          50: '#e6f5f5',
          100: '#ccebeb',
          200: '#99d7d7',
          300: '#66c3c3',
          400: '#33afaf',
          500: '#8cc1c1', // Main accent color
          600: '#5a9d9d',
          700: '#447676',
          800: '#2e4e4e',
          900: '#172727',
        },
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Subtle orange for binary bits
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        dark: {
          DEFAULT: '#1a1a1a',
          50: '#f5f5f5',
          100: '#e0e0e0',
          200: '#c2c2c2',
          300: '#a3a3a3',
          400: '#858585',
          500: '#666666',
          600: '#4d4d4d',
          700: '#333333',
          800: '#2a2a2a',
          900: '#1a1a1a',
          950: '#0d0d0d',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-in',
        'ticker': 'ticker 30s linear infinite',
        'scroll': 'scroll 60s linear infinite',
        'flicker': 'flicker 8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '25%': { transform: 'translateY(-20px) translateX(10px)' },
          '50%': { transform: 'translateY(0px) translateX(20px)' },
          '75%': { transform: 'translateY(20px) translateX(10px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        ticker: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '2%': { opacity: '0.98' },
          '4%': { opacity: '1' },
          '8%': { opacity: '0.99' },
          '10%': { opacity: '1' },
          '15%': { opacity: '0.97' },
          '18%': { opacity: '1' },
          '25%': { opacity: '0.98' },
          '28%': { opacity: '1' },
          '35%': { opacity: '0.99' },
          '38%': { opacity: '1' },
          '45%': { opacity: '0.96' },
          '48%': { opacity: '1' },
          '55%': { opacity: '0.98' },
          '58%': { opacity: '1' },
          '65%': { opacity: '0.99' },
          '68%': { opacity: '1' },
          '75%': { opacity: '0.97' },
          '78%': { opacity: '1' },
          '85%': { opacity: '0.98' },
          '88%': { opacity: '1' },
          '92%': { opacity: '0.99' },
          '95%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-cyber': 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}
export default config

