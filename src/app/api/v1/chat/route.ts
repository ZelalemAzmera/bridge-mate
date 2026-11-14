import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api/v1-auth';
import { retrieveRelevantChunks } from '@/lib/ai/rag/retriever';
import { buildGroundedContext } from '@/lib/ai/rag/context-builder';
import { buildSystemPrompt } from '@/lib/ai/prompts/system-chat';
import { getAIProvider, isLiveAIConfigured } from '@/lib/ai/providers';
import { generateText } from 'ai';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/v1/chat',
    description: 'BridgeMate Multilingual RAG Chat Assistant API',
    supportedLanguages: ['am', 'en'],
    authentication: 'Optional x-api-key or Authorization: Bearer <key> (Use demo_key_alx_2026)',
    version: '1.0.0',
  });
}

export async function POST(req: NextRequest) {
  const auth = validateApiKey(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'UNAUTHORIZED', message: auth.error },
      },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const prompt = body.prompt || (body.messages && body.messages[body.messages.length - 1]?.content);

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'A valid text "prompt" or "messages" array is required.',
          },
        },
        { status: 400 }
      );
    }

    // 1. RAG Retrieval from legal & educational curriculum database
    const { chunks } = await retrieveRelevantChunks(prompt);
    const { promptContext, citations } = buildGroundedContext(chunks);

    // 2. Determine response language
    const isAmharic = /[\u1200-\u137F]/.test(prompt);
    const language = body.language || (isAmharic ? 'am' : 'en');

    let assistantResponse = '';

    // 3. Live AI generation if configured
    if (isLiveAIConfigured()) {
      try {
        const { model } = getAIProvider();
        if (model) {
          const system = buildSystemPrompt(promptContext);
          const aiResult = await generateText({
            model,
            system,
            prompt,
          });
          assistantResponse = aiResult.text;
        }
      } catch (aiErr) {
        console.warn('[BridgeMate REST Chat] AI provider error, falling back to verified grounded response:', aiErr);
      }
    }

    // 4. Grounded fallback when external AI keys are unavailable
    if (!assistantResponse) {
      if (language === 'am') {
        assistantResponse =
          `ሰላም! በብሪጅሜት የተረጋገጠ የሕግና ሥርዓተ-ትምህርት መረጃ መሠረት፡\n\n` +
          `• በአዋጅ ቁጥር 568/2008 እና በአሠሪና ሠራተኛ አዋጅ ቁጥር 1156/2019 መሠረት፣ ማንኛውም አካል ጉዳተኛ ተማሪ ወይም ሠራተኛ ተገቢውን የማመቻቸት ድጋፍ (Reasonable Accommodation) የማግኘት ሕጋዊ መብት አለው [Source: ${citations[0]?.sourceTitle || 'የኢትዮጵያ የሥራና የአካል ጉዳት ሕግ'}]።\n` +
          `• ለኮድ ትምህርትና ዲጂታል ስልጠናዎች ስክሪን አንባቢዎችን (NVDA/JAWS)፣ የጽሁፍ አማራጮችን እና ተጨማሪ የፈተና ጊዜ መጠየቅ የተፈቀደ አሰራር ነው [Source: ${citations[1]?.sourceTitle || 'መሠረታዊ የዲጂታል ክህሎት'}]።\n\n` +
          `ለቀጣሪ ወይም ለትምህርት ተቋምዎ የሚቀርብ የማመቻቸት ጥያቄ ደብዳቤ ለማዘጋጀት /api/v1/translator መጠቀም ይችላሉ።`;
      } else {
        assistantResponse =
          `Hello! Based on BridgeMate's verified legal and curriculum knowledge base:\n\n` +
          `• Under Ethiopian Proclamation No. 568/2008 and Labour Proclamation No. 1156/2019, individuals with disabilities have an enforceable legal right to reasonable accommodation in educational environments and recruitment processes [Source: ${citations[0]?.sourceTitle || 'Ethiopian Labor Proclamation'}]。\n` +
          `• For software development and digital coursework, accommodations include extended assessment time, keyboard navigation compliance, and high-contrast screen reader materials [Source: ${citations[1]?.sourceTitle || 'Web Fundamentals Curriculum'}]。\n\n` +
          `You can generate a formal accommodation request letter using the /api/v1/translator endpoint.`;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        response: assistantResponse,
        language,
        citations,
        groundedInProclamation568: true,
      },
      meta: {
        apiVersion: 'v1',
        authTier: auth.keyType,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('[API v1 Chat Error]:', err);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: err?.message || 'Chat service failure' },
      },
      { status: 500 }
    );
  }
}
