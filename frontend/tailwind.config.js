/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {

      // ─── NEON COLOR SYSTEM (merged from Bolt + App4 + existing project) ───────
      colors: {
        // Primary accent — lime/yellow-green (your existing identity)
        'neon-lime':    '#ccff00',
        'neon-lime-dim':'rgba(204,255,0,0.4)',

        // Secondary accents — from Bolt/App4
        'neon-cyan':    '#00e5ff',
        'neon-magenta': '#ff00aa',
        'neon-violet':  '#a855f7',

        // Dark surface scale (App1+App4 naming, maps to your existing bg vars)
        'dark': {
          50:   '#f8fafc',   // near-white text
          100:  '#e2e8f0',   // slate-200 — body text
          200:  '#cbd5e1',
          300:  '#94a3b8',   // muted text
          400:  '#64748b',
          500:  '#475569',   // dim text
          600:  '#334155',   // borders
          700:  '#1e293b',   // subtle borders
          800:  '#0f172a',   // card bg
          900:  '#080c14',   // panel bg
          950:  '#030508',   // page bg
        },

        // Semantic keep-alive (used all over your existing CSS)
        'cyan': {
          50:  '#e0f2f1',
          100: '#b2ebf2',
          300: '#4dd0e1',
          500: '#00e5ff',
        },
        'rose': {
          100: '#ffb3d9',
          300: '#ff80ab',
          400: '#fb7185',
          500: '#ff4081',
        },
      },

      // ─── BACKGROUND IMAGES / GRADIENTS ────────────────────────────────────────
      backgroundImage: {
        // Gradient text helpers used in App4 / merged App
        'gradient-lime-cyan':   'linear-gradient(135deg, #ccff00, #00e5ff)',
        'gradient-cyan-violet': 'linear-gradient(135deg, #00e5ff, #a855f7)',
        'gradient-lime-violet': 'linear-gradient(135deg, #ccff00, #a855f7)',
        'gradient-cyber':       'linear-gradient(135deg, #ccff00 0%, #00e5ff 50%, #ff00aa 100%)',
        // Subtle grid pattern (App4 parallax background)
        'cyber-grid': `linear-gradient(0deg,  transparent 24%, rgba(204,255,0,.04) 25%, rgba(204,255,0,.04) 26%, transparent 27%),
                       linear-gradient(90deg, transparent 24%, rgba(204,255,0,.04) 25%, rgba(204,255,0,.04) 26%, transparent 27%)`,
      },
      backgroundSize: {
        'grid-60': '60px 60px',
      },

      // ─── TYPOGRAPHY ───────────────────────────────────────────────────────────
      fontFamily: {
        'sans':  ['Assistant', 'sans-serif'],
        'mono':  ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'xs':   '0.75rem',
        'sm':   '0.875rem',
        'base': '1rem',
        'lg':   '1.125rem',
        'xl':   '1.25rem',
        '2xl':  '1.5rem',
        '3xl':  '1.875rem',
        '4xl':  '2.25rem',
        '5xl':  '3rem',
        '6xl':  '3.75rem',
        '7xl':  '4.5rem',
      },

      // ─── SPACING ──────────────────────────────────────────────────────────────
      spacing: {
        '0.75': '0.1875rem',
        '1.25': '0.3125rem',
        '1.75': '0.4375rem',
        '2.5':  '0.625rem',
        '2.75': '0.6875rem',
        '3.5':  '0.875rem',
        '4.5':  '1.125rem',
        '5.5':  '1.375rem',
        '6.5':  '1.625rem',
        '7':    '1.75rem',
        '8':    '2rem',
        '9':    '2.25rem',
        '10':   '2.5rem',
        '12':   '3rem',
        '13':   '3.25rem',
        '14':   '3.5rem',
        '16':   '4rem',
        '18':   '4.5rem',
        '20':   '5rem',
        '22':   '5.5rem',
        '24':   '6rem',
        '28':   '7rem',
        '32':   '8rem',
        '36':   '9rem',
        '40':   '10rem',
        '48':   '12rem',
        '55':   '13.75rem',
        '75':   '18.75rem',
        '90':   '22.5rem',
      },

      // ─── BORDER RADIUS ────────────────────────────────────────────────────────
      borderRadius: {
        'sm':  '0.25rem',
        'md':  '0.375rem',
        'lg':  '0.5rem',
        'xl':  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full':'9999px',
      },

      // ─── BOX SHADOW / GLOW ────────────────────────────────────────────────────
      boxShadow: {
        // Your existing shadows
        'lg':          '0 10px 15px -3px rgba(0,0,0,0.4)',
        '2xl':         '0 25px 50px -12px rgba(0,0,0,0.5)',
        // Neon glow shadows (used via group-hover or hover: variants)
        'glow-lime':   '0 0 20px rgba(204,255,0,0.35), 0 0 60px rgba(204,255,0,0.12)',
        'glow-cyan':   '0 0 20px rgba(0,229,255,0.35), 0 0 60px rgba(0,229,255,0.12)',
        'glow-magenta':'0 0 20px rgba(255,0,170,0.35), 0 0 60px rgba(255,0,170,0.12)',
        'glow-violet': '0 0 20px rgba(168,85,247,0.35), 0 0 60px rgba(168,85,247,0.12)',
        'inner-lime':  'inset 0 1px 0 rgba(204,255,0,0.08)',
        'card':        '0 4px 24px rgba(0,0,0,0.4)',
      },

      // ─── ANIMATIONS ───────────────────────────────────────────────────────────
      animation: {
        'fade-in':        'fadeInUp 0.4s ease both',
        'fade-in-up':     'fadeInUp 0.3s ease both',
        'fade-in-down':   'fadeInDown 0.7s ease both',
        'fade-out':       'fadeOut 0.3s ease both',
        'slide-in-right': 'slideInRight 0.45s ease both',
        'pulse-slow':     'pulse 3s ease-in-out infinite',
        'bounce-slow':    'bounce 2s infinite',
        'spin':           'spin 1s linear infinite',
        'glow-pulse':     'glowPulse 2s ease-in-out infinite',
        'gradient-shift': 'gradientShift 4s ease infinite',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          from: { opacity: '0', transform: 'translateY(-12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeOut: {
          to: { opacity: '0', transform: 'translateY(10px)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        glowPulse: {
          '0%,100%': { opacity: '0.6' },
          '50%':     { opacity: '1' },
        },
        gradientShift: {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%':     { backgroundPosition: '100% 50%' },
        },
      },

      // ─── TRANSITION ───────────────────────────────────────────────────────────
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
      },

      // ─── WIDTH / HEIGHT ───────────────────────────────────────────────────────
      width: {
        '0.75':   '3px',
        '7':      '1.75rem',
        '7.5':    '1.875rem',
        '9':      '2.25rem',
        '12':     '3rem',
        '28':     '7rem',
        '36':     '9rem',
        '48':     '12rem',
        '55':     '13.75rem',
        '75':     '18.75rem',
        '90':     '22.5rem',
        '260px':  '260px',
      },
      height: {
        '1.75': '0.4375rem',
        '4.5':  '1.125rem',
        '7':    '1.75rem',
        '7.5':  '1.875rem',
        '9':    '2.25rem',
        '28':   '7rem',
        '36':   '9rem',
        '48':   '12rem',
        '120':  '30rem',
      },
      maxHeight: {
        '96':   '24rem',
        '400':  '400px',
      },

      // ─── OPACITY ──────────────────────────────────────────────────────────────
      opacity: {
        '2': '0.02',
        '3': '0.03',
        '5': '0.05',
        '8': '0.08',
      },
    },
  },

  plugins: [
    function({ addComponents, addUtilities }) {

      // ─── COMPONENT CLASSES ──────────────────────────────────────────────────
      addComponents({

        // Avatar helpers
        '.avatar-initials': {
          '@apply rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0': {},
          'box-shadow': '0 0 10px rgba(204,255,0,0.25)',
          'border':     '1px solid rgba(204,255,0,0.2)',
          'background': 'linear-gradient(135deg, rgba(204,255,0,0.1), rgba(204,255,0,0.05))',
        },
        '.avatar-img': {
          '@apply w-full h-full object-cover rounded-full': {},
        },

        // Glass card — base surface for panels (App1+App2 style)
        '.glass-card': {
          'background':     'rgba(255,255,255,0.025)',
          'backdrop-filter':'blur(16px)',
          'border':         '1px solid rgba(255,255,255,0.06)',
          'transition':     'all 0.3s cubic-bezier(0.23,1,0.32,1)',
          '&:hover': {
            'background': 'rgba(255,255,255,0.04)',
            'border-color':'rgba(255,255,255,0.12)',
          },
        },

        // Neon card — lime accent border (your existing style)
        '.neon-card': {
          'background':     'rgba(255,255,255,0.02)',
          'backdrop-filter':'blur(12px)',
          'border':         '1px solid rgba(204,255,0,0.08)',
          'transition':     'all 0.3s cubic-bezier(0.23,1,0.32,1)',
          '&:hover': {
            'border-color': 'rgba(204,255,0,0.25)',
            'box-shadow':   '0 0 20px rgba(204,255,0,0.08), 0 8px 32px rgba(0,0,0,0.4)',
            'transform':    'translateY(-2px)',
          },
        },

        // Cyan card — Bolt style
        '.cyan-card': {
          'background':     'rgba(255,255,255,0.02)',
          'backdrop-filter':'blur(12px)',
          'border':         '1px solid rgba(0,229,255,0.08)',
          'transition':     'all 0.3s cubic-bezier(0.23,1,0.32,1)',
          '&:hover': {
            'border-color': 'rgba(0,229,255,0.25)',
            'box-shadow':   '0 0 20px rgba(0,229,255,0.08), 0 8px 32px rgba(0,0,0,0.4)',
            'transform':    'translateY(-2px)',
          },
        },

        // Category card (App1 style, upgraded)
        '.cat-card': {
          '@apply rounded-2xl p-6 transition-all duration-350': {},
          'background':     'rgba(255,255,255,0.025)',
          'backdrop-filter':'blur(12px)',
          'border':         '1px solid rgba(204,255,0,0.08)',
          '&:hover': {
            'transform':    'translateY(-4px)',
            'background':   'rgba(255,255,255,0.04)',
            'border-color': 'rgba(204,255,0,0.2)',
            'box-shadow':   '0 20px 60px rgba(0,0,0,0.4), 0 0 30px rgba(204,255,0,0.06)',
          },
        },

        // Topic/post card
        '.post-card': {
          '@apply rounded-xl mb-3 transition-all duration-300 relative overflow-hidden': {},
          'background': 'rgba(255,255,255,0.02)',
          'border':     '1px solid rgba(255,255,255,0.05)',
          '&:hover': {
            'background': 'rgba(255,255,255,0.035)',
            'border-color':'rgba(204,255,0,0.15)',
            'transform':  'translateY(-1px)',
            'box-shadow': '0 8px 32px rgba(0,0,0,0.4)',
          },
        },

        // Search box
        '.search-box': {
          '@apply rounded-full transition-all': {},
          'padding': '10px 20px',
          '&:focus-within': {
            '@apply border-neon-lime bg-white/5': {},
            'box-shadow': '0 0 0 3px rgba(204,255,0,0.1)',
          },
        },

        // Neon button — lime (primary CTA)
        '.btn-neon': {
          'background':   '#ccff00',
          'color':        '#0a0a0c',
          'font-weight':  '700',
          'transition':   'all 0.2s ease',
          '@apply rounded-xl px-5 py-2.5 text-sm': {},
          '&:hover': {
            'background':  '#bfff00',
            'box-shadow':  '0 0 20px rgba(204,255,0,0.4)',
            'transform':   'translateY(-1px)',
          },
        },

        // Gradient text (App4 style — apply to spans/h1)
        '.gradient-text': {
          'background':           'linear-gradient(135deg, #ccff00, #00e5ff)',
          '-webkit-background-clip': 'text',
          'background-clip':     'text',
          '-webkit-text-fill-color': 'transparent',
          'color':               'transparent',
        },
        '.gradient-text-cyber': {
          'background':           'linear-gradient(135deg, #ccff00 0%, #00e5ff 50%, #ff00aa 100%)',
          '-webkit-background-clip': 'text',
          'background-clip':     'text',
          '-webkit-text-fill-color': 'transparent',
          'color':               'transparent',
        },

        // Smooth border — Bolt naming alias
        '.smooth-border': {
          'border': '1px solid rgba(255,255,255,0.08)',
        },

        // Card hover — Bolt naming alias
        '.card-hover': {
          'transition': 'all 0.3s cubic-bezier(0.23,1,0.32,1)',
          '&:hover': {
            'transform':  'translateY(-2px)',
            'box-shadow': '0 8px 32px rgba(0,0,0,0.4)',
          },
        },

        // Cyber grid background (App4)
        '.bg-cyber-grid': {
          'background-image': `
            linear-gradient(0deg,  transparent 24%, rgba(204,255,0,0.04) 25%, rgba(204,255,0,0.04) 26%, transparent 27%),
            linear-gradient(90deg, transparent 24%, rgba(204,255,0,0.04) 25%, rgba(204,255,0,0.04) 26%, transparent 27%)
          `,
          'background-size': '60px 60px',
        },

        // Ambient glow blob (used as pseudo-background decoration)
        '.ambient-glow': {
          'position':       'absolute',
          'width':          '600px',
          'height':         '600px',
          'background':     'radial-gradient(circle, rgba(204,255,0,0.04), transparent 70%)',
          'filter':         'blur(140px)',
          'pointer-events': 'none',
          'z-index':        '-1',
        },
        '.ambient-glow-cyan': {
          'position':       'absolute',
          'width':          '400px',
          'height':         '400px',
          'background':     'radial-gradient(circle, rgba(0,229,255,0.06), transparent 70%)',
          'filter':         'blur(120px)',
          'pointer-events': 'none',
          'z-index':        '-1',
        },

        // Live pulse dot (notifications, online indicator)
        '.live-pulse': {
          'animation': 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
        },

        // Topic tag
        '.topic-tag': {
          '@apply rounded text-xs px-2 py-1 transition-colors duration-200 cursor-pointer': {},
          'background':   'rgba(204,255,0,0.05)',
          'border':       '1px solid rgba(204,255,0,0.1)',
          'color':        'rgba(204,255,0,0.7)',
          '&:hover': {
            'background':   'rgba(204,255,0,0.1)',
            'border-color': 'rgba(204,255,0,0.25)',
            'color':        '#ccff00',
          },
        },

        // Badge variants (App3 style)
        '.badge-expert': {
          '@apply inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold': {},
          'background':   'rgba(255,0,170,0.12)',
          'border':       '1px solid rgba(255,0,170,0.2)',
          'color':        '#ff00aa',
        },
        '.badge-moderator': {
          '@apply inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold': {},
          'background':   'rgba(0,229,255,0.12)',
          'border':       '1px solid rgba(0,229,255,0.2)',
          'color':        '#00e5ff',
        },
        '.badge-pinned': {
          '@apply inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold': {},
          'background':   'rgba(204,255,0,0.1)',
          'border':       '1px solid rgba(204,255,0,0.2)',
          'color':        '#ccff00',
        },
        '.badge-trending': {
          '@apply inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold': {},
          'background':   'rgba(0,229,255,0.1)',
          'border':       '1px solid rgba(0,229,255,0.2)',
          'color':        '#00e5ff',
        },

      });

      // ─── UTILITY CLASSES ────────────────────────────────────────────────────
      addUtilities({
        // Glow utilities (hover:shadow-glow-lime etc already covered by boxShadow)
        '.glow-lime':    { 'box-shadow': '0 0 20px rgba(204,255,0,0.35), 0 0 60px rgba(204,255,0,0.12)' },
        '.glow-cyan':    { 'box-shadow': '0 0 20px rgba(0,229,255,0.35), 0 0 60px rgba(0,229,255,0.12)' },
        '.glow-magenta': { 'box-shadow': '0 0 20px rgba(255,0,170,0.35), 0 0 60px rgba(255,0,170,0.12)' },

        // Gradient border trick
        '.border-gradient-lime': {
          'border':     '1px solid transparent',
          'background': 'linear-gradient(#0a0a0c,#0a0a0c) padding-box, linear-gradient(135deg,#ccff00,#00e5ff) border-box',
        },

        // Text clamp helpers
        '.line-clamp-1': { 'overflow':'hidden','display':'-webkit-box','-webkit-line-clamp':'1','-webkit-box-orient':'vertical' },
        '.line-clamp-2': { 'overflow':'hidden','display':'-webkit-box','-webkit-line-clamp':'2','-webkit-box-orient':'vertical' },
        '.line-clamp-3': { 'overflow':'hidden','display':'-webkit-box','-webkit-line-clamp':'3','-webkit-box-orient':'vertical' },

        // Backdrop blur shorthand
        '.blur-glass': { 'backdrop-filter': 'blur(16px)', '-webkit-backdrop-filter': 'blur(16px)' },
      });
    },
  ],
}