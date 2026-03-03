/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  
  theme: {
    extend: {
      // Brand Colors (reference CSS custom properties)
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          light: 'var(--color-primary-light)',
          dark: 'var(--color-primary-dark)',
        },
        secondary: 'var(--color-secondary)',
        background: 'var(--color-background)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          elevated: 'var(--color-surface-elevated)',
        },
        divider: 'var(--color-divider)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
      },
      
      // Typography
      fontFamily: {
        sans: ['Roboto Flex', 'Helvetica', 'Arial', 'sans-serif'],
      },
      
      // Border Radius (M3 Scale from brand tokens)
      // Usage: sm=buttons/inputs, md=cards, lg=panels, xl=pills
      borderRadius: {
        none: '0',
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',    // 8px - buttons, inputs
        md: 'var(--radius-md)',    // 12px - cards, dialogs
        lg: 'var(--radius-lg)',    // 16px - large cards, panels
        xl: 'var(--radius-xl)',    // 28px - pills, composer
        full: 'var(--radius-full)', // 9999px - chips, toggles
      },
      
      // M3 Elevation System (subtle shadows)
      // IMPORTANT: Prefer elevation-* over shadow-* for consistency
      boxShadow: {
        none: 'none',
        'elevation-1': 'var(--elevation-1)',
        'elevation-2': 'var(--elevation-2)',
        'elevation-3': 'var(--elevation-3)',
        'elevation-4': 'var(--elevation-4)',
        // Legacy aliases
        sm: 'var(--elevation-1)',
        md: 'var(--elevation-2)',
        lg: 'var(--elevation-3)',
        xl: 'var(--elevation-4)',
      },
      
      // Transitions (using brand motion tokens)
      transitionTimingFunction: {
        standard: 'var(--ease-standard)',
        emphasized: 'var(--ease-emphasized)',
        decelerate: 'var(--ease-decelerate)',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        medium: 'var(--duration-medium)',
        slow: 'var(--duration-slow)',
      },
      
      // Spacing scale extension
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
      
      // Max widths for containers
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      
      // Z-index scale
      zIndex: {
        dropdown: 'var(--z-dropdown)',
        sticky: 'var(--z-sticky)',
        fixed: 'var(--z-fixed)',
        'modal-backdrop': 'var(--z-modal-backdrop)',
        modal: 'var(--z-modal)',
        popover: 'var(--z-popover)',
        tooltip: 'var(--z-tooltip)',
      },
    },
  },
  
  plugins: [],
};
