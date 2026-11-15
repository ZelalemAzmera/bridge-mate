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
      /^(ሰላም|ጤና ይስጥልኝ|እንደምን አለህ|እንደምን አለሽ|ሃይ)\b/.test(trimmed) ||
      /^(akkam|ashamaa|nagaa|akkam jirtu)\b/i.test(trimmed) ||
      /^(ከመይ አለኻ|ከመይ አለኺ|ከመይ ሓዲርኩም)\b/.test(trimmed) ||
      /^(iska warran|soo dhowow|subax wanaagsan|galab wanaagsan)\b/i.test(trimmed);

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

    // 5. Offline Resilient Mock Streaming Response across Supported Languages
    const lang = userLanguage === 'om' ? 'om' :
                 userLanguage === 'ti' ? 'ti' :
                 userLanguage === 'so' ? 'so' :
                 userLanguage === 'ar' ? 'ar' :
                 (userLanguage === 'am' || /[\u1200-\u137F]/.test(latestMessage)) ? 'am' : 'en';

    let mockResponse = '';

    if (isGreeting) {
      const nameStr = user?.fullName ? (lang === 'en' ? ` ${user.fullName}` : ` ${user.fullName}`) : '';
      if (lang === 'am') {
        mockResponse = `ሰላም${nameStr}! 👋 ወደ ብሪጅሜት እንኳን በደህና መጡ።\n\n` +
          (user?.profile?.disabilityType ? `ለእርስዎ የተዘጋጀው የተደራሽነት መገለጫ (${user.profile.disabilityType}) ነቅቷል።\n\n` : '') +
          `እኔ ብሪጅሜት ነኝ — የቴክኖሎጂ ትምህርቶችን፣ በአዋጅ 1156/2019 የተደገፉ የተደራሽነት መብቶችን እና አካታች የሥራ ዕድሎችን እንዲረዱ ለማገዝ ዝግጁ ነኝ።\n\n` +
          `ዛሬ በምን ላግዝዎት?\n` +
          `• ስለ ኮርሶች ወይም ስለ ፈተና ማመቻቸት መጠየቅ\n` +
          `• የሥራ ማስታወቂያ ማነቆዎችን መመርመር\n` +
          `• የቀጥታ የሰው ድጋፍ ማግኘት (Alt+H)`;
      } else if (lang === 'om') {
        mockResponse = `Akkam${nameStr}! 👋 Baga nagaan gara BridgeMate dhuftan.\n\n` +
          (user?.profile?.disabilityType ? `Piroofaayiliin dhaqqabummaa keessan (${user.profile.disabilityType}) hojjechaa jira.\n\n` : '') +
          `Ani BridgeMate dha — leenjii teeknoolojii ALX, mirgoota madaqsuu Labsii 1156/2019, fi carraawwan hojii hunda-hammataa hubachuuf isin gargaaruuf qophiidha.\n\n` +
          `Har'a maalin isin gargaaruu danda'a?\n` +
          `• Waa'ee koorsii fi madaqsuu qormaataa gaafachuu\n` +
          `• Beeksisa hojii keessatti gufuuwwan jiran sakatta'uu\n` +
          `• Gargaarsa namaa kallattiin argachuu (Alt+H)`;
      } else if (lang === 'ti') {
        mockResponse = `ሰላም${nameStr}! 👋 ናብ ብሪጅሜት ብደሓን መጻእኩም።\n\n` +
          (user?.profile?.disabilityType ? `ንዓኹም ዝተዳለወ ናይ ተበጻሕነት መገለጺ (${user.profile.disabilityType}) ንጡፍ እዩ።\n\n` : '') +
          `ኣነ ብሪጅሜት እየ — ናይ ቴክኖሎጂ ትምህርትታት፣ ብኣዋጅ 1156/2019 ዝተደገፉ ናይ ተበጻሕነት መሰላትን ናይ ስራሕ ዕድላትን ንኽትርድኡ ንምሕጋዝ ድሉው እየ።\n\n` +
          `ሎሚ ብምንታይ ክሕግዘኩም?\n` +
          `• ብዛዕባ ኮርሳትን ምምችቻው ፈተናታትን ምሕታት\n` +
          `• ኣብ ናይ ስራሕ ምልክታታት ዘለዉ ዕንቅፋታት ምምርማር\n` +
          `• ቀጥታዊ ናይ ሰብ ሓገዝ ምርካብ (Alt+H)`;
      } else if (lang === 'so') {
        mockResponse = `Salaan${nameStr}! 👋 Ku soo dhowow BridgeMate.\n\n` +
          (user?.profile?.disabilityType ? `Xogtaada helitaanka u gaarka ah (${user.profile.disabilityType}) waa mid firfircoon.\n\n` : '') +
          `Waxaan ahay BridgeMate — hagahaaga koorsooyinka farsamada ALX, xuquuqda waafajinta ee Xeerka 1156/2019, iyo fursadaha shaqo ee loo dhan yahay.\n\n` +
          `Sideen maanta kuu caawin karaa?\n` +
          `• Weydii ku saabsan koorsooyinka iyo waafajinta imtixaannada\n` +
          `• Baadhitaanka caqabadaha ku jira xayaysiisyada shaqada\n` +
          `• Helitaanka caawimaad toos ah oo bini'aadan ah (Alt+H)`;
      } else if (lang === 'ar') {
        mockResponse = `مرحبًا${nameStr}! 👋 أهلاً بك في BridgeMate.\n\n` +
          (user?.profile?.disabilityType ? `ملف إمكانية الوصول المخصص لك (${user.profile.disabilityType}) نشط حاليًا.\n\n` : '') +
          `أنا BridgeMate — دليلك الميسر لدورات ALX التقنية، وحقوق التسهيلات المعقولة بموجب إعلان العمل الإثيوبي 1156/2019، والفرص الوظيفية الدامجة.\n\n` +
          `كيف يمكنني مساعدتك اليوم؟\n` +
          `• السؤال عن الدورات وتسهيلات الامتحانات\n` +
          `• تحليل إعلانات الوظائف للكشف عن المتطلبات المخفية\n` +
          `• طلب الدعم البشري المباشر بنقرة واحدة (Alt+H)`;
      } else {
        mockResponse = `Hello${nameStr}! 👋 Welcome to BridgeMate.\n\n` +
          (user?.profile?.disabilityType ? `Your tailored accessibility profile (${user.profile.disabilityType}) is active.\n\n` : '') +
          `I am your accessible guide for ALX tech courses, disability accommodation rights under Ethiopian Proclamation 1156/2019, and inclusive career opportunities.\n\n` +
          `How can I assist you today? You can ask me:\n` +
          `• Prerequisites and accommodations for ALX courses (Python, AWS, Front-End)\n` +
          `• How to decode a job notice for hidden physical requirements\n` +
          `• Requesting 1-click live human support (Alt+H)`;
      }
    } else if (lang === 'am') {
      mockResponse = `ሰላም! ጥያቄዎትን ተቀብያለሁ። በብሪጅሜት የተረጋገጠ የሥርዓተ-ትምህርት መረጃ መሠረት፡\n\n` +
        `• የኮምፒውተር ፕሮግራሚንግና የዲጂታል ክህሎቶችን ለመማር መሠረታዊ የኮምፒውተር አጠቃቀም እና አመክንዮአዊ አስተሳሰብ አስፈላጊ ናቸው [Source: ${citations[0]?.sourceTitle || 'መሠረታዊ የዲጂታል ክህሎት'}]።\n` +
        `• በአዋጅ ቁጥር 1156/2019 አንቀጽ 29 መሠረት ማንኛውም የአካል ጉዳተኛ ዜጋ ለትምህርትና ለፈተና ተደራሽ የሆኑ ቁሳቁሶችን የማግኘት ሕጋዊ መብት አለው [Source: ${citations[1]?.sourceTitle || 'የኢትዮጵያ የሥራና የአካል ጉዳት ሕግ'}]።\n\n` +
        `ተጨማሪ ማብራሪያ ወይም የማመቻቸት ጥያቄ ደብዳቤ ማዘጋጀት ይፈልጋሉ?`;
    } else if (lang === 'om') {
      mockResponse = `Akkam! Gaaffii keessan qoradheera. Bu'uura silabasii mirkanaa'e BridgeMate tiin:\n\n` +
        `• Piroogiraamingii fi dandeettii dijitaalaa baruuf beekumsa bu'uuraa kompiitaraa fi yaada loojikii qabaachuun barbaachisaadha [Source: ${citations[0]?.sourceTitle || 'Dandeettiiwwan Dijitaalaa Bu’uuraa'}]。\n` +
        `• Akka Labsii Hojjataa Itoophiyaa 1156/2019 Keewwata 29 tti, namoonni qaama miidhamoo qabaniif madaqsuu barbaachisaa ta'e barnootaa fi qormaata keessatti argachuuf mirga guutuu qabu [Source: ${citations[1]?.sourceTitle || 'Mirga Qaama Miidhamtootaa Itoophiyaa'}]。\n\n` +
        `Xalayaa gaaffii madaqsuu qopheessuu ykn carraawwan hojii dabalataa ilaaluu barbaadduu?`;
    } else if (lang === 'ti') {
      mockResponse = `ሰላም! ሕቶኹም ተቐቢለ ኣለኹ። ኣብ ብሪጅሜት ብዝተረጋገጸ ስርዓተ-ትምህርቲ መረዳእታ መሰረት፡\n\n` +
        `• ፕሮግራሚንግን ዲጂታል ክእለታትን ንምምሃር መሰረታዊ ናይ ኮምፒተር ኣጠቓቕማን አመዛዝናን ኣገዳሲ እዩ [Source: ${citations[0]?.sourceTitle || 'መሰረታዊ ዲጂታል ክእለት'}]።\n` +
        `• ብመሰረት ኣዋጅ 1156/2019 ዓንቀጽ 29፣ ዝኾነ ኣካል ጉዳይ ዘለዎ ዜጋ ኣብ ትምህርትን ፈተናን ተበጻሒ ምምችቻው ናይ ምርካብ ሕጋዊ መሰል ኣለዎ [Source: ${citations[1]?.sourceTitle || 'ናይ ኢትዮጵያ ናይ ስራሕን ኣካል ጉዳትን ሕጊ'}]።\n\n` +
        `ተወሳኺ መብርሂ ወይ ናይ ምምችቻው ሕቶ ደብዳበ ክትሰርሑ ትደልዩ ዶ?`;
    } else if (lang === 'so') {
      mockResponse = `Salaan! Su'aashaada waan helay. Marka loo eego agabka manhajka la xaqiijiyay ee BridgeMate:\n\n` +
        `• Si aad u bilowdo barashada barnaamijyada iyo xirfadaha dhijitaalka ah, fahamka aasaasiga ah iyo qalabka helitaanka dhijitaalka ah ayaa lagula talinayaa [Source: ${citations[0]?.sourceTitle || 'Aasaaska Xirfadaha Dhijitaalka ah'}]。\n` +
        `• Sida ku cad Xeerka Shaqaalaha Itoobiya 1156/2019 Qodobka 29, dadka naafada ah waxay xaq buuxa u leeyihiin waafajin macquul ah xagga waxbarashada iyo goobaha shaqada [Source: ${citations[1]?.sourceTitle || 'Sharciga Shaqaalaha Itoobiya'}]。\n\n` +
        `Ma jeclaan lahayd inaad diyaariso codsi rasmi ah oo waafajin ah mise waxaad doonaysaa macluumaad dheeraad ah?`;
    } else if (lang === 'ar') {
      mockResponse = `مرحبًا! تلقيت استفسارك. استنادًا إلى مواد المناهج المعتمدة في BridgeMate:\n\n` +
        `• لبدء تعلم البرمجة والمهارات الرقمية، يوصى بفهم المنطق التأسيسي وأدوات إمكانية الوصول الرقمي [Source: ${citations[0]?.sourceTitle || 'أساسيات المهارات الرقمية'}]。\n` +
        `• بموجب إعلان العمل الإثيوبي 1156/2019 المادة 29، يتمتع الأشخاص ذوو الإعاقة بحقوق قانونية كاملة في التسهيلات المعقولة في التقييمات التعليمية وبيئات العمل [Source: ${citations[1]?.sourceTitle || 'نظرة عامة على قانون العمل الإثيوبي'}]。\n\n` +
        `هل ترغب في صياغة طلب رسمي للحصول على تسهيلات معقولة أو استكشاف المزيد من التفاصيل؟`;
    } else {
      mockResponse = `Hello! Based on verified curriculum materials in BridgeMate:\n\n` +
        `• To start learning programming and digital skills, understanding foundational logic and digital accessibility tools is recommended [Source: ${citations[0]?.sourceTitle || 'Web Development Fundamentals'}]。\n` +
        `• Under Ethiopian Proclamation 1156/2019 (Art. 29), persons with disabilities have full legal rights to reasonable accommodation in both educational assessments and workplace environments [Source: ${citations[1]?.sourceTitle || 'Ethiopian Labor Proclamation Overview'}]。\n\n` +
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

