/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScreenState, AccessibilitySettings, ActiveTab, AppConfig, DEFAULT_ACCESSIBILITY_SETTINGS } from './types';
import { APP_CONFIGS } from './data';
import ArrivalScreen from './components/ArrivalScreen';
import ChoiceScreen from './components/ChoiceScreen';
import HomeScreen from './components/HomeScreen';
import AdminCms from './cms/AdminCms';
import { storage } from './lib/storage';
import { useThemeClasses } from './hooks/useThemeClasses';

export default function App() {
  // Screen Router state
  const [screen, setScreen] = useState<ScreenState>('arrival');

  // Reset browser scroll when moving between the arrival, choice, and home screens.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [screen]);

  // Selected Second Thought App Workspace (default: Companion)
  const [activeApp, setActiveApp] = useState<AppConfig>(() => {
    const saved = (storage.getItem('st_active_app_id', '') as string) || '';
    const matched = APP_CONFIGS.find(a => a.id === saved);
    return matched || APP_CONFIGS[0];
  });

  // Global Accessibility Settings
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = (storage.getItem('st_accessibility_settings', {}) as Partial<AccessibilitySettings>) || {};
    return {
      ...DEFAULT_ACCESSIBILITY_SETTINGS,
      ...saved,
      activeModules: saved.activeModules || APP_CONFIGS[0].modules
    };
  });

  // Expansion target state for Choice Screen -> Home transition
  const [initialExpandedTab, setInitialExpandedTab] = useState<ActiveTab>('workspace');

  // Sync state to portable Storage Layer
  useEffect(() => {
    storage.setItem('st_active_app_id', activeApp.id);
  }, [activeApp]);

  useEffect(() => {
    storage.setItem('st_accessibility_settings', settings);
    if (settings.displayMode === 'dark' || settings.displayMode === 'high-contrast') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  // Lazy-initialized Web Audio API for ticking/chime auditory cues
  const audioContextRef = useRef<AudioContext | null>(null);

  const playTick = (freq: number, dur = 0.1) => {
    if (!settings.soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch (e) {
      // Browsers block audio prior to user interaction
    }
  };

  // Build the layout style modifiers dynamically to alter baseline typography scale & theme colors
  const getLayoutStyles = (): React.CSSProperties => {
    const isHigh = settings.contrast === 'high';
    const isWarm = settings.contrast === 'warm';

    let bgColor = '#faf8f5';
    let textColor = '#1B0A3B';

    if (settings.displayMode === 'dark') {
      bgColor = '#111215';
      textColor = '#f3f4f6';
    } else if (settings.displayMode === 'high-contrast') {
      bgColor = '#000000';
      textColor = '#ffffff';
    } else if (settings.displayMode === 'low-vision') {
      bgColor = '#050502';
      textColor = '#fef08a';
    } else if (settings.colorPreference === 'grayscale') {
      if (isHigh) { bgColor = '#000000'; textColor = '#ffffff'; }
      else if (isWarm) { bgColor = '#f5f5f4'; textColor = '#1c1917'; }
      else { bgColor = '#fafaf9'; textColor = '#1c1917'; }
    } else if (settings.colorPreference === 'amber') {
      if (isHigh) { bgColor = '#1c0a00'; textColor = '#fff7ed'; }
      else if (isWarm) { bgColor = '#fef3c7'; textColor = '#451a03'; }
      else { bgColor = '#faf6f0'; textColor = '#7c2d12'; }
    } else if (settings.colorPreference === 'cream') {
      if (isHigh) { bgColor = '#1c1917'; textColor = '#fafaf9'; }
      else if (isWarm) { bgColor = '#f4ebd0'; textColor = '#292524'; }
      else { bgColor = '#faf8f5'; textColor = '#1c1917'; }
    } else {
      if (isHigh) { bgColor = '#020617'; textColor = '#f8fafc'; }
      else if (isWarm) { bgColor = '#faf9f6'; textColor = '#1B0A3B'; }
      else { bgColor = '#faf8f5'; textColor = '#1B0A3B'; }
    }

    const styles: React.CSSProperties & Record<string, string> = {
      '--bg-color': bgColor,
      '--text-color': textColor,
      color: textColor,
      backgroundColor: bgColor
    };

    // Baseline viewport scale to scale all rem / em units proportionally
    if (settings.fontSize === 'extra-large') {
      styles.fontSize = '18px';
    } else if (settings.fontSize === 'large') {
      styles.fontSize = '16px';
    } else {
      styles.fontSize = '14px';
    }

    // Letter spacing scale
    if (settings.letterSpacing === 'extra-wide') {
      styles.letterSpacing = '0.15em';
    } else if (settings.letterSpacing === 'wide') {
      styles.letterSpacing = '0.05em';
    } else {
      styles.letterSpacing = 'normal';
    }

    // Line height scale
    if (settings.lineHeight === 'spacious') {
      styles.lineHeight = '2.25';
    } else if (settings.lineHeight === 'double') {
      styles.lineHeight = '2';
    } else {
      styles.lineHeight = '1.625';
    }

    return styles;
  };

  const handleSelectTabFromChoice = (tab: ActiveTab) => {
    setInitialExpandedTab(tab);
    setScreen('home');
    playTick(523, 0.2); // Welcome tone
  };

  // Theme classes come from the shared hook so the same logic is not duplicated.
  const themeClasses = useThemeClasses(settings);

  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
    return <AdminCms />;
  }

  return (
    <div
      style={getLayoutStyles()}
      className={`min-h-screen font-sans antialiased text-left selection:bg-current selection:text-background transition-colors duration-200 ${themeClasses} ${
        settings.dyslexiaFont ? 'dyslexia-mode' : ''
      } ${settings.enhancedFocus ? 'enhanced-focus' : ''}`}
      id="second-thought-shell-root"
    >
      <AnimatePresence mode="wait">
        {screen === 'arrival' && (
          <motion.div
            key="arrival"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={settings.reducedMotion ? { opacity: 0 } : { opacity: 0, transition: { duration: 3.5, ease: 'easeInOut' } }}
            className="w-full"
          >
            <ArrivalScreen
              onContinue={() => {
                setScreen('choice');
                playTick(440, 0.15);
              }}
              settings={settings}
              onSettingsChange={setSettings}
              appModules={activeApp.modules}
            />
          </motion.div>
        )}

        {screen === 'choice' && (
          <motion.div
            key="choice"
            initial={settings.reducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={settings.reducedMotion ? { opacity: 0 } : { opacity: 0, transition: { duration: 1.5, ease: 'easeInOut' } }}
            transition={settings.reducedMotion ? { duration: 0 } : { duration: 3.5, ease: 'easeInOut' }}
            className="w-full"
          >
            <ChoiceScreen
              appName={activeApp.name}
              onSelect={handleSelectTabFromChoice}
              reducedMotion={settings.reducedMotion}
              onResetToArrival={() => {
                setScreen('arrival');
                playTick(330, 0.2);
              }}
              settings={settings}
            />
          </motion.div>
        )}

        {screen === 'home' && (
          <motion.div
            key="home"
            initial={settings.reducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={settings.reducedMotion ? { duration: 0 } : { duration: 1.0, ease: 'easeInOut' }}
            className="w-full"
          >
            <HomeScreen
              activeApp={activeApp}
              onAppChange={setActiveApp}
              settings={settings}
              onSettingsChange={setSettings}
              initialExpandedTab={initialExpandedTab}
              onResetToArrival={() => {
                setScreen('arrival');
                playTick(330, 0.2);
              }}
              onResetToChoice={() => {
                setScreen('choice');
                playTick(440, 0.15);
              }}
              playTick={playTick}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

