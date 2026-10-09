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
    familyName: 'KITT Monochrome',
    familyColor: '#FFFFFF',
    description: 'Classical neutral palette: Black, Graphite, Silver, Alabaster.',
    darkPreset: 'kitt_sovereign',
    lightPreset: 'kitt_sovereign',
    darkName: 'KITT Monochrome (Black & White)',
    lightName: 'KITT Monochrome (Black & White)',
  },
  {
    familyId: 'gold',
    familyName: 'KITT Graphite',
    familyColor: '#FFFFFF',
    description: 'Black void with silver logic traces and graphite accents.',
    darkPreset: 'kitt_sovereign',
    lightPreset: 'kitt_sovereign_light',
    darkName: 'Sovereign Graphite',
    lightName: 'Sovereign Graphite',
  },
  {
    familyId: 'emerald',
    familyName: 'KITT Silver',
    familyColor: '#8F8F8F',
    description: 'Silver traces against a black void foundation.',
    darkPreset: 'emerald',
    lightPreset: 'emerald_light',
    darkName: 'Sovereign Silver',
    lightName: 'Sovereign Silver',
  },
  {
    familyId: 'cyberpunk',
    familyName: 'KITT Dual Matrix',
    familyColor: '#B4B4B4',
    description: 'White high signals with graphite ground traces.',
    darkPreset: 'cyberpunk',
    lightPreset: 'cyberpunk_light',
    darkName: 'Sovereign Dual Matrix',
    lightName: 'Sovereign Dual Matrix',
  },
  {
    familyId: 'cobalt',
    familyName: 'KITT Deep Void',
    familyColor: '#E8E8E8',
    description: 'High-contrast alabaster and silver on a black void.',
    darkPreset: 'cobalt',
    lightPreset: 'cobalt_light',
    darkName: 'Sovereign Deep Void',
    lightName: 'Sovereign Deep Void',
  },
  {
    familyId: 'amber',
    familyName: 'KITT Alabaster',
    familyColor: '#FFFFFF',
    description: 'Vintage CRT display aesthetic with glowing alabaster lines.',
    darkPreset: 'amber',
    lightPreset: 'amber_light',
    darkName: 'Sovereign Alabaster',
    lightName: 'Sovereign Alabaster',
  },
  {
    familyId: 'violet',
    familyName: 'KITT Sovereign Dusk',
    familyColor: '#737373',
    description: 'Deep graphite traces against black space.',
    darkPreset: 'violet',
    lightPreset: 'violet_light',
    darkName: 'Sovereign Dark Dusk',
    lightName: 'Sovereign Dark Dusk',
  },
  {
    familyId: 'monochrome',
    familyName: 'KITT Sovereign Slate',
    familyColor: '#F5F5F5',
    description: 'Minimalist alabaster traces on a black background.',
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
  name: 'KITT Monochrome (Black & White)',
  description: 'The canonical neutral aesthetic: black void, silver, graphite, alabaster.',
  primaryColor: '#FFFFFF',
  secondaryColor: '#E8E8E8',
  accentColor: '#8F8F8F',
  wireHighColor: '#FFFFFF',
  wireGlowColor: 'rgba(255, 255, 255, 0.65)',
  wireLowColor: '#29292A',
  signalPulseColor: '#E8E8E8',
  canvasBg: '#000000',
  gridDotColor: 'rgba(255, 255, 255, 0.20)',
  navBg: '#000000',
  panelBg: '#141415',
  panelBorder: 'rgba(255, 255, 255, 0.25)',
  borderTone: 'rgba(255, 255, 255, 0.25)',
  gateActiveFill: 'rgba(255, 255, 255, 0.18)',
  gateInactiveFill: 'rgba(29, 29, 30, 0.85)',
  gateActiveStroke: '#FFFFFF',
  gateInactiveStroke: 'rgba(255, 255, 255, 0.35)',
  boxActiveFill: 'rgba(143, 143, 143, 0.22)',
  boxInactiveFill: 'rgba(29, 29, 30, 0.85)',
  boxActiveStroke: '#B4B4B4',
  boxInactiveStroke: 'rgba(143, 143, 143, 0.35)',
  inputActiveFill: '#FFFFFF',
  inputActiveStroke: '#E8E8E8',
  inputKnobActive: '#000000',
  clockTraceActive: '#B4B4B4',
  ledGlowColor: 'rgba(255, 255, 255, 0.85)',
  ledActiveFill: '#FFFFFF',
  ledActiveStroke: '#E8E8E8',
  probeActiveBg: 'rgba(255, 255, 255, 0.25)',
  probeActiveText: '#F5F5F5',
  displayDigitColor: '#FFFFFF',
  displayDigitGlow: 'drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]',
  portActiveColor: '#FFFFFF',
  portInactiveColor: 'rgba(245, 245, 245, 0.4)',
  badgeActiveBg: 'rgba(255, 255, 255, 0.2)',
  badgeActiveBorder: '#FFFFFF',
  badgeActiveText: '#E8E8E8',
};

const tealSovereign: ThemeConfig = {
  ...baseSovereign,
  id: 'kitt_sovereign_light',
  name: 'KITT Silver',
  primaryColor: '#8F8F8F',
  secondaryColor: '#B4B4B4',
  accentColor: '#FFFFFF',
  wireHighColor: '#B4B4B4',
  wireGlowColor: 'rgba(143, 143, 143, 0.65)',
  signalPulseColor: '#B4B4B4',
  gateActiveStroke: '#B4B4B4',
  gateActiveFill: 'rgba(143, 143, 143, 0.2)',
  ledActiveFill: '#B4B4B4',
  ledActiveStroke: '#8F8F8F',
  ledGlowColor: 'rgba(180, 180, 180, 0.85)',
  portActiveColor: '#B4B4B4',
};

export const THEME_PRESETS: Record<ThemePreset, ThemeConfig> = {
  kitt_sovereign: baseSovereign,
  kitt_sovereign_light: tealSovereign,
  light: tealSovereign,
  crimson: { ...baseSovereign, id: 'crimson', name: 'Sovereign Dark Graphite' },
  crimson_light: { ...baseSovereign, id: 'crimson_light', name: 'Sovereign Light Graphite' },
  emerald: { ...tealSovereign, id: 'emerald', name: 'Sovereign Silver' },
  emerald_light: { ...tealSovereign, id: 'emerald_light', name: 'Sovereign Silver Light' },
  cyberpunk: { ...baseSovereign, id: 'cyberpunk', name: 'Sovereign Dual Matrix' },
  cyberpunk_light: { ...tealSovereign, id: 'cyberpunk_light', name: 'Sovereign Dual Light' },
  cobalt: { ...baseSovereign, id: 'cobalt', name: 'Sovereign Deep Void' },
  cobalt_light: { ...tealSovereign, id: 'cobalt_light', name: 'Sovereign Deep Light' },
  amber: { ...baseSovereign, id: 'amber', name: 'Sovereign Alabaster' },
  amber_light: { ...baseSovereign, id: 'amber_light', name: 'Sovereign Alabaster Light' },
  violet: { ...baseSovereign, id: 'violet', name: 'Sovereign Dark Dusk' },
  violet_light: { ...baseSovereign, id: 'violet_light', name: 'Sovereign Light Dusk' },
  monochrome: { ...baseSovereign, id: 'monochrome', name: 'Sovereign Alabaster' },
  monochrome_light: { ...baseSovereign, id: 'monochrome_light', name: 'Sovereign Alabaster Light' },
};
