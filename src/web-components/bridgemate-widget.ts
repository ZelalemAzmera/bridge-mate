/**
 * BridgeMate Drop-in Web Component (<bridgemate-assistant>)
 * 
 * Standards & Design:
 * - W3C Custom Elements v1 & Shadow DOM v1
 * - WCAG 2.2 Level AA Compliant (SC 1.4.3, SC 2.1.1, SC 2.4.3, SC 2.5.8, SC 3.2.6)
 * - Multilingual: Amharic (አማርኛ) & English with dynamic in-dialog toggle
 * - Keyboard shortcuts: Alt+M (Toggle Assistant), Alt+H (Escalate to Human Help), Esc (Close)
 * - Speech synthesis (TTS) & Web Speech API recognition fallback
 * - Zero external framework dependencies — pure vanilla browser element
 */

export interface BridgeMateMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  citations?: Array<{ sourceTitle: string; pageNumber?: number }>;
}

export class BridgeMateAssistantElement extends HTMLElement {
  static get observedAttributes() {
    return ['theme', 'lang', 'api-base', 'course-id', 'initial-context'];
  }

  private isOpen = false;
  private messages: BridgeMateMessage[] = [];
  private isGenerating = false;
  private isListening = false;
  private recognition: any = null;
  private shadow: ShadowRoot;

  // DOM references
  private launcherBtn!: HTMLButtonElement;
  private dialogContainer!: HTMLElement;
  private messagesContainer!: HTMLElement;
  private messageInput!: HTMLTextAreaElement;
  private sendBtn!: HTMLButtonElement;
  private langToggleBtn!: HTMLButtonElement;
  private closeBtn!: HTMLButtonElement;
  private liveHelpBtn!: HTMLButtonElement;
  private micBtn!: HTMLButtonElement;
  private liveRegion!: HTMLElement;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  get theme(): string {
    return this.getAttribute('theme') || 'dark';
  }

  get currentLang(): 'am' | 'en' {
    return (this.getAttribute('lang') as 'am' | 'en') || 'am';
  }

  get apiBase(): string {
    const attr = this.getAttribute('api-base');
    if (attr) return attr.replace(/\/$/, '');
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  }

  get courseId(): string | null {
    return this.getAttribute('course-id');
  }

  get initialContext(): string | null {
    return this.getAttribute('initial-context');
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
    this.setupSpeechRecognition();
    this.initWelcomeMessage();
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;
    if (name === 'theme') {
      this.updateTheme();
    } else if (name === 'lang') {
      this.updateLanguage();
    }
  }

  private t(key: string): string {
    const dict: Record<string, { am: string; en: string }> = {
      launcherLabel: {
        am: 'ብሪጅሜት የትምህርትና ተደራሽነት ረዳት (Alt+M)',
        en: 'BridgeMate Accessibility Assistant (Alt+M)',
      },
      title: {
        am: 'ብሪጅሜት ረዳት',
        en: 'BridgeMate Assistant',
      },
      close: {
        am: 'ረዳቱን ዝጋ (Esc)',
        en: 'Close Assistant (Esc)',
      },
      liveHelpLabel: {
        am: '👩‍💼 የሰው ድጋፍ አገናኝ (Live Help - Alt+H)',
        en: '👩‍💼 Get Live Human Help (Alt+H)',
      },
      inputPlaceholder: {
        am: 'ጥያቄዎን ወይም ማመቻቸት የሚፈልጉትን እዚህ ይጻፉ...',
        en: 'Ask a question or request accommodation...',
      },
      send: {
        am: 'ላክ',
        en: 'Send',
      },
      listen: {
        am: 'በድምፅ አዳምጥ',
        en: 'Listen to message',
      },
      voiceInputStart: {
        am: 'በድምፅ ተናገር',
        en: 'Speak query with microphone',
      },
      voiceInputStop: {
        am: 'ድምፅ ማዳመጥ አቁም',
        en: 'Stop listening',
      },
      welcomeMessage: {
        am: 'እንኳን ወደ ብሪጅሜት ረዳት በደህና መጡ! በትምህርት፣ በኮድ ማብራሪያ፣ በፈተና ወይም በሥራ ቦታ ተደራሽነትና ማመቻቸት ጥያቄዎችዎን ለመመለስ ዝግጁ ነኝ።',
        en: 'Welcome to BridgeMate Assistant! I can help you understand assignments, clarify technical concepts, or request accessibility accommodations.',
      },
      escalating: {
        am: 'የቀጥታ የሰው ረዳት እየተገናኘ ነው...',
        en: 'Connecting to Live Human Queue...',
      },
      escalatedSuccess: {
        am: 'የድጋፍ ጥያቄዎ በተራ ቁጥር ተመዝግቧል። የሰው ረዳት በቅርቡ ያናግርዎታል።',
        en: 'Support session requested. A human specialist will assist you shortly.',
      },
    };

    const entry = dict[key];
    if (!entry) return key;
    return this.currentLang === 'am' ? entry.am : entry.en;
  }

