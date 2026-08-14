// ─────────────────────────────────────────────────────────────────────────────
// chart-theme.util.ts
// Defines light/dark palettes and resolves the correct palette for a theme.
// IMPORTANT: Sets Chart.js global RTL + font defaults — must be imported before
//            any Chart instance is created.
// ─────────────────────────────────────────────────────────────────────────────
import { Chart } from 'chart.js/auto';
import { ChartPalette, ChartTheme } from '../models/chart.models';

// ── Apply Chart.js global RTL / font defaults (runs once on module load) ──────
Chart.defaults.plugins.legend.rtl = true;
Chart.defaults.font.family = 'inherit';

// ── Light palette ─────────────────────────────────────────────────────────────
export const LIGHT_PALETTE: ChartPalette = {
  background: '#ffffff',
  gridLines: '#e5e7eb',
  tickColor: '#6b7280',
  tooltipBackground: '#1f2937',
  tooltipText: '#f9fafb',
  seriesColors: [
    '#6366f1', // indigo
    '#22c55e', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#3b82f6', // blue
    '#a855f7', // purple
    '#14b8a6', // teal
    '#f97316', // orange
  ],
};

// ── Dark palette ──────────────────────────────────────────────────────────────
export const DARK_PALETTE: ChartPalette = {
  background: '#1e1e2e',
  gridLines: '#374151',
  tickColor: '#9ca3af',
  tooltipBackground: '#e2e8f0',
  tooltipText: '#1e1e2e',
  seriesColors: [
    '#818cf8', // lighter indigo
    '#4ade80', // lighter green
    '#fbbf24', // lighter amber
    '#f87171', // lighter red
    '#60a5fa', // lighter blue
    '#c084fc', // lighter purple
    '#2dd4bf', // lighter teal
    '#fb923c', // lighter orange
  ],
};

/** Resolves the colour palette for the given theme. */
export function resolvePalette(theme: ChartTheme): ChartPalette {
  return theme === 'dark' ? DARK_PALETTE : LIGHT_PALETTE;
}
