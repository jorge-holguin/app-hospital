/**
 * Hospital App Theme - Modular color system
 * Change the HospitalColors object to easily update the entire app theme.
 */

import { Platform } from 'react-native';

// ============================================================
// MODULAR HOSPITAL COLORS - Change these to restyle the whole app
// ============================================================
export const HospitalColors = {
  // Primary celeste/azulado
  primary: '#0891B2',         // Cyan-600 — main hospital teal
  primaryDark: '#0E7490',     // Cyan-700
  primaryLight: '#22D3EE',    // Cyan-400
  primarySoft: '#CFFAFE',     // Cyan-50

  // Gradients
  gradientStart: '#0E7490',
  gradientMiddle: '#06B6D4',
  gradientEnd: '#ECFEFF',

  // Accent (deeper blue for contrast)
  accent: '#0284C7',          // Sky-600
  accentLight: '#E0F2FE',     // Sky-100

  // Status colors
  statusReady: '#D1FAE5',
  statusReadyText: '#065F46',
  statusProcess: '#FEF3C7',
  statusProcessText: '#92400E',
  statusPending: '#FFE4E6',
  statusPendingText: '#9F1239',

  // Neutrals
  white: '#FFFFFF',
  background: '#F0FDFA',      // Teal-50 tinted bg
  card: '#FFFFFF',
  textPrimary: '#0F172A',     // Slate-900
  textSecondary: '#475569',   // Slate-600
  textLight: '#94A3B8',       // Slate-400
  border: '#E2E8F0',          // Slate-200
  inputBg: '#F8FAFC',         // Slate-50
  shadow: '#000000',

  // Category cards (Orders menu)
  categoryLab: '#FEF3C7',
  categoryRayosX: '#D1FAE5',
  categoryEcografia: '#EDE9FE',
  categoryTomografia: '#E0F2FE',

  // Patient types
  pagante: '#059669',
  sis: '#2563EB',
  soat: '#7C3AED',

  // Appointment status
  citado: '#059669',
  pendiente: '#D97706',
  denegado: '#DC2626',
  eliminado: '#6B7280',
};

const tintColorLight = HospitalColors.primary;
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: HospitalColors.textPrimary,
    background: HospitalColors.background,
    tint: tintColorLight,
    icon: HospitalColors.textLight,
    tabIconDefault: HospitalColors.textLight,
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
