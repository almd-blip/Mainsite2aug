/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AccessibilitySettings } from '../types';

interface BrandLogoProps {
  settings?: AccessibilitySettings;
  /** Tailwind width classes, e.g. "w-40" (160px) or "w-36". */
  className?: string;
  /** Accessible label. */
  label?: string;
}

const INDIGO_LOGO = '/second-thought-logo.png';
const DARK_LOGO = '/second-thought-logo-on-dark.png';

/**
 * Returns true when the active theme uses a dark background, in which case the
 * cream logo variant is shown so it stays visible. This mirrors the background
 * colours chosen in the theme logic (dark, high-contrast, low-vision, and the
 * light-mode "high contrast" colour preference all render dark backgrounds).
 */
export function isDarkLogoNeeded(settings?: AccessibilitySettings): boolean {
  if (!settings) return false;
  const mode = settings.displayMode || 'light';
  if (mode === 'dark' || mode === 'high-contrast' || mode === 'low-vision') {
    return true;
  }
  if (settings.contrast === 'high') {
    return true;
  }
  return false;
}

/**
 * The Second Thought wordmark. Picks the indigo variant for light backgrounds
 * and the cream variant for dark backgrounds so the logo stays calm and legible
 * in every theme. Left-aligned by default; sizing comes from `className`.
 */
export default function BrandLogo({ settings, className = 'w-36', label = 'Second Thought' }: BrandLogoProps) {
  const src = isDarkLogoNeeded(settings) ? DARK_LOGO : INDIGO_LOGO;
  return (
    <img
      src={src}
      alt={label}
      aria-label={label}
      role="img"
      className={`h-auto select-none ${className}`}
      id="brand-logo"
      style={{ display: 'block' }}
    />
  );
}
