import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Enostics brand colors - updated dark-mode palette
        enostics: {
          black: '#000000',
          white: '#ffffff',
          gray: {
            950: '#09090b',
            900: '#0f0f11',
            800: '#1a1a1d',
            700: '#26262a',
            600: '#323238',
            500: '#8b8b93',
            400: '#a5a5ad',
            300: '#c0c0c5',
            200: '#dcdce0',
            100: '#f5f5f6',
          },
          blue: '#4f8cff',          // primary accent
          green: '#22c55e',         // success
          red: '#ef4444',           // destructive
          amber: '#f59e0b',         // warning
        },
        // Brand shorthand
        brand: '#4f8cff',
        // Syntax highlighting colors
        syntax: {
          key: '#66d9ef',
          string: '#a6e22e',
          number: '#ae81ff',
          boolean: '#fd971f',
          null: '#f92672',
        },
        // Background gradients
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Consolas', 'Courier New', 'monospace'],
      },
      fontSize: {
        'xs': '0.75rem',    // 12px
        'sm': '0.875rem',   // 14px
        'base': '1rem',     // 16px
        'lg': '1.125rem',   // 18px
        'xl': '1.25rem',    // 20px
        '2xl': '1.5rem',    // 24px
        '3xl': '1.875rem',  // 30px
        '4xl': '2.25rem',   // 36px
        '5xl': '3rem',      // 48px
        '6xl': '3.75rem',   // 60px
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      typography: {
        invert: {
          css: {
            '--tw-prose-body': 'theme(colors.enostics.gray.300)',
            '--tw-prose-headings': 'theme(colors.white)',
            '--tw-prose-lead': 'theme(colors.enostics.gray.400)',
            '--tw-prose-links': 'theme(colors.brand)',
            '--tw-prose-bold': 'theme(colors.white)',
            '--tw-prose-counters': 'theme(colors.enostics.gray.400)',
            '--tw-prose-bullets': 'theme(colors.enostics.gray.600)',
            '--tw-prose-hr': 'theme(colors.enostics.gray.800)',
            '--tw-prose-quotes': 'theme(colors.enostics.gray.100)',
            '--tw-prose-quote-borders': 'theme(colors.enostics.gray.800)',
            '--tw-prose-captions': 'theme(colors.enostics.gray.400)',
            '--tw-prose-code': 'theme(colors.white)',
            '--tw-prose-pre-code': 'theme(colors.enostics.gray.300)',
            '--tw-prose-pre-bg': 'theme(colors.enostics.gray.900)',
            '--tw-prose-th-borders': 'theme(colors.enostics.gray.600)',
            '--tw-prose-td-borders': 'theme(colors.enostics.gray.800)',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config; 