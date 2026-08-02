/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sliders, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AccessibilitySettings } from '../types';
import AccessibilityPanel from './AccessibilityPanel';

interface CollapsibleAccessibilitySectionProps {
  settings: AccessibilitySettings;
  onChange: (settings: AccessibilitySettings) => void;
  appModules?: string[];
  defaultOpen?: boolean;
}

export default function CollapsibleAccessibilitySection({
  settings,
  onChange,
  appModules = [],
  defaultOpen = false
}: CollapsibleAccessibilitySectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="pt-8 border-t border-current/10 space-y-4 text-left" id="collapsible-accessibility-section">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl border border-current/15 bg-current/[0.02] hover:bg-current/[0.04] transition-all cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-current group"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#1B0A3B]/10 text-[#1B0A3B] dark:text-[#C9C2DC] shrink-0">
            <Sliders className="w-4 h-4 shrink-0" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight">
              Accessibility & Comfort Settings
            </h3>
            <p className="text-xs opacity-60 mt-0.5">
              Font: <span className="font-semibold capitalize">{settings.fontSize}</span> • Motion: <span className="font-semibold">{settings.reducedMotion ? 'Reduced' : 'Standard'}</span> • Sound: <span className="font-semibold">{settings.soundEnabled ? 'Enabled' : 'Disabled'}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold opacity-80 group-hover:opacity-100 shrink-0">
          <span>{isOpen ? 'Collapse settings' : 'Expand settings'}</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border border-current/10 rounded-2xl p-6 md:p-8 bg-current/[0.01]"
          >
            <AccessibilityPanel settings={settings} onChange={onChange} appModules={appModules} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
