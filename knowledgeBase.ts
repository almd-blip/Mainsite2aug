/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { KnowledgeItem } from '../types/practiceEngine';

/**
 * Placeholder Knowledge Base Architecture for RAG Retrieval.
 * Designed to retrieve relevant Second Thought framework guidelines,
 * values documentation, publications, Still Becoming journals,
 * research excerpts, accessibility principles, and ethical guidance.
 */
export const KNOWLEDGE_BASE_ITEMS: KnowledgeItem[] = [
  {
    id: 'kb-framework-core',
    category: 'framework',
    title: 'The Second Thought Framework: Look, Ask, Think a Second Time',
    content: `The Second Thought Framework creates space between experience and response through three core movements:
1. Look: Notice the raw experience and Pause somatic tension.
2. Ask: Question automatic assumptions and Listen to reflective resonance.
3. Think a Second Time: Reconsider alternative perspectives and Choose a response aligned with compassion and accountability.`,
    keywords: ['framework', 'look', 'ask', 'think a second time', 'think again', 'notice', 'pause', 'question', 'listen', 'reconsider', 'choose']
  },
  {
    id: 'kb-values-coexistence',
    category: 'values',
    title: 'Coexistence of Compassion and Accountability',
    content: `People are more than their worst moment or their most reactive impulse. 
Compassion does not mean excusing harm or ignoring boundaries; true accountability honors human dignity while addressing real impact with truth and clarity.`,
    keywords: ['values', 'compassion', 'accountability', 'dignity', 'truth', 'boundaries', 'coexistence']
  },
  {
    id: 'kb-ethics-nonjudgment',
    category: 'ethics',
    title: 'Ethical Reflective Guidance & Non-Judgment',
    content: `The Practice Engine never decides who is right or wrong, passes moral judgment, or provides therapy.
It serves as a reflective mirror to help users clarify their own values, discover unexamined needs, and act with intentionality.`,
    keywords: ['ethics', 'non-judgment', 'therapy', 'boundaries', 'moral', 'reflective', 'mirror']
  },
  {
    id: 'kb-accessibility-principles',
    category: 'accessibility',
    title: 'Accessibility & Neurodivergent Design Principles',
    content: `Design for clarity, unhurried pacing, readable contrast, reduced motion alternatives, screen reader friendly semantic markup, and flexible interaction options that accommodate diverse cognitive and sensory processing styles.`,
    keywords: ['accessibility', 'screen reader', 'neurodivergent', 'reduced motion', 'contrast', 'dyslexia']
  },
  {
    id: 'kb-journals-still-becoming',
    category: 'journals',
    title: 'Still Becoming Reflection Excerpt: The Space Between',
    content: `Between stimulus and response there is a gap. In that gap lies our freedom to choose our response. In our response lies our growth and our freedom.`,
    keywords: ['still becoming', 'journals', 'gap', 'stimulus', 'response', 'freedom', 'growth']
  }
];

export function searchKnowledgeBase(query: string): KnowledgeItem[] {
  if (!query || !query.trim()) return KNOWLEDGE_BASE_ITEMS.slice(0, 2);
  const normalized = query.toLowerCase().trim();
  const words = normalized.split(/\s+/);

  const matched = KNOWLEDGE_BASE_ITEMS.filter((item) => {
    return words.some((w) =>
      item.keywords.some((k) => k.toLowerCase().includes(w)) ||
      item.title.toLowerCase().includes(w) ||
      item.content.toLowerCase().includes(w)
    );
  });

  return matched.length > 0 ? matched : KNOWLEDGE_BASE_ITEMS.slice(0, 2);
}
