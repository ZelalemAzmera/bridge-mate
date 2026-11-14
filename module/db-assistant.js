/**
 * BridgeMate <db-assistant> Web Component
 * ALX Ethiopia Digital Bridge Accessibility Hackathon — Track 3
 *
 * Usage: <db-assistant lang="am" api="http://localhost:3000/api" content="/data/content.json"></db-assistant>
 *
 * Features:
 *  - Shadow DOM (zero style leakage)
 *  - WCAG 2.2 AA: 44px targets, focus ring #f5a300, keyboard-only, ARIA live
 *  - 6 languages: en, am, ti, om, so, ar (RTL aware)
 *  - BM25 offline search when API unavailable
 *  - Voice input (SpeechRecognition) + TTS (SpeechSynthesis)
 *  - Guide Me: scans host DOM, creates interactive step list
 *  - Ethiopian calendar formatting
 *  - Offline queue (localStorage)
 *  - Dispatches db-assistant:question, db-assistant:escalated
 *  - FAB launcher button
 *  - Simple mode toggle
 *  - Talk to a person → POST /api/v1/escalations
 *
 * @license MIT
 * @version 2.0.0
 */

(function () {
  'use strict';

  // ── Inline i18n strings (fallback; external JSON is fetched first) ────────
  const FALLBACK_STRINGS = {
    en: {
      open: 'Open BridgeMate Assistant', close: 'Close Assistant',
      placeholder: 'Ask a question…', send: 'Send', listen: 'Listen',
      stopListen: 'Stop', voiceInput: 'Voice input', simpleMode: 'Simple mode',
      simpleModeOff: 'Full mode', guideme: 'Guide Me', escalate: 'Talk to a person',
      escalating: 'Connecting…', escalated: 'Support request sent. Ticket ID: {ticketId}',
      escalateError: 'Could not connect. Please try again.',
      offline: 'You are offline. Message saved — will send when reconnected.',
      loading: 'Loading…', error: 'Something went wrong. Please try again.',
      noAnswer: 'No answer found for your question.', sources: 'Sources',
      step: 'Step {n} of {total}', stepFocus: 'Focused on: {label}',
      announcement: 'Assistant response ready', skipToMain: 'Skip to main content'
    },
    am: {
      open: 'ብሪጅሜት ረዳት ክፈት', close: 'ረዳቱን ዝጋ',
      placeholder: 'ጥያቄ ይጠይቁ…', send: 'ላክ', listen: 'አዳምጥ',
      stopListen: 'አቁም', voiceInput: 'የድምፅ ግቤት', simpleMode: 'ቀላል ሁነታ',
      simpleModeOff: 'ሙሉ ሁነታ', guideme: 'መርሃ ግብር', escalate: 'ከሰው ጋር ተነጋገር',
      escalating: 'በማገናኘት ላይ…', escalated: 'የድጋፍ ጥያቄ ተልኳል። ቲኬት፦ {ticketId}',
      escalateError: 'ማገናኘት አልተቻለም። እባክዎ እንደገና ሞክሩ።',
      offline: 'ከኢንተርኔት ተቋርጠዋል። መልዕክቱ ተቀምጧል።',
      loading: 'በመጫን ላይ…', error: 'ስህተት ተከስቷል።',
      noAnswer: 'ለጥያቄዎ መልስ አልተገኘም።', sources: 'ምንጮች',
      step: 'ደረጃ {n} ከ {total}', stepFocus: 'ትኩረት ተሰጥቷል፦ {label}',
      announcement: 'የረዳት ምላሽ ዝግጁ ነው', skipToMain: 'ወደ ዋና ይዘት ዝለል'
    }
  };

  // ── BM25 offline search ───────────────────────────────────────────────────
  const STOPWORDS = new Set(['a','an','the','is','are','was','were','be','have','of','in','to','for','on','with','and','or','not','it','i','you','we','they','ነው','ወይም','እና','ስለ','ከ','ወደ']);

  function tokenize(text) {
    return (text || '').toLowerCase().replace(/[^\w\s\u1200-\u137F]/g, ' ').split(/\s+/).filter(t => t.length > 1 && !STOPWORDS.has(t));
  }

  function bm25Search(question, sections, topK = 2) {
    if (!sections || !sections.length) return [];
    const N = sections.length;
    const qTokens = tokenize(question);
    const tf = sections.map(s => {
      const tokens = tokenize(`${s.heading} ${s.content}`);
      const freq = {};
      tokens.forEach(t => { freq[t] = (freq[t] || 0) + 1; });
      return { freq, len: tokens.length };
    });
    const df = {};
    tf.forEach(d => Object.keys(d.freq).forEach(t => { df[t] = (df[t] || 0) + 1; }));
    const avgLen = tf.reduce((s, d) => s + d.len, 0) / N;
    const scores = sections.map((section, i) => {
      let score = 0;
      const docLen = tf[i].len;
      qTokens.forEach(t => {
        if (!df[t]) return;
        const idf = Math.log((N - df[t] + 0.5) / (df[t] + 0.5) + 1);
        const freq = tf[i].freq[t] || 0;
        const k1 = 1.5, b = 0.75;
        score += idf * (freq * (k1 + 1)) / (freq + k1 * (1 - b + b * (docLen / avgLen)));
      });
      return { section, score };
    });
    return scores.sort((a, b) => b.score - a.score).slice(0, topK).filter(x => x.score > 0).map(x => x.section);
  }

  // ── Ethiopian calendar ────────────────────────────────────────────────────
  function formatEthiopicDate(isoDate) {
    try {
      const d = new Date(isoDate);
      return new Intl.DateTimeFormat('am-ET-u-ca-ethiopic', { year: 'numeric', month: 'long', day: 'numeric' }).format(d);
    } catch (e) {
      return isoDate;
    }
  }

  // ── Template helper ───────────────────────────────────────────────────────
  function t(str, vars = {}) {
    return Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, v), str || '');
  }

  // ── CSS ───────────────────────────────────────────────────────────────────
  const CSS = `
    :host {
      --bm-primary: #f5a300;
      --bm-primary-dark: #c47f00;
      --bm-bg: #ffffff;
      --bm-bg2: #f5f5f5;
      --bm-text: #1a1a1a;
      --bm-text2: #555555;
      --bm-border: #d0d0d0;
      --bm-radius: 12px;
      --bm-focus: 3px solid #f5a300;
      --bm-shadow: 0 8px 32px rgba(0,0,0,0.18);
      --bm-fab-size: 56px;
      display: block;
      position: fixed;
      bottom: 24px;
      inset-inline-end: 24px;
      z-index: 2147483647;
      font-family: var(--bs-body-font-family, 'Noto Sans Ethiopic', system-ui, sans-serif);
    }

    :host([theme="dark"]) {
      --bm-bg: #1e1e1e;
      --bm-bg2: #2a2a2a;
      --bm-text: #f0f0f0;
      --bm-text2: #aaaaaa;
      --bm-border: #444444;
    }

    *,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }

    :focus-visible {
      outline: var(--bm-focus) !important;
      outline-offset: 2px !important;
    }

    /* ── FAB button ── */
    #fab {
      width: var(--bm-fab-size);
      height: var(--bm-fab-size);
      min-width: 44px;
      min-height: 44px;
      border-radius: 50%;
      background: var(--bm-primary);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--bm-shadow);
      transition: transform 0.2s, box-shadow 0.2s;
      color: #000;
    }
    #fab:hover, #fab:focus-visible {
      transform: scale(1.08);
      box-shadow: 0 12px 36px rgba(0,0,0,0.25);
    }
    #fab svg { width: 28px; height: 28px; fill: currentColor; pointer-events: none; }

    /* ── Panel ── */
    #panel {
      position: fixed;
      bottom: 90px;
      inset-inline-end: 24px;
      width: min(400px, calc(100vw - 32px));
      max-height: min(600px, calc(100vh - 110px));
      background: var(--bm-bg);
      border: 1px solid var(--bm-border);
      border-radius: var(--bm-radius);
      box-shadow: var(--bm-shadow);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      direction: ltr;
    }
    #panel[dir="rtl"] { direction: rtl; }
    #panel[hidden] { display: none; }

    /* ── Panel header ── */
    .panel-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: var(--bm-primary);
      color: #000;
    }
    .panel-title {
      flex: 1;
      font-weight: 700;
      font-size: 1rem;
      line-height: 1.4;
    }
    .panel-header button {
      min-width: 44px;
      min-height: 44px;
      background: transparent;
      border: none;
      cursor: pointer;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #000;
      font-size: 0.8rem;
      padding: 4px 8px;
      white-space: nowrap;
    }
    .panel-header button:hover, .panel-header button:focus-visible {
      background: rgba(0,0,0,0.12);
    }

    /* ── Tab bar ── */
    .tab-bar {
      display: flex;
      border-bottom: 1px solid var(--bm-border);
      background: var(--bm-bg2);
    }
    .tab-btn {
      flex: 1;
      min-height: 44px;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--bm-text2);
      padding: 8px 4px;
      border-bottom: 3px solid transparent;
      transition: color 0.15s, border-color 0.15s;
    }
    .tab-btn[aria-selected="true"] {
      color: var(--bm-text);
      border-bottom-color: var(--bm-primary);
    }
    .tab-btn:hover, .tab-btn:focus-visible {
      background: rgba(245,163,0,0.1);
      color: var(--bm-text);
    }

    /* ── Chat log ── */
    #chat-log {
      flex: 1;
      overflow-y: auto;
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      scroll-behavior: smooth;
      overscroll-behavior: contain;
    }
    #chat-log:focus { outline: none; }

    .msg {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 0.9rem;
      line-height: 1.7;
      word-break: break-word;
    }
    .msg-user {
      align-self: flex-end;
      background: var(--bm-primary);
      color: #000;
      border-bottom-right-radius: 4px;
    }
    .msg-assistant {
      align-self: flex-start;
      background: var(--bm-bg2);
      color: var(--bm-text);
      border-bottom-left-radius: 4px;
      border: 1px solid var(--bm-border);
    }
    .msg-loading {
      align-self: flex-start;
      background: var(--bm-bg2);
      border: 1px solid var(--bm-border);
      color: var(--bm-text2);
      font-style: italic;
    }
    .sources {
      margin-top: 8px;
      font-size: 0.78rem;
      color: var(--bm-text2);
    }
    .sources a {
      color: var(--bm-primary-dark);
      text-decoration: underline;
    }
    .sources a:focus-visible { outline: var(--bm-focus); border-radius: 2px; }

    .msg-actions {
      display: flex;
      gap: 6px;
      margin-top: 6px;
      flex-wrap: wrap;
    }
    .msg-action-btn {
      min-height: 36px;
      padding: 4px 10px;
      border: 1px solid var(--bm-border);
      border-radius: 20px;
      background: var(--bm-bg);
      cursor: pointer;
      font-size: 0.75rem;
      color: var(--bm-text2);
    }
    .msg-action-btn:hover, .msg-action-btn:focus-visible {
      background: var(--bm-primary);
      color: #000;
      border-color: var(--bm-primary);
    }

    /* ── Input area ── */
    .input-area {
      padding: 10px 12px;
      border-top: 1px solid var(--bm-border);
      background: var(--bm-bg);
      display: flex;
      gap: 6px;
      align-items: flex-end;
    }
    #chat-input {
      flex: 1;
      min-height: 44px;
      max-height: 120px;
      padding: 10px 12px;
      border: 1px solid var(--bm-border);
      border-radius: 22px;
      resize: none;
      font-size: 0.9rem;
      font-family: inherit;
      background: var(--bm-bg2);
      color: var(--bm-text);
      line-height: 1.5;
    }
    #chat-input:focus { outline: var(--bm-focus); }
    #chat-input::placeholder { color: var(--bm-text2); }

    .icon-btn {
      min-width: 44px;
      min-height: 44px;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
      flex-shrink: 0;
    }
    .icon-btn svg { width: 20px; height: 20px; fill: currentColor; pointer-events: none; }
    #send-btn { background: var(--bm-primary); color: #000; }
    #send-btn:hover, #send-btn:focus-visible { background: var(--bm-primary-dark); }
    #voice-btn { background: var(--bm-bg2); color: var(--bm-text2); border: 1px solid var(--bm-border); }
    #voice-btn.listening { background: #e53935; color: #fff; border-color: #e53935; }
    #voice-btn:hover, #voice-btn:focus-visible { background: var(--bm-primary); color: #000; border-color: var(--bm-primary); }

    /* ── Guide panel ── */
    #guide-panel { display: none; flex-direction: column; flex: 1; overflow: hidden; }
    #guide-panel.active { display: flex; }
    #guide-list {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      list-style: none;
    }
    .guide-step {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border: 1px solid var(--bm-border);
      border-radius: 8px;
      background: var(--bm-bg);
      cursor: pointer;
      text-align: start;
      min-height: 44px;
      font-size: 0.85rem;
      color: var(--bm-text);
      transition: background 0.15s;
      scroll-margin-top: 72px;
    }
    .guide-step:hover, .guide-step:focus-visible {
      background: var(--bm-primary);
      color: #000;
      border-color: var(--bm-primary);
    }
    .guide-step-num {
      min-width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--bm-primary);
      color: #000;
      font-weight: 700;
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .guide-step:hover .guide-step-num, .guide-step:focus-visible .guide-step-num {
      background: #000;
      color: var(--bm-primary);
    }

    /* ── Jobs panel ── */
    #jobs-panel { display: none; flex-direction: column; flex: 1; overflow: hidden; }
    #jobs-panel.active { display: flex; overflow-y: auto; }
    .job-card {
      margin: 8px 12px;
      padding: 12px;
      border: 1px solid var(--bm-border);
      border-radius: 10px;
      background: var(--bm-bg);
      font-size: 0.85rem;
    }
    .job-title { font-weight: 700; font-size: 0.95rem; color: var(--bm-text); margin-bottom: 4px; }
    .job-org { color: var(--bm-text2); margin-bottom: 6px; }
    .job-meta { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
    .job-pill {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.72rem;
      background: var(--bm-bg2);
      border: 1px solid var(--bm-border);
      color: var(--bm-text2);
    }
    .job-apply {
      display: inline-block;
      min-height: 36px;
      padding: 6px 14px;
      background: var(--bm-primary);
      color: #000;
      border-radius: 20px;
      font-weight: 600;
      text-decoration: none;
      font-size: 0.8rem;
      border: none;
      cursor: pointer;
    }
    .job-apply:hover, .job-apply:focus-visible {
      background: var(--bm-primary-dark);
    }

    /* ── Status bar ── */
    .status-bar {
      padding: 4px 12px;
      font-size: 0.72rem;
      color: var(--bm-text2);
      border-top: 1px solid var(--bm-border);
      background: var(--bm-bg2);
      display: flex;
      gap: 8px;
      align-items: center;
    }

    /* ── ARIA live ── */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0,0,0,0);
      white-space: nowrap;
    }

    /* ── 200% zoom reflow ── */
    @media (max-width: 320px) {
      #panel {
        width: calc(100vw - 16px);
        bottom: 80px;
        inset-inline-end: 8px;
      }
      :host {
        bottom: 16px;
        inset-inline-end: 8px;
      }
    }

    /* ── Reduced motion ── */
    @media (prefers-reduced-motion: reduce) {
      * { transition: none !important; animation: none !important; }
    }

    /* ── High contrast ── */
    @media (forced-colors: active) {
      #fab, .job-apply, .msg-user, .guide-step-num { forced-color-adjust: none; }
      .panel-header { border-bottom: 2px solid ButtonText; }
    }
  `;

  // ── SVG icons ─────────────────────────────────────────────────────────────
  const ICON_CHAT = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>`;
  const ICON_CLOSE = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;
  const ICON_SEND = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`;
  const ICON_MIC = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>`;
  const ICON_STOP = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6h12v12H6z"/></svg>`;

  // ── Component ─────────────────────────────────────────────────────────────
  class DbAssistant extends HTMLElement {
    static get observedAttributes() { return ['lang', 'api', 'content', 'theme']; }

    constructor() {
      super();
      this._shadow = this.attachShadow({ mode: 'open' });
      this._strings = { ...FALLBACK_STRINGS.en };
      this._lang = 'en';
      this._apiBase = '';
      this._contentUrl = '';
      this._sections = [];
      this._conversation = [];
      this._isOpen = false;
      this._simpleMode = false;
      this._isListening = false;
      this._recognition = null;
      this._synth = window.speechSynthesis || null;
      this._currentTab = 'chat';
      this._offlineQueue = JSON.parse(localStorage.getItem('bm-offline-queue') || '[]');
      this._guideSteps = [];
      this._mounted = false;
    }

    connectedCallback() {
      this._lang = this.getAttribute('lang') || 'en';
      this._apiBase = this.getAttribute('api') || '';
      this._contentUrl = this.getAttribute('content') || '';
      this._render();
      this._mounted = true;
      this._loadStrings();
      this._loadContent();
      this._setupVoice();
      this._flushOfflineQueue();
    }

    attributeChangedCallback(name, _old, val) {
      if (!this._mounted) return;
      if (name === 'lang') { this._lang = val; this._loadStrings(); }
      if (name === 'theme') { this._applyTheme(val); }
    }

    // ── String loading ──────────────────────────────────────────────────────
    async _loadStrings() {
      const base = this._getModuleBase();
      const url = `${base}/module/i18n/${this._lang}.json`;
      try {
        const r = await fetch(url);
        if (r.ok) {
          const data = await r.json();
          this._strings = { ...FALLBACK_STRINGS.en, ...data };
        } else {
          this._strings = { ...FALLBACK_STRINGS.en, ...(FALLBACK_STRINGS[this._lang] || {}) };
        }
      } catch (e) {
        this._strings = { ...FALLBACK_STRINGS.en, ...(FALLBACK_STRINGS[this._lang] || {}) };
      }
      this._updateStrings();
      // RTL for Arabic
      const panel = this._shadow.getElementById('panel');
      if (panel) panel.setAttribute('dir', this._lang === 'ar' ? 'rtl' : 'ltr');
      // Update html lang on host doc for screen reader compatibility
      if (document.documentElement) {
        document.documentElement.lang = this._lang === 'am' ? 'am' : this._lang === 'ti' ? 'ti' : this._lang === 'ar' ? 'ar' : 'en';
      }
    }

    _getModuleBase() {
      // Find script tag src to derive base URL
      const scripts = document.querySelectorAll('script[src*="db-assistant"]');
      if (scripts.length > 0) {
        const src = scripts[scripts.length - 1].src;
        return src.replace(/\/module\/db-assistant\.js.*/, '');
      }
      return this._apiBase.replace('/api', '') || '';
    }

    _updateStrings() {
      const s = this._strings;
      const fab = this._shadow.getElementById('fab');
      if (fab) fab.setAttribute('aria-label', s.open);
      const closeBtn = this._shadow.getElementById('close-btn');
      if (closeBtn) closeBtn.setAttribute('aria-label', s.close);
      const input = this._shadow.getElementById('chat-input');
      if (input) input.placeholder = s.placeholder;
      const sendBtn = this._shadow.getElementById('send-btn');
      if (sendBtn) sendBtn.setAttribute('aria-label', s.send);
      const voiceBtn = this._shadow.getElementById('voice-btn');
      if (voiceBtn) voiceBtn.setAttribute('aria-label', s.voiceInput);
    }

    // ── Content loading ─────────────────────────────────────────────────────
    async _loadContent() {
      if (!this._contentUrl) return;
      try {
        const r = await fetch(this._contentUrl);
        if (r.ok) {
          const data = await r.json();
          this._sections = data.sections || [];
        }
      } catch (e) { /* use BM25 offline */ }
    }

    // ── Render ──────────────────────────────────────────────────────────────
    _render() {
      const s = this._strings;
      this._shadow.innerHTML = `
        <style>${CSS}</style>

        <div class="sr-only" role="status" aria-live="polite" aria-atomic="true" id="live-polite"></div>
        <div class="sr-only" role="alert" aria-live="assertive" aria-atomic="true" id="live-assertive"></div>

        <button id="fab" aria-label="${s.open}" aria-expanded="false" aria-controls="panel">
          ${ICON_CHAT}
        </button>

        <div id="panel" role="dialog" aria-modal="true" aria-labelledby="panel-title" hidden>

          <!-- Header -->
          <div class="panel-header">
            <span id="panel-title" class="panel-title">🌉 BridgeMate</span>
            <button id="simple-toggle" class="panel-header" aria-pressed="false" aria-label="${s.simpleMode}">${s.simpleMode}</button>
            <button id="close-btn" aria-label="${s.close}">${ICON_CLOSE}</button>
          </div>

          <!-- Tabs -->
          <div class="tab-bar" role="tablist" aria-label="Assistant sections">
            <button class="tab-btn" role="tab" id="tab-chat" aria-selected="true" aria-controls="chat-section">💬 Chat</button>
            <button class="tab-btn" role="tab" id="tab-guide" aria-selected="false" aria-controls="guide-section">🗺️ Guide</button>
            <button class="tab-btn" role="tab" id="tab-jobs" aria-selected="false" aria-controls="jobs-section">💼 Jobs</button>
          </div>

          <!-- Chat section -->
          <div id="chat-section" role="tabpanel" aria-labelledby="tab-chat" style="display:flex;flex-direction:column;flex:1;overflow:hidden;">
            <div id="chat-log" role="log" aria-live="polite" aria-label="Conversation" tabindex="0"></div>
            <div class="input-area">
              <textarea id="chat-input" rows="1" aria-label="${s.placeholder}" placeholder="${s.placeholder}" autocomplete="off" autocorrect="off" autocapitalize="sentences"></textarea>
              <button id="voice-btn" class="icon-btn" aria-label="${s.voiceInput}" aria-pressed="false">${ICON_MIC}</button>
              <button id="send-btn" class="icon-btn" aria-label="${s.send}">${ICON_SEND}</button>
            </div>
            <div class="status-bar">
              <button id="escalate-btn" style="background:none;border:none;cursor:pointer;color:inherit;font-size:0.72rem;padding:0;min-height:36px;" aria-label="${s.escalate}">👤 ${s.escalate}</button>
            </div>
          </div>

          <!-- Guide section -->
          <div id="guide-section" role="tabpanel" aria-labelledby="tab-guide" hidden>
            <div style="padding:10px 12px;border-bottom:1px solid var(--bm-border);">
              <button id="scan-btn" style="width:100%;min-height:44px;background:var(--bm-primary);border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:0.9rem;">🗺️ ${s.guideme}</button>
            </div>
            <ul id="guide-list" aria-label="Page guide steps" role="list"></ul>
          </div>

          <!-- Jobs section -->
          <div id="jobs-section" role="tabpanel" aria-labelledby="tab-jobs" hidden>
            <div id="jobs-list" style="overflow-y:auto;flex:1;"></div>
          </div>

        </div>
      `;

      this._bindEvents();
      this._applyTheme(this.getAttribute('theme') || 'light');
    }

    // ── Event binding ───────────────────────────────────────────────────────
    _bindEvents() {
      const $ = id => this._shadow.getElementById(id);

      // FAB
      $('fab').addEventListener('click', () => this._toggle());
      $('fab').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._toggle(); } });

      // Close
      $('close-btn').addEventListener('click', () => this._close());

      // Escape key
      this._shadow.addEventListener('keydown', e => {
        if (e.key === 'Escape') this._close();
        if (e.key === 'Tab') this._trapFocus(e);
      });

      // Send
      $('send-btn').addEventListener('click', () => this._sendMessage());
      $('chat-input').addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this._sendMessage(); }
        // Auto-resize
        const ta = e.target;
        ta.style.height = 'auto';
        ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
      });

      // Voice
      $('voice-btn').addEventListener('click', () => this._toggleVoice());

      // Simple mode
      $('simple-toggle').addEventListener('click', (e) => {
        this._simpleMode = !this._simpleMode;
        e.currentTarget.textContent = this._simpleMode ? this._strings.simpleModeOff : this._strings.simpleMode;
        e.currentTarget.setAttribute('aria-pressed', String(this._simpleMode));
      });

      // Escalate
      $('escalate-btn').addEventListener('click', () => this._escalate());

      // Tabs
      ['chat', 'guide', 'jobs'].forEach(tab => {
        $(`tab-${tab}`).addEventListener('click', () => this._switchTab(tab));
        $(`tab-${tab}`).addEventListener('keydown', e => {
          if (e.key === 'ArrowRight') { e.preventDefault(); this._nextTab(tab, 1); }
          if (e.key === 'ArrowLeft')  { e.preventDefault(); this._nextTab(tab, -1); }
        });
      });

      // Guide scan
      $('scan-btn').addEventListener('click', () => this._runGuide());

      // Jobs load
      this._loadJobs();
    }

    // ── Tab management ──────────────────────────────────────────────────────
    _switchTab(name) {
      this._currentTab = name;
      ['chat', 'guide', 'jobs'].forEach(tab => {
        const btn = this._shadow.getElementById(`tab-${tab}`);
        const panel = this._shadow.getElementById(`${tab}-section`);
        const isActive = tab === name;
        btn.setAttribute('aria-selected', String(isActive));
        if (isActive) {
          panel.removeAttribute('hidden');
          btn.focus();
        } else {
          panel.setAttribute('hidden', '');
        }
      });
    }

    _nextTab(current, dir) {
      const tabs = ['chat', 'guide', 'jobs'];
      const idx = (tabs.indexOf(current) + dir + tabs.length) % tabs.length;
      this._switchTab(tabs[idx]);
    }

    // ── Open / close ────────────────────────────────────────────────────────
    _toggle() {
      this._isOpen ? this._close() : this._open();
    }

    _open() {
      this._isOpen = true;
      const panel = this._shadow.getElementById('panel');
      const fab = this._shadow.getElementById('fab');
      panel.removeAttribute('hidden');
      fab.setAttribute('aria-expanded', 'true');
      fab.innerHTML = ICON_CLOSE;
      fab.setAttribute('aria-label', this._strings.close);
      // Focus first interactive element
      setTimeout(() => {
        const input = this._shadow.getElementById('chat-input');
        if (input) input.focus();
      }, 50);
      this._announce(this._strings.open, 'polite');
    }

    _close() {
      this._isOpen = false;
      const panel = this._shadow.getElementById('panel');
      const fab = this._shadow.getElementById('fab');
      panel.setAttribute('hidden', '');
      fab.setAttribute('aria-expanded', 'false');
      fab.innerHTML = ICON_CHAT;
      fab.setAttribute('aria-label', this._strings.open);
      fab.focus();
    }

    // ── Focus trap ──────────────────────────────────────────────────────────
    _trapFocus(e) {
      if (!this._isOpen) return;
      const panel = this._shadow.getElementById('panel');
      const focusable = [...panel.querySelectorAll(
        'button:not([disabled]),textarea,a[href],[tabindex]:not([tabindex="-1"])'
      )].filter(el => !el.closest('[hidden]'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && this._shadow.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && this._shadow.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    // ── Announce ────────────────────────────────────────────────────────────
    _announce(msg, priority = 'polite') {
      const el = this._shadow.getElementById(priority === 'assertive' ? 'live-assertive' : 'live-polite');
      if (!el) return;
      el.textContent = '';
      requestAnimationFrame(() => { el.textContent = msg; });
    }

    // ── Send message ─────────────────────────────────────────────────────────
    async _sendMessage() {
      const input = this._shadow.getElementById('chat-input');
      const q = (input.value || '').trim();
      if (!q) return;
      input.value = '';
      input.style.height = 'auto';

      this._addMessage('user', q);
      this._conversation.push({ role: 'user', content: q });

      this.dispatchEvent(new CustomEvent('db-assistant:question', { bubbles: true, composed: true, detail: { question: q, lang: this._lang } }));

      const loadingId = this._addMessage('loading', this._strings.loading);

      try {
        const answer = await this._getAnswer(q);
        this._removeMessage(loadingId);
        this._addMessage('assistant', answer.text, answer.sources);
        this._conversation.push({ role: 'assistant', content: answer.text });
        this._announce(this._strings.announcement, 'polite');
      } catch (err) {
        this._removeMessage(loadingId);
        this._addMessage('assistant', this._strings.error);
      }
    }

    // ── Get answer (API → BM25 fallback) ─────────────────────────────────────
    async _getAnswer(question) {
      // Try API first
      if (this._apiBase && navigator.onLine) {
        try {
          const r = await fetch(`${this._apiBase}/v1/ask`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question, language: this._lang }),
            signal: AbortSignal.timeout(10000)
          });
          if (r.ok) {
            const data = await r.json();
            return { text: data.answer || this._strings.noAnswer, sources: data.sources || [] };
          }
        } catch (e) { /* fall through to BM25 */ }
      }

      // If offline, queue and use BM25
      if (!navigator.onLine) {
        this._queueOffline(question);
        this._announce(this._strings.offline, 'assertive');
      }

      // BM25 offline search
      const matches = bm25Search(question, this._sections);
      if (matches.length === 0) return { text: this._strings.noAnswer, sources: [] };

      const text = this._simpleMode
        ? matches[0].content.slice(0, 200) + '…'
        : matches.map(m => `**${m.heading}**\n${m.content.slice(0, 300)}…`).join('\n\n');

      const sources = matches.map(m => ({ title: m.heading, url: m.url || `#${m.id}` }));
      return { text, sources };
    }

    // ── Chat log helpers ──────────────────────────────────────────────────────
    _addMessage(role, text, sources = []) {
      const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const log = this._shadow.getElementById('chat-log');
      const div = document.createElement('div');
      div.id = id;
      div.setAttribute('role', role === 'user' ? 'none' : 'article');
      div.className = `msg msg-${role === 'loading' ? 'loading' : role}`;

      // Format text: bold **...** and line breaks
      const formatted = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
      div.innerHTML = `<span>${formatted}</span>`;

      if (sources.length > 0) {
        const src = document.createElement('div');
        src.className = 'sources';
        src.innerHTML = `<strong>${this._strings.sources}:</strong> ` +
          sources.map(s => `<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.title}</a>`).join(', ');
        div.appendChild(src);
      }

      if (role === 'assistant') {
        const actions = document.createElement('div');
        actions.className = 'msg-actions';
        const readBtn = document.createElement('button');
        readBtn.className = 'msg-action-btn';
        readBtn.setAttribute('aria-label', `${this._strings.listen}: ${text.slice(0, 50)}`);
        readBtn.textContent = `🔊 ${this._strings.listen}`;
        readBtn.addEventListener('click', () => this._speak(text));
        actions.appendChild(readBtn);
        div.appendChild(actions);
      }

      log.appendChild(div);
      log.scrollTop = log.scrollHeight;
      return id;
    }

    _removeMessage(id) {
      const el = this._shadow.getElementById(id);
      if (el) el.remove();
    }

    // ── TTS ───────────────────────────────────────────────────────────────────
    _speak(text) {
      if (!this._synth) return;
      this._synth.cancel();
      const utt = new SpeechSynthesisUtterance(text.replace(/\*\*/g, '').replace(/\n/g, ' '));
      const langMap = { am: 'am-ET', ti: 'ti-ET', om: 'om-ET', so: 'so-SO', ar: 'ar-SA', en: 'en-US' };
      utt.lang = langMap[this._lang] || 'en-US';
      utt.rate = 0.9;
      this._synth.speak(utt);
    }

    // ── Voice input ───────────────────────────────────────────────────────────
    _setupVoice() {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) return;
      this._recognition = new SR();
      this._recognition.continuous = false;
      this._recognition.interimResults = true;
      const langMap = { am: 'am-ET', ti: 'ti', om: 'om', so: 'so-SO', ar: 'ar-SA', en: 'en-US' };
      this._recognition.lang = langMap[this._lang] || 'en-US';

      this._recognition.onresult = (e) => {
        const transcript = [...e.results].map(r => r[0].transcript).join('');
        const input = this._shadow.getElementById('chat-input');
        if (input) input.value = transcript;
      };
      this._recognition.onend = () => this._setListening(false);
      this._recognition.onerror = () => this._setListening(false);
    }

    _toggleVoice() {
      if (this._isListening) {
        this._recognition && this._recognition.stop();
        this._setListening(false);
      } else {
        if (!this._recognition) { this._announce('Voice input not available', 'assertive'); return; }
        this._recognition.start();
        this._setListening(true);
      }
    }

    _setListening(val) {
      this._isListening = val;
      const btn = this._shadow.getElementById('voice-btn');
      if (!btn) return;
      btn.setAttribute('aria-pressed', String(val));
      btn.setAttribute('aria-label', val ? this._strings.stopListen : this._strings.voiceInput);
      btn.className = `icon-btn${val ? ' listening' : ''}`;
      btn.innerHTML = val ? ICON_STOP : ICON_MIC;
    }

    // ── Guide Me ──────────────────────────────────────────────────────────────
    _runGuide() {
      const list = this._shadow.getElementById('guide-list');
      list.innerHTML = '';

      // Scan host DOM for interactive/heading elements
      const selectors = 'h1,h2,h3,[role="heading"],button,a[href],input,select,textarea,[role="button"],[role="link"]';
      const elements = [...document.querySelectorAll(selectors)]
        .filter(el => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && !el.closest('db-assistant');
        })
        .slice(0, 20);

      this._guideSteps = elements;

      if (elements.length === 0) {
        list.innerHTML = `<li style="padding:12px;color:var(--bm-text2);">No interactive elements found on this page.</li>`;
        return;
      }

      elements.forEach((el, i) => {
        const label = el.getAttribute('aria-label') || el.textContent.trim().slice(0, 60) || el.tagName.toLowerCase();
        const li = document.createElement('li');
        li.setAttribute('role', 'listitem');
        const btn = document.createElement('button');
        btn.className = 'guide-step';
        btn.setAttribute('aria-label', t(this._strings.step, { n: i + 1, total: elements.length }) + `: ${label}`);
        btn.innerHTML = `<span class="guide-step-num">${i + 1}</span><span>${label}</span>`;
        btn.addEventListener('click', () => this._focusGuideStep(i));
        btn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._focusGuideStep(i); } });
        li.appendChild(btn);
        list.appendChild(li);
      });

      // Read first step aloud
      this._speak(t(this._strings.step, { n: 1, total: elements.length }) + `: ${elements[0].textContent.trim().slice(0, 60)}`);
    }

    _focusGuideStep(index) {
      const el = this._guideSteps[index];
      if (!el) return;
      // Remove previous highlight
      document.querySelectorAll('[data-bm-highlight]').forEach(e => {
        e.style.outline = '';
        e.style.scrollMarginTop = '';
        delete e.dataset.bmHighlight;
      });
      // Highlight
      el.style.outline = '4px solid #f5a300';
      el.style.scrollMarginTop = '72px';
      el.dataset.bmHighlight = 'true';
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus();
      const label = el.getAttribute('aria-label') || el.textContent.trim().slice(0, 60);
      this._announce(t(this._strings.stepFocus, { label }), 'polite');
    }

    // ── Jobs loading ──────────────────────────────────────────────────────────
    async _loadJobs() {
      const container = this._shadow.getElementById('jobs-list');
      if (!container) return;

      let jobs = [];

      // Try API
      if (this._apiBase) {
        try {
          const r = await fetch(`${this._apiBase}/v1/jobs`);
          if (r.ok) {
            const data = await r.json();
            jobs = data.itemListElement ? data.itemListElement.map(x => x.item) : [];
          }
        } catch (e) { /* fall through */ }
      }

      // Try local data
      if (jobs.length === 0) {
        const base = this._getModuleBase();
        try {
          const r = await fetch(`${base}/data/jobs.json`);
          if (r.ok) jobs = await r.json();
        } catch (e) { /* no jobs */ }
      }

      if (jobs.length === 0) {
        container.innerHTML = `<p style="padding:16px;color:var(--bm-text2);">No jobs available.</p>`;
        return;
      }

      container.innerHTML = jobs.slice(0, 10).map(job => {
        const dateStr = job.datePostedEthiopic || formatEthiopicDate(job.datePosted || '');
        return `
          <article class="job-card" aria-label="${job.title} at ${job.organization}">
            <div class="job-title">${job.title || ''}</div>
            <div class="job-org">🏢 ${job.organization || (job.hiringOrganization && job.hiringOrganization.name) || ''}</div>
            <div class="job-meta">
              ${job.salaryDisplay ? `<span class="job-pill">💰 ${job.salaryDisplay}</span>` : ''}
              ${job.jobLocationType === 'TELECOMMUTE' ? '<span class="job-pill">🌐 Remote</span>' : '<span class="job-pill">📍 On-site</span>'}
              <span class="job-pill">📅 ${dateStr}</span>
            </div>
            <p style="font-size:0.8rem;color:var(--bm-text2);margin-bottom:8px;">${(job.description || '').slice(0, 120)}…</p>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              ${job.applyUrl ? `<a class="job-apply" href="${job.applyUrl}" target="_blank" rel="noopener noreferrer" aria-label="Apply for ${job.title}">${this._strings.apply || 'Apply'}</a>` : ''}
              <button class="job-apply" style="background:var(--bm-bg2);border:1px solid var(--bm-border);" onclick="this.closest('db-assistant,#panel') && true" aria-label="Request accommodation for ${job.title}">♿ Accommodation</button>
            </div>
            <div class="sr-only" role="complementary" aria-label="Audio transcript for ${job.title}">
              ${job.title} at ${job.organization}. Salary: ${job.salaryDisplay || 'TBD'}. ${job.description || ''}
            </div>
          </article>
        `;
      }).join('');

      // Wire accommodation buttons
      container.querySelectorAll('button').forEach((btn, i) => {
        btn.addEventListener('click', () => {
          const job = jobs[Math.floor(i)];
          this._requestAccommodation(job && job.title, job && job.organization);
        });
      });
    }

    async _requestAccommodation(jobTitle, organization) {
      if (!this._apiBase) return;
      try {
        const r = await fetch(`${this._apiBase}/v1/accommodations/request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobTitle, organization, language: this._lang })
        });
        if (r.ok) {
          const data = await r.json();
          this._switchTab('chat');
          this._addMessage('assistant', `✅ Accommodation request template created.\n\nTicket: **${data.ticketId}**\n\nLegal basis: ${(data.legalBasis || []).join(', ')}\n\nNo medical disclosure required.`, []);
          this._announce('Accommodation request ready', 'polite');
        }
      } catch (e) {
        this._addMessage('assistant', this._strings.escalateError);
      }
    }

    // ── Escalation ────────────────────────────────────────────────────────────
    async _escalate() {
      const btn = this._shadow.getElementById('escalate-btn');
      if (btn) btn.textContent = `⏳ ${this._strings.escalating}`;

      try {
        if (!this._apiBase) throw new Error('No API');
        const r = await fetch(`${this._apiBase}/v1/escalations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversation: this._conversation,
            language: this._lang,
            pageUrl: location.href
          })
        });
        if (!r.ok) throw new Error('API error');
        const data = await r.json();
        const msg = t(this._strings.escalated, { ticketId: data.ticketId });
        this._addMessage('assistant', msg);
        if (btn) btn.textContent = `✅ ${this._strings.escalated.split('.')[0]}`;
        this.dispatchEvent(new CustomEvent('db-assistant:escalated', { bubbles: true, composed: true, detail: { ticketId: data.ticketId } }));
        this._announce(msg, 'polite');
      } catch (e) {
        this._addMessage('assistant', this._strings.escalateError);
        if (btn) btn.textContent = `👤 ${this._strings.escalate}`;
      }
    }

    // ── Offline queue ─────────────────────────────────────────────────────────
    _queueOffline(question) {
      this._offlineQueue.push({ question, lang: this._lang, ts: Date.now() });
      localStorage.setItem('bm-offline-queue', JSON.stringify(this._offlineQueue));
    }

    async _flushOfflineQueue() {
      if (!navigator.onLine || this._offlineQueue.length === 0 || !this._apiBase) return;
      const queue = [...this._offlineQueue];
      this._offlineQueue = [];
      localStorage.removeItem('bm-offline-queue');
      for (const item of queue) {
        try {
          await fetch(`${this._apiBase}/v1/ask`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: item.question, language: item.lang })
          });
        } catch (e) { /* ignore */ }
      }
    }

    // ── Theme ─────────────────────────────────────────────────────────────────
    _applyTheme(theme) {
      if (theme === 'dark') {
        this.setAttribute('theme', 'dark');
      } else {
        this.removeAttribute('theme');
      }
    }
  }

  if (!customElements.get('db-assistant')) {
    customElements.define('db-assistant', DbAssistant);
  }
})();
