/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // CapCut Design System Color Palette
        capcut: {
          primary: '#1F1F1F',
          canvas: '#FFFFFF',
          surface: '#EDF1FF',
          'surface-alt': '#121217',
          'surface-dark': '#1D1D1E',
          'surface-raised': '#29292A',
          ink: '#000000',
          body: '#111A2C',
          muted: '#1C283D',
          faint: '#2B3743',
          'accent-blue': '#5B8FFF',     // Accent 1
          'accent-navy': '#2E4A66',     // Accent 2
          'accent-dark': '#111A20',     // Accent 3
          'accent-sage': '#BDD1DB',     // Accent 4
          'accent-cyan': '#12E8FF',     // Accent 5 (Signature CapCut Vibrant Cyan)
          'neutral-gray': '#54545C',
          border: '#353536',
        },
        bgPrimary: '#0F0F10',
        bgSecondary: '#121217',
        bgTertiary: '#1D1D1E',
      },
      fontFamily: {
        sans: ['"Noto Sans"', '"Noto Sans Lao"', '"Noto Sans Thai"', 'Inter', 'sans-serif'],
        noto: ['"Noto Sans"', '"Noto Sans Lao"', '"Noto Sans Thai"', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        albert: ['Albert Sans', 'sans-serif'],
        lao: ['"Noto Sans Lao"', '"Noto Sans"', 'sans-serif'],
      },
      borderRadius: {
        none: '0px',
        xs: '6px',
        sm: '8px',
        md: '10px',
        lg: '12px',
        xl: '16px',
        xxl: '20px',
        full: '9999px',
      },
      spacing: {
        xxs: '4px',
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '20px',
        xl: '24px',
        xxl: '28px',
        xxxl: '40px',
        section: '60px',
        band: '64px',
      },
      letterSpacing: {
        'display-xl': '-3px',
        'display-lg': '-1px',
        'display-md': '-0.96px',
        'display-sm': '-0.84px',
        'heading-tight': '-0.72px',
        'caption-sm': '-0.44px',
        'caption-xs': '2.29px',
      },
      boxShadow: {
        'capcut-sm': 'rgba(13, 13, 18, 0.04) 0px 1px 4px 0px',
        'capcut-cyan': '0 0 24px rgba(18, 232, 255, 0.35)',
        'capcut-cyan-lg': '0 0 40px rgba(18, 232, 255, 0.5)',
      },
      screens: {
        mobile: '375px',
        tablet: '768px',
        'tablet-lg': '1024px',
        desktop: '1280px',
        'desktop-xl': '1440px',
      },
    },
  },
  plugins: [],
};
