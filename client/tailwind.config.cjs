/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0F0D1A',
        violet: '#5B21B6',
        indigo: '#4F46E5',
        indigoLight: '#818CF8',

        amber: '#D97706',
        amberLight: '#FCD34D',

        surface: '#F5F3FF',
        card: '#FFFFFF',
        border: '#E5E7EB',

        body: '#1E1B4B',
        muted: '#6B7280',

        success: '#059669',
        danger: '#DC2626',
        warn: '#D97706',
      },

      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      backgroundImage: {
        'hero-gradient':
          'linear-gradient(135deg, #0F0D1A 0%, #1E1B4B 50%, #2D1B69 100%)',
        'card-violet':
          'linear-gradient(135deg, #5B21B6 0%, #4F46E5 100%)',
        'card-amber':
          'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
        'card-green':
          'linear-gradient(135deg, #059669 0%, #10B981 100%)',
        'card-rose':
          'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
        'card-cyan':
          'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)',
        sidebar:
          'linear-gradient(180deg, #0F0D1A 0%, #1a1730 100%)',
      },

      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'fade-up': 'fadeUp 0.6s ease both',
        'slide-in': 'slideIn 0.5s ease both',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },

      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },

      boxShadow: {
        'glow-violet': '0 0 40px rgba(91,33,182,.35)',
        'glow-amber': '0 0 30px rgba(217,119,6,.3)',
        card: '0 4px 24px rgba(0,0,0,.07)',
        'card-hover': '0 8px 40px rgba(0,0,0,.13)',
      },
    },
  },
  plugins: [],
};