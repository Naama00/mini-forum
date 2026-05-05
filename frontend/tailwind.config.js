/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyan': {
          500: '#00e5ff',
          300: '#4dd0e1',
          100: '#b2ebf2',
          50: '#e0f2f1',
        },
        'rose': {
          500: '#ff4081',
          300: '#ff80ab',
          100: '#ffb3d9',
        },
      },
      spacing: {
        '0.75': '0.1875rem',
        '1.25': '0.3125rem',
        '1.75': '0.4375rem',
        '2.5': '0.625rem',
        '2.75': '0.6875rem',
        '3.5': '0.875rem',
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '6.5': '1.625rem',
        '7': '1.75rem',
        '8': '2rem',
        '9': '2.25rem',
        '10': '2.5rem',
        '12': '3rem',
        '13': '3.25rem',
        '14': '3.5rem',
        '16': '4rem',
        '20': '5rem',
        '22': '5.5rem',
        '24': '6rem',
        '28': '7rem',
        '32': '8rem',
        '36': '9rem',
        '40': '10rem',
        '48': '12rem',
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'monospace'],
        'sans': ['Assistant', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeInUp 0.4s ease both',
        'fade-in-up': 'fadeInUp 0.3s ease both',
        'fade-in-down': 'fadeInDown 0.7s ease both',
        'fade-out': 'fadeOut 0.3s ease both',
        'slide-in-right': 'slideInRight 0.45s ease both',
        'bounce': 'bounce 1s infinite',
      },
      keyframes: {
        fadeInUp: {
          'from': { opacity: '0', transform: 'translateY(12px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          'from': { opacity: '0', transform: 'translateY(-12px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeOut: {
          'to': { opacity: '0', transform: 'translateY(10px)' },
        },
        slideInRight: {
          'from': { opacity: '0', transform: 'translateX(20px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      borderRadius: {
        '3xl': '1.5rem',
        'full': '9999px',
      },
      opacity: {
        '2': '0.02',
        '3': '0.03',
        '5': '0.05',
        '8': '0.08',
      },
      backgroundColor: {
        'gray': {
          '900/50': 'rgba(17, 24, 39, 0.5)',
          '600': '#4b5563',
        },
        'white': {
          '2': 'rgba(255, 255, 255, 0.04)',
          '3': 'rgba(255, 255, 255, 0.06)',
        },
      },
      borderColor: {
        'cyan': {
          '500/10': 'rgba(0, 229, 255, 0.1)',
          '500/15': 'rgba(0, 229, 255, 0.15)',
          '500/20': 'rgba(0, 229, 255, 0.2)',
          '500/30': 'rgba(0, 229, 255, 0.3)',
        },
        'white': {
          '4': 'rgba(255, 255, 255, 0.06)',
          '5': 'rgba(255, 255, 255, 0.08)',
          '8': 'rgba(255, 255, 255, 0.12)',
          '20': 'rgba(255, 255, 255, 0.22)',
        },
        'rose': {
          '500/30': 'rgba(255, 64, 129, 0.3)',
          '500/40': 'rgba(255, 64, 129, 0.4)',
        },
      },
      textColor: {
        'cyan': {
          '500': '#00e5ff',
          '500/50': 'rgba(0, 229, 255, 0.5)',
          '500/70': 'rgba(0, 229, 255, 0.7)',
        },
        'slate': {
          '200/75': 'rgba(226, 232, 240, 0.75)',
          '200/80': 'rgba(226, 232, 240, 0.8)',
        },
        'rose': {
          '500': '#ff4081',
          '500/70': 'rgba(255, 64, 129, 0.7)',
        },
        'gray': {
          '400': '#9ca3af',
          '600': '#4b5563',
          '900': '#111827',
        },
      },
      boxShadow: {
        'lg': '0 10px 15px -3px',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'lg/cyan': '0 10px 20px -6px rgba(0, 229, 255, 0.14)',
        '2xl/cyan': '0 30px 70px -18px rgba(0, 229, 255, 0.18)',
      },
      width: {
        '0.75': '3px',
        '7': '1.75rem',
        '7.5': '1.875rem',
        '9': '2.25rem',
        '12': '3rem',
        '28': '7rem',
        '36': '9rem',
        '48': '12rem',
        '260px': '260px',
        '55': '13.75rem',
        '75': '18.75rem',
        '90': '22.5rem',
      },
      height: {
        '7': '1.75rem',
        '9': '2.25rem',
        '28': '7rem',
        '36': '9rem',
        '48': '12rem',
        '4.5': '1.125rem',
        '1.75': '0.4375rem',
        '7.5': '1.875rem',
        '120': '30rem',
      },
      maxHeight: {
        '96': '24rem',
        '400': '400px',
      },
      padding: {
        '0.75': '0.1875rem',
        '1.5': '0.375rem',
        '2.5': '0.625rem',
        '2.75': '0.6875rem',
        '3.5': '0.875rem',
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '6': '1.5rem',
      },
      direction: {
        rtl: 'rtl',
        ltr: 'ltr',
      },
      transitionDuration: {
        '350': '350ms',
      },
      scale: {
        'y-0': '0',
        'y-100': '1',
      },
    },
  },
  plugins: [
    function({ addComponents, theme }) {
      addComponents({
        '.avatar-initials': {
          '@apply rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0': {},
          'box-shadow': '0 0 10px rgba(0, 229, 255, 0.25)',
          'border': '1px solid rgba(0, 229, 255, 0.2)',
          'background': 'linear-gradient(135deg, rgba(0, 229, 255, 0.1), rgba(0, 229, 255, 0.05))',
        },
        '.avatar-img': {
          '@apply w-full h-full object-cover rounded-full': {},
        },
        '.cat-card': {
          '@apply bg-white/3 border border-cyan-500/15 rounded-3xl p-6 transition-all duration-350': {},
          'backdrop-filter': 'blur(12px)',
          '&:hover': {
            '@apply -translate-y-1 bg-white/5 border-cyan-500/25 shadow-2xl shadow-cyan-500/8': {},
          },
        },
        '.post-card': {
          '@apply rounded-lg mb-3.5 shadow-lg bg-white/2 border border-white/5 transition-all duration-300 relative overflow-hidden': {},
          '&:hover': {
            '@apply shadow-2xl bg-white/4 border-white/15 -translate-y-0.5': {},
          },
        },
        '.search-box': {
          '@apply rounded-full transition-all': {},
          'padding': '10px 20px',
          '&:focus-within': {
            '@apply border-cyan-500 bg-white/5 shadow-lg shadow-cyan-500/50': {},
          },
        },
        '.topic-tag': {
          '@apply rounded text-xs px-2 py-1 transition-colors duration-200': {},
          '&:hover': {
            '@apply cursor-pointer': {},
          },
        },
      });
    },
  ],
}
