/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0B0C09',
          950: '#07080610',
          900: '#0B0C09',
          850: '#101210',
          800: '#171A16',
          700: '#20231E',
          600: '#2B2F27',
          500: '#3A3F35'
        },
        bone: {
          DEFAULT: '#ECE5D3',
          50: '#F6F1E3',
          100: '#ECE5D3',
          200: '#D8D0BA',
          300: '#BDB39A',
          400: '#978D76',
          500: '#6F6858',
          600: '#4D483C'
        },
        moss: {
          DEFAULT: '#7A9960',
          300: '#A8C08B',
          400: '#8EAE72',
          500: '#7A9960',
          600: '#5F7D49',
          700: '#465E36',
          800: '#324225'
        },
        amber: {
          DEFAULT: '#D4A84B',
          300: '#EAC880',
          400: '#DFB862',
          500: '#D4A84B',
          600: '#B08A34',
          700: '#8A6B25'
        }
      },
      fontFamily: {
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      fontSize: {
        'label': ['0.68rem', { lineHeight: '1rem', letterSpacing: '0.14em' }],
        'kpi': ['2.75rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }]
      },
      borderRadius: {
        'xs': '2px',
        'sm': '3px'
      },
      boxShadow: {
        'card': '0 0 0 1px rgba(236,229,211,0.06), 0 1px 0 rgba(236,229,211,0.03)'
      }
    }
  },
  plugins: []
};
