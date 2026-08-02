/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { storage } from './storage';
import { SubStageId } from '../types/practiceEngine';

/**
 * Lightweight, non-AI helpers that decide WHEN a Care Moment should surface.
 * These read/write small bits of session state through the existing
 * `storage` adapter (same one the Practice Engine already uses to persist
 * conversations), so this layer keeps working before, during, and after
 * AI integration.
 */

const RETURNING_USER_GAP_MS = 20 * 60 * 1000; // 20 minutes of inactivity counts as "a break"
const MINIMAL_RESPONSE_WORD_LIMIT = 3; // "a few words" threshold

function lastActiveKey(version: string) {
  return `st_care_last_active_${version}`;
}

function stageVisitsKey(version: string) {
  return `st_care_stage_visits_${version}`;
}

function completedStagesKey(version: string) {
  return `st_care_completed_stages_${version}`;
}

/**
 * Call once when the Practice Engine mounts. Returns true if enough time has
 * passed since the last visit (and there is existing history) that a
 * `returning_user` Care Moment should be shown. Also refreshes the
 * last-active timestamp for next time.
 */
export function checkReturningUser(version: string, hasExistingHistory: boolean): boolean {
  const key = lastActiveKey(version);
  const lastActive = storage.getItem<number | null>(key, null);
  const now = Date.now();

  storage.setItem<number>(key, now);

  if (!hasExistingHistory || !lastActive) {
    return false;
  }

  return now - lastActive > RETURNING_USER_GAP_MS;
}

/**
 * Call whenever the user selects/enters a reflection stage. Returns true if
 * this is a repeat visit to that stage (i.e. `repeated_practice` applies),
 * and records the visit.
 */
export function recordStageVisitAndCheckRepeat(version: string, stageId: SubStageId): boolean {
  const key = stageVisitsKey(version);
  const visits = storage.getItem<Partial<Record<SubStageId, number>>>(key, {});
  const priorCount = visits[stageId] || 0;

  storage.setItem(key, { ...visits, [stageId]: priorCount + 1 });

  return priorCount >= 1;
}

/**
 * Call after a reflection response is produced for a stage. Returns true the
 * FIRST time that stage is completed in this browser (so `practice_completed`
 * doesn't repeat every single message), and records completion.
 */
export function recordStageCompletionAndCheckFirstTime(version: string, stageId: SubStageId): boolean {
  const key = completedStagesKey(version);
  const completed = storage.getItem<SubStageId[]>(key, []);

  if (completed.includes(stageId)) {
    return false;
  }

  storage.setItem(key, [...completed, stageId]);
  return true;
}

/**
 * A "minimal" reflection is a genuine but very short entry — a few words
 * rather than an empty submission.
 */
export function isMinimalResponse(text: string): boolean {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length > 0 && words.length <= MINIMAL_RESPONSE_WORD_LIMIT;
}

export function resetCareMomentsSession(version: string): void {
  storage.removeItem(lastActiveKey(version));
  storage.removeItem(stageVisitsKey(version));
  storage.removeItem(completedStagesKey(version));
}
