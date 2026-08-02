/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { buildSystemInstructionForStage } from '../../lib/secondThoughtPrompt';
import { searchKnowledgeBase } from '../../lib/knowledgeBase';

export interface PracticeEngineEnv {
  OPENAI_API_KEY?: string;
  GEMINI_API_KEY?: string;
}

const getRuntimeEnvValue = (
  env: PracticeEngineEnv | undefined,
  key: keyof PracticeEngineEnv
): string | undefined => {
  const valueFromCloudflare = env?.[key];
  if (valueFromCloudflare && valueFromCloudflare.trim()) {
    return valueFromCloudflare;
  }

  if (typeof process !== 'undefined') {
    const valueFromNode = process.env?.[key];
    if (valueFromNode && valueFromNode.trim()) {
      return valueFromNode;
    }
  }

  return undefined;
};

/** Small deterministic string hash, used only to rotate fallback openings so the
 * same input doesn't always produce the exact same opening line (no external
 * randomness dependency needed). */
const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
};

const extractGeminiText = (data: any): string => {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) {
    return '';
  }

  return parts
    .map((part: any) => (typeof part?.text === 'string' ? part.text : ''))
    .filter(Boolean)
    .join('\n')
    .trim();
};

/**
 * Server-side reflection handler logic for Practice Engine.
 * Supports OpenAI API (via OPENAI_API_KEY) and Gemini API (via GEMINI_API_KEY).
 */
export async function handlePracticeEngineRequest(body: {
  stage?: string;
  userMessage?: string;
  conversationHistory?: { role: string; text: string }[];
  contextValues?: string[];
}, env?: PracticeEngineEnv): Promise<{ status: number; body: Record<string, any> }> {
  try {
    const { stage = 'notice', userMessage, conversationHistory = [], contextValues = [] } = body;

    if (!userMessage || !userMessage.trim()) {
      return {
        status: 400,
        body: { error: 'A user reflection message is required.' }
      };
    }

    const openAiKey = getRuntimeEnvValue(env, 'OPENAI_API_KEY');
    const geminiKey = getRuntimeEnvValue(env, 'GEMINI_API_KEY');

    const systemInstruction = buildSystemInstructionForStage(stage as any, contextValues);
    const knowledgeItems = searchKnowledgeBase(userMessage);
    const knowledgeContext = knowledgeItems.map((k) => `[${k.title}]: ${k.content}`).join('\n\n');

    const fullSystemPrompt = `${systemInstruction}

RELEVANT SECOND THOUGHT KNOWLEDGE CONTEXT:
${knowledgeContext}`;

    // 1. If OpenAI API Key is available, call OpenAI chat completions API
    if (openAiKey && openAiKey.trim()) {
      const messages: { role: string; content: string }[] = [
        { role: 'system', content: fullSystemPrompt }
      ];

      for (const item of conversationHistory) {
        messages.push({
          role: item.role === 'user' ? 'user' : 'assistant',
          content: item.text
        });
      }

      messages.push({
        role: 'user',
        content: `Current reflection for stage [${stage}]: ${userMessage}`
      });

      const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openAiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.7,
          max_tokens: 600
        })
      });

      if (openAiRes.ok) {
        const data = await openAiRes.json();
        const reply = data?.choices?.[0]?.message?.content;
        if (reply) {
          return { status: 200, body: { reply, stage } };
        }
      } else {
        console.warn('OpenAI API request failed, trying Gemini or fallback...');
      }
    }

    // 2. If Gemini API Key is available, call the Gemini REST API.
    // Direct fetch keeps the handler portable across Node/Express and Cloudflare Pages Functions.
    if (geminiKey && geminiKey.trim()) {
      let promptContents = `RELEVANT KNOWLEDGE CONTEXT:\n${knowledgeContext}\n\n`;
      if (conversationHistory.length > 0) {
        promptContents += 'Previous Reflection Dialogue:\n';
        for (const item of conversationHistory) {
          promptContents += `[${item.role === 'user' ? 'User' : 'Practice Engine'}]: ${item.text}\n`;
        }
        promptContents += '\n';
      }
      promptContents += `Current User Reflection for stage [${stage}]: ${userMessage}`;

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${encodeURIComponent(geminiKey)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: fullSystemPrompt }]
            },
            contents: [
              {
                role: 'user',
                parts: [{ text: promptContents }]
              }
            ],
            generationConfig: {
              temperature: 0.7
            }
          })
        }
      );

      if (geminiRes.ok) {
        const data = await geminiRes.json();
        const reply = extractGeminiText(data);
        if (reply) {
          return { status: 200, body: { reply, stage } };
        }
      } else {
        console.warn('Gemini API request failed, using fallback response...');
      }
    }

    // 3. Fallback calm response generator when no API keys or offline.
    // Even without AI enhancement, the reply follows the Second Thought
    // personality layer: open with curiosity, distinguish what happened from
    // the meaning attached to it, and close with a gentle question rather
    // than a conclusion. Several openings rotate so the tone stays natural
    // rather than scripted.
    const trimmedMessage = `${userMessage.slice(0, 90)}${userMessage.length > 90 ? '...' : ''}`;
    const valsStr = contextValues.length > 0 ? contextValues.join(' and ') : 'your own values';

    const openings = [
      `Before going further, what feels most important to you about "${trimmedMessage}"?`,
      `What have you already noticed as you sit with "${trimmedMessage}"?`,
      `Let's look at what is happening here before deciding what it means.`
    ];
    const opening = openings[Math.abs(hashString(userMessage + stage)) % openings.length];

    const fallbackReply = `${opening}

It can help to separate what actually happened from the meaning attached to it. What is the observable event, and what is the story or conclusion sitting on top of it?

Is there another perspective that could also be true — one that does not cancel out what you are feeling, but sits alongside it? Whatever you choose next, let it be something that honors ${valsStr}, taken in your own time rather than in a rush to resolve this.`;

    return { status: 200, body: { reply: fallbackReply, stage } };
  } catch (err: any) {
    console.error('Error in handlePracticeEngineRequest:', err);
    return {
      status: 500,
      body: {
        error: 'Something interrupted the reflection space. Please try again.',
        details: err?.message || 'Internal server error'
      }
    };
  }
}
