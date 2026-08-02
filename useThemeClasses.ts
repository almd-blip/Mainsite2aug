/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AccessibilitySettings } from '../types';

/**
 * Shared theme-class generator used by App, ArrivalScreen and HomeScreen so the
 * same theme logic lives in exactly one place instead of being duplicated.
 *
 * Display modes (dark / high-contrast / low-vision) take priority because they
 * intentionally override the brand palette for accessibility. In light mode the
 * user's colour preference and contrast level drive the palette. The brand
 * default is indigo (#1B0A3B) text on warm paper (#faf8f5).
 */
export function useThemeClasses(settings: AccessibilitySettings): string {
  const mode = settings.displayMode || 'light';
  const isHigh = settings.contrast === 'high';
  const isWarm = settings.contrast === 'warm';

  // Display modes take priority so the container always matches the theme.
  if (mode === 'dark') {
    return 'bg-[#111215] text-[#f3f4f6] border-[#27272a]';
  }
  if (mode === 'high-contrast') {
    return 'bg-[#000000] text-[#ffffff] border-[#ffffff]';
  }
  if (mode === 'low-vision') {
    return 'bg-[#050502] text-[#fef08a] border-[#eab308]';
  }

  // Light-mode colour preferences (design brand default is indigo on warm paper).
  if (settings.colorPreference === 'grayscale') {
    if (isHigh) return 'bg-black text-white border-white';
    if (isWarm) return 'bg-stone-100 text-stone-900 border-stone-300';
    return 'bg-stone-50 text-stone-900 border-stone-200';
  }

  if (settings.colorPreference === 'amber') {
    if (isHigh) return 'bg-[#1c0a00] text-[#fff7ed] border-[#ea580c]';
    if (isWarm) return 'bg-[#fef3c7] text-[#451a03] border-[#f59e0b]';
    return 'bg-[#faf6f0] text-[#7c2d12] border-[#ffedd5]';
  }

  if (settings.colorPreference === 'cream') {
    if (isHigh) return 'bg-[#1c1917] text-[#fafaf9] border-[#d6d3d1]';
    if (isWarm) return 'bg-[#f4ebd0] text-[#292524] border-[#d6c59d]';
    return 'bg-[#faf8f5] text-[#1c1917] border-[#e7e5e4]';
  }

  // Default brand palette (slate)
  if (isHigh) return 'bg-slate-950 text-slate-50 border-slate-100';
  if (isWarm) return 'bg-[#faf9f6] text-[#1B0A3B] border-slate-300';
  return 'bg-[#faf8f5] text-[#1B0A3B] border-[#e7e5e4]';
}
