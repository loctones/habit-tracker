/**
 * Monokai Pro color palette and shared style tokens.
 *
 * All color values in the app are sourced from this file. No component
 * should define a hex color inline — this ensures the theme can be
 * updated in one place and all components stay consistent.
 */
export const C = {
  bg:      '#2d2a2e',
  surface: '#403e41',
  overlay: '#5b5a5c',
  muted:   '#727072',
  subtle:  '#939293',
  text:    '#fcfcfa',
  yellow:  '#ffd866',
  orange:  '#fc9867',
  red:     '#ff6188',
  purple:  '#ab9df2',
  green:   '#a9dc76',
  cyan:    '#78dce8',
};

/**
 * Shared spacing, radius, and typography tokens.
 *
 * Using named tokens rather than raw numbers makes layout adjustments
 * easier and keeps the visual rhythm consistent across components.
 */
export const T = {
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: {
    xs:  13,
    sm:  15,
    md:  17,
    lg:  20,
    xl:  24,
  },
  radius: { sm: 2, md: 4, lg: 8 },
  space:  { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
};
