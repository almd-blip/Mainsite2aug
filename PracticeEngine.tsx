/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Sparkles, Heart, Check, ArrowRight, Compass, Shield } from 'lucide-react';
import { ChatMessage, PracticeEngineProps, SubStageId } from '../../types/practiceEngine';
import { STAGES_CONFIG, SECOND_THOUGHT_CORE_PRINCIPLE, SECOND_THOUGHT_CORE_QUESTION } from '../../lib/secondThoughtPrompt';
import { sendPracticeEngineReflection } from '../../lib/openai';
import { storage } from '../../lib/storage';
import { CareTrigger } from '../../lib/careMessages';
import {
  checkReturningUser,
  recordStageVisitAndCheckRepeat,
  recordStageCompletionAndCheckFirstTime,
  resetCareMomentsSession
} from '../../lib/careMoments';
import { FrameworkIndicator } from './FrameworkIndicator';
import { StageProgress } from './StageProgress';
import { ChatWindow } from './ChatWindow';
import { ReflectionInput } from './ReflectionInput';
import { AccessibilityControls } from './AccessibilityControls';
import { CareMomentCard } from './CareMomentCard';

export const CORE_VALUES = [
  { id: 'compassion', label: 'Compassion', desc: 'Understanding human struggle with kindness' },
  { id: 'accountability', label: 'Accountability', desc: 'Taking ownership of actions & outcomes' },
  { id: 'truth', label: 'Truth & Honesty', desc: 'Facing reality with clarity and integrity' },
  { id: 'dignity', label: 'Human Dignity', desc: 'Honoring inherent worth in self and others' },
  { id: 'patience', label: 'Patience', desc: 'Allowing time for reflection and growth' },
  { id: 'courage', label: 'Courage', desc: 'Standing up for boundaries and principles' }
];

