/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GROUNDING_STEPS } from '../data';
import { Play, Pause, RotateCcw, Heart, Check, Wind, Eye, Compass, Anchor, Layers, ArrowLeft } from 'lucide-react';

interface PauseAndBreatheMenuProps {
  soundEnabled: boolean;
  reducedMotion: boolean;
  fontSize: 'standard' | 'large' | 'extra-large';
}

const EXTENDED_BREATHING = [
  {
    id: 'calm-focus',
    name: 'Calm, focus, rest & centre (5-5-5-5)',
    breatheIn: 5,
    holdIn: 5,
    breatheOut: 5,
    holdOut: 5,
    description: 'A gentle 5-second box rhythm that balances the nervous system, clears mental clutter, and builds calm focus.'
  },
  {
    id: 'relax',
    name: 'Deep relaxation (5-7-8-0)',
    breatheIn: 5,
    holdIn: 7,
    breatheOut: 8,
    holdOut: 0,
    description: 'A deeply relaxing rhythm with a long 8-second exhale that acts as a natural tranquilizer for mind and body.'
  },
  {
    id: 'calming',
    name: 'Deep calming (5-3-9-0)',
    breatheIn: 5,
    holdIn: 3,
    breatheOut: 9,
    holdOut: 0,
    description: 'Extends the exhale duration to 9 seconds to stimulate the parasympathetic nervous system and slow your heart rate.'
  },
  {
    id: 'reset',
    name: 'Reset & center (6-4-6-4)',
    breatheIn: 6,
    holdIn: 4,
    breatheOut: 6,
    holdOut: 4,
    description: 'A spacious, grounding rhythm that creates moments of restful pause between deep, intentional breath cycles.'
  }
];

const PRESENCE_SIDEBAR_ITEMS = [
  {
    id: 'texture',
    title: 'Touch three textures',
    category: 'Sensory grounding',
    icon: Eye,
    instruction: 'Identify three distinct textures surrounding you right now. Touch them gently one by one. Notice the temperature, the roughness, the soft details. Allow your focus to rest entirely on the sensation under your fingertips.'
  },
  {
    id: 'listen',
    title: 'Listen for distance',
    category: 'Auditory focus',
    icon: Compass,
    instruction: 'Close your eyes. Listen closely. Search for the most distant sound you can hear. Do not judge it, just note its presence. Now, search for the closest sound. Feel the auditory space around you.'
  },
  {
    id: 'breath',
    title: 'Acknowledge your breath',
    category: 'Breath awareness',
    icon: Wind,
    instruction: 'Do not change how you are breathing. Simply notice where the breath enters your body. Is it cold at the nostrils? Do you feel it more in your chest or your abdomen? Follow one full cycle from beginning to end.'
  },
  {
    id: 'shoulders',
    title: 'Release the shoulders',
    category: 'Somatic relaxation',
    icon: Anchor,
    instruction: 'Notice your posture. Bring your awareness to your shoulders. Are they tense? Gently let them drop. Roll them backward once, very slowly. Allow the weight to be carried by the ground underneath.'
  },
  {
    id: 'grounding-54321',
    title: '5-4-3-2-1 Grounding workbook',
    category: 'Interactive exercise',
    icon: Layers,
    instruction: 'Work through the 5-4-3-2-1 sensory technique step by step to gently return your awareness to your physical environment.'
  }
];

