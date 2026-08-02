/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Info } from 'lucide-react';

interface AccessibilityControlsProps {
  className?: string;
}

export const AccessibilityControls: React.FC<AccessibilityControlsProps> = ({ className = '' }) => {
  const [privacyInfoOpen, setPrivacyInfoOpen] = useState(false);

  return (
    <div
      className={`border border-[#1B0A3B]/15 dark:border-slate-700 rounded-2xl p-3.5 bg-white/70 dark:bg-slate-900/70 text-xs text-left space-y-2.5 text-[#1B0A3B] dark:text-slate-100 ${className}`}
      id="st-practice-engine-accessibility-panel"
      aria-label="Practice Engine Accessibility & Privacy Settings"
    >
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-[#1D9E75] dark:text-[#8CE0C6] shrink-0" />
          <span className="font-bold text-[11px] text-[#1B0A3B] dark:text-slate-100">
            Privacy First: Saved Only on This Device
          </span>
        </div>

        <button
          type="button"
          onClick={() => setPrivacyInfoOpen(!privacyInfoOpen)}
          className="text-[10px] underline font-semibold text-[#1B0A3B] dark:text-slate-200 hover:opacity-100 cursor-pointer flex items-center gap-1"
        >
          <Info className="w-3 h-3" />
          <span>{privacyInfoOpen ? 'Hide Privacy details' : 'Privacy Info'}</span>
        </button>
      </div>

      {privacyInfoOpen && (
        <div className="p-3 bg-[#1B0A3B]/[0.02] dark:bg-slate-800/80 border border-[#1B0A3B]/10 dark:border-slate-700 rounded-xl space-y-1 text-[11px] leading-relaxed text-[#1B0A3B] dark:text-slate-200">
          <p className="font-bold text-[#1B0A3B] dark:text-slate-100">
            Your reflections stay private on this device:
          </p>
          <ul className="list-disc pl-4 space-y-0.5 opacity-90">
            <li>Conversations are kept in this browser's local storage and can be cleared or exported at any time.</li>
            <li>No user profiles, memory models, or advertising identifiers are created.</li>
            <li>Fully compatible with screen readers, keyboard navigation, and custom font scaling.</li>
          </ul>
        </div>
      )}
    </div>
  );
};