  private render() {
    this.shadow.innerHTML = `
      <style>
        :host {
          --bm-primary: #10B981;
          --bm-primary-hover: #059669;
          --bm-bg: #0F172A;
          --bm-card: #1E293B;
          --bm-text: #F8FAFC;
          --bm-text-muted: #94A3B8;
          --bm-border: #334155;
          --bm-focus: #38BDF8;
          --bm-font: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Nyala", "Abyssinica SIL", sans-serif;
          font-family: var(--bm-font);
          display: block;
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 999999;
        }

        :host([theme="light"]) {
          --bm-bg: #FFFFFF;
          --bm-card: #F1F5F9;
          --bm-text: #0F172A;
          --bm-text-muted: #64748B;
          --bm-border: #CBD5E1;
          --bm-focus: #0284C7;
        }

        :host([theme="high-contrast"]) {
          --bm-primary: #FFFF00;
          --bm-primary-hover: #FFEA00;
          --bm-bg: #000000;
          --bm-card: #121212;
          --bm-text: #FFFFFF;
          --bm-text-muted: #FFFF00;
          --bm-border: #FFFFFF;
          --bm-focus: #FFFF00;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        /* Screen reader only utility */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        /* Floating Launcher Button */
        .launcher-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: var(--bm-primary);
          color: #0F172A;
          border: 3px solid var(--bm-border);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s;
        }

        .launcher-btn:hover {
          transform: scale(1.08);
          background: var(--bm-primary-hover);
        }

        .launcher-btn:focus-visible {
          outline: 4px solid var(--bm-focus);
          outline-offset: 4px;
        }

        .launcher-btn svg {
          width: 32px;
          height: 32px;
        }

        /* Dialog Container */
        .dialog {
          display: none;
          position: fixed;
          bottom: 96px;
          right: 24px;
          width: 400px;
          max-width: calc(100vw - 32px);
          height: 580px;
          max-height: calc(100vh - 120px);
          background: var(--bm-bg);
          color: var(--bm-text);
          border: 2px solid var(--bm-border);
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
          flex-direction: column;
          overflow: hidden;
          z-index: 1000000;
        }

        .dialog.open {
          display: flex;
          animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Dialog Header */
        .dialog-header {
          padding: 14px 18px;
          background: var(--bm-card);
          border-bottom: 1px solid var(--bm-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .header-title-box {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .header-title-box h2 {
          font-size: 1.1rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .badge-course {
          font-size: 0.75rem;
          padding: 2px 8px;
          border-radius: 9999px;
          background: rgba(16, 185, 129, 0.2);
          color: var(--bm-primary);
          border: 1px solid var(--bm-primary);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .icon-btn {
          min-width: 44px;
          min-height: 44px;
          background: transparent;
          border: 1px solid var(--bm-border);
          color: var(--bm-text);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
          transition: background 0.15s, border-color 0.15s;
        }

        .icon-btn:hover {
          background: var(--bm-border);
        }

        .icon-btn:focus-visible {
          outline: 3px solid var(--bm-focus);
          outline-offset: 2px;
        }

        /* Live Help Escalation Banner */
        .live-help-banner {
          background: rgba(16, 185, 129, 0.12);
          border-bottom: 1px solid rgba(16, 185, 129, 0.3);
          padding: 8px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .live-help-btn {
          width: 100%;
          min-height: 44px;
          background: #047857;
          color: #FFFFFF;
          border: 1px solid #10B981;
          border-radius: 8px;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.15s;
        }

        .live-help-btn:hover {
          background: #065F46;
        }

        .live-help-btn:focus-visible {
          outline: 3px solid var(--bm-focus);
          outline-offset: 2px;
        }

        /* Messages Area */
        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .message-bubble {
          max-width: 85%;
          padding: 12px 14px;
          border-radius: 12px;
          font-size: 0.92rem;
          line-height: 1.5;
          word-break: break-word;
        }

        .message-bubble.user {
          align-self: flex-end;
          background: var(--bm-primary);
          color: #0F172A;
          font-weight: 500;
          border-bottom-right-radius: 2px;
        }

        .message-bubble.assistant {
          align-self: flex-start;
          background: var(--bm-card);
          color: var(--bm-text);
          border: 1px solid var(--bm-border);
          border-bottom-left-radius: 2px;
        }

        .message-bubble.system {
          align-self: center;
          background: rgba(56, 189, 248, 0.15);
          color: #38BDF8;
          border: 1px solid rgba(56, 189, 248, 0.3);
          font-size: 0.85rem;
          text-align: center;
        }

        .bubble-footer {
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 6px;
        }

        .speak-btn {
          min-width: 36px;
          min-height: 36px;
          padding: 4px 8px;
          font-size: 0.78rem;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid var(--bm-border);
          color: var(--bm-text);
          border-radius: 6px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .speak-btn:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .speak-btn:focus-visible {
          outline: 2px solid var(--bm-focus);
        }

        /* Input Form */
        .input-area {
          padding: 12px 14px;
          background: var(--bm-card);
          border-top: 1px solid var(--bm-border);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-row {
          display: flex;
          align-items: flex-end;
          gap: 8px;
        }

        .text-input {
          flex: 1;
          min-height: 48px;
          max-height: 120px;
          padding: 10px 14px;
          background: var(--bm-bg);
          color: var(--bm-text);
          border: 1px solid var(--bm-border);
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.95rem;
          resize: none;
        }

        .text-input:focus-visible {
          outline: 2px solid var(--bm-focus);
        }

        .action-btn {
          min-width: 48px;
          min-height: 48px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          transition: background 0.15s;
        }

        .send-btn {
          background: var(--bm-primary);
          color: #0F172A;
          padding: 0 16px;
        }

        .send-btn:hover:not(:disabled) {
          background: var(--bm-primary-hover);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .send-btn:focus-visible, .mic-btn:focus-visible {
          outline: 3px solid var(--bm-focus);
          outline-offset: 2px;
        }

        .mic-btn {
          background: var(--bm-bg);
          color: var(--bm-text);
          border: 1px solid var(--bm-border);
        }

        .mic-btn.active {
          background: #DC2626;
          color: #FFFFFF;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
          70% { box-shadow: 0 0 0 8px rgba(220, 38, 38, 0); }
          100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
        }

        .shortcuts-hint {
          font-size: 0.72rem;
          color: var(--bm-text-muted);
          text-align: center;
        }
      </style>

      <!-- Live Announcement Region for Screen Readers -->
      <div id="bm-live" class="sr-only" aria-live="polite" aria-atomic="true"></div>

      <!-- Floating Launcher Button -->
      <button 
        id="bm-launcher" 
        class="launcher-btn" 
        type="button"
        aria-label="${this.t('launcherLabel')}"
        aria-expanded="false"
        aria-haspopup="dialog"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          <path d="M8 10h.01"></path>
          <path d="M12 10h.01"></path>
          <path d="M16 10h.01"></path>
        </svg>
      </button>

      <!-- Main Assistant Dialog -->
      <div 
        id="bm-dialog" 
        class="dialog" 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="bm-title"
      >
        <!-- Header -->
        <header class="dialog-header">
          <div class="header-title-box">
            <h2 id="bm-title">${this.t('title')}</h2>
            ${this.courseId ? `<span class="badge-course">${this.courseId}</span>` : ''}
          </div>
          <div class="header-actions">
            <button 
              id="bm-lang-toggle" 
              class="icon-btn" 
              type="button" 
              aria-label="Toggle language: Amharic or English"
            >
              ${this.currentLang === 'am' ? 'EN' : 'አማ'}
            </button>
            <button 
              id="bm-close" 
              class="icon-btn" 
              type="button" 
              aria-label="${this.t('close')}"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </header>

        <!-- Live Human Help Banner -->
        <div class="live-help-banner">
          <button id="bm-live-help" class="live-help-btn" type="button" aria-label="${this.t('liveHelpLabel')}">
            ${this.t('liveHelpLabel')}
          </button>
        </div>

        <!-- Messages Area -->
        <div id="bm-messages" class="messages-area" role="log" aria-live="polite">
          <!-- Dynamically populated messages -->
        </div>

        <!-- Input Area -->
        <footer class="input-area">
          <div class="input-row">
            <textarea 
              id="bm-input" 
              class="text-input" 
              rows="1" 
              placeholder="${this.t('inputPlaceholder')}"
              aria-label="${this.t('inputPlaceholder')}"
            ></textarea>

            <button 
              id="bm-mic" 
              class="action-btn mic-btn" 
              type="button" 
              aria-label="${this.t('voiceInputStart')}"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            </button>

            <button 
              id="bm-send" 
              class="action-btn send-btn" 
              type="button" 
              aria-label="${this.t('send')}"
            >
              ${this.t('send')}
            </button>
          </div>
          <div class="shortcuts-hint">
            <span>Alt+M: Toggle • Alt+H: Live Help • Esc: Close</span>
          </div>
        </footer>
      </div>
    `;

    // Cache elements
    this.launcherBtn = this.shadow.querySelector('#bm-launcher') as HTMLButtonElement;
    this.dialogContainer = this.shadow.querySelector('#bm-dialog') as HTMLElement;
    this.messagesContainer = this.shadow.querySelector('#bm-messages') as HTMLElement;
    this.messageInput = this.shadow.querySelector('#bm-input') as HTMLTextAreaElement;
    this.sendBtn = this.shadow.querySelector('#bm-send') as HTMLButtonElement;
    this.langToggleBtn = this.shadow.querySelector('#bm-lang-toggle') as HTMLButtonElement;
    this.closeBtn = this.shadow.querySelector('#bm-close') as HTMLButtonElement;
    this.liveHelpBtn = this.shadow.querySelector('#bm-live-help') as HTMLButtonElement;
    this.micBtn = this.shadow.querySelector('#bm-mic') as HTMLButtonElement;
    this.liveRegion = this.shadow.querySelector('#bm-live') as HTMLElement;
  }

  private setupEventListeners() {
    this.launcherBtn.addEventListener('click', () => this.toggle());
    this.closeBtn.addEventListener('click', () => this.close());
    this.langToggleBtn.addEventListener('click', () => this.toggleLanguage());
    this.liveHelpBtn.addEventListener('click', () => this.escalateToLiveHelp());
    this.sendBtn.addEventListener('click', () => this.handleSendMessage());

    this.messageInput.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSendMessage();
      }
    });

    if (this.micBtn) {
      this.micBtn.addEventListener('click', () => this.toggleSpeechRecognition());
    }

    // Global keyboard listeners
    window.addEventListener('keydown', this.handleGlobalKeyDown);

    // Focus trap inside shadow DOM
    this.dialogContainer.addEventListener('keydown', this.handleFocusTrap);
  }

  private removeEventListeners() {
    window.removeEventListener('keydown', this.handleGlobalKeyDown);
  }

  private handleGlobalKeyDown = (e: KeyboardEvent) => {
    // Alt+M toggles assistant
    if (e.altKey && (e.key === 'm' || e.key === 'M' || e.key === 'መ')) {
      e.preventDefault();
      this.toggle();
    }
    // Alt+H escalates to live human help
    if (e.altKey && (e.key === 'h' || e.key === 'H' || e.key === 'ሀ')) {
      e.preventDefault();
      if (!this.isOpen) this.open();
      this.escalateToLiveHelp();
    }
    // Escape closes assistant
    if (e.key === 'Escape' && this.isOpen) {
      e.preventDefault();
      this.close();
    }
  };

  private handleFocusTrap = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    const focusable = this.dialogContainer.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && this.shadow.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && this.shadow.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  public open() {
    this.isOpen = true;
    this.dialogContainer.classList.add('open');
    this.launcherBtn.setAttribute('aria-expanded', 'true');
    this.announce(this.currentLang === 'am' ? 'የብሪጅሜት ረዳት ተከፍቷል' : 'BridgeMate Assistant opened');
    setTimeout(() => this.messageInput.focus(), 100);

    this.dispatchEvent(new CustomEvent('bridgemate:open', { bubbles: true, composed: true }));
  }

  public close() {
    this.isOpen = false;
    this.dialogContainer.classList.remove('open');
    this.launcherBtn.setAttribute('aria-expanded', 'false');
    this.launcherBtn.focus();
    this.announce(this.currentLang === 'am' ? 'የብሪጅሜት ረዳት ተዘግቷል' : 'BridgeMate Assistant closed');

    this.dispatchEvent(new CustomEvent('bridgemate:close', { bubbles: true, composed: true }));
  }

  public toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  public setLanguage(lang: 'am' | 'en') {
    this.setAttribute('lang', lang);
  }

  private toggleLanguage() {
    const nextLang = this.currentLang === 'am' ? 'en' : 'am';
    this.setLanguage(nextLang);
  }

  private updateLanguage() {
    if (!this.launcherBtn) return;
    const lang = this.currentLang;
    this.launcherBtn.setAttribute('aria-label', this.t('launcherLabel'));
    const titleEl = this.shadow.querySelector('#bm-title');
    if (titleEl) titleEl.textContent = this.t('title');
    if (this.closeBtn) this.closeBtn.setAttribute('aria-label', this.t('close'));
    if (this.liveHelpBtn) {
      this.liveHelpBtn.textContent = this.t('liveHelpLabel');
      this.liveHelpBtn.setAttribute('aria-label', this.t('liveHelpLabel'));
    }
    if (this.messageInput) {
      this.messageInput.placeholder = this.t('inputPlaceholder');
      this.messageInput.setAttribute('aria-label', this.t('inputPlaceholder'));
    }
    if (this.sendBtn) {
      this.sendBtn.textContent = this.t('send');
      this.sendBtn.setAttribute('aria-label', this.t('send'));
    }
    if (this.langToggleBtn) {
      this.langToggleBtn.textContent = lang === 'am' ? 'EN' : 'አማ';
    }
  }

  private updateTheme() {
    // CSS :host([theme="..."]) automatically adjusts styles
  }

  private announce(text: string) {
    if (this.liveRegion) {
      this.liveRegion.textContent = text;
    }
  }

  private initWelcomeMessage() {
    const welcome = this.t('welcomeMessage');
    this.addMessageToDOM({
      id: 'welcome-1',
      role: 'assistant',
      content: welcome,
      timestamp: new Date(),
    });
  }

  private addMessageToDOM(msg: BridgeMateMessage) {
    this.messages.push(msg);

    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${msg.role}`;
    bubble.id = `bm-msg-${msg.id}`;

    const textSpan = document.createElement('div');
    textSpan.textContent = msg.content;
    bubble.appendChild(textSpan);

    // Audio TTS button for assistant responses
    if (msg.role === 'assistant') {
      const footer = document.createElement('div');
      footer.className = 'bubble-footer';

      const speakBtn = document.createElement('button');
      speakBtn.className = 'speak-btn';
      speakBtn.type = 'button';
      speakBtn.setAttribute('aria-label', `${this.t('listen')}: ${msg.content.slice(0, 40)}`);
      speakBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
        <span>${this.t('listen')}</span>
      `;
      speakBtn.addEventListener('click', () => this.speakText(msg.content));
      footer.appendChild(speakBtn);

      bubble.appendChild(footer);
    }

    this.messagesContainer.appendChild(bubble);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;

    this.dispatchEvent(new CustomEvent('bridgemate:message', {
      bubbles: true,
      composed: true,
      detail: { role: msg.role, content: msg.content },
    }));
  }

  private speakText(text: string) {
    if (typeof window === 'undefined') return;

    const cleanText = (text || '')
      .replace(/\[Source:.*?\]/g, '')
      .replace(/[*_#`~>]/g, '')
      .trim()
      .slice(0, 300);

    const isAmharic = this.currentLang === 'am' || /[\u1200-\u137F]/.test(cleanText);

    const fallbackSpeech = () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = isAmharic ? 'am-ET' : 'en-US';
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    };

    if (isAmharic) {
      try {
        const audio = new Audio(`/api/tts?lang=am&text=${encodeURIComponent(cleanText)}`);
        audio.play().catch(() => fallbackSpeech());
        audio.onerror = () => fallbackSpeech();
        return;
      } catch {
        fallbackSpeech();
        return;
      }
    }

    fallbackSpeech();
  }

  private setupSpeechRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.messageInput.value = transcript;
        this.stopSpeechRecognition();
        this.handleSendMessage();
      };

      this.recognition.onerror = () => {
        this.stopSpeechRecognition();
      };

      this.recognition.onend = () => {
        this.stopSpeechRecognition();
      };
    }
  }

  private toggleSpeechRecognition() {
    if (!this.recognition) {
      alert(this.currentLang === 'am' ? 'በዚህ አሳሽ የድምፅ ማዳመጥ አይደገፍም።' : 'Speech recognition not supported in this browser.');
      return;
    }

    if (this.isListening) {
      this.stopSpeechRecognition();
    } else {
      this.startSpeechRecognition();
    }
  }

  private startSpeechRecognition() {
    if (!this.recognition) return;
    this.recognition.lang = this.currentLang === 'am' ? 'am-ET' : 'en-US';
    try {
      this.recognition.start();
      this.isListening = true;
      this.micBtn.classList.add('active');
      this.micBtn.setAttribute('aria-label', this.t('voiceInputStop'));
      this.announce(this.currentLang === 'am' ? 'ድምፅዎን በመስማት ላይ...' : 'Listening to speech...');
    } catch {
      // Ignored if already started
    }
  }

  private stopSpeechRecognition() {
    if (!this.recognition) return;
    try {
      this.recognition.stop();
    } catch {
      // Ignore
    }
    this.isListening = false;
    this.micBtn.classList.remove('active');
    this.micBtn.setAttribute('aria-label', this.t('voiceInputStart'));
  }

  private async handleSendMessage() {
    const text = this.messageInput.value.trim();
    if (!text || this.isGenerating) return;

    this.messageInput.value = '';
    this.isGenerating = true;
    this.sendBtn.disabled = true;

    // Add user message
    this.addMessageToDOM({
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    });

    try {
      const endpoint = `${this.apiBase}/api/chat`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: text }],
          courseId: this.courseId,
          initialContext: this.initialContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          assistantText += chunk;
        }
      } else {
        assistantText = await response.text();
      }

      this.addMessageToDOM({
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: assistantText.trim() || 'መልስ ማግኘት አልተቻለም። እባክዎ እንደገና ይሞክሩ።',
        timestamp: new Date(),
      });

    } catch (err: any) {
      console.error('[BridgeMate WebComponent Error]:', err);
      this.addMessageToDOM({
        id: `err-${Date.now()}`,
        role: 'system',
        content: this.currentLang === 'am'
          ? 'ይቅርታ፣ ከአገልጋዩ ጋር መገናኘት አልተቻለም። እባክዎ የቀጥታ የሰው ድጋፍ (Alt+H) ይጠቀሙ።'
          : 'Could not connect to server. Please try Live Human Help (Alt+H).',
        timestamp: new Date(),
      });

      this.dispatchEvent(new CustomEvent('bridgemate:error', {
        bubbles: true,
        composed: true,
        detail: { message: err?.message || 'Network error' },
      }));
    } finally {
      this.isGenerating = false;
      this.sendBtn.disabled = false;
      this.messageInput.focus();
    }
  }

  private async escalateToLiveHelp() {
    this.addMessageToDOM({
      id: `sys-${Date.now()}`,
      role: 'system',
      content: this.t('escalating'),
      timestamp: new Date(),
    });

    try {
      const endpoint = `${this.apiBase}/api/support/request`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userGoal: `Embedded Widget Course Help (${this.courseId || 'General Inquiry'})`,
          userLanguage: this.currentLang,
          disclosedAccommodations: ['Web Component Embedded User'],
          consentTranscript: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const queuePos = data.data?.queuePosition || 1;
        const msg = this.currentLang === 'am'
          ? `የሰው ድጋፍ ተመዝግቧል! የእርስዎ ተራ ቁጥር: #${queuePos}። ልዩ የድጋፍ ባለሙያ በቅርቡ ያናግርዎታል።`
          : `Live human help requested! Your queue position is: #${queuePos}. A specialist will assist you.`;

        this.addMessageToDOM({
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: msg,
          timestamp: new Date(),
        });

        this.dispatchEvent(new CustomEvent('bridgemate:escalate', {
          bubbles: true,
          composed: true,
          detail: data.data,
        }));
      } else {
        throw new Error(data.message || 'Support service unavailable');
      }
    } catch (err: any) {
      this.addMessageToDOM({
        id: `err-${Date.now()}`,
        role: 'system',
        content: this.currentLang === 'am'
          ? 'የሰው ድጋፍ መጠየቅ አልተቻለም። እባክዎ በቀጥታ በስልክ ወይም በዋናው ድረ-ገጽ ይሞክሩ።'
          : 'Unable to connect to live support queue. Please retry or contact support directly.',
        timestamp: new Date(),
      });
    }
  }
}

// Auto-register custom element if executing in browser context
if (typeof window !== 'undefined' && !window.customElements.get('bridgemate-assistant')) {
  window.customElements.define('bridgemate-assistant', BridgeMateAssistantElement);
}
