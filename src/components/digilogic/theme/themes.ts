/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ThemeConfig, ThemePreset } from '../types/circuit';

export interface ThemeFamilyOption {
  familyId: string;
  familyName: string;
  familyColor: string;
  description: string;
  darkPreset: ThemePreset;
  lightPreset: ThemePreset;
  darkName: string;
  lightName: string;
}

export const THEME_FAMILIES: ThemeFamilyOption[] = [
  {
    familyId: 'sovereign',
    familyName: 'KITT Sovereign Luxury',
    familyColor: '#A58D66',
    description: 'Classical 4-color palette: Obsidian Void, Alabaster Sand, Antique Gold, Oceanic Teal.',
    darkPreset: 'kitt_sovereign',
    lightPreset: 'kitt_sovereign',
    darkName: 'KITT Sovereign (Obsidian & Gold)',
    lightName: 'KITT Sovereign (Obsidian & Gold)',
  },
  {
    familyId: 'gold',
    familyName: 'KITT Sovereign Gold',
    familyColor: '#A58D66',
    description: 'Obsidian void with antique gold logic traces and oceanic teal accents.',
    darkPreset: 'kitt_sovereign',
    lightPreset: 'kitt_sovereign_light',
    darkName: 'Sovereign Antique Gold',
    lightName: 'Sovereign Antique Gold',
  },
  {
    familyId: 'emerald',
    familyName: 'KITT Sovereign Teal',
    familyColor: '#407E8C',
    description: 'Deep oceanic teal traces against obsidian void foundation.',
    darkPreset: 'emerald',
    lightPreset: 'emerald_light',
    darkName: 'Sovereign Oceanic Teal',
    lightName: 'Sovereign Oceanic Teal',
  },
  {
    familyId: 'cyberpunk',
    familyName: 'KITT Dual Matrix',
    familyColor: '#76B4C2',
    description: 'Antique gold high signals with oceanic teal ground traces.',
    darkPreset: 'cyberpunk',
    lightPreset: 'cyberpunk_light',
    darkName: 'Sovereign Dual Matrix',
    lightName: 'Sovereign Dual Matrix',
  },
  {
    familyId: 'cobalt',
    familyName: 'KITT Deep Void',
    familyColor: '#DFCCA8',
    description: 'High-contrast alabaster sand and antique gold on obsidian void.',
    darkPreset: 'cobalt',
    lightPreset: 'cobalt_light',
    darkName: 'Sovereign Deep Void',
    lightName: 'Sovereign Deep Void',
  },
  {
    familyId: 'amber',
    familyName: 'KITT Amber Gold',
    familyColor: '#A58D66',
    description: 'Vintage warm CRT display aesthetic with glowing antique gold lines.',
    darkPreset: 'amber',
    lightPreset: 'amber_light',
    darkName: 'Sovereign Amber Gold',
    lightName: 'Sovereign Amber Gold',
  },
  {
    familyId: 'violet',
    familyName: 'KITT Sovereign Dusk',
    familyColor: '#8C7654',
    description: 'Rich deep bronze and gold traces against obsidian space.',
    darkPreset: 'violet',
    lightPreset: 'violet_light',
    darkName: 'Sovereign Dark Dusk',
    lightName: 'Sovereign Dark Dusk',
  },
  {
    familyId: 'monochrome',
    familyName: 'KITT Sovereign Slate',
    familyColor: '#E5E1DD',
    description: 'Minimalist alabaster sand traces with obsidian background.',
    darkPreset: 'monochrome',
    lightPreset: 'monochrome_light',
    darkName: 'Sovereign Alabaster',
    lightName: 'Sovereign Alabaster',
  },
];

export function getCounterpartTheme(current: ThemePreset, targetMode: 'dark' | 'light'): ThemePreset {
  return 'kitt_sovereign';
}

export function getThemeMode(preset: ThemePreset): 'dark' | 'light' {
  return 'dark';
}

