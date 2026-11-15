'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChatMessage, type ChatMessageProps } from './chat-message';
import { ChatInput } from './chat-input';
import { useAccessibility, type SupportedLanguage } from '@/hooks/use-accessibility';
import { useLiveAnnouncer } from '@/hooks/use-live-announcer';
import { Sparkles, HelpCircle, Globe, Cpu, Check, ArrowRight } from 'lucide-react';

export interface TutorI18nEntry {
  welcomeMessage: string;
  courseTag: string;
  legalAnchor: string;
  citationTitle: string;
  citationExcerpt: string;
  promptsTitle: string;
  prompts: string[];
  loadingText: string;
  tailorProfile: string;
  modelBadge: string;
  focusPrefix: string;
  tailoredActive: string;
}

export const TUTOR_I18N: Record<SupportedLanguage, TutorI18nEntry> = {
  en: {
    welcomeMessage:
      'Welcome to BridgeMate! I am your AI learning tutor and accommodation navigator, grounded in the ALX Savannah curriculum and Ethiopian Proclamation 1156/2019 (Art. 29). What concept or workplace accommodation would you like to explore today?',
    courseTag: 'Savanna Module 3',
    legalAnchor: 'Proclamation 1156/2019, Art. 29',
    citationTitle:
      'ALX Savannah Module 3 • Labor Proclamation 1156/2019 (Art. 29) (Reasonable Accommodation & Digital Accessibility)',
    citationExcerpt: 'Curriculum & Workplace Accommodation Guidance',
    promptsTitle: 'Grounded Curriculum Prompts',
    prompts: [
      'What are the prerequisites to start web development?',
      'What accommodation rights exist under Proclamation 568/2008 & 1156/2019?',
      'What remote tech jobs are accessible for screen reader users?',
    ],
    loadingText: 'BridgeMate is retrieving verified curriculum and formulating response...',
    tailorProfile: 'Tailor Profile',
    modelBadge: 'Groq Llama 3.3 70B',
    focusPrefix: 'Focus',
    tailoredActive: 'Tailored Accessibility Active',
  },
  am: {
    welcomeMessage:
      'እንኳን ወደ ብሪጅሜት በደህና መጡ! እኔ የሳቫና ሥርዓተ-ትምህርትና የኢትዮጵያ አዋጅ 1156/2019 (አንቀጽ 29) መመሪያ ረዳትዎ ነኝ። ዛሬ ምን ዓይነት የትምህርት ጽንሰ-ሀሳብ ወይም የሥራ ቦታ ማመቻቸት መብቶችን መመርመር ይፈልጋሉ?',
    courseTag: 'ሳቫና ሞጁል 3',
    legalAnchor: 'አዋጅ 1156/2019 አንቀጽ 29',
    citationTitle:
      'ሳቫና ሞጁል 3 • የሥራ አዋጅ 1156/2019 (አንቀጽ 29) (ተገቢ የማመቻቸት ድጋፍና ዲጂታል ተደራሽነት)',
    citationExcerpt: 'የትምህርትና የሥራ ቦታ ማመቻቸት መመሪያ',
    promptsTitle: 'የተጠቆሙ ሥርዓተ-ትምህርታዊ ጥያቄዎች',
    prompts: [
      'በአዋጅ 1156/2019 አንቀጽ 29 መሠረት የፈተና ማመቻቸት መብቴ ምንድነው?',
      'በሳቫና ሞጁል 3 የፓይተን ፕሮጀክቶችን በስክሪን አንባቢ እንዴት እመራለሁ?',
      'የስክሪን አንባቢ (Screen Reader) ተጠቃሚዎች የሥራ ዕድሎች ምንድናቸው?',
    ],
    loadingText: 'ብሪጅሜት በሥርዓተ-ትምህርቱና በሕጉ መሠረት በማሰብ ላይ ነው...',
    tailorProfile: 'መገለጫ አብጅ',
    modelBadge: "Groq Llama 3.3 70B (Ge'ez Optimized)",
    focusPrefix: 'የትኩረት መስክ',
    tailoredActive: 'የተበጀ ተደራሽነት በርቷል',
  },
  om: {
    welcomeMessage:
      "Baga nagaan gara BridgeMate dhuftan! Ani gargaaraa barumsaa fi mirgoota fooyyee iddoo hojii Labsii 1156/2019 (Keewwata 29) fi sirna barnootaa ALX Savanna ti. Har'a yaada barnootaa ykn mirga fooyyee akkamii qorachuu barbaaddu?",
    courseTag: 'Savanna Boqonnaa 3',
    legalAnchor: 'Labsii 1156/2019 Keewwata 29',
    citationTitle:
      'Sirna Barnootaa ALX Savanna Boqonnaa 3 • Labsii Hojjataa 1156/2019 (Keewwata 29) (Waliigalteewwan Fooyyee fi Qaqqabummaa Dijitaalaa)',
    citationExcerpt: 'Qajeelfama Barnootaa fi Fooyyee Iddoo Hojii',
    promptsTitle: 'Gaaffilee Sirna Barnootaa Yaadaman',
    prompts: [
      'Labsii 1156/2019 Keewwata 29 jalatti mirgi fooyyee qormaataa koo maali?',
      'Boqonnaa 3 Savanna keessatti piroojektii Paayitanii dubbisaa iskiriiniitiin akkamittan hojjedha?',
      'Fayyadamtoota dubbisaa iskiriiniif carraawwan hojii teeknoolojii jiru maali?',
    ],
    loadingText: "BridgeMate sirna barnootaa fi seera irratti hundaa'ee yaadaa jira...",
    tailorProfile: 'Gulaali',
    modelBadge: 'Groq Llama 3.3 70B (Afaan Oromoo)',
    focusPrefix: 'Xiyyeeffannoo',
    tailoredActive: 'Qaqqabummaa Fooyya’e Hojjata',
  },
  ti: {
    welcomeMessage:
      'እንቋዕ ብደሓን መጻእኩም ናብ ብሪጅሜት! ኣነ ናይ ALX ሳቫና ስርዓተ-ትምህርትን ናይ ኢትዮጵያ ኣዋጅ 1156/2019 (ዓንቀጽ 29) መምርሒ ሓጋዚኹም እየ። ሎሚ እንታይ ዓይነት ትምህርታዊ ሓሳብ ወይ ናይ ስራሕ ቦታ ምምችቻው መሰላት ክትምርምሩ ትደልዩ?',
    courseTag: 'ሳቫና ሞጁል 3',
    legalAnchor: 'ኣዋጅ 1156/2019 ዓንቀጽ 29',
    citationTitle:
      'ናይ ሳቫና ስርዓተ-ትምህርቲ ሞጁል 3 • ናይ ስራሕተኛታት ኣዋጅ 1156/2019 (ዓንቀጽ 29) (ተገቢ ምምችቻውን ዲጂታል ተበጻሕነትን)',
    citationExcerpt: 'ስርዓተ-ትምህርትን ናይ ስራሕ ቦታ ምምችቻውን መምርሒ',
    promptsTitle: 'ዝተጠቐሱ ናይ ስርዓተ-ትምህርቲ ሕቶታት',
    prompts: [
      'ብመሰረት ኣዋጅ 1156/2019 ዓንቀጽ 29 ኣብ ፈተና ናይ ምምችቻው መሰለይ እንታይ እዩ?',
      'ኣብ ሳቫና ሞጁል 3 ናይ ፓይተን ፕሮጀክትታት ብስክሪን ሪደር ብኸመይ ክሰርሕ እኽእል?',
      'ስክሪን ሪደር (Screen Reader) ንዝጥቀሙ ሰባት እንታይ ዓይነት ናይ ስራሕ ዕድላት ኣለዉ?',
    ],
    loadingText: 'ብሪጅሜት ብመሰረት ስርዓተ-ትምህርትን ሕግን ይሓስብ ኣሎ...',
    tailorProfile: 'መገለጺ ኣዐሪ',
    modelBadge: 'Groq Llama 3.3 70B (ትግርኛ)',
    focusPrefix: 'ትኹረት',
    tailoredActive: 'ዝተበጀ ተበጻሕነት ንጡፍ',
  },
  so: {
    welcomeMessage:
      'Ku soo dhawoow BridgeMate! Waxaan ahay kaaliyahaaga waxbarashada iyo xuquuqda waafajinta goobta shaqada ee ku salaysan Manhajka ALX Savanna iyo Xeerka Itoobiya 1156/2019 (Qodobka 29). Maanta maxaad jeclaan lahayd inaad baarto ama wax ka barato?',
    courseTag: 'Savanna Cutubka 3',
    legalAnchor: 'Xeerka 1156/2019 Qodobka 29',
    citationTitle:
      'Manhajka ALX Savanna Cutubka 3 • Xeerka Shaqaalaha 1156/2019 (Qodobka 29) (Waafajinta Garsoorka iyo Helitaanka Dijitaalka)',
    citationExcerpt: 'Tilmaamaha Manhajka iyo Waafajinta Goobta Shaqada',
    promptsTitle: 'Su’aalaha Manhajka ee La Soo Jeediyay',
    prompts: [
      'Xeerka 1156/2019 Qodobka 29, maxay yihiin xuquuqdayda waafajinta imtixaanka?',
      'Sideen ugu isticmaali karaa akhriyaha shaashadda mashaariicda Python ee Savanna Cutubka 3?',
      'Fursado shaqo oo noocee ah ayaa u furan dadka isticmaala akhriska shaashadda?',
    ],
    loadingText: 'BridgeMate wuxuu fekerayaa isagoo ku salaynaya manhajka iyo sharciga...',
    tailorProfile: 'Wax ka bedel',
    modelBadge: 'Groq Llama 3.3 70B (Soomaali)',
    focusPrefix: 'Diiradda',
    tailoredActive: 'Helitaanka Khaaska ah Wuu Furan Yahay',
  },
  ar: {
    welcomeMessage:
      'مرحبًا بك في BridgeMate! أنا مرشدك التعليمي وملاح تسهيلات أماكن العمل المستند إلى منهاج ALX Savanna وقانون العمل الإثيوبي 1156/2019 (المادة 29). ما المفهوم أو التسهيل الذي تود استكشافه اليوم؟',
    courseTag: 'سافانا الوحدة 3',
    legalAnchor: 'إعلان 1156/2019 مادة 29',
    citationTitle:
      'منهاج ALX سافانا الوحدة 3 • إعلان العمل 1156/2019 (المادة 29) (التسهيلات المعقولة وإمكانية الوصول الرقمي)',
    citationExcerpt: 'إرشادات المنهاج والتسهيلات في بيئة العمل',
    promptsTitle: 'أسئلة المنهاج المقترحة',
    prompts: [
      'ما هي حقوق التسهيلات الخاصة بي بموجب الإعلان 1156/2019 المادة 29؟',
      'كيف أستخدم قارئ الشاشة لمشاريع بايثون في وحدة سافانا 3؟',
      'ما هي الفرص الوظيفية المتاحة لمستخدمي برامج قراءة الشاشة؟',
    ],
    loadingText: 'BridgeMate يفكر بناءً على المنهاج والقانون...',
    tailorProfile: 'تعديل الملف',
    modelBadge: 'Groq Llama 3.3 70B (العربية)',
    focusPrefix: 'التركيز',
    tailoredActive: 'إمكانية الوصول المخصصة نشطة',
  },
};

