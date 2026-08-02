/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChatMessage, SubStageId } from '../types/practiceEngine';

export interface PracticeEngineApiPayload {
  stage: SubStageId;
  userMessage: string;
  conversationHistory?: { role: string; text: string }[];
  contextValues?: string[];
}

export interface PracticeEngineApiResponse {
  reply: string;
  stage?: SubStageId;
  error?: string;
  details?: string;
}

/**
 * Sends reflection payload to backend /api/practice-engine server route.
 */
export async function sendPracticeEngineReflection(
  stage: SubStageId,
  userMessage: string,
  history: ChatMessage[],
  anchorValues: string[] = []
): Promise<string> {
  const conversationHistory = history
    .filter((m) => !m.isError)
    .map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      text: m.content
    }));

  const payload: PracticeEngineApiPayload = {
    stage,
    userMessage,
    conversationHistory,
    contextValues: anchorValues
  };

  const response = await fetch('/api/practice-engine', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error || `Server returned error status ${response.status}`);
  }

  const data: PracticeEngineApiResponse = await response.json();

  if (data.reply) {
    return data.reply;
  }

  throw new Error(data.error || 'No reflection response received from server.');
}