const baseSovereign: ThemeConfig = {
  id: 'kitt_sovereign',
  name: 'KITT Sovereign (Obsidian & Gold)',
  description: 'The canonical 4-color aesthetic: Obsidian Void, Antique Gold, Oceanic Teal, Alabaster Sand.',
  primaryColor: '#A58D66',
  secondaryColor: '#DFCCA8',
  accentColor: '#407E8C',
  wireHighColor: '#A58D66',
  wireGlowColor: 'rgba(165, 141, 102, 0.65)',
  wireLowColor: '#1d2c38',
  signalPulseColor: '#DFCCA8',
  canvasBg: '#080f14',
  gridDotColor: 'rgba(165, 141, 102, 0.20)',
  navBg: '#080f14',
  panelBg: '#0d171f',
  panelBorder: 'rgba(165, 141, 102, 0.25)',
  borderTone: 'rgba(165, 141, 102, 0.25)',
  gateActiveFill: 'rgba(165, 141, 102, 0.18)',
  gateInactiveFill: 'rgba(13, 23, 30, 0.85)',
  gateActiveStroke: '#A58D66',
  gateInactiveStroke: 'rgba(165, 141, 102, 0.35)',
  boxActiveFill: 'rgba(64, 126, 140, 0.22)',
  boxInactiveFill: 'rgba(13, 23, 30, 0.85)',
  boxActiveStroke: '#76B4C2',
  boxInactiveStroke: 'rgba(64, 126, 140, 0.35)',
  inputActiveFill: '#A58D66',
  inputActiveStroke: '#DFCCA8',
  inputKnobActive: '#080f14',
  clockTraceActive: '#76B4C2',
  ledGlowColor: 'rgba(165, 141, 102, 0.85)',
  ledActiveFill: '#A58D66',
  ledActiveStroke: '#DFCCA8',
  probeActiveBg: 'rgba(165, 141, 102, 0.25)',
  probeActiveText: '#E5E1DD',
  displayDigitColor: '#A58D66',
  displayDigitGlow: 'drop-shadow-[0_0_10px_rgba(165,141,102,0.7)]',
  portActiveColor: '#A58D66',
  portInactiveColor: 'rgba(229, 225, 221, 0.4)',
  badgeActiveBg: 'rgba(165, 141, 102, 0.2)',
  badgeActiveBorder: '#A58D66',
  badgeActiveText: '#DFCCA8',
};

const tealSovereign: ThemeConfig = {
  ...baseSovereign,
  id: 'kitt_sovereign_light',
  name: 'KITT Sovereign Teal',
  primaryColor: '#407E8C',
  secondaryColor: '#76B4C2',
  accentColor: '#A58D66',
  wireHighColor: '#76B4C2',
  wireGlowColor: 'rgba(64, 126, 140, 0.65)',
  signalPulseColor: '#76B4C2',
  gateActiveStroke: '#76B4C2',
  gateActiveFill: 'rgba(64, 126, 140, 0.2)',
  ledActiveFill: '#76B4C2',
  ledActiveStroke: '#407E8C',
  ledGlowColor: 'rgba(118, 180, 194, 0.85)',
  portActiveColor: '#76B4C2',
};

export const THEME_PRESETS: Record<ThemePreset, ThemeConfig> = {
  kitt_sovereign: baseSovereign,
  kitt_sovereign_light: tealSovereign,
  light: tealSovereign,
  crimson: { ...baseSovereign, id: 'crimson', name: 'Sovereign Dark Gold' },
  crimson_light: { ...baseSovereign, id: 'crimson_light', name: 'Sovereign Light Gold' },
  emerald: { ...tealSovereign, id: 'emerald', name: 'Sovereign Oceanic Teal' },
  emerald_light: { ...tealSovereign, id: 'emerald_light', name: 'Sovereign Oceanic Light' },
  cyberpunk: { ...baseSovereign, id: 'cyberpunk', name: 'Sovereign Dual Matrix' },
  cyberpunk_light: { ...tealSovereign, id: 'cyberpunk_light', name: 'Sovereign Dual Light' },
  cobalt: { ...baseSovereign, id: 'cobalt', name: 'Sovereign Deep Void' },
  cobalt_light: { ...tealSovereign, id: 'cobalt_light', name: 'Sovereign Deep Light' },
  amber: { ...baseSovereign, id: 'amber', name: 'Sovereign Amber Gold' },
  amber_light: { ...baseSovereign, id: 'amber_light', name: 'Sovereign Amber Light' },
  violet: { ...baseSovereign, id: 'violet', name: 'Sovereign Dark Dusk' },
  violet_light: { ...baseSovereign, id: 'violet_light', name: 'Sovereign Light Dusk' },
  monochrome: { ...baseSovereign, id: 'monochrome', name: 'Sovereign Alabaster' },
  monochrome_light: { ...baseSovereign, id: 'monochrome_light', name: 'Sovereign Alabaster Light' },
};
