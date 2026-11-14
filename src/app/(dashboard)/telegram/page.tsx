'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Sparkles, 
  CheckCheck, 
  Volume2, 
  Headphones, 
  ShieldCheck, 
  FileSearch, 
  Bell, 
  Copy, 
  Check, 
  MessageSquare,
  Bot
} from 'lucide-react';

interface ChatBubble {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export default function TelegramSimulatorPage() {
  const [messages, setMessages] = useState<ChatBubble[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: '👋 *እንኳን ወደ ብሪጅሜት (BridgeMate) ቴሌግራም ረዳት በደህና መጡ!* 🇪🇹\n\nብሪጅሜት ለትምህርትና ለሥራ ዕድሎች ተደራሽነትን የሚያረጋግጥ ረዳት ነው። የሚከተሉትን ትዕዛዞች መጠቀም ይችላሉ፡\n\n• /ask <ጥያቄ> — በሥርዓተ-ትምህርትና በሕግ የተደገፈ ማብራሪያ\n• /decode <ማስታወቂያ> — የሥራ ማስታወቂያ ማነቆዎችን መፈተሽ\n• /livehelp — ወዲያውኑ ከቀጥታ የሰው ረዳት ጋር መገናኘት\n• /alerts — አዳዲስ የሥራ ማስታወቂያዎችን በቴሌግራም መመዝገብ\n\n_ጥያቄዎን ዝም ብለው በመጻፍም መልስ ማግኘት ይችላሉ!_',
      time: '12:00',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [deepLink, setDeepLink] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleConnectTelegram = async () => {
    setIsLinking(true);
    try {
      const res = await fetch('/api/telegram/link-token');
      const data = await res.json();
      if (data.success && data.deepLink) {
        setDeepLink(data.deepLink);
        window.open(data.deepLink, '_blank');
      }
    } catch (err) {
      console.error('Failed to generate telegram link token:', err);
    } finally {
      setIsLinking(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSending) return;

    setInputText('');
    setIsSending(true);

    const userMsgId = `user-${Date.now()}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, sender: 'user', text, time: nowTime },
    ]);

    try {
      const res = await fetch('/api/telegram/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          update_id: Math.floor(Math.random() * 1000000),
          message: {
            message_id: Math.floor(Math.random() * 10000),
            from: { id: 88921102, first_name: 'Evaluator', username: 'judge_2026' },
            chat: { id: 88921102, type: 'private' },
            date: Math.floor(Date.now() / 1000),
            text,
          },
        }),
      });

      // Poll recent outgoing log from webhook endpoint
      const logRes = await fetch('/api/telegram/webhook');
      const logData = await logRes.json();
      const latest = logData.recentLog?.[0];

      if (latest && latest.text) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: latest.text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: 'መልስ ተዘጋጅቷል። እባክዎ እንደገና ይሞክሩ።',
            time: nowTime,
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `⚠️ Error communicating with Telegram webhook: ${err.message}`,
          time: nowTime,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*_#`]/g, '');
    const isAmharic = /[\u1200-\u137F]/.test(clean);
    const utt = new SpeechSynthesisUtterance(clean);
    utt.lang = isAmharic ? 'am-ET' : 'en-US';
    utt.rate = 0.95;
    window.speechSynthesis.speak(utt);
  };

  const copyWebhookUrl = () => {
    const url = `${typeof window !== 'undefined' ? window.location.origin : 'https://bridgemate.et'}/api/telegram/webhook`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-700/60 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Bot className="w-3.5 h-3.5" />
              <span>Track 3: Web & Telegram-Based Assistant</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              BridgeMate Telegram Bot Assistant & Alert Engine
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Official Track 3 Deliverable on <strong>digitalbridge.et</strong>: A multilingual voice and text tutor in Telegram with strict course citations, 1-click live human escalation, and job alert dispatching.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleConnectTelegram}
              disabled={isLinking}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Bot className="w-4 h-4" />
              <span>{isLinking ? 'Connecting...' : 'Connect to Live Telegram Bot'}</span>
            </button>