export function PracticeEngine({
  version = 'website',
  playTick,
  onLaunchFullApp,
  onNavigateToFramework,
  soundEnabled = true,
  className = ''
}: PracticeEngineProps) {
  // Conversations are saved per version (website widget vs. full app) so the
  // two experiences don't overwrite each other's state.
  const storageKey = `st_practice_engine_conversation_${version}`;

  interface PersistedConversation {
    messages: ChatMessage[];
    currentStageId: SubStageId;
    selectedValues: string[];
  }

  const persisted = storage.getItem<PersistedConversation | null>(storageKey, null) as PersistedConversation | null;

  // Current reflection sub-stage
  const [currentStageId, setCurrentStageId] = useState<SubStageId>(persisted?.currentStageId || 'notice');

  // Messages thread state — restored from storage so a page refresh doesn't lose the conversation.
  const [messages, setMessages] = useState<ChatMessage[]>(persisted?.messages || []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>(persisted?.selectedValues || ['compassion', 'accountability']);

  // --- Care Moments Layer state -------------------------------------------------
  // This layer is entirely independent of the AI/API logic below. It reads and
  // writes small session markers through `storage` (the same non-AI adapter used
  // to persist the conversation) so it behaves identically before and after AI
  // integration is enabled.
  const [activeCareMoment, setActiveCareMoment] = useState<CareTrigger | null>(null);

  const showCareMoment = (trigger: CareTrigger) => {
    setActiveCareMoment(trigger);
    if (playTick) playTick(480, 0.08);
  };

  const dismissCareMoment = () => setActiveCareMoment(null);

  // On mount: was there a meaningful gap since the last visit? If so, and the
  // person has been here before, greet them gently rather than diving back in.
  useEffect(() => {
    const isReturning = checkReturningUser(version, (persisted?.messages?.length || 0) > 0);
    if (isReturning) {
      showCareMoment('returning_user');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // --------------------------------------------------------------------------

  // Persist the conversation whenever it changes.
  useEffect(() => {
    storage.setItem<PersistedConversation>(storageKey, { messages, currentStageId, selectedValues });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, currentStageId, selectedValues]);

  // Flattened sub-stages lookup
  const allSubStages = STAGES_CONFIG.flatMap((group) => group.subStages);
  const currentSubStage = allSubStages.find((s) => s.id === currentStageId) || allSubStages[0];

  const handleSelectStage = (stageId: SubStageId) => {
    setCurrentStageId(stageId);
    // Care Moments Layer: gently acknowledge when someone returns to a stage
    // they've already sat with, rather than treating it as brand new.
    if (recordStageVisitAndCheckRepeat(version, stageId)) {
      showCareMoment('repeated_practice');
    }
  };

  // Keyboard navigation between framework stages (← / →). Ignored while the
  // user is typing in a field or pressing a modifier key, so normal text entry
  // and page scrolling are unaffected. Left/right arrows are used (not up/down)
  // so the page can still be scrolled vertically with arrow keys.
  useEffect(() => {
    const rootEl = document.getElementById('second-thought-practice-engine-root');
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;

      const target = e.target as HTMLElement | null;
      if (!target || !rootEl || !rootEl.contains(target)) return;
      const tag = (target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable) return;

      const index = allSubStages.findIndex((s) => s.id === currentStageId);
      if (index === -1) return;

      let nextId: SubStageId | undefined;
      if (e.key === 'ArrowRight') {
        nextId = allSubStages[Math.min(index + 1, allSubStages.length - 1)]?.id;
      } else {
        nextId = allSubStages[Math.max(index - 1, 0)]?.id;
      }

      if (nextId && nextId !== currentStageId) {
        e.preventDefault();
        handleSelectStage(nextId);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStageId]);

  const toggleValueSelect = (valId: string) => {
    if (selectedValues.includes(valId)) {
      setSelectedValues(selectedValues.filter((v) => v !== valId));
    } else {
      setSelectedValues([...selectedValues, valId]);
    }
    if (playTick) playTick(440, 0.05);
  };

  const handleSendReflection = async (userText: string) => {
    if (!userText.trim() || isGenerating) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      stageId: currentStageId
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsGenerating(true);

    if (playTick) playTick(520, 0.1);

    try {
      const replyText = await sendPracticeEngineReflection(
        currentStageId,
        userText,
        newMessages,
        selectedValues
      );

      const aiMsg: ChatMessage = {
        id: 'msg-ai-' + Date.now(),
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        stageId: currentStageId
      };

      setMessages((prev) => [...prev, aiMsg]);
      if (playTick) playTick(620, 0.15);

      // Care Moments Layer: the first time a given stage's reflection completes
      // in this browser, acknowledge the moment. This check is independent of
      // whether the reply above came from AI or the offline fallback.
      if (recordStageCompletionAndCheckFirstTime(version, currentStageId)) {
        showCareMoment('practice_completed');
      }
    } catch (err: any) {
      console.error('Error fetching reflection from server:', err);
      const errorMsg: ChatMessage = {
        id: 'msg-err-' + Date.now(),
        role: 'assistant',
        content: 'Something interrupted the reflection space. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResetConversation = () => {
    setMessages([]);
    setCurrentStageId('notice');
    storage.removeItem(storageKey);
    resetCareMomentsSession(version);
    setActiveCareMoment(null);
    if (playTick) playTick(350, 0.08);
  };

  const handleExportConversation = () => {
    if (!messages.length) return;

    const stageNameById = Object.fromEntries(allSubStages.map((s) => [s.id, s.name]));
    const lines = [
      'Second Thought — Reflective Dialogue',
      `Exported ${new Date().toLocaleString()}`,
      ''
    ];

    for (const msg of messages) {
      const speaker = msg.role === 'user' ? 'You' : 'Practice Engine';
      const stageLabel = msg.stageId ? ` (${stageNameById[msg.stageId] || msg.stageId})` : '';
      lines.push(`[${msg.timestamp}]${stageLabel} ${speaker}:`);
      lines.push(msg.content);
      lines.push('');
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `second-thought-reflection-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (playTick) playTick(460, 0.08);
  };

  return (
    <div
      className={`w-full max-w-5xl mx-auto space-y-6 text-left text-[#1B0A3B] dark:text-slate-100 ${className}`}
      id="second-thought-practice-engine-root"
    >
      {/* HEADER BAR (Show in full app version) */}
      {version !== 'website' && (
        <div className="border border-[#1B0A3B]/15 dark:border-slate-700 rounded-2xl p-5 bg-white/90 dark:bg-slate-900/90 shadow-xs space-y-3">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#C68A2B] shrink-0" />
                <h3 className="text-xl font-bold tracking-tight text-[#1B0A3B] dark:text-slate-100">
                  Second Thought Practice Engine
                </h3>
              </div>
              <p className="text-xs font-normal opacity-90 leading-relaxed text-[#1B0A3B] dark:text-slate-200 max-w-xl">
                Create space between experience and response. A reflective space supported by artificial intelligence grounded in the Second Thought framework.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ANCHOR VALUES SELECTION (Show in full app version) */}
      {version !== 'website' && (
        <div className="border border-[#1B0A3B]/10 dark:border-slate-700 p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold flex items-center gap-1.5 text-[#1B0A3B] dark:text-slate-100">
              <Heart className="w-4 h-4 text-[#912A4A] dark:text-[#D9A0B4]" />
              Anchor Values
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {CORE_VALUES.map((v) => {
              const isSelected = selectedValues.includes(v.id);
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => toggleValueSelect(v.id)}
                  className={`px-3 py-1 rounded-xl text-xs border transition-all cursor-pointer font-medium flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-[#1B0A3B] dark:focus-visible:ring-amber-400 ${
                    isSelected
                      ? 'bg-[#1B0A3B] dark:bg-[#C68A2B] text-white dark:text-slate-950 border-[#1B0A3B] dark:border-[#C68A2B] font-bold'
                      : 'border-[#1B0A3B]/20 dark:border-slate-700 text-[#1B0A3B] dark:text-slate-200 hover:bg-[#1B0A3B]/10 dark:hover:bg-slate-800'
                  }`}
                  title={v.desc}
                >
                  {isSelected && <Check className="w-3 h-3 shrink-0" />}
                  <span>{v.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* MAIN WORKSPACE */}
      {version === 'website' ? (
        <div className="space-y-4 max-w-3xl mx-auto">
          <StageProgress
            currentStageId={currentStageId}
            onSelectStage={handleSelectStage}
          />

          {messages.length > 0 && (
            <ChatWindow
              messages={messages}
              isGenerating={isGenerating}
              onReset={handleResetConversation}
              onExport={handleExportConversation}
            />
          )}

          {activeCareMoment && (
            <CareMomentCard trigger={activeCareMoment} onDismiss={dismissCareMoment} />
          )}

          <ReflectionInput
            currentSubStage={currentSubStage}
            onSubmit={handleSendReflection}
            isGenerating={isGenerating}
            onEmptyReflectionExit={() => showCareMoment('empty_reflection_exit')}
            onMinimalResponse={() => showCareMoment('minimal_response')}
            onNavigateToFramework={onNavigateToFramework}
            version={version}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Framework Indicator (Collapsible Stages) */}
          <div className="lg:col-span-4 space-y-4">
            <FrameworkIndicator
              currentStageId={currentStageId}
              onSelectStage={handleSelectStage}
              playTick={playTick}
            />
          </div>

          {/* Right Column: Chat Window + Reflection Input */}
          <div className="lg:col-span-8 space-y-4">
            <ChatWindow
              messages={messages}
              isGenerating={isGenerating}
              onReset={handleResetConversation}
              onExport={handleExportConversation}
            />

            {activeCareMoment && (
              <CareMomentCard trigger={activeCareMoment} onDismiss={dismissCareMoment} />
            )}

            <ReflectionInput
              currentSubStage={currentSubStage}
              onSubmit={handleSendReflection}
              isGenerating={isGenerating}
              onSelectStarterPrompt={(promptText) => {
                if (!messages.length) {
                  handleSendReflection(promptText);
                }
              }}
              onEmptyReflectionExit={() => showCareMoment('empty_reflection_exit')}
              onMinimalResponse={() => showCareMoment('minimal_response')}
              onNavigateToFramework={onNavigateToFramework}
              version={version}
            />
          </div>
        </div>
      )}

      {/* ACCESSIBILITY & PRIVACY FOOTER */}
      <AccessibilityControls />
    </div>
  );
}

export default PracticeEngine;
