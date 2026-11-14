'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChatMessage, type ChatMessageProps } from './chat-message';
import { ChatInput } from './chat-input';
import { useAccessibility, type SupportedLanguage } from '@/hooks/use-accessibility';
import { useLiveAnnouncer } from '@/hooks/use-live-announcer';
import { Sparkles, HelpCircle, Globe, Cpu, Zap, Check, User, ArrowRight } from 'lucide-react';

export function ChatContainer() {
  const { language, setLanguage } = useAccessibility();
  const { announce } = useLiveAnnouncer();
  const [chatLanguage, setChatLanguage] = useState<SupportedLanguage>(language);

  // Sync with global language changes if triggered from AccessibilityBar
  useEffect(() => {
    setChatLanguage(language);
  }, [language]);

  const [messages, setMessages] = useState<ChatMessageProps[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content:
        language === 'am'
          ? 'ሰላም! እኔ ብሪጅሜት ነኝ — ለአካል ጉዳተኛ ወጣቶች የተዘጋጀ የዲጂታል ክህሎትና የሥራ ዕድል መመሪያ ረዳት። ዛሬ ምን መማር ወይም ማወቅ ይፈልጋሉ?'
          : 'Hello! I am BridgeMate — your accessible guide for digital skills, career development, and accommodation rights. How can I help you today?',
      citations: [
        {
          id: 'cite-intro',
          sourceTitle: language === 'am' ? 'የብሪጅሜት መመሪያ' : 'BridgeMate Curriculum Overview',
          excerpt: language === 'am' ? 'የተደራሽነትና የዲጂታል ክህሎት ማብራሪያ' : 'Accessible digital skills guidance',
          similarity: 1.0,
        },
      ],
      language,
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [activeModel, setActiveModel] = useState<string>('Llama 3.3 70B (Groq)');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const languageOptions = [
    { code: 'en' as SupportedLanguage, label: 'English', model: 'Llama 3.3 70B' },
    { code: 'am' as SupportedLanguage, label: 'አማርኛ (Amharic)', model: 'Llama 3.3 70B' },
    { code: 'om' as SupportedLanguage, label: 'Afaan Oromoo', model: 'Llama 3.3 70B' },
    { code: 'ti' as SupportedLanguage, label: 'ትግርኛ (Tigrinya)', model: 'Llama 3.3 70B' },
    { code: 'so' as SupportedLanguage, label: 'Soomaali (Somali)', model: 'Llama 3.3 70B' },
  ];

  const samplePrompts = {
    en: [
      'What are the prerequisites to start web development?',
      'What accommodation rights exist under Proclamation 568/2008 & 1156/2019?',
      'What remote tech jobs are accessible for screen reader users?',
    ],
    am: [
      'የኮምፒውተር ፕሮግራሚንግ ለመማር ምን ያስፈልገኛል?',
      'በአዋጅ 568/2008 እና 1156/2019 መሠረት የፈተና ማመቻቸት መብቴ ምንድነው?',
      'የስክሪን አንባቢ (Screen Reader) ተጠቃሚዎች የሥራ ዕድሎች ምንድናቸው?',
    ],
    om: [
      'Sagantaa kompiitaraa barachuuf maaltu na barbaachisa?',
      'Labsii 568/2008 fi 1156/2019 jalatti mirgootni qormaatarratti naaf kennamu maali?',
      'Carraawwan hojii teeknoolojii fayyadamtoota dubbisaa iskiriiniif jiru maali?',
    ],
    ti: [
      'ናይ ኮምፒተር ፕሮግራሚንግ ንምምሃር እንታይ የድልየኒ?',
      'ብመሰረት ኣዋጅ 568/2008ን 1156/2019ን ኣብ ፈተና ናይ ምምችቻው መሰለይ እንታይ እዩ?',
      'ስክሪን ሪደር (Screen Reader) ንዝጥቀሙ ሰባት እንታይ ዓይነት ናይ ስራሕ ዕድላት ኣለዉ?',
    ],
    so: [
      'Waa maxay waxyaabaha looga baahan yahay barashada barnaamijyada kombiyuutarka?',
      'Xuquuqdee ayaan u leeyahay waafajinta imtixaanka sida ku cad Xeerka 1156/2019?',
      'Fursado shaqo oo noocee ah ayaa u furan dadka isticmaala akhriska shaashadda?',
    ],
  }[chatLanguage] || [
      'What are the prerequisites to start web development?',
      'What accommodation rights exist under Proclamation 568/2008?',
      'What remote tech jobs are suitable for screen reader users?',
    ];

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setChatLanguage(lang);
    setLanguage(lang);
    announce(`Language set to ${lang}`);
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
        announce(
          chatLanguage === 'am'
            ? 'የብሪጅሜት ምላሽ ደርሷል'
            : 'BridgeMate response received'
        );
      }
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
              ...msg,
              content:
                chatLanguage === 'am'
                  ? 'ይቅርታ፣ ምላሽ ለመስጠት ችግር አጋጥሟል። እባክዎ ጥቂት ቆይተው እንደገና ይሞክሩ።'
                  : 'I apologize, but an error occurred while generating a response. Please try again.',
            }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[700px] max-h-[82vh] bg-background border border-border rounded-2xl shadow-xs overflow-hidden">
      {/* Top Bar: Language Switcher & Model Assignment Indicator */}
      <div className="px-4 py-2.5 bg-muted/50 border-b border-border flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Language Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-label="Select Assistant Language">
          <Globe className="w-3.5 h-3.5 text-muted-foreground mr-0.5" />
          {languageOptions.map((opt) => {
            const isSelected = chatLanguage === opt.code;
            return (
              <button
                key={opt.code}
                onClick={() => handleLanguageChange(opt.code)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer flex items-center gap-1 ${isSelected
                  ? 'bg-primary text-white shadow-xs font-bold'
                  : 'bg-card text-muted-foreground hover:text-foreground border border-border'
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
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground bg-card px-2.5 py-1 rounded-md border border-border">
          <Cpu className="w-3.5 h-3.5 text-primary" />
          <span>Engine:</span>
          <span className="font-bold text-foreground">
            {chatLanguage === 'en' ? 'Groq Llama 3.3 70B' : 'Groq Llama 3.3 70B (Ge\'ez Optimized)'}
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
          <div className="flex items-center justify-between px-3.5 py-2 bg-primary/5 rounded-xl border border-primary/20 text-xs text-foreground">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-foreground">
                {currentUser.fullName}
              </span>
              <span className="text-muted-foreground hidden sm:inline">•</span>
              <span className="text-muted-foreground hidden sm:inline">
                {currentUser.profile?.disabilityType ? `Focus: ${currentUser.profile.disabilityType}` : 'Tailored Accessibility Active'}
              </span>
            </div>
            <Link
              href="/onboarding"
              className="text-primary hover:underline text-[11px] font-bold flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-1"
            >
              <span>{language === 'am' ? 'መገለጫ አብጅ' : 'Tailor Profile'}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} {...msg} />
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground text-xs italic py-2">
            <Sparkles className="w-4 h-4 text-primary animate-spin" />
            <span>
              {chatLanguage === 'am'
                ? 'ብሪጅሜት በሥርዓተ-ትምህርቱና በሕጉ መሠረት በማሰብ ላይ ነው...'
                : 'BridgeMate is retrieving verified curriculum and formulating response...'}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sample Quick Prompts */}
      <div className="px-4 py-2 bg-muted/30 border-t border-border flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1 shrink-0">
          <HelpCircle className="w-3 h-3" />
          {chatLanguage === 'am' ? 'የተለመዱ ጥያቄዎች፡' : 'Suggested:'}
        </span>
        {samplePrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="text-xs bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground border border-border px-3 py-1.5 rounded-full shrink-0 transition-colors truncate max-w-[280px] sm:max-w-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer active:scale-95"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Input Box */}
      <div className="p-3 sm:p-4 border-t border-border bg-card">
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          language={chatLanguage}
        />
        <div className="mt-2 text-[10px] text-muted-foreground text-center">
          {chatLanguage === 'am'
            ? 'በተረጋገጠ የሥርዓተ-ትምህርትና የኢትዮጵያ አዋጅ 1156/2019 ላይ የተመሠረተ።'
            : 'Grounded in verified curriculum and Ethiopian Labor Proclamation 1156/2019.'}
        </div>
      </div>
    </div>
  );
}
