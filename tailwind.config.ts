import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Stitch DESIGN.md tokens — public site ──────────────
        neiox: {
          // Surfaces
          surface:                '#f8f9ff',
          'surface-dim':          '#cbdbf5',
          'surface-bright':       '#f8f9ff',
          'surface-lowest':       '#ffffff',
          'surface-low':          '#eff4ff',
          'surface-mid':          '#e5eeff',
          'surface-high':         '#dce9ff',
          'surface-highest':      '#d3e4fe',
          // Text
          'on-surface':           '#0b1c30',
          'on-surface-variant':   '#42493d',
          'inverse-surface':      '#213145',
          'inverse-on-surface':   '#eaf1ff',
          // Outlines
          outline:                '#73796c',
          'outline-variant':      '#c2c9ba',
          // Primary green
          primary:                '#3f692c',
          'on-primary':           '#ffffff',
          'primary-container':    '#76a35f',
          'on-primary-container': '#103701',
          'inverse-primary':      '#a4d48a',
          'primary-fixed':        '#bff0a4',
          'primary-fixed-dim':    '#a4d48a',
          'on-primary-fixed':     '#062100',
          // Secondary slate
          secondary:              '#556063',
          'on-secondary':         '#ffffff',
          'secondary-container':  '#d6e2e4',
          // Tertiary
          tertiary:               '#5c5f5e',
          'on-tertiary':          '#ffffff',
          'tertiary-container':   '#959796',
          // Error
          error:                  '#ba1a1a',
          'on-error':             '#ffffff',
          'error-container':      '#ffdad6',
          // Background
          bg:                     '#f8f9ff',
          'on-bg':                '#0b1c30',
          'surface-variant':      '#d3e4fe',
          // Dark section
          dark:                   '#213145',
          'dark-2':               '#1a2838',
          'dark-3':               '#141e2a',
        },

        // ── Dashboard palette — light "Stitch" theme, matches main site ──
        forest: {
          950: '#f8f9ff',  // n-surface       — page background
          900: '#ffffff',  // n-surface-lowest — cards
          800: '#eff4ff',  // n-surface-low   — inputs / hover surfaces
          700: '#e5eeff',  // n-surface-mid   — active / pressed surfaces
          600: '#dce9ff',  // n-surface-high  — highest elevation
        },
        sage: {
          100: '#0b1c30',  // n-on-surface          — headings / highest emphasis
          200: '#1a2018',  // n-on-surface-variant  — default body text
          300: '#3d4438',  // n-outline             — secondary text / labels
          400: '#5b6358',  // muted text
          500: '#7a8174',  // more muted text / placeholders
          600: '#c2c9ba',  // n-outline-variant     — borders / dividers
        },
        mint: {
          300: '#a4d48a',  // n-primary-fixed-dim
          400: '#76a35f',  // n-primary-container
          500: '#3f692c',  // n-primary — brand green accent
          600: '#2d4d20',  // pressed / active accent
          700: '#1f3517',  // darkest accent
        },
        status: {
          success: '#22C55E',
          warning: '#F59E0B',
          error:   '#EF4444',
          pending: '#6366F1',
          idle:    '#6B7280',
        },
        surface:          '#041E15',
        'surface-raised':  '#072E1F',
        primary:           '#E2ECE9',
        secondary:         '#96BAB0',
        subtle:            '#456E65',
        accent:            '#10B981',
        'accent-hover':    '#34D399',
      },

      fontFamily: {
        // Public site fonts — Stitch DESIGN.md
        hanken:  ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
        inter:   ['Inter', 'system-ui', 'sans-serif'],
        jetmono: ['"JetBrains Mono"', 'monospace'],
        // Dashboard fonts — unchanged
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Cal Sans"', '"Hanken Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },

      fontSize: {
        // Stitch display scale
        'display-hero': ['4.5rem',  { lineHeight: '1.1',  letterSpacing: '-0.02em', fontWeight: '600' }],
        'headline-lg':  ['2.5rem',  { lineHeight: '1.2',  letterSpacing: '-0.01em', fontWeight: '500' }],
        'label-caps':   ['0.75rem', { lineHeight: '1.0',  letterSpacing: '0.1em' }],
        'stat-value':   ['3rem',    { lineHeight: '1.0',  fontWeight: '300' }],
        // Existing scale
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        '5xl': ['3rem',    { lineHeight: '1.1',  letterSpacing: '-0.02em'  }],
        '6xl': ['3.75rem', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        '7xl': ['4.5rem',  { lineHeight: '1',    letterSpacing: '-0.03em'  }],
        '8xl': ['6rem',    { lineHeight: '0.95', letterSpacing: '-0.035em' }],
      },

      spacing: {
        '18':  '4.5rem',
        '22':  '5.5rem',
        '30':  '7.5rem',
        '88':  '22rem',
        '128': '32rem',
        // Stitch spacing
        'section': '7.5rem',   // 120px section gap
        'gutter':  '2rem',     // 32px gutter
        'margin':  '5rem',     // 80px desktop margin
      },

      borderRadius: {
        // Stitch shape language — soft-industrial
        'site-sm':  '0.125rem',  // 2px
        'site':     '0.25rem',   // 4px
        'site-md':  '0.375rem',  // 6px
        'site-lg':  '0.5rem',    // 8px
        'site-xl':  '0.75rem',   // 12px
        'site-2xl': '1rem',      // 16px — large containers
        // Existing
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      boxShadow: {
        // Stitch ambient shadows — soft, low opacity
        'aqi':          '0 6px 24px rgba(11,28,48,0.07), 0 2px 8px rgba(11,28,48,0.05)',
        'card-site':    '0 1px 3px rgba(11,28,48,0.06), 0 1px 2px rgba(11,28,48,0.04)',
        'card-hover':   '0 8px 32px rgba(11,28,48,0.10), 0 2px 8px rgba(11,28,48,0.06)',
        'glass':        '0 4px 24px rgba(11,28,48,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
        'glass-hover':  '0 8px 40px rgba(11,28,48,0.12), inset 0 1px 0 rgba(255,255,255,0.8)',
        // Dashboard — light theme
        'card-dark':       '0 1px 3px rgba(11,28,48,0.05)',
        'card-hover-dark': '0 8px 32px rgba(11,28,48,0.10)',
        'mint-glow':       '0 0 20px rgba(63,105,44,0.35), 0 0 40px rgba(63,105,44,0.15)',
        'mint-glow-sm':    '0 0 10px rgba(63,105,44,0.25)',
        'inner-dark':      'inset 0 2px 8px rgba(11,28,48,0.06)',
        'overlay':         '0 25px 80px rgba(11,28,48,0.12)',
      },

      backgroundImage: {
        // Dashboard — light theme
        'hero-gradient':
          'radial-gradient(ellipse 80% 60% at 50% -10%, #e5eeff 0%, #f8f9ff 50%, #ffffff 100%)',
        'sidebar-gradient':
          'linear-gradient(180deg, #eff4ff 0%, #ffffff 60%, #f8f9ff 100%)',
        'shimmer':
          'linear-gradient(90deg, transparent 0%, rgba(110,231,183,0.06) 50%, transparent 100%)',
        // Site — glass shimmer
        'glass-sheen':
          'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.25) 50%, transparent 65%)',
      },

      keyframes: {
        // Site animations
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)'    },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(40px)', filter: 'blur(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)',    filter: 'blur(0)'   },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)'  },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'sheen': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        'arrow-right': {
          '0%, 100%': { transform: 'translateX(0)'   },
          '50%':      { transform: 'translateX(4px)' },
        },
        // Dashboard animations unchanged
        'fade-in-left': {
          '0%':   { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)'     },
        },
        'ping-slow': {
          '0%, 100%': { transform: 'scale(1)',    opacity: '0.8' },
          '50%':      { transform: 'scale(1.15)', opacity: '0.4' },
        },
        'breathe': {
          '0%, 100%': { opacity: '0.7', transform: 'scale(1)'    },
          '50%':      { opacity: '1',   transform: 'scale(1.05)' },
        },
      },

      animation: {
        'fade-up':       'fade-up 0.7s cubic-bezier(0.22,1,0.36,1) forwards',
        'fade-up-delay': 'fade-up 0.7s cubic-bezier(0.22,1,0.36,1) 0.15s forwards',
        'fade-in':       'fade-in 0.5s ease forwards',
        'slide-up':      'slide-up 0.8s cubic-bezier(0.22,1,0.36,1) forwards',
        'float':         'float 5s ease-in-out infinite',
        'sheen':         'sheen 3s ease-in-out infinite',
        'arrow-right':   'arrow-right 1.2s ease-in-out infinite',
        // Dashboard
        'fade-in-left':  'fade-in-left 0.4s ease-out forwards',
        'ping-slow':     'ping-slow 2s ease-in-out infinite',
        'breathe':       'breathe 8s ease-in-out infinite',
        'shimmer':       'sheen 2.5s linear infinite',
      },

      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'expo':   'cubic-bezier(0.22, 1, 0.36, 1)',
      },

      maxWidth: {
        'site': '1280px',
      },
    },
  },
  plugins: [],
};

export default config;