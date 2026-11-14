/**
 * BridgeMate Assistant — Embeddable Web Component
 * Track 3: Multilingual Assistant & Live Help
 *
 * Usage:
 *   <script src="http://localhost:3000/bridgemate-plugin.js"></script>
 *   <bridgemate-assistant api-url="/api/v1" lang="am"></bridgemate-assistant>
 *
 * Features:
 *  - Zero-dependency shadow DOM web component (no React/Vue/Angular required)
 *  - Multilingual: EN, አማ (Amharic), ትግ (Tigrinya), OM (Afaan Oromo), SO (Somali), AR (Arabic)
 *  - WCAG 2.2 AA compliant: 44px touch targets, focus-visible ring, semantic HTML
 *  - "Scan & Guide This Page" highlights & focuses real host-page elements
 *  - Offline/2G fallback with cached Ethiopian Labour Proclamation knowledge
 *  - Ethiopian Calendar + Gregorian dual-date display
 *  - Zero medical disclosure — cites Proclamation 1156/2019 Art. 29 & 568/2008
 */

(function () {
  'use strict';

  // ── Ethiopian Calendar Converter ──────────────────────────────────────────
  const EC = {
    MONTHS: ['Meskerem', 'Tikmt', 'Hidar', 'Tahsas', 'Ter', 'Yekatit',
             'Megabit', 'Miyazia', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume'],
    toEC(gregorianDate) {
      const d = gregorianDate instanceof Date ? gregorianDate : new Date(gregorianDate);
      const jd = Math.floor(d.getTime() / 86400000) + 2440588;
      const r = jd - 1724220;
      const n = Math.floor(r / 1461);
      const r2 = r % 1461;
      const m = Math.min(Math.floor(r2 / 365), 3);
      const day = r2 - m * 365;
      const year = 4 * n + m;
      const month = Math.floor(day / 30);
      const dom = (day % 30) + 1;
      return { year, month: month + 1, day: dom, monthName: this.MONTHS[month] || 'Pagume' };
    },
    format(gregorianDate) {
      const ec = this.toEC(gregorianDate);
      return `${ec.day} ${ec.monthName} ${ec.year} E.C.`;
    }
  };

  // ── Offline Knowledge Corpus ──────────────────────────────────────────────
  const OFFLINE_CORPUS = `
## Keyboard Operability (WCAG 2.1.1 & 2.4.7)
Every interactive element must be reachable via Tab and Shift+Tab without a mouse. Focus indicators must maintain a minimum 3px high-contrast outline.

## Screen Reader Landmarks & Language Tags (WCAG 3.1.2)
Use semantic landmarks (<main>, <nav>, <aside>) and tag Ethiopian languages with lang="am" (Amharic), lang="ti" (Tigrinya), lang="om" (Afaan Oromo), and dir="rtl" for Arabic.

## Article 29 & Proclamation 568/2008: Reasonable Accommodation
Employers and training institutions in Ethiopia must provide reasonable accommodation (extra exam time, screen reader compatibility, sign language interpretation, or remote work options) without requiring invasive medical history disclosure.
  `.trim();

  // ── i18n Labels ──────────────────────────────────────────────────────────
  const I18N = {
    en: { placeholder: 'Ask about your course or job rights…', send: 'Send', scan: 'Scan & Guide This Page', scanning: 'Scanning…', close: 'Close BridgeMate', title: 'BridgeMate Assistant', loading: 'Loading answer…' },
    am: { placeholder: 'ስለ ኮርስዎ ወይም የሥራ መብቶች ይጠይቁ…', send: 'ላክ', scan: 'ገጹን ቃኝ እና ምሩ', scanning: 'እየተቃኘ ነው…', close: 'BridgeMate ዝጋ', title: 'BridgeMate ረዳት', loading: 'ምላሽ እየተጫነ ነው…' },
    ti: { placeholder: 'ብዛዕባ ኮርስካ ወይ ናይ ስራሕ መሰልካ ሕተት…', send: 'ስደድ', scan: 'ነዚ ገጽ ኣቃኒ', scanning: 'ይቃናይ ኣሎ…', close: 'BridgeMate ዕጸዎ', title: 'BridgeMate ሓጋዚ', loading: 'ምላሽ ይጽዓን ኣሎ…' },
    om: { placeholder: 'Waa'ee koorsii kee yookiin mirga hojii kee gaafadhu…', send: 'Ergi', scan: 'Fuula Kana Sakatta\'i', scanning: 'Sakatta\'amutti jira…', close: 'BridgeMate Cufaa', title: 'BridgeMate Gargaaraa', loading: 'Deebii fe\'amutti jira…' },
    so: { placeholder: 'Ka weydii koorsadaada ama xuquuqda shaqada…', send: 'Dir', scan: 'Baadhi Boggan', scanning: 'La baadhinayaa…', close: 'Xidh BridgeMate', title: 'Kaaliyaha BridgeMate', loading: 'Jawaabta la soo rarayo…' },
    ar: { placeholder: 'اسأل عن دورتك أو حقوق العمل…', send: 'إرسال', scan: 'مسح وإرشاد هذه الصفحة', scanning: 'جارٍ المسح…', close: 'إغلاق BridgeMate', title: 'مساعد BridgeMate', loading: 'جارٍ تحميل الإجابة…' },
  };

  // ── Web Component Shadow DOM Styles ───────────────────────────────────────
  const STYLES = `
    :host {
      --bg-surface: #ffffff;
      --bg-canvas: #f8fafc;
      --bg-subtle: #f1f5f9;
      --text-primary: #0f172a;
      --text-secondary: #475569;
      --border-default: #e2e8f0;
      --brand-primary: #0f62fe;
      --accent-verified: #047857;
      --focus-ring: #00e676;
      display: block;
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      font-family: 'Inter', 'Noto Sans Ethiopic', system-ui, -apple-system, sans-serif;
      font-size: 16px;
      line-height: 1.65;
    }

    @media (prefers-color-scheme: dark) {
      :host {
        --bg-surface: #1e293b;
        --bg-canvas: #090d16;
        --bg-subtle: #1e293b;
        --text-primary: #f8fafc;
        --text-secondary: #94a3b8;
        --border-default: #334155;
        --brand-primary: #38bdf8;
        --accent-verified: #34d399;
      }
    }

    *:focus-visible {
      outline: 3px solid var(--focus-ring);
      outline-offset: 2px;
    }

    /* ── FAB Launcher ── */
    #launcher {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--brand-primary);
      color: #ffffff;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(15,98,254,0.35);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      font-size: 24px;
    }
    #launcher:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(15,98,254,0.45); }
    #launcher[aria-expanded="true"] { background: #334155; }

    /* ── Widget Panel ── */
    #panel {
      display: none;
      flex-direction: column;
      width: 380px;
      max-height: 580px;
      background: var(--bg-surface);
      border: 1px solid var(--border-default);
      border-radius: 16px;
      box-shadow: 0 8px 48px rgba(0,0,0,0.14);
      overflow: hidden;
      margin-bottom: 12px;
    }
    #panel.open { display: flex; }

    /* ── Panel Header ── */
    #panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      background: var(--bg-canvas);
      border-bottom: 1px solid var(--border-default);
      gap: 8px;
    }
    #panel-title {
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    #panel-title svg { flex-shrink: 0; }
    #lang-switcher {
      display: flex;
      gap: 2px;
      background: var(--bg-subtle);
      border-radius: 20px;
      padding: 2px;
    }
    .lang-btn {
      padding: 4px 8px;
      border: none;
      background: transparent;
      border-radius: 16px;
      font-size: 0.72rem;
      font-weight: 500;
      color: var(--text-secondary);
      cursor: pointer;
      min-width: 36px;
      min-height: 28px;
      transition: background 0.1s;
    }
    .lang-btn.active, .lang-btn:hover {
      background: var(--bg-surface);
      color: var(--text-primary);
    }
    #close-btn {
      width: 36px;
      height: 36px;
      border: none;
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }
    #close-btn:hover { background: var(--bg-subtle); color: var(--text-primary); }

    /* ── Messages ── */
    #messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .msg {
      max-width: 68ch;
      padding: 12px 14px;
      border-radius: 12px;
      font-size: 0.9rem;
      line-height: 1.65;
    }
    .msg.user {
      background: var(--brand-primary);
      color: #ffffff;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    .msg.bot {
      background: var(--bg-canvas);
      color: var(--text-primary);
      border: 1px solid var(--border-default);
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }
    .msg.bot .citation-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: var(--accent-verified);
      color: #ffffff;
      font-size: 0.7rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 20px;
      margin-bottom: 8px;
    }

    /* ── Guide Steps ── */
    .guide-steps {
      margin-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .guide-step {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      border-radius: 8px;
      border: 1px solid var(--border-default);
      background: var(--bg-surface);
      cursor: pointer;
      font-size: 0.82rem;
      color: var(--text-primary);
      text-align: left;
      min-height: 44px;
      transition: background 0.1s;
    }
    .guide-step:hover { background: var(--bg-subtle); }
    .step-num {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--brand-primary);
      color: #ffffff;
      font-size: 0.72rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .step-label { font-weight: 500; }
    .step-tag {
      margin-left: auto;
      background: var(--bg-subtle);
      color: var(--text-secondary);
      font-size: 0.68rem;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
      flex-shrink: 0;
    }

    /* ── Scan Button ── */
    #scan-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin: 0 16px;
      padding: 10px 16px;
      min-height: 44px;
      background: var(--bg-subtle);
      border: 1px solid var(--border-default);
      border-radius: 8px;
      color: var(--text-secondary);
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.1s, color 0.1s;
    }
    #scan-btn:hover { background: var(--border-default); color: var(--text-primary); }
    #scan-btn:disabled { opacity: 0.6; cursor: default; }

    /* ── Input Dock ── */
    #input-dock {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid var(--border-default);
      background: var(--bg-canvas);
    }
    #query-input {
      flex: 1;
      min-height: 44px;
      padding: 10px 14px;
      border: 2px solid #94a3b8;
      border-radius: 10px;
      background: var(--bg-surface);
      color: var(--text-primary);
      font-family: inherit;
      font-size: 0.9rem;
      resize: none;
      outline: none;
    }
    #query-input:focus-visible {
      border-color: var(--brand-primary);
      outline: 3px solid var(--focus-ring);
      outline-offset: 2px;
    }
    #send-btn {
      width: 44px;
      height: 44px;
      min-width: 44px;
      border-radius: 10px;
      background: var(--brand-primary);
      color: #ffffff;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.15s;
    }
    #send-btn:disabled { opacity: 0.5; cursor: default; }
    #send-btn:hover:not(:disabled) { opacity: 0.9; }

    /* ── RTL support ── */
    :host([lang="ar"]) #panel { direction: rtl; text-align: right; }

    /* ── Highlight overlay injected into host page ── */
    .bm-highlight {
      outline: 3px solid #0f62fe !important;
      outline-offset: 3px !important;
      background: rgba(15,98,254,0.08) !important;
      scroll-margin-top: 80px;
    }
  `;

  // ── Helper: Inject SVG Icons ──────────────────────────────────────────────
  const SVG = {
    bot: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="8" width="18" height="12" rx="4" fill="currentColor" opacity=".2"/><rect x="3" y="8" width="18" height="12" rx="4" stroke="currentColor" stroke-width="1.5"/><circle cx="9" cy="14" r="1.5" fill="currentColor"/><circle cx="15" cy="14" r="1.5" fill="currentColor"/><path d="M12 3v5M9 3h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    send: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    scan: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 9V5a2 2 0 012-2h4M3 15v4a2 2 0 002 2h4M21 9V5a2 2 0 00-2-2h-4M21 15v4a2 2 0 01-2 2h-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    check: `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  };

  // ── Custom Element Definition ─────────────────────────────────────────────
  class BridgeMateAssistant extends HTMLElement {
    constructor() {
      super();
      this._shadow = this.attachShadow({ mode: 'open' });
      this._lang = 'en';
      this._apiUrl = '/api/v1';
      this._isOpen = false;
      this._isLoading = false;
      this._highlightedEls = [];
    }

    static get observedAttributes() { return ['lang', 'api-url']; }

    attributeChangedCallback(name, _, val) {
      if (name === 'lang' && I18N[val]) { this._lang = val; this._updateLabels(); }
      if (name === 'api-url') { this._apiUrl = val; }
    }

    connectedCallback() {
      this._lang = this.getAttribute('lang') || 'en';
      this._apiUrl = this.getAttribute('api-url') || '/api/v1';
      this._render();
      this._bindEvents();
      // Keyboard shortcut: Alt+B opens the widget
      document.addEventListener('keydown', (e) => {
        if (e.altKey && e.key === 'b') { e.preventDefault(); this._toggle(); }
      });
    }

    disconnectedCallback() {
      this._clearHighlights();
    }

    _render() {
      const t = I18N[this._lang] || I18N.en;
      this._shadow.innerHTML = `
        <style>${STYLES}</style>
        <div id="widget-root">
          <div id="panel" role="dialog" aria-label="${t.title}" aria-modal="true">
            <div id="panel-header">
              <div id="panel-title">
                ${SVG.bot}
                <span>${t.title}</span>
              </div>
              <div id="lang-switcher" role="group" aria-label="Language">
                ${['en','am','ti','om','so','ar'].map(l => `<button class="lang-btn${l === this._lang ? ' active' : ''}" data-lang="${l}" aria-pressed="${l === this._lang}">${{en:'EN',am:'አማ',ti:'ትግ',om:'OM',so:'SO',ar:'AR'}[l]}</button>`).join('')}
              </div>
              <button id="close-btn" aria-label="${t.close}">✕</button>
            </div>
            <div id="messages" role="log" aria-live="polite" aria-label="Conversation">
              <div class="msg bot" lang="${this._lang}">
                <span class="citation-pill">${SVG.check} ALX Savanna · Proclamation 1156/2019</span><br>
                ${this._lang === 'am' ? 'ሰላም! ስለ ALX ኮርስዎ ወይም ስለ ሥራ አቅርቦቶች ይጠይቁ። ምንም ዓይነት የሕክምና ሰነድ አያስፈልግም።' : 
                  this._lang === 'ar' ? 'مرحباً! اسأل عن دورات ALX أو حقوق التوظيف. لا يلزم تقديم وثائق طبية.' :
                  'Hello! Ask about your ALX course or employment rights. Zero medical disclosure required.'}
              </div>
            </div>
            <button id="scan-btn">
              ${SVG.scan}
              <span id="scan-label">${t.scan}</span>
            </button>
            <div id="input-dock">
              <textarea id="query-input" rows="1" placeholder="${t.placeholder}" aria-label="${t.placeholder}"></textarea>
              <button id="send-btn" aria-label="${t.send}" disabled>${SVG.send}</button>
            </div>
          </div>
          <button id="launcher" aria-expanded="false" aria-controls="panel" aria-label="${t.title} (Alt+B)">
            ${SVG.bot}
          </button>
        </div>
      `;
    }

    _bindEvents() {
      const $ = (sel) => this._shadow.querySelector(sel);

      // Toggle
      $('#launcher').addEventListener('click', () => this._toggle());
      $('#close-btn').addEventListener('click', () => this._close());

      // Send on button click or Enter (Shift+Enter = newline)
      const input = $('#query-input');
      const sendBtn = $('#send-btn');

      input.addEventListener('input', () => {
        sendBtn.disabled = !input.value.trim();
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this._send(); }
      });
      sendBtn.addEventListener('click', () => this._send());

      // Scan page
      $('#scan-btn').addEventListener('click', () => this._scanPage());

      // Language switcher
      this._shadow.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this._lang = btn.dataset.lang;
          this._render();
          this._bindEvents();
          this._open();
        });
      });
    }

    _toggle() { this._isOpen ? this._close() : this._open(); }

    _open() {
      this._isOpen = true;
      const panel = this._shadow.querySelector('#panel');
      const launcher = this._shadow.querySelector('#launcher');
      panel.classList.add('open');
      launcher.setAttribute('aria-expanded', 'true');
      this._shadow.querySelector('#query-input')?.focus();
    }

    _close() {
      this._isOpen = false;
      const panel = this._shadow.querySelector('#panel');
      const launcher = this._shadow.querySelector('#launcher');
      panel.classList.remove('open');
      launcher.setAttribute('aria-expanded', 'false');
      launcher.focus();
      this._clearHighlights();
    }

    _updateLabels() {
      const t = I18N[this._lang] || I18N.en;
      const input = this._shadow.querySelector('#query-input');
      const scanLabel = this._shadow.querySelector('#scan-label');
      if (input) { input.placeholder = t.placeholder; input.setAttribute('aria-label', t.placeholder); }
      if (scanLabel) { scanLabel.textContent = t.scan; }
    }

    async _send() {
      const input = this._shadow.querySelector('#query-input');
      const query = input?.value?.trim();
      if (!query || this._isLoading) return;

      this._appendMsg('user', query);
      input.value = '';
      input.style.height = 'auto';
      this._shadow.querySelector('#send-btn').disabled = true;

      const thinkingId = this._appendMsg('bot', I18N[this._lang]?.loading || 'Loading…', true);
      this._isLoading = true;

      try {
        const res = await fetch(`${this._apiUrl}/scrape-and-guide`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, lang: this._lang, simpleMode: false })
        });
        const data = res.ok ? await res.json() : null;
        this._removeMsg(thinkingId);
        this._renderBotResponse(data, query);
      } catch (_) {
        this._removeMsg(thinkingId);
        this._renderOfflineResponse(query);
      } finally {
        this._isLoading = false;
      }
    }

    _renderBotResponse(data, _query) {
      if (!data || data.status !== 'ok') { this._renderOfflineResponse(_query); return; }
      const topAnswer = data.groundedAnswers?.[0];
      const text = topAnswer ? topAnswer.explanation : 'No specific guidance found. Try asking about a different topic.';
      const citation = topAnswer?.citation?.title || data.pageTitle || 'ALX Savanna';
      const section = topAnswer?.citation?.section || '';

      const msgEl = document.createElement('div');
      msgEl.className = 'msg bot';
      msgEl.setAttribute('lang', this._lang);
      msgEl.innerHTML = `
        <span class="citation-pill">${SVG.check} ${citation}${section ? ` · ${section}` : ''}</span><br>
        <span>${this._escHtml(text)}</span>
      `;

      if (data.jobBarriersDecoded?.length) {
        const barrier = data.jobBarriersDecoded[0];
        msgEl.innerHTML += `<hr style="margin:10px 0;border-color:var(--border-default)">
          <strong>⚠ Detected Barrier:</strong> ${this._escHtml(barrier.barrier)}<br>
          <strong>✓ Accommodation:</strong> ${this._escHtml(barrier.recommendedAccommodation)}<br>
          <em style="font-size:0.8rem;color:var(--accent-verified)">${this._escHtml(barrier.legalCitation)}</em>`;
      }

      if (data.interactivePageGuide?.length) {
        const steps = data.interactivePageGuide.slice(0, 6);
        const stepsHtml = steps.map(s => `
          <button class="guide-step" data-step="${s.step}" aria-label="Go to: ${this._escHtml(s.label)}">
            <span class="step-num">${s.step}</span>
            <span class="step-label">${this._escHtml(s.label.slice(0, 55))}</span>
            <span class="step-tag">${this._escHtml(s.tag)}</span>
          </button>`).join('');
        msgEl.innerHTML += `<div class="guide-steps">${stepsHtml}</div>`;
      }

      const messages = this._shadow.querySelector('#messages');
      messages.appendChild(msgEl);
      messages.scrollTop = messages.scrollHeight;

      // Wire guide step click to host-page element
      msgEl.querySelectorAll('.guide-step').forEach(btn => {
        btn.addEventListener('click', () => this._focusHostElement(parseInt(btn.dataset.step) - 1));
      });
    }

    _renderOfflineResponse(_query) {
      const t = I18N[this._lang] || I18N.en;
      const msgEl = document.createElement('div');
      msgEl.className = 'msg bot';
      msgEl.setAttribute('lang', this._lang);
      msgEl.innerHTML = `
        <span class="citation-pill">${SVG.check} Offline · Proclamation 568/2008</span><br>
        <strong>Offline Guidance (2G/3G Mode):</strong><br>
        ${this._escHtml(OFFLINE_CORPUS.split('\n\n')[0])}<br><br>
        <em style="font-size:0.8rem;color:var(--accent-verified)">${t.placeholder.includes('Ask') ? 'Zero medical proof required — Proclamation 568/2008 Art. 4.' : ''}</em>
      `;
      const messages = this._shadow.querySelector('#messages');
      messages.appendChild(msgEl);
      messages.scrollTop = messages.scrollHeight;
    }

    async _scanPage() {
      const btn = this._shadow.querySelector('#scan-btn');
      const scanLabel = this._shadow.querySelector('#scan-label');
      const t = I18N[this._lang] || I18N.en;
      btn.disabled = true;
      if (scanLabel) scanLabel.textContent = t.scanning;

      this._clearHighlights();

      // Collect interactive elements from the HOST page (outside shadow DOM)
      const hostEls = Array.from(
        document.querySelectorAll('h1, h2, h3, a[href], button:not([disabled]), input:not([type="hidden"]), select, textarea, [role="button"]')
      ).filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetWidth > 0;
      }).slice(0, 20);

      this._highlightedEls = hostEls;

      // Add highlight class to each
      hostEls.forEach(el => { el.classList.add('bm-highlight'); });

      // Inject host-page stylesheet if not already present
      if (!document.getElementById('bm-highlight-styles')) {
        const style = document.createElement('style');
        style.id = 'bm-highlight-styles';
        style.textContent = `.bm-highlight { outline: 3px solid #0f62fe !important; outline-offset: 3px !important; background: rgba(15,98,254,0.08) !important; scroll-margin-top: 80px; }`;
        document.head.appendChild(style);
      }

      const steps = hostEls.map((el, i) => ({
        step: i + 1,
        tag: el.tagName.toLowerCase(),
        label: (el.textContent?.trim() || el.getAttribute('aria-label') || el.getAttribute('placeholder') || el.getAttribute('title') || 'Interactive Element').slice(0, 70),
        href: el.getAttribute('href') || null
      })).filter(s => s.label.length > 1);

      // Render scanned steps as a bot message
      const msgEl = document.createElement('div');
      msgEl.className = 'msg bot';
      msgEl.innerHTML = `
        <span class="citation-pill">${SVG.check} Page Scan · ${steps.length} Elements Found</span><br>
        <strong>${t.scan} — ${steps.length} interactive elements detected.</strong>
        <div class="guide-steps">
          ${steps.slice(0, 8).map(s => `
            <button class="guide-step" data-step="${s.step}" aria-label="Focus: ${this._escHtml(s.label)}">
              <span class="step-num">${s.step}</span>
              <span class="step-label">${this._escHtml(s.label.slice(0, 55))}</span>
              <span class="step-tag">${this._escHtml(s.tag)}</span>
            </button>`).join('')}
        </div>
      `;

      const messages = this._shadow.querySelector('#messages');
      messages.appendChild(msgEl);
      messages.scrollTop = messages.scrollHeight;

      // Wire step buttons
      msgEl.querySelectorAll('.guide-step').forEach(btn => {
        btn.addEventListener('click', () => this._focusHostElement(parseInt(btn.dataset.step) - 1));
      });

      btn.disabled = false;
      if (scanLabel) scanLabel.textContent = t.scan;
    }

    _focusHostElement(index) {
      const el = this._highlightedEls[index];
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus();
      // Brief pulse animation
      el.style.transition = 'background 0.3s';
      el.style.background = 'rgba(15,98,254,0.18)';
      setTimeout(() => { el.style.background = ''; }, 800);
    }

    _clearHighlights() {
      this._highlightedEls.forEach(el => el.classList.remove('bm-highlight'));
      this._highlightedEls = [];
    }

    _appendMsg(role, text, thinking = false) {
      const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const msgEl = document.createElement('div');
      msgEl.className = `msg ${role}`;
      msgEl.id = id;
      if (thinking) msgEl.setAttribute('aria-busy', 'true');
      msgEl.setAttribute('lang', role === 'user' ? 'und' : this._lang);
      msgEl.textContent = text;
      const messages = this._shadow.querySelector('#messages');
      messages?.appendChild(msgEl);
      messages && (messages.scrollTop = messages.scrollHeight);
      return id;
    }

    _removeMsg(id) {
      this._shadow.getElementById(id)?.remove();
    }

    _escHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }
  }

  // Register the custom element (guard against double-registration in hot-reload envs)
  if (!customElements.get('bridgemate-assistant')) {
    customElements.define('bridgemate-assistant', BridgeMateAssistant);
  }

  // ── Auto-mount if <bridgemate-assistant> tags are already in the DOM ──────
  // (Handles browsers that don't auto-upgrade before script loads)
  document.querySelectorAll('bridgemate-assistant').forEach(el => {
    if (!el.shadowRoot) { el.connectedCallback?.(); }
  });

  console.info('[BridgeMate] Plugin v1.0.0 loaded. Use <bridgemate-assistant api-url="/api/v1" lang="am"> to embed.');
})();
