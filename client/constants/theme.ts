/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * Trail app theme (purple/lavender) is in TrailColors.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

/** Trail / The Trail app UI palette */
export const TrailColors = {
  background: '#f7f2ff',
  surface: '#ffffff',
  cardBorder: 'rgba(255,255,255,0.6)',
  textPrimary: '#16141f',
  textSecondary: '#5f5a73',
  textMuted: '#8a83a3',
  textBody: '#2f254b',
  textCaption: '#6b6286',
  accent: '#2f254b',
  accentBg: '#e8dcff',
  accentBgHover: '#d6c9ff',
  borderButton: '#6b6286',
  emerald: {
    dot: '#10b981',
    bg: '#d1fae5',
    text: '#047857',
    border: '#a7f3d0',
  },
  cyan: { border: '#22d3ee', bg: '#cffafe' },
  purple: { border: '#c4b5fd', bg: '#ede9fe' },
  rose: { bg: '#ffe4e6', text: '#be123c' },
  amber: { bg: '#fef3c7', text: '#b45309' },
  shadow: 'rgba(58,38,97,0.25)',
  shadowCard: 'rgba(87,61,140,0.12)',
};

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
