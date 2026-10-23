import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060B14',
          900: '#0A1120',
          850: '#0F1A30',
          800: '#14213D',
          700: '#1E2F54',
          600: '#2A4374',
        },
        charcoal: {
          950: '#0D0E12',
          900: '#13151B',
          800: '#1C2029',
          700: '#2A303C',
          600: '#40495B',
        },
        accent: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          electric: '#0066FF',
          glow: '#3B82F6',
          cyan: '#06B6D4',
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#3B82F6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.25)',
        'card-hover': '0 10px 25px -3px rgba(37, 99, 235, 0.15)',
        glow: '0 0 20px rgba(0, 102, 255, 0.35)',
      },
      borderRadius: {
        card: '14px',
      }
    },
  },
  plugins: [],
}

export default config
