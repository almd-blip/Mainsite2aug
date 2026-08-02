/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * CARE MOMENTS LAYER
 * -------------------
 * Small, human moments of care shown in response to user actions inside the
 * Practice Engine. This layer is intentionally kept separate from any AI /
 * API logic so it works identically in the current non-AI engine and after
 * AI integration is enabled. It has no network dependency and no runtime
 * dependency on `openai.ts` or the `/api/practice-engine` route.
 *
 * Architecture:
 *   User interaction
 *     -> Practice Engine logic
 *       -> Care Moments Layer (this file, when relevant)
 *         -> Reflection response
 *           -> Optional AI enhancement when API is enabled
 */

export type CareTrigger =
  | 'empty_reflection_exit'
  | 'practice_completed'
  | 'returning_user'
  | 'minimal_response'
  | 'repeated_practice';

export interface CareMessage {
  trigger: CareTrigger;
  lines: string[];
}

export const CARE_MESSAGES: Record<CareTrigger, CareMessage> = {
  empty_reflection_exit: {
    trigger: 'empty_reflection_exit',
    lines: [
      "Today wasn't the day.",
      'The question will still be here tomorrow.',
      'Sometimes noticing is enough.'
    ]
  },
  practice_completed: {
    trigger: 'practice_completed',
    lines: [
      'Thank you for spending time with this question.',
      'Reflection is not about finding the perfect answer.',
      'It is about creating space for a different possibility.'
    ]
  },
  returning_user: {
    trigger: 'returning_user',
    lines: [
      'Welcome back.',
      'There is no need to catch up.',
      'You can begin exactly where you are.'
    ]
  },
  minimal_response: {
    trigger: 'minimal_response',
    lines: [
      'A few words are enough.',
      'Small beginnings can open new understanding.'
    ]
  },
  repeated_practice: {
    trigger: 'repeated_practice',
    lines: [
      'Some questions need time.',
      'Returning to the same place can reveal something new.'
    ]
  }
};

export function getCareMessage(trigger: CareTrigger): CareMessage {
  return CARE_MESSAGES[trigger];
}
