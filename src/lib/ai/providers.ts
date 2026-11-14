import { google } from '@ai-sdk/google';
import { openai, createOpenAI } from '@ai-sdk/openai';
import { env } from '@/lib/env';

export type AIProvider = 'groq' | 'google' | 'openai' | 'mock';

export interface AIProviderOptions {
  language?: string;
  speed?: 'instant' | 'accurate';
}

export function getAIProvider(options: AIProviderOptions = {}): {
  provider: AIProvider;
  model: any;
  modelId: string;
} {
  const groqKey = process.env.GROQ_API_KEY;
  const isGroqLive = groqKey && !groqKey.toLowerCase().includes('mock') && groqKey.trim() !== '';

  // 1. Groq Provider (Priority for user preference)
  if (isGroqLive) {
    const groq = createOpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: groqKey,
    });

    const lang = options.language || 'en';
    const isRegional = ['am', 'om', 'ti', 'so'].includes(lang);

    // Amharic and regional languages require 70B parameters for deep Ge'ez script understanding
    if (isRegional || options.speed === 'accurate') {
      const modelId = 'llama-3.3-70b-versatile';
      return {
        provider: 'groq',
        model: groq(modelId),
        modelId,
      };
    }

    // Fast English conversational responses (800+ tokens/sec)
    const modelId = 'llama-3.1-8b-instant';
    return {
      provider: 'groq',
      model: groq(modelId),
      modelId,
    };
  }

  // 2. Google Gemini Fallback
  const googleKey = env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (googleKey && !googleKey.toLowerCase().includes('mock') && googleKey.trim() !== '') {
    return {
      provider: 'google',
      model: google('gemini-1.5-flash'),
      modelId: 'gemini-1.5-flash',
    };
  }

  // 3. OpenAI Fallback
  const openaiKey = env.OPENAI_API_KEY;
  if (openaiKey && !openaiKey.toLowerCase().includes('mock') && openaiKey.trim() !== '') {
    return {
      provider: 'openai',
      model: openai('gpt-4o-mini'),
      modelId: 'gpt-4o-mini',
    };
  }

  // 4. Mock Offline Fallback
  return {
    provider: 'mock',
    model: null,
    modelId: 'mock-offline-tutor',
  };
}

export function isLiveAIConfigured(): boolean {
  const groqKey = process.env.GROQ_API_KEY;
  const isGroqLive = Boolean(groqKey && !groqKey.toLowerCase().includes('mock') && groqKey.trim() !== '');

  const googleKey = env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
  const isGoogleLive = Boolean(googleKey && !googleKey.toLowerCase().includes('mock') && googleKey.trim() !== '');

  const openaiKey = env.OPENAI_API_KEY;
  const isOpenAILive = Boolean(openaiKey && !openaiKey.toLowerCase().includes('mock') && openaiKey.trim() !== '');

  return isGroqLive || isGoogleLive || isOpenAILive;
}
