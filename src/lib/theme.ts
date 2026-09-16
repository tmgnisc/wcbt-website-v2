/**
 * Chart libraries need literal colour values rather than Tailwind classes.
 * These mirror the `--color-wcbt-*` tokens declared in src/index.css.
 */
export const WCBT_COLORS = {
  maroon: '#8b1a2b',
  maroonDark: '#6e1420',
  maroonLight: '#b23a4c',
  cream: '#f5f0ee',
  surface: '#ffffff',
  ink: '#1e1e1e',
  muted: '#6b7280',
  success: '#2f855a',
  warning: '#b7791f',
  danger: '#c53030',
} as const;

/** Donut/legend sequence for department and program breakdowns. */
export const CHART_SEQUENCE = [
  WCBT_COLORS.maroon,
  WCBT_COLORS.maroonLight,
  '#c96b7a',
  '#d99aa4',
  '#e6c0c6',
  WCBT_COLORS.maroonDark,
  '#a34b59',
  '#8f6f74',
];
