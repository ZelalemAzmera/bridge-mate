import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import { getAIProvider, isLiveAIConfigured } from '@/lib/ai/providers';
import { retrieveRelevantChunks } from '@/lib/ai/rag/retriever';
import { buildGroundedContext } from '@/lib/ai/rag/context-builder';
import { buildSystemPrompt } from '@/lib/ai/prompts/system-chat';
import { getRepository } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages || [];
    const latestMessage = messages[messages.length - 1]?.content || body.prompt || '';
    const conversationId = body.conversationId || 'default-session';

    if (!latestMessage) {
      return NextResponse.json(
        { error: 'Message content is required.' },
        { status: 400 }
      );
    }

    const user = await getAuthUser();
    const userLanguage = body.language || user?.preferredLanguage || (/[\\u1200-\\u137F]/.test(latestMessage) ? 'am' : 'en');

    const trimmed = latestMessage.trim().toLowerCase();
    const isGreeting =
      /^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening)|howdy)\b/i.test(trimmed) ||
      /^(ሰላም|ጤና ይስጥልኝ|እንደምን አለህ|እንደምን አለሽ|ሃይ)\b/.test(trimmed);

    const userProfile = user ? {
      fullName: user.fullName,
      userType: user.profile?.userType,
      disabilityType: user.profile?.disabilityType,
      primaryGoal: user.profile?.primaryGoal,
      assistiveTech: user.profile?.assistiveTech,
      preferredLanguage: userLanguage,
    } : undefined;

    let citations: any[] = [];
    let promptContext = '';

    // Only perform RAG chunk retrieval when the user is asking an actual question
    if (!isGreeting) {
      const { chunks } = await retrieveRelevantChunks(latestMessage);
      const grounded = buildGroundedContext(chunks);
      promptContext = grounded.promptContext;
      citations = grounded.citations;
    }

    // 2. Build system instructions with grounded context, user language, and tailored profile
    const systemInstruction = buildSystemPrompt(promptContext, userLanguage, userProfile);

    // 3. Save user message to database
    const repo = getRepository();
    try {
      await repo.conversations.addMessage({
        conversationId,
        role: 'user',
        content: latestMessage,
      });
    } catch {
      // Ignore if session record creation is deferred
    }

    // Safe ASCII-encoded citations header
    let encodedCitations = '';
    try {
      encodedCitations = encodeURIComponent(JSON.stringify(citations));
    } catch {
      encodedCitations = '[]';
    }

    // 4. Live AI Streaming (Groq Llama 3.3 70B / Gemini / OpenAI)
    if (isLiveAIConfigured()) {
      const { model, modelId, provider } = getAIProvider({ language: userLanguage });
      if (model) {
        console.log(`[BridgeMate AI] Routing chat to ${provider} model: ${modelId} for language: ${userLanguage}`);
        const result = streamText({
          model,
          system: systemInstruction,
          messages: messages.map((m: any) => ({
            role: m.role,
            content: m.content,
          })),
        });

        return result.toDataStreamResponse({
          headers: {
            'x-citations': encodedCitations,
            'x-model-id': modelId,
            'x-provider': provider,
          },
        });
      }
    }

    // 5. Offline Resilient Mock Streaming Response
    const isAmharic = userLanguage === 'am' || /[\u1200-\u137F]/.test(latestMessage);
    let mockResponse = '';

    if (isGreeting) {
      const nameStr = user?.fullName ? (isAmharic ? `${user.fullName} ` : ` ${user.fullName}`) : '';
      if (isAmharic) {
        mockResponse = `ሰላም ${nameStr}! 👋 ወደ ብሪጅሜት እንኳን በደህና መጡ።\n\n` +
          (user?.profile?.disabilityType ? `ለእርስዎ የተዘጋጀው የተደራሽነት መገለጫ (${user.profile.disabilityType}) ነቅቷል።\n\n` : '') +
          `እኔ ብሪጅሜት ነኝ — የቴክኖሎጂ ትምህርቶችን፣ በአዋጅ 1156/2019 የተደገፉ የተደራሽነት መብቶችን እና አካታች የሥራ ዕድሎችን እንዲረዱ ለማገዝ ዝግጁ ነኝ።\n\n` +
          `ዛሬ በምን ላግዝዎት?\n` +
          `• ስለ ኮርሶች ወይም ስለ ፈተና ማመቻቸት መጠየቅ\n` +
          `• የሥራ ማስታወቂያ ማነቆዎችን መመርመር\n` +
          `• የቀጥታ የሰው ድጋፍ ማግኘት (Alt+H)`;
      } else {
        mockResponse = `Hello${nameStr}! 👋 Welcome to BridgeMate.\n\n` +
          (user?.profile?.disabilityType ? `Your tailored accessibility profile (${user.profile.disabilityType}) is active.\n\n` : '') +
          `I am your accessible guide for ALX tech courses, disability accommodation rights under Ethiopian Proclamation 1156/2019, and inclusive career opportunities.\n\n` +
          `How can I assist you today? You can ask me:\n` +
          `• Prerequisites and accommodations for ALX courses (Python, AWS, Front-End)\n` +
          `• How to decode a job notice for hidden physical requirements\n` +
          `• Requesting 1-click live human support (Alt+H)`;
      }
    } else if (isAmharic) {
      mockResponse = `ሰላም! ጥያቄዎትን ተቀብያለሁ። በብሪጅሜት የተረጋገጠ የሥርዓተ-ትምህርት መረጃ መሠረት፡\n\n` +
        `• የኮምፒውተር ፕሮግራሚንግና የዲጂታል ክህሎቶችን ለመማር መሠረታዊ የኮምፒውተር አጠቃቀም እና አመክንዮአዊ አስተሳሰብ አስፈላጊ ናቸው [Source: ${citations[0]?.sourceTitle || 'መሠረታዊ የዲጂታል ክህሎት'}]።\n` +
        `• በአዋጅ ቁጥር 568/2008 መሠረት ማንኛውም የአካል ጉዳተኛ ዜጋ ለትምህርትና ለፈተና ተደራሽ የሆኑ ቁሳቁሶችን የማግኘት ሕጋዊ መብት አለው [Source: ${citations[1]?.sourceTitle || 'የኢትዮጵያ የሥራና የአካል ጉዳት ሕግ'}]።\n\n` +
        `ተጨማሪ ማብራሪያ ወይም የማመቻቸት ጥያቄ ደብዳቤ ማዘጋጀት ይፈልጋሉ?`;
    } else {
      mockResponse = `Hello! Based on verified curriculum materials in BridgeMate:\n\n` +
        `• To start learning programming and digital skills, understanding foundational logic and digital accessibility tools is recommended [Source: ${citations[0]?.sourceTitle || 'Web Development Fundamentals'}]。\n` +
        `• Under Ethiopian Proclamation 568/2008, persons with disabilities have full legal rights to reasonable accommodation in both educational assessments and workplace environments [Source: ${citations[1]?.sourceTitle || 'Ethiopian Labor Proclamation Overview'}]。\n\n` +
        `Would you like to draft a formal accommodation request or explore relevant entry-level opportunities?`;
    }

    // Return a streaming text response conforming to SSE / Data Stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Stream the response in readable tokens
        const tokens = mockResponse.split(' ');
        for (let i = 0; i < tokens.length; i++) {
          controller.enqueue(encoder.encode(tokens[i] + ' '));
          await new Promise((resolve) => setTimeout(resolve, 20));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'x-citations': encodedCitations,
      },
    });
  } catch (error: any) {
    console.error('[BridgeMate Chat API Error]:', error);
    return NextResponse.json(
      { error: 'Internal chat assistant error.', details: error.message },
      { status: 500 }
    );
  }
}