            <button
              onClick={copyWebhookUrl}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-medium text-xs transition-all focus:outline-none focus:ring-2 focus:ring-sky-400"
              aria-label="Copy Webhook Endpoint URL"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Copied Webhook URL' : 'Copy Webhook URL'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Quick Commands & Architecture Overview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4 shadow-md">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>One-Click Test Commands</span>
            </h2>
            <p className="text-xs text-slate-400">
              Click any chip below to simulate standard user interactions through the Telegram webhook:
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleSend('/ask በአዋጅ 568/2008 መሠረት ለፈተና ተጨማሪ ጊዜ መጠየቅ እችላለሁ?')}
                className="w-full text-left p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-sky-500/50 text-xs text-slate-200 transition-all flex items-start gap-2.5"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-mono">/ask &lt;ጥያቄ&gt;</strong>
                  <span className="text-slate-400 text-[11px]">Ask about exam accommodation under Ethiopian law with citations</span>
                </div>
              </button>

              <button
                onClick={() => handleSend('/decode Junior Developer wanted. Must possess driver license and physical filing on 4th floor.')}
                className="w-full text-left p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-sky-500/50 text-xs text-slate-200 transition-all flex items-start gap-2.5"
              >
                <FileSearch className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-mono">/decode &lt;notice&gt;</strong>
                  <span className="text-slate-400 text-[11px]">Identify mobility and physical barriers in job circular</span>
                </div>
              </button>

              <button
                onClick={() => handleSend('/livehelp')}
                className="w-full text-left p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-sky-500/50 text-xs text-slate-200 transition-all flex items-start gap-2.5"
              >
                <Headphones className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-mono">/livehelp</strong>
                  <span className="text-slate-400 text-[11px]">Instant 1-click human specialist escalation with deep link</span>
                </div>
              </button>

              <button
                onClick={() => handleSend('/alerts')}
                className="w-full text-left p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-sky-500/50 text-xs text-slate-200 transition-all flex items-start gap-2.5"
              >
                <Bell className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-mono">/alerts</strong>
                  <span className="text-slate-400 text-[11px]">Subscribe chat ID to job and content notifications</span>
                </div>
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
            <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Dual-Mode Execution</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Offline Sandbox:</strong> Works immediately without external API keys or VPNs.<br/>
              <strong>Live Telegram:</strong> Set <code className="text-emerald-300 font-mono">TELEGRAM_BOT_TOKEN</code> in <code className="text-slate-300 font-mono">.env.local</code> to connect your real bot from <code className="text-sky-300 font-mono">@BotFather</code>.
            </p>
          </div>
        </div>

        {/* Right: Telegram Mobile Chat Frame */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="w-full max-w-md rounded-2xl border-2 border-slate-700 bg-slate-950 overflow-hidden shadow-2xl flex flex-col h-[640px]">
            {/* Telegram Header */}
            <div className="bg-[#17212B] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-base shadow">
                  BM
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>BridgeMate Assistant</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  </h3>
                  <p className="text-xs text-sky-400 font-mono">@BridgeMateAssistantBot • bot</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Track 3
              </span>
            </div>

            {/* Telegram Chat Message History */}
            <div 
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0E1621] text-xs leading-relaxed"
              role="log"
              aria-live="polite"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 shadow-md whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? 'bg-[#2B5278] text-white rounded-br-none'
                        : 'bg-[#182533] text-slate-100 rounded-bl-none border border-slate-800'
                    }`}
                  >
                    <div>{msg.text}</div>

                    <div className="mt-2 flex items-center justify-between gap-3 text-[10px] text-slate-400 border-t border-white/10 pt-1.5">
                      {msg.sender === 'bot' && (
                        <button
                          onClick={() => speakText(msg.text)}
                          className="hover:text-emerald-300 flex items-center gap-1 text-[11px]"
                          aria-label="Listen with speech synthesis"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>አዳምጥ (Listen)</span>
                        </button>
                      )}
                      <div className="ml-auto flex items-center gap-1">
                        <span>{msg.time}</span>
                        {msg.sender === 'user' && <CheckCheck className="w-3.5 h-3.5 text-sky-400" />}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Telegram Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="bg-[#17212B] p-2.5 border-t border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Write a message or command (/ask, /livehelp)..."
                className="flex-1 rounded-xl bg-[#0E1621] border border-slate-700 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
                aria-label="Telegram Message Input"
              />
              <button
                type="submit"
                disabled={isSending || !inputText.trim()}
                className="w-9 h-9 rounded-full bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"
                aria-label="Send Telegram Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