export default function PauseAndBreatheMenu({ soundEnabled, reducedMotion, fontSize }: PauseAndBreatheMenuProps) {
  // --- Focused Exercise State ---
  const [focusedTechnique, setFocusedTechnique] = useState<typeof EXTENDED_BREATHING[0] | null>(null);
  const [breathingPhase, setBreathingPhase] = useState<'idle' | 'inhale' | 'holdIn' | 'exhale' | 'holdOut'>('idle');
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [circlePercent, setCirclePercent] = useState(25);
  const [isPaused, setIsPaused] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const elapsedRef = useRef<number>(0);
  const lastSecondRef = useRef<number>(-1);
  const lastPhaseRef = useRef<string>('idle');

  const playTick = (freq: number, dur = 0.1) => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      
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
      // Ignored
    }
  };

  const stopBreathing = () => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    lastTimeRef.current = null;
    elapsedRef.current = 0;
    lastSecondRef.current = -1;
    lastPhaseRef.current = 'idle';
    setBreathingPhase('idle');
    setSecondsRemaining(0);
    setCirclePercent(25);
    setIsPaused(false);
  };

  const runRealTimeTick = (timestamp: number, tech: typeof EXTENDED_BREATHING[0]) => {
    if (lastTimeRef.current !== null) {
      const delta = (timestamp - lastTimeRef.current) / 1000;
      elapsedRef.current += delta;
    }
    lastTimeRef.current = timestamp;

    const { breatheIn, holdIn, breatheOut, holdOut } = tech;
    const totalCycle = breatheIn + holdIn + breatheOut + holdOut;
    const cycleTime = totalCycle > 0 ? (elapsedRef.current % totalCycle) : 0;

    let phase: 'inhale' | 'holdIn' | 'exhale' | 'holdOut' = 'inhale';
    let secs = 0;
    let pct = 25;

    if (cycleTime < breatheIn) {
      phase = 'inhale';
      const progress = breatheIn > 0 ? cycleTime / breatheIn : 1;
      const ease = (1 - Math.cos(progress * Math.PI)) / 2;
      pct = 25 + 75 * ease;
      secs = Math.ceil(breatheIn - cycleTime);
    } else if (cycleTime < breatheIn + holdIn) {
      phase = 'holdIn';
      const phaseTime = cycleTime - breatheIn;
      pct = 100;
      secs = Math.ceil(holdIn - phaseTime);
    } else if (cycleTime < breatheIn + holdIn + breatheOut) {
      phase = 'exhale';
      const phaseTime = cycleTime - (breatheIn + holdIn);
      const progress = breatheOut > 0 ? phaseTime / breatheOut : 1;
      const ease = (1 - Math.cos(progress * Math.PI)) / 2;
      pct = 100 - 75 * ease;
      secs = Math.ceil(breatheOut - phaseTime);
    } else {
      phase = 'holdOut';
      const phaseTime = cycleTime - (breatheIn + holdIn + breatheOut);
      pct = 25;
      secs = Math.ceil(holdOut - phaseTime);
    }

    setBreathingPhase(phase);
    setSecondsRemaining(secs);
    setCirclePercent(pct);

    if (phase !== lastPhaseRef.current) {
      lastPhaseRef.current = phase;
      if (phase === 'inhale') playTick(330, 0.3);
      else if (phase === 'exhale') playTick(220, 0.3);
      else playTick(261, 0.15);
    }
    lastSecondRef.current = secs;

    animFrameRef.current = requestAnimationFrame((ts) => runRealTimeTick(ts, tech));
  };

  const startBreathing = (tech: typeof EXTENDED_BREATHING[0]) => {
    stopBreathing();
    setIsPaused(false);
    lastPhaseRef.current = 'inhale';
    playTick(330, 0.25);

    animFrameRef.current = requestAnimationFrame((ts) => runRealTimeTick(ts, tech));
  };

  const pauseBreathing = () => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    lastTimeRef.current = null;
    setIsPaused(true);
  };

  const resumeBreathing = (tech: typeof EXTENDED_BREATHING[0]) => {
    setIsPaused(false);
    lastTimeRef.current = null;
    animFrameRef.current = requestAnimationFrame((ts) => runRealTimeTick(ts, tech));
  };

  const handleChooseExercise = (tech: typeof EXTENDED_BREATHING[0]) => {
    setFocusedTechnique(tech);
    startBreathing(tech);
  };

  const handleExitExercise = () => {
    stopBreathing();
    setFocusedTechnique(null);
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // --- Presence Sidebar State ---
  const [activePresenceId, setActivePresenceId] = useState<string>(PRESENCE_SIDEBAR_ITEMS[0].id);
  const [groundingInputs, setGroundingInputs] = useState<Record<number, string>>({});
  const [groundingChecked, setGroundingChecked] = useState<Record<number, boolean>>({});

  const handleCheckGrounding = (id: number) => {
    setGroundingChecked(prev => ({ ...prev, [id]: !prev[id] }));
    playTick(523, 0.1);
  };

  const resetGrounding = () => {
    setGroundingInputs({});
    setGroundingChecked({});
  };

  const selectedPresence = PRESENCE_SIDEBAR_ITEMS.find(p => p.id === activePresenceId) || PRESENCE_SIDEBAR_ITEMS[0];

  // Font size classes for visual hierarchy
  const heading2Class = fontSize === 'extra-large' ? 'text-3xl' : fontSize === 'large' ? 'text-2xl' : 'text-xl';
  const body1Class = fontSize === 'extra-large' ? 'text-lg' : fontSize === 'large' ? 'text-base' : 'text-sm';

  // --- FOCUSED EXERCISE ANIMATION VIEW ---
  // When a breathing exercise is chosen, ONLY the animation for that exercise is shown on the page.
  if (focusedTechnique) {
    return (
      <div className="w-full min-h-[75vh] flex flex-col items-start justify-between py-12 px-4 text-left space-y-12" id="focused-breathing-view">
        
        {/* Top bar with back button */}
        <div className="w-full max-w-2xl flex items-center justify-between text-left" id="focused-breathing-topbar">
          <button
            id="exit-breathing-btn"
            onClick={handleExitExercise}
            className="px-4 py-2 border border-current/25 hover:border-current/60 rounded-full text-xs font-semibold cursor-pointer flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-current"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to exercise list</span>
          </button>
          <span className="text-xs font-semibold opacity-60 tracking-wider text-left" id="focused-tech-badge">
            Breathing practice
          </span>
        </div>

        {/* Center Stage: Title & Animation */}
        <div className="w-full max-w-xl flex flex-col items-start space-y-8 my-auto text-left" id="focused-breathing-stage">
          <div className="space-y-2 text-left w-full" id="focused-breathing-title-group">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-left" id="focused-breathing-name">
              {focusedTechnique.name}
            </h2>
            <p className="text-sm opacity-75 max-w-md leading-relaxed text-left" id="focused-breathing-desc">
              {focusedTechnique.description}
            </p>
          </div>

          {/* Animated Slow Motion Sphere Stage */}
          <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center my-6" id="focused-circle-container">
            {/* Outer Soft Aura Sphere */}
            <div
              id="focused-circle-glow"
              className="absolute rounded-full bg-current/[0.04] border border-current/10 transition-none"
              style={{
                width: `${Math.min(100, circlePercent + 15)}%`,
                height: `${Math.min(100, circlePercent + 15)}%`
              }}
            />

            {/* Main Slow Motion Sphere */}
            <div
              id="focused-circle-ring"
              className="absolute rounded-full bg-current/[0.08] border-2 border-current/25 flex items-center justify-center transition-none shadow-sm"
              style={{
                width: `${circlePercent}%`,
                height: `${circlePercent}%`
              }}
            >
              {/* Inner Core Sphere */}
              <div
                className="w-full h-full rounded-full bg-current/[0.05] border border-current/15"
              />
            </div>

            {/* Center Phase Text Label (No Number Countdown) */}
            <div className="z-10 flex flex-col items-start justify-center space-y-1 select-none text-left px-4" id="focused-phase-info">
              <span className="text-lg md:text-xl font-medium tracking-wide opacity-90 capitalize" id="focused-phase-label">
                {breathingPhase === 'inhale' ? 'Inhale' :
                 breathingPhase === 'holdIn' ? 'Hold' :
                 breathingPhase === 'exhale' ? 'Exhale' : 'Pause'}
              </span>
            </div>
          </div>

          {/* Phase Guidance Prompt text aligned with animation */}
          <div className="text-xs md:text-sm font-medium opacity-70 tracking-wide text-left min-h-[1.5rem]" id="focused-phase-guidance">
            {breathingPhase === 'inhale' && 'Inhale gently as the circle expands...'}
            {breathingPhase === 'holdIn' && 'Keep your chest relaxed and comfortable...'}
            {breathingPhase === 'exhale' && 'Let go of tension as the circle contracts...'}
            {breathingPhase === 'holdOut' && 'Rest quietly in stillness before the next inhale...'}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 pt-4 text-left" id="focused-controls">
            {breathingPhase !== 'idle' ? (
              <button
                id="pause-exercise-btn"
                onClick={() => {
                  if (isPaused) {
                    resumeBreathing(focusedTechnique);
                  } else {
                    pauseBreathing();
                  }
                }}
                className="px-6 py-2.5 bg-foreground text-background rounded-full text-xs font-semibold hover:opacity-90 cursor-pointer flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-current"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>
            ) : (
              <button
                id="restart-exercise-btn"
                onClick={() => startBreathing(focusedTechnique)}
                className="px-6 py-2.5 bg-foreground text-background rounded-full text-xs font-semibold hover:opacity-90 cursor-pointer flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                <span>Start exercise</span>
              </button>
            )}

            <button
              id="stop-exercise-btn"
              onClick={handleExitExercise}
              className="px-6 py-2.5 border border-current/20 hover:border-current/60 rounded-full text-xs font-semibold cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>End exercise</span>
            </button>
          </div>
        </div>

        <div className="text-xs opacity-50 font-mono text-left" id="focused-timing-summary">
          Inhale: {focusedTechnique.breatheIn}s {focusedTechnique.holdIn > 0 ? `• Hold: ${focusedTechnique.holdIn}s` : ''} • Exhale: {focusedTechnique.breatheOut}s {focusedTechnique.holdOut > 0 ? `• Hold: ${focusedTechnique.holdOut}s` : ''}
        </div>
      </div>
    );
  }

  // --- MAIN LIST VIEW: BREATHE FOR CALM + PAUSING AND BEING PRESENT ---
  return (
    <div className="w-full space-y-20 md:space-y-24 text-left py-6 md:py-10 text-[#1B0A3B]" id="pause-and-breathe-container">
      
      {/* SECTION 1: BREATHE FOR CALM */}
      <section className="space-y-8 md:space-y-10 text-left" id="section-breathing">
        <div className="space-y-3 text-left max-w-2xl" id="breathing-header">
          <h2 className={`${heading2Class} font-bold tracking-tight text-left`} id="breathing-h2">
            Breathe for calm
          </h2>
          <p className={`${body1Class} opacity-80 leading-relaxed text-left`} id="breathing-b1">
            Select a breathing rhythm to guide your breathing.
          </p>
        </div>

        {/* Open layout: breathing techniques separated by subtle burgundy dividers */}
        <div className="flex flex-col sm:flex-row sm:items-stretch" id="breathing-cards-grid">
          {EXTENDED_BREATHING.map((tech, index) => (
            <React.Fragment key={tech.id}>
              {index > 0 && (
                <>
                  <div aria-hidden="true" className="hidden sm:block w-[2px] bg-[#912A4A] self-stretch my-8" />
                  <div aria-hidden="true" className="sm:hidden h-[2px] bg-[#912A4A] w-2/3 mx-auto my-8" />
                </>
              )}
              <div
                id={`breathing-card-${tech.id}`}
                onClick={() => handleChooseExercise(tech)}
                tabIndex={0}
                role="button"
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleChooseExercise(tech);
                  }
                }}
                className="flex-1 px-4 sm:px-6 md:px-8 py-4 transition-opacity hover:opacity-80 text-left flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-current/40 group min-h-[220px]"
              >
                <div className="space-y-4 text-left flex-1 flex flex-col justify-start" id={`breathing-card-top-${tech.id}`}>
                  <div className="flex justify-between items-start gap-3" id={`breathing-card-title-row-${tech.id}`}>
                    <h3 className="text-lg font-bold leading-snug text-left group-hover:underline decoration-1 underline-offset-2 min-h-[2rem] flex items-center" id={`breathing-card-title-${tech.id}`}>
                      {tech.name}
                    </h3>
                    <Play className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                  </div>
                  <p className="text-xs sm:text-sm opacity-80 leading-relaxed text-left min-h-[3rem]" id={`breathing-card-desc-${tech.id}`}>
                    {tech.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-current/10 flex items-center justify-between text-xs font-mono opacity-75 text-left mt-6" id={`breathing-card-footer-${tech.id}`}>
                  <span>
                    Inhale {tech.breatheIn}s {tech.holdIn > 0 ? `• Hold ${tech.holdIn}s` : ''} • Exhale {tech.breatheOut}s
                  </span>
                  <span className="font-sans font-semibold text-xs opacity-90 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Begin →
                  </span>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* SECTION 2: PAUSING AND BEING PRESENT */}
      <section className="space-y-10 text-left pt-14 border-t border-current/10" id="section-presence">
        <div className="space-y-3 text-left max-w-2xl" id="presence-header">
          <h2 className={`${heading2Class} font-bold tracking-tight text-left`} id="presence-h2">
            Pausing and being present
          </h2>
          <p className={`${body1Class} opacity-80 leading-relaxed text-left`} id="presence-b1">
            Brief practices and grounding prompts to help anchor you in the present moment.
          </p>
        </div>

        {/* Sidebar Menu + Content Panel */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 text-left" id="presence-sidebar-layout">
          
          {/* Sidebar Menu */}
          <aside className="md:col-span-4 space-y-3 text-left" id="presence-sidebar-menu" aria-label="Presence exercises sidebar">
            <span className="text-xs font-semibold opacity-60 block mb-3 text-left tracking-wider" id="presence-menu-heading">
              Presence exercises
            </span>
            <div className="flex flex-col text-left" id="presence-menu-list">
              {PRESENCE_SIDEBAR_ITEMS.map((item, index) => {
                const IconComponent = item.icon;
                const isActive = activePresenceId === item.id;

                return (
                  <React.Fragment key={item.id}>
                    {index > 0 && (
                      <div aria-hidden="true" className="h-[2px] bg-[#912A4A] w-2/3 my-1" />
                    )}
                    <button
                      id={`presence-menu-item-${item.id}`}
                      onClick={() => {
                        setActivePresenceId(item.id);
                        playTick(440, 0.05);
                      }}
                      className={`w-full flex items-center gap-3.5 py-3.5 text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-current/40 ${
                        isActive ? 'font-semibold opacity-100' : 'opacity-75 hover:opacity-100'
                      }`}
                      style={isActive ? { color: '#912A4A' } : undefined}
                    >
                      <IconComponent className="w-4 h-4 shrink-0" />
                      <div className="text-left overflow-hidden" id={`presence-menu-txt-${item.id}`}>
                        <div className="text-xs sm:text-sm font-semibold truncate" id={`presence-menu-title-${item.id}`}>
                          {index + 1}. {item.title}
                        </div>
                        <div className="text-[11px] opacity-75 truncate mt-0.5" id={`presence-menu-cat-${item.id}`}>
                          {item.category}
                        </div>
                      </div>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </aside>

          {/* Main Content Area */}
          <section className="md:col-span-8 border border-current/15 p-8 md:p-12 rounded-3xl bg-current/[0.01] space-y-8 text-left shadow-2xs" id="presence-main-content" aria-labelledby="presence-h2">
            {activePresenceId === 'grounding-54321' ? (
              <div className="space-y-8 text-left" id="presence-54321-view">
                <div className="flex justify-between items-start gap-4 border-b border-current/10 pb-6 text-left" id="presence-54321-header">
                  <div className="space-y-1.5 text-left">
                    <h3 className="text-xl font-bold text-left" id="presence-54321-title">
                      5-4-3-2-1 Grounding workbook
                    </h3>
                    <p className="text-xs sm:text-sm opacity-80 leading-relaxed text-left" id="presence-54321-sub">
                      Identify sensory inputs around you step by step to gently quiet hyperactive thought cycles.
                    </p>
                  </div>
                  <button
                    id="presence-54321-reset-btn"
                    onClick={resetGrounding}
                    className="px-4 py-2 border border-current/20 hover:border-current/50 rounded-full text-xs font-semibold cursor-pointer shrink-0 transition-colors"
                  >
                    Reset workbook
                  </button>
                </div>

                <div className="space-y-5 text-left" id="presence-54321-steps">
                  {GROUNDING_STEPS.map(step => (
                    <div key={step.id} className="p-5 md:p-6 border border-current/10 rounded-2xl space-y-3 bg-background text-left shadow-2xs" id={`grounding-step-${step.id}`}>
                      <div className="flex items-center gap-3 text-left" id={`grounding-step-head-${step.id}`}>
                        <button
                          id={`grounding-check-${step.id}`}
                          onClick={() => handleCheckGrounding(step.id)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer transition-colors ${
                            groundingChecked[step.id] ? 'bg-[#1D9E75] text-white border-[#1D9E75]' : 'border-current/30'
                          }`}
                          aria-label={`Mark step ${step.id} complete`}
                        >
                          {groundingChecked[step.id] && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <span className="text-xs sm:text-sm font-semibold text-left" id={`grounding-step-lbl-${step.id}`}>
                          Acknowledge {step.id} {step.label}
                        </span>
                      </div>
                      <input
                        type="text"
                        id={`grounding-input-${step.id}`}
                        value={groundingInputs[step.id] || ''}
                        onChange={e => setGroundingInputs({ ...groundingInputs, [step.id]: e.target.value })}
                        placeholder={`Note down ${step.id} items...`}
                        className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-background border border-current/20 focus:outline-none focus:border-current/60 text-left transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-8 text-left" id="presence-prompt-view">
                <div className="space-y-2 border-b border-current/10 pb-6 text-left" id="presence-prompt-header">
                  <span className="text-xs font-semibold opacity-60 text-left block tracking-wider" id="presence-prompt-cat">
                    {selectedPresence.category}
                  </span>
                  <h3 className="text-2xl font-bold text-left" id="presence-prompt-title">
                    {selectedPresence.title}
                  </h3>
                </div>

                <div className="space-y-8 text-left" id="presence-prompt-body">
                  <p className="text-base sm:text-lg opacity-90 leading-relaxed text-left" id="presence-prompt-instruction">
                    {selectedPresence.instruction}
                  </p>

                  <div className="p-6 rounded-2xl border border-current/15 bg-current/[0.02] text-xs sm:text-sm opacity-85 leading-relaxed space-y-2 text-left" id="presence-prompt-tip">
                    <span className="font-bold block text-left">Reflective guidance</span>
                    <p className="text-left leading-relaxed">
                      Take as long as you need with this observation. There is no right or wrong outcome — simply bringing your awareness to the present moment is the entire practice.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </section>

    </div>
  );
}
