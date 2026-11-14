'use client';

import React, { useState } from 'react';
import { 
  Code, 
  Terminal, 
  Copy, 
  Check, 
  Send, 
  Key, 
  ExternalLink, 
  CheckCircle2, 
  Layers, 
  BookOpen, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface EndpointDoc {
  id: string;
  method: 'POST' | 'GET';
  path: string;
  name: string;
  description: string;
  defaultPayload: string;
  curlExample: string;
}

const ENDPOINTS: EndpointDoc[] = [
  {
    id: 'chat',
    method: 'POST',
    path: '/api/v1/chat',
    name: 'Multilingual RAG Chat Assistant',
    description: 'Queries verified curriculum and legal knowledge (Proclamation 568/2008) in Amharic or English with grounded source citations.',
    defaultPayload: JSON.stringify({
      prompt: 'በአዋጅ 568/2008 መሠረት ለፈተና ተጨማሪ ጊዜ መጠየቅ እችላለሁ?',
      language: 'am',
    }, null, 2),
    curlExample: `curl -X POST https://bridgemate.et/api/v1/chat \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: demo_key_alx_2026" \\
  -d '{"prompt": "Can I request exam accommodation under Ethiopian law?", "language": "en"}'`,
  },
  {
    id: 'decoder',
    method: 'POST',
    path: '/api/v1/decoder',
    name: 'Opportunity & Barrier Decoder',
    description: 'Scans raw job vacancies and course assignments for implicit accessibility barriers (driving license, physical submission, stairs) and matches solutions.',
    defaultPayload: JSON.stringify({
      text: 'Junior Fullstack Developer wanted. Must have valid driver\'s license for occasional client site visits. Must submit printed paper CV in person at our 4th floor office.',
    }, null, 2),
    curlExample: `curl -X POST https://bridgemate.et/api/v1/decoder \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: demo_key_alx_2026" \\
  -d '{"text": "Office Assistant needed with driver license and physical filing."}'`,
  },
  {
    id: 'translator',
    method: 'POST',
    path: '/api/v1/translator',
    name: 'Accommodation Request Generator',
    description: 'Transforms functional needs into professional, legally protected accommodation request letters without disclosing private medical diagnoses.',
    defaultPayload: JSON.stringify({
      candidateName: 'አበበ በቀለ (Abebe Bekele)',
      employerName: 'Ethio Telecom Tech Hub',
      jobTitle: 'Junior Software Engineer',
      functionalImpact: 'low_vision',
      specificNeed: 'Needs 24pt large font test papers and high-contrast digital IDE format',
      context: 'physical_office',
      tone: 'formal_legal',
      language: 'am',
    }, null, 2),
    curlExample: `curl -X POST https://bridgemate.et/api/v1/translator \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: demo_key_alx_2026" \\
  -d '{"candidateName": "Sara Tesfaye", "functionalImpact": "screen_reader", "specificNeed": "Keyboard accessible test portal", "language": "en"}'`,
  },
  {
    id: 'support',
    method: 'POST',
    path: '/api/v1/support',
    name: 'Live Human Help Escalation Queue',
    description: 'Enqueues users for live specialist assistance, transmitting a structured context handoff packet to eliminate repetitive re-explanation.',
    defaultPayload: JSON.stringify({
      userGoal: 'Encountering inaccessible captcha during assignment submission',
      userLanguage: 'am',
      disclosedAccommodations: ['Blind / Screen Reader User'],
      conversationHistorySummary: 'User attempted 3 times to solve visual captcha; stuck on final quiz step.',
      consentTranscript: true,
      consentScreenShare: false,
    }, null, 2),
    curlExample: `curl -X POST https://bridgemate.et/api/v1/support \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: demo_key_alx_2026" \\
  -d '{"userGoal": "Need help with inaccessible assessment form", "userLanguage": "en"}'`,
  },
];

export default function DevelopersPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDoc>(ENDPOINTS[0]);
  const [apiKey, setApiKey] = useState('demo_key_alx_2026');
  const [requestBody, setRequestBody] = useState(ENDPOINTS[0].defaultPayload);
  const [isLoading, setIsLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<string>('');
  const [responseData, setResponseData] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const handleSelectEndpoint = (ep: EndpointDoc) => {
    setSelectedEndpoint(ep);
    setRequestBody(ep.defaultPayload);
    setResponseData(null);
    setResponseStatus(null);
  };

  const handleSendTest = async () => {
    setIsLoading(true);
    setResponseData(null);
    setResponseStatus(null);
    const start = performance.now();

    try {
      const parsedBody = JSON.parse(requestBody);
      const res = await fetch(selectedEndpoint.path, {
        method: selectedEndpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify(parsedBody),
      });

      const elapsed = Math.round(performance.now() - start);
      setResponseStatus(res.status);
      setResponseHeaders(`${res.status} ${res.statusText} • ${elapsed}ms`);

      const json = await res.json();
      setResponseData(JSON.stringify(json, null, 2));
    } catch (err: any) {
      setResponseStatus(500);
      setResponseHeaders('Client Request Error');
      setResponseData(JSON.stringify({ error: err.message || 'Network request failed' }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-700/60 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 md:p-8 shadow-xl">
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Layers className="w-3.5 h-3.5" />
            <span>Door 2: Level 2 REST APIs</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            BridgeMate Developer APIs & Interactive Sandbox
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Integrate BridgeMate&apos;s intelligent accessibility engines directly into your native workflows, LMS backends, and Ethiopian employment portals. All endpoints deliver standardized JSON envelopes, strict error codes, and legal statutory citations.
          </p>

          {/* Quick API Key Callout */}
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Evaluation Key:</span>
              <code className="text-amber-300 font-mono font-bold">demo_key_alx_2026</code>
            </div>
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Ready for Immediate Testing (No signup required)</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Endpoint Directory */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Available v1 REST Endpoints
          </h2>
          <div className="space-y-2">
            {ENDPOINTS.map((ep) => {
              const isSelected = selectedEndpoint.id === ep.id;
              return (
                <button
                  key={ep.id}
                  onClick={() => handleSelectEndpoint(ep)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-emerald-500/60 shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-500/40'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {ep.method}
                    </span>
                    <span className="text-xs font-mono text-slate-300">{ep.path}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white">{ep.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{ep.description}</p>
                </button>
              );
            })}
          </div>

          {/* Social Model of Disability Guarantee Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2 mt-4">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span>Social Model Compliance</span>
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              In accordance with Ethiopian Proclamations 568/2008 and 1156/2019, BridgeMate APIs never accept or store diagnostic medical history. All processing centers on workplace and educational adjustments.
            </p>
          </div>
        </div>

        {/* Right Side: Interactive Sandbox Playground */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-xl border border-slate-700/80 bg-slate-900/90 p-5 md:p-6 shadow-lg space-y-5">
            {/* Active Endpoint Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {selectedEndpoint.method}
                  </span>
                  <span className="text-sm md:text-base font-mono font-bold text-white">
                    {selectedEndpoint.path}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{selectedEndpoint.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(selectedEndpoint.curlExample)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
                  aria-label="Copy cURL Command"
                >
                  {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSnippet ? 'Copied' : 'Copy cURL'}</span>
                </button>
              </div>
            </div>

            {/* API Key Input */}
            <div className="space-y-1.5">
              <label htmlFor="api-key-input" className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>API Authorization Header (`x-api-key`)</span>
              </label>
              <input
                id="api-key-input"
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="demo_key_alx_2026"
              />
            </div>

            {/* Request Payload Editor */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="request-body-input" className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-sky-400" />
                  <span>JSON Request Body</span>
                </label>
                <button
                  onClick={() => setRequestBody(selectedEndpoint.defaultPayload)}
                  className="text-[11px] text-slate-400 hover:text-white underline"
                >
                  Reset Default
                </button>
              </div>
              <textarea
                id="request-body-input"
                rows={6}
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-800 p-3 font-mono text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                spellCheck={false}
              />
            </div>

            {/* Send Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSendTest}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                {isLoading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Executing Request...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Test Request</span>
                  </>
                )}
              </button>
            </div>

            {/* Response Console */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-purple-400" />
                  <span>API Response Output</span>
                </span>
                {responseHeaders && (
                  <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                    responseStatus === 200 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {responseHeaders}
                  </span>
                )}
              </div>

              <div className="rounded-lg bg-slate-950 border border-slate-800 p-4 font-mono text-xs overflow-x-auto min-h-[140px] max-h-[360px] overflow-y-auto">
                {responseData ? (
                  <pre className="text-emerald-300">{responseData}</pre>
                ) : (
                  <p className="text-slate-600 italic">Click &quot;Send Test Request&quot; above to inspect live API output.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
