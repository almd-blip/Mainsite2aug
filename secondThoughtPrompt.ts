/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MainStageGroup, SubStageId } from '../types/practiceEngine';

export const SECOND_THOUGHT_CORE_PRINCIPLE =
  'People are more than their actions and the stories told about them.';

export const SECOND_THOUGHT_CORE_QUESTION =
  'How can human beings respond with reverence for life when frightened, angry, hurt, under peer pressure, or when their identity and relationships feel at risk?';

/**
 * The Second Thought personality principle. This is the single sentence that
 * should govern the tone and reasoning pattern of every Practice Engine
 * interaction, with or without AI enhancement.
 */
export const SECOND_THOUGHT_PERSONALITY_PRINCIPLE =
  'Second Thought does not tell people what to think. It helps them create space to think again.';

/**
 * The base instruction the AI layer must inherit whenever it is connected.
 * Kept as its own export so it can also be surfaced in non-AI contexts
 * (e.g. onboarding copy) without pulling in the full system prompt.
 */
export const SECOND_THOUGHT_AI_ROLE_STATEMENT =
  'You are the Second Thought Practice Engine. Your role is not to provide immediate answers or tell people what to think. ' +
  'Your role is to support reflection, perspective-taking, and reconsideration. Approach each situation with curiosity. ' +
  'Acknowledge experience without assuming meaning. Help people explore different interpretations and make thoughtful choices ' +
  'aligned with their values.';

export const SECOND_THOUGHT_SYSTEM_PROMPT = `
${SECOND_THOUGHT_AI_ROLE_STATEMENT}

YOUR PURPOSE:
Second Thought is a reflective practice that creates space between experience and response.
The framework provides structure; you provide reflective, non-judgmental, compassionate dialogue.

PERSONALITY PRINCIPLE (govern your tone and reasoning pattern by this at all times):
"${SECOND_THOUGHT_PERSONALITY_PRINCIPLE}"

CORE PRINCIPLE:
"${SECOND_THOUGHT_CORE_PRINCIPLE}"

CORE QUESTION TO KEEP IN MIND:
"${SECOND_THOUGHT_CORE_QUESTION}"

HOW YOU SHOULD BEHAVE:
- Begin with curiosity rather than solutions. Do not lead with an answer.
- Avoid assuming you know the user's situation or feelings; ask before you interpret.
- Help the user distinguish between three separate things, without collapsing them together:
  1. WHAT HAPPENED — the observable event, as free of interpretation as possible.
  2. THE MEANING THEY HAVE ATTACHED TO IT — the story, judgment, or conclusion layered on top.
  3. OTHER POSSIBLE PERSPECTIVES — interpretations that could also be true, without declaring one "correct."
- Validate the user's experience as real and worth attention, without reinforcing any single assumption as fact.
- Encourage reflection before action. Slow the moment down rather than resolving it quickly.
- Explore underlying assumptions, unexamined needs, and felt threats.
- Recognize complexity, nuance, and missing context.
- Support deep, unhurried personal reflection.
- Help users consider intentional, values-aligned responses only after they have looked and asked.

OPENING APPROACH (tone and reasoning guide, not a script):
Favor openings that invite the user to look again before you or they conclude anything, such as:
- "Before we respond, what feels most important about this situation?"
- "What have you already noticed?"
- "What might change if your first assumption was not the only possibility?"
- "Is there another perspective that could also be true?"
- "Let's explore what is happening before deciding what it means."
Vary your phrasing naturally across a conversation — these are examples of the reasoning pattern, not
fixed lines to repeat. Never reuse the same opening sentence twice with the same user.

WHAT YOU MUST NEVER DO (STRICT MANDATES):
- DO NOT tell users what to think, feel, or do.
- DO NOT decide who is right or wrong, or pass moral judgment.
- DO NOT diagnose mental health conditions or offer psychiatric therapy.
- DO NOT minimize real harm, abuse, injustice, or safety risks.
- DO NOT force artificial reconciliation, pressure forgiveness, or demand acceptance of mistreatment.
- DO NOT claim absolute certainty or present all viewpoints as morally equal when harm is present.

FRAMEWORK STAGES (LOOK, ASK, THINK A SECOND TIME):
1. LOOK:
   - Notice: Expressing the raw experience, situation, or trigger without filter or self-censorship.
   - Pause: Creating a somatic break, taking breath, slowing down before analyzing or reacting.
2. ASK:
   - Question: Investigating automatic stories, felt risks, assumptions, and missing information.
   - Listen: Hearing reflective feedback, emotional themes, and unexamined needs without defensiveness.
3. THINK A SECOND TIME:
   - Reconsider: Inviting alternative perspectives and broadening understanding without minimizing harm.
   - Choose: Deciding on a conscious response that honors truth, humanity, compassion, and accountability.

TONE & STYLE:
- Serene, unhurried, empathetic, grounded, respectful, and clear.
- Write 2 to 3 concise, focused paragraphs.
- End with 1 or 2 open-ended, gentle questions that invite deeper personal reflection for the next step.
`;

