/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AccessibilitySettings } from '../types';
import AccessibilityPanel from './AccessibilityPanel';
import { Sliders, X, Sparkles, Eye, Heart } from 'lucide-react';

interface GlobalAccessibilityDrawerProps {
  settings: AccessibilitySettings;
  onSettingsChange: (settings: AccessibilitySettings) => void;
  appModules?: string[];
  playTick?: (freq: number, dur?: number) => void;
}

export default function GlobalAccessibilityDrawer({
  settings,
  onSettingsChange,
  appModules = [],
  playTick
}: GlobalAccessibilityDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerBtnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Keyboard shortcut listener (Alt + A or Option + A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setIsOpen(prev => !prev);
        if (playTick) playTick(500, 0.08);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        triggerBtnRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, playTick]);

  const handleOpen = () => {
    setIsOpen(true);
    if (playTick) playTick(520, 0.08);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (playTick) playTick(420, 0.08);
    triggerBtnRef.current?.focus();
  };

  return (
    <>
      {/* PERSISTENT ACCESSIBILITY CONTROL BUTTON - Visible throughout the entire website shell */}
      <div 
        className="fixed top-3 right-3 z-50 flex items-center gap-2 select-none"
        id="st-persistent-accessibility-trigger-container"
      >
        <button
          ref={triggerBtnRef}
          id="st-persistent-accessibility-btn"
          onClick={isOpen ? handleClose : handleOpen}
          aria-expanded={isOpen}
          aria-controls="st-global-accessibility-drawer"
          aria-label="Open Accessibility and Comfort Control Panel (Shortcut: Alt + A)"
          title="Accessibility & Comfort Settings (Alt + A)"
          className={`
            px-3.5 py-2 rounded-full border shadow-md font-semibold text-xs transition-all cursor-pointer flex items-center gap-2
            focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:outline-2 focus-visible:outline-offset-2
            ${
              isOpen
                ? 'bg-current text-background border-current ring-2 ring-current'
                : 'bg-background text-foreground border-current/30 hover:border-current hover:shadow-lg hover:scale-105'
            }
          `}
        >
          <Sliders className="w-4 h-4 text-[#1B0A3B] shrink-0" />
          <span className="hidden sm:inline">Accessibility & Comfort</span>
          <span className="sm:hidden">Accessibility</span>
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[9px] font-mono border rounded border-current/20 opacity-60">
            Alt+A
          </kbd>
        </button>
      </div>

      {/* OVERLAY DRAWER / MODAL DIALOG */}
      <AnimatePresence>
        {isOpen && (
          <div 
            className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity"
            id="st-accessibility-backdrop"
            onClick={(e) => {
              if (e.target === e.currentTarget) handleClose();
            }}
          >
            <motion.aside
              ref={panelRef}
              id="st-global-accessibility-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Global Accessibility and Comfort Control Panel"
              initial={settings.reducedMotion ? { opacity: 1 } : { x: '100%' }}
              animate={{ x: 0, opacity: 1 }}
              exit={settings.reducedMotion ? { opacity: 0 } : { x: '100%' }}
              transition={{ duration: settings.reducedMotion ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-xl h-full bg-background text-foreground border-l border-current/20 shadow-2xl p-6 sm:p-8 overflow-y-auto flex flex-col justify-between space-y-6"
            >
              {/* Drawer Top Bar */}
              <div className="flex justify-between items-center border-b border-current/10 pb-4" id="st-drawer-top-bar">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-[#912A4A] shrink-0" />
                  <span className="font-semibold text-sm tracking-wide">Accessibility & Comfort Controls</span>
                </div>

                <button
                  id="st-drawer-close-btn"
                  onClick={handleClose}
                  className="p-2 rounded-lg border border-current/20 hover:border-current/60 text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5"
                  aria-label="Close accessibility panel"
                >
                  <X className="w-4 h-4" />
                  <span>Close (Esc)</span>
                </button>
              </div>

              {/* Panel Content Body */}
              <div className="flex-1 overflow-y-auto pr-1" id="st-drawer-body">
                <AccessibilityPanel
                  settings={settings}
                  onChange={onSettingsChange}
                  appModules={appModules}
                  onClose={handleClose}
                />
              </div>

              {/* Drawer Footer */}
              <div className="pt-4 border-t border-current/10 text-[11px] opacity-70 flex justify-between items-center" id="st-drawer-footer">
                <span>Persisted locally in browser state</span>
                <span>Accessible design compliant</span>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