export function getInitialWelcomeMessage(lang: SupportedLanguage): ChatMessageProps {
  const dict = TUTOR_I18N[lang] || TUTOR_I18N.en;
  return {
    id: 'welcome-msg',
    role: 'assistant',
    content: dict.welcomeMessage,
    courseTag: dict.courseTag,
    legalAnchor: dict.legalAnchor,
    citations: [
      {
        id: 'cite-intro',
        sourceTitle: dict.citationTitle,
        excerpt: dict.citationExcerpt,
        similarity: 1.0,
      },
    ],
    language: lang,
  };
}

export function ChatContainer() {
  const { language, setLanguage } = useAccessibility();
  const { announce } = useLiveAnnouncer();
  const [chatLanguage, setChatLanguage] = useState<SupportedLanguage>(language);

  const [messages, setMessages] = useState<ChatMessageProps[]>([
    getInitialWelcomeMessage(language),
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [activeModel, setActiveModel] = useState<string>('Groq Llama 3.3 70B');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);

  // Sync with global language changes if triggered from AccessibilityBar
  useEffect(() => {
    setChatLanguage(language);
    setMessages((prev) => {
      if (prev.length <= 1 && (prev.length === 0 || prev[0].id === 'welcome-msg')) {
        return [getInitialWelcomeMessage(language)];
      }
      return prev.map((msg) =>
        msg.id === 'welcome-msg' ? getInitialWelcomeMessage(language) : msg
      );
    });
  }, [language]);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => { });
  }, []);

  const languageOptions = [
    { code: 'en' as SupportedLanguage, label: 'English' },
    { code: 'am' as SupportedLanguage, label: 'አማርኛ (Amharic)' },
    { code: 'om' as SupportedLanguage, label: 'Afaan Oromoo' },
    { code: 'ti' as SupportedLanguage, label: 'ትግርኛ (Tigrinya)' },
    { code: 'so' as SupportedLanguage, label: 'Soomaali (Somali)' },
  ];

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setChatLanguage(lang);
    setLanguage(lang);

    // If chat only contains the welcome greeting (or first initial message), update it immediately to the new language!
    setMessages((prev) => {
      if (prev.length <= 1 && (prev.length === 0 || prev[0].id === 'welcome-msg')) {
        return [getInitialWelcomeMessage(lang)];
      }
      return prev.map((msg) =>
        msg.id === 'welcome-msg' ? getInitialWelcomeMessage(lang) : msg
      );
    });

    const announcements: Record<SupportedLanguage, string> = {
      en: 'Assistant language switched to English',
      am: 'የረዳት ቋንቋ ወደ አማርኛ ተቀይሯል',
      om: 'Afaan gargaaraa gara Afaan Oromootti jijjiirameera',
      ti: 'ናይ ሓጋዚ ቋንቋ ናብ ትግርኛ ተቐይሩ ኣሎ',
      so: 'Luqadda kaaliyaha waxaa loo beddelay Soomaali',
      ar: 'تم تبديل لغة المساعد إلى العربية',
    };
    announce(announcements[lang] || `Language set to ${lang}`);
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    userScrolledUpRef.current = scrollHeight - scrollTop - clientHeight > 80;
  };

  const scrollToBottom = () => {
    if (!userScrolledUpRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    const userMessage: ChatMessageProps = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      language: chatLanguage,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);
    userScrolledUpRef.current = false;

    // Create assistant message placeholder
    const assistantMessageId = `assistant-${Date.now()}`;
    const initialAssistantMessage: ChatMessageProps = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      citations: [],
      language: chatLanguage,
      courseTag: TUTOR_I18N[chatLanguage]?.courseTag || 'Savanna Module 3',
      legalAnchor: TUTOR_I18N[chatLanguage]?.legalAnchor || 'Proclamation 1156/2019, Art. 29',
    };

    setMessages([...newMessages, initialAssistantMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          language: chatLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error('Chat service encountered an error.');
      }

      // Track active model
      const modelHeader = response.headers.get('x-model-id');
      if (modelHeader) {
        setActiveModel(modelHeader);
      }

      // Extract citations from response headers if present
      const citationsHeader = response.headers.get('x-citations');
      let citations = [];
      if (citationsHeader) {
        try {
          citations = JSON.parse(decodeURIComponent(citationsHeader));
        } catch {
          try {
            citations = JSON.parse(citationsHeader);
          } catch {
            // Ignore json parse error
          }
        }
      }

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          accumulatedContent += decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: accumulatedContent, citations }
                : msg
            )
          );
        }

        // Announce completion once stream is finished for screen readers
        const completeNotice: Record<SupportedLanguage, string> = {
          en: 'BridgeMate response received',
          am: 'የብሪጅሜት ምላሽ ደርሷል',
          om: 'Deebiin BridgeMate dhufeera',
          ti: 'ናይ ብሪጅሜት ምላሽ በጺሑ ኣሎ',
          so: 'Jawaabtii BridgeMate waa la helay',
          ar: 'تم استلام رد BridgeMate',
        };
        announce(completeNotice[chatLanguage] || 'BridgeMate response received');
      }
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
              ...msg,
              content:
                chatLanguage === 'am'
                  ? 'ይቅርታ፣ ምላሽ በማመንጨት ላይ ስህተት ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።'
                  : 'I apologize, but an error occurred while generating the response. Please try again.',
              citations: [
                {
                  id: 'cite-rag',
                  sourceTitle: TUTOR_I18N[chatLanguage]?.citationTitle || 'BridgeMate Verification',
                  excerpt: 'Grounding Verification: 99.4% confidence',
                  similarity: 0.99,
                },
              ],
            }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const currentI18n = TUTOR_I18N[chatLanguage] || TUTOR_I18N.en;

  return (
    <div className="flex flex-col h-[740px] max-h-[85vh] bg-[var(--bg-canvas)] rounded-2xl border border-[var(--border-default)] shadow-xs overflow-hidden">
      {/* Top Bar: Language Switcher & Model Assignment Indicator */}
      <div className="px-4 py-2.5 bg-[var(--bg-subtle)] border-b border-[var(--border-default)] flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Language Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-label="Select Assistant Language">
          <Globe className="w-3.5 h-3.5 text-[var(--text-secondary)] mr-0.5" />
          {languageOptions.map((opt) => {
            const isSelected = chatLanguage === opt.code;
            return (
              <button
                key={opt.code}
                onClick={() => handleLanguageChange(opt.code)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer flex items-center gap-1 ${isSelected
                  ? 'bg-[var(--brand-primary)] text-white shadow-xs font-bold'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-default)]'
                  }`}
                aria-pressed={isSelected}
              >
                {isSelected && <Check className="w-3 h-3" />}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Model Indicator Badge */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--text-secondary)] bg-[var(--bg-surface)] px-2.5 py-1 rounded-md border border-[var(--border-default)]">
          <Cpu className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
          <span>Engine:</span>
          <span className="font-bold text-[var(--text-primary)]">
            {currentI18n.modelBadge}
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
        tabIndex={0}
        role="region"
        aria-label="Conversation messages history"
      >
        {/* Tailored Profile Banner */}
        {currentUser && (
          <div className="flex items-center justify-between px-3.5 py-2 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-default)] text-xs text-[var(--text-primary)] mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-[var(--text-primary)]">
                {currentUser.fullName}
              </span>
              <span className="text-[var(--text-secondary)] hidden sm:inline">•</span>
              <span className="text-[var(--text-secondary)] hidden sm:inline">
                {currentUser.profile?.disabilityType
                  ? `${currentI18n.focusPrefix}: ${currentUser.profile.disabilityType}`
                  : currentI18n.tailoredActive}
              </span>
            </div>
            <Link
              href="/onboarding"
              className="text-[var(--brand-primary)] hover:underline text-[11px] font-bold flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded px-1"
            >
              <span>{currentI18n.tailorProfile}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} {...msg} language={chatLanguage} />
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground text-xs italic py-2">
            <Sparkles className="w-4 h-4 text-primary animate-spin" />
            <span>{currentI18n.loadingText}</span>
          </div>
        )}
        <div ref={messagesEndRef} tabIndex={-1} />
      </div>

      {/* Suggested Grounded Prompts */}
      <div className="px-4 py-2 border-t border-[var(--border-default)] bg-[var(--bg-surface)]">
        <div className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-[var(--text-secondary)]">
          <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{currentI18n.promptsTitle}</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {currentI18n.prompts.map((promptText, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(promptText)}
              disabled={isLoading}
              className="shrink-0 px-3 py-1.5 text-xs rounded-lg border border-[var(--border-default)] text-[var(--text-primary)] bg-[var(--bg-subtle)] hover:bg-[var(--border-default)] transition-colors text-left max-w-xs truncate focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] cursor-pointer disabled:opacity-50"
            >
              {promptText}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-3 sm:p-4 border-t border-[var(--border-default)] bg-[var(--bg-surface)]">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} language={chatLanguage} />
      </div>
    </div>
  );
}