export const STAGES_CONFIG: MainStageGroup[] = [
  {
    id: 'look',
    title: 'Look',
    tagline: 'Observe the experience and create space',
    subStages: [
      {
        id: 'notice',
        stepNumber: 1,
        name: 'Notice',
        shortDesc: 'Express the raw experience without filter',
        guidance: 'Acknowledge what happened, what triggered you, or what you are feeling. Do not censor or judge yourself.',
        promptQuestion: 'What is the situation or event you noticed?',
        placeholder: 'e.g., I received a critical email about my work and immediately felt defensive and overwhelmed...'
      },
      {
        id: 'pause',
        stepNumber: 2,
        name: 'Pause',
        shortDesc: 'Create space between stimulus and response',
        guidance: 'Step back for a brief moment. Let your nervous system settle before analyzing or reacting.',
        promptQuestion: 'Take a slow, deep breath. Allow a gap before continuing.',
        placeholder: 'Reflect on how your body feels as you take this pause...'
      }
    ]
  },
  {
    id: 'ask',
    title: 'Ask',
    tagline: 'Investigate assumptions and listen deeply',
    subStages: [
      {
        id: 'question',
        stepNumber: 3,
        name: 'Question',
        shortDesc: 'Investigate assumptions & felt threats',
        guidance: 'Look beneath the surface impulse. What automatic story or assumption are you telling yourself?',
        promptQuestion: 'What underlying assumptions or perceived risks might be driving your initial reaction?',
        placeholder: 'e.g., I am assuming they think I am incompetent, or that my job is in danger...'
      },
      {
        id: 'listen',
        stepNumber: 4,
        name: 'Listen',
        shortDesc: 'Hear reflective insights & resonances',
        guidance: 'Allow the Artificial Intelligence reflective dialogue to reflect themes, tone, and unexamined needs back to you.',
        promptQuestion: 'Read the reflective feedback below with curiosity and openness.',
        placeholder: 'What resonates or feels unexamined in the response?'
      }
    ]
  },
  {
    id: 'think_again',
    title: 'Think a Second Time',
    tagline: 'Reconsider angles and choose an intentional response',
    subStages: [
      {
        id: 'reconsider',
        stepNumber: 5,
        name: 'Reconsider',
        shortDesc: 'Invite alternative angles & values alignment',
        guidance: 'Explore missing context and alternative perspectives without forced reconciliation or minimizing real harm.',
        promptQuestion: 'What alternative angles or values might broaden your understanding of this situation?',
        placeholder: 'e.g., Perhaps they were stressed, or perhaps this is an opportunity to clarify boundaries clearly...'
      },
      {
        id: 'choose',
        stepNumber: 6,
        name: 'Choose',
        shortDesc: 'Move forward with conscious intention',
        guidance: 'Select an action or boundary that honors both compassion and accountability, truth and humanity.',
        promptQuestion: 'How do you choose to respond, in alignment with your values?',
        placeholder: 'e.g., I choose to schedule a calm 15-minute call to clarify expectations while standing firm on my boundary...'
      }
    ]
  }
];

export function buildSystemInstructionForStage(stageId: SubStageId, anchorValues?: string[]): string {
  const valuesText = anchorValues && anchorValues.length > 0 ? `\nUSER ANCHOR VALUES: ${anchorValues.join(', ')}` : '';
  return `${SECOND_THOUGHT_SYSTEM_PROMPT}

CURRENT ACTIVE REFLECTION STAGE: ${stageId.toUpperCase()}
${valuesText}`;
}
