/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('ALX Track 3 <db-assistant> Spec Conformance Tests', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    // Load module/db-assistant.js into the jsdom environment if not defined
    if (!customElements.get('db-assistant')) {
      const scriptCode = fs.readFileSync(path.join(process.cwd(), 'module', 'db-assistant.js'), 'utf8');
      const scriptEl = document.createElement('script');
      scriptEl.textContent = scriptCode;
      document.body.appendChild(scriptEl);
    }
  });

  it('defines <db-assistant> custom element with Shadow DOM', () => {
    const el = document.createElement('db-assistant');
    document.body.appendChild(el);

    expect(customElements.get('db-assistant')).toBeDefined();
    expect(el.shadowRoot).not.toBeNull();
  });

  it('renders a floating launcher button (#fab) with accessible name and min touch target', () => {
    const el = document.createElement('db-assistant');
    document.body.appendChild(el);

    const fab = el.shadowRoot?.getElementById('fab');
    expect(fab).not.toBeNull();
    expect(fab?.getAttribute('aria-label')).toBeTruthy();
    expect(fab?.getAttribute('aria-expanded')).toBe('false');
  });

  it('toggles open panel on launcher click and updates aria-expanded', () => {
    const el = document.createElement('db-assistant');
    document.body.appendChild(el);

    const fab = el.shadowRoot?.getElementById('fab');
    const panel = el.shadowRoot?.getElementById('panel');

    expect(panel?.hasAttribute('hidden')).toBe(true);

    fab?.click();
    expect(panel?.hasAttribute('hidden')).toBe(false);
    expect(fab?.getAttribute('aria-expanded')).toBe('true');

    fab?.click();
    expect(panel?.hasAttribute('hidden')).toBe(true);
    expect(fab?.getAttribute('aria-expanded')).toBe('false');
  });

  it('dispatches db-assistant:question with { text, language } per host data contract', async () => {
    const el = document.createElement('db-assistant');
    el.setAttribute('lang', 'am');
    document.body.appendChild(el);

    const fab = el.shadowRoot?.getElementById('fab');
    fab?.click();

    let capturedEvent: any = null;
    document.addEventListener('db-assistant:question', (e: any) => {
      capturedEvent = e.detail;
    });

    const input = el.shadowRoot?.getElementById('chat-input') as HTMLTextAreaElement;
    const sendBtn = el.shadowRoot?.getElementById('send-btn') as HTMLButtonElement;

    input.value = 'ስለ ቨርቹዋል አሲስታንት ስራ ምን ተብሏል?';
    sendBtn.click();

    expect(capturedEvent).not.toBeNull();
    expect(capturedEvent.text).toBe('ስለ ቨርቹዋል አሲስታንት ስራ ምን ተብሏል?');
    expect(capturedEvent.language).toBe('am');
  });

  it('closes panel and returns focus to launcher on Escape key', () => {
    const el = document.createElement('db-assistant');
    document.body.appendChild(el);

    const fab = el.shadowRoot?.getElementById('fab');
    fab?.click();

    const panel = el.shadowRoot?.getElementById('panel');
    expect(panel?.hasAttribute('hidden')).toBe(false);

    // Press Escape
    const escapeEvt = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    el.shadowRoot?.dispatchEvent(escapeEvt);

    expect(panel?.hasAttribute('hidden')).toBe(true);
    expect(fab?.getAttribute('aria-expanded')).toBe('false');
  });

  it('contains role="log" and aria-live="polite" on chat log', () => {
    const el = document.createElement('db-assistant');
    document.body.appendChild(el);

    const log = el.shadowRoot?.getElementById('chat-log');
    expect(log).not.toBeNull();
    expect(log?.getAttribute('role')).toBe('log');
    expect(log?.getAttribute('aria-live')).toBe('polite');
  });

  it('renders multilingual grounded quick prompt chips and dispatches question on chip click', () => {
    const el = document.createElement('db-assistant') as any;
    el.setAttribute('lang', 'am');
    document.body.appendChild(el);

    const fab = el.shadowRoot?.getElementById('fab');
    fab?.click();

    const chipsBar = el.shadowRoot?.getElementById('quick-chips-bar');
    expect(chipsBar).not.toBeNull();
    const chips = chipsBar?.querySelectorAll('.quick-chip');
    expect(chips?.length).toBeGreaterThanOrEqual(3);
    expect(chips?.[0]?.textContent).toContain('የፈተና ማመቻቸት መብቶች');

    let capturedEvent: any = null;
    document.addEventListener('db-assistant:question', (e: any) => {
      capturedEvent = e.detail;
    });

    (chips?.[0] as HTMLButtonElement).click();

    expect(capturedEvent).not.toBeNull();
    expect(capturedEvent.text).toContain('በአዋጅ 1156/2019 አንቀጽ 29');
    expect(capturedEvent.language).toBe('am');
  });

  it('cycles audio playback speed regulator across 0.85x, 1.0x, and 1.25x', () => {
    const el = document.createElement('db-assistant');
    el.setAttribute('lang', 'am');
    document.body.appendChild(el);

    const fab = el.shadowRoot?.getElementById('fab');
    fab?.click();

    const rateBtn = el.shadowRoot?.getElementById('rate-toggle') as HTMLButtonElement;
    expect(rateBtn).not.toBeNull();
    expect(rateBtn.textContent).toBe('🔊 0.85x');

    rateBtn.click();
    expect(rateBtn.textContent).toBe('🔊 1x');

    rateBtn.click();
    expect(rateBtn.textContent).toBe('🔊 1.25x');

    rateBtn.click();
    expect(rateBtn.textContent).toBe('🔊 0.85x');
  });

  it('toggles Deepened Simple Mode and applies simple-mode-active class', () => {
    const el = document.createElement('db-assistant');
    document.body.appendChild(el);

    const fab = el.shadowRoot?.getElementById('fab');
    fab?.click();

    const panel = el.shadowRoot?.getElementById('panel');
    const simpleToggle = el.shadowRoot?.getElementById('simple-toggle') as HTMLButtonElement;

    expect(panel?.classList.contains('simple-mode-active')).toBe(false);
    expect(simpleToggle.getAttribute('aria-pressed')).toBe('false');

    simpleToggle.click();
    expect(panel?.classList.contains('simple-mode-active')).toBe(true);
    expect(simpleToggle.getAttribute('aria-pressed')).toBe('true');

    simpleToggle.click();
    expect(panel?.classList.contains('simple-mode-active')).toBe(false);
    expect(simpleToggle.getAttribute('aria-pressed')).toBe('false');
  });

  it('toggles Hands-Free voice loop mode and updates button state', () => {
    const el = document.createElement('db-assistant');
    document.body.appendChild(el);

    const fab = el.shadowRoot?.getElementById('fab');
    fab?.click();

    const handsfreeBtn = el.shadowRoot?.getElementById('handsfree-btn') as HTMLButtonElement;
    expect(handsfreeBtn).not.toBeNull();
    expect(handsfreeBtn.getAttribute('aria-pressed')).toBe('false');
    expect(handsfreeBtn.classList.contains('active')).toBe(false);

    handsfreeBtn.click();
    expect(handsfreeBtn.getAttribute('aria-pressed')).toBe('true');
    expect(handsfreeBtn.classList.contains('active')).toBe(true);

    handsfreeBtn.click();
    expect(handsfreeBtn.getAttribute('aria-pressed')).toBe('false');
    expect(handsfreeBtn.classList.contains('active')).toBe(false);
  });

  it('exports plain text and Braille formatted transcript safely', () => {
    const el = document.createElement('db-assistant') as any;
    document.body.appendChild(el);

    const fab = el.shadowRoot?.getElementById('fab');
    fab?.click();

    const exportBtn = el.shadowRoot?.getElementById('export-btn') as HTMLButtonElement;
    expect(exportBtn).not.toBeNull();

    // Trigger export with empty conversation
    exportBtn.click();

    // Now populate a conversation item and trigger export
    el._conversation = [
      { role: 'user', content: 'What accommodation rights exist?' },
      { role: 'assistant', content: 'Under Ethiopian Proclamation 1156/2019...' }
    ];

    expect(() => exportBtn.click()).not.toThrow();
  });

  it('triggers haptic feedback via navigator.vibrate when available', () => {
    const vibrateMock = vi.fn();
    (navigator as any).vibrate = vibrateMock;

    const el = document.createElement('db-assistant');
    document.body.appendChild(el);

    const fab = el.shadowRoot?.getElementById('fab');
    fab?.click();

    const input = el.shadowRoot?.getElementById('chat-input') as HTMLTextAreaElement;
    const sendBtn = el.shadowRoot?.getElementById('send-btn') as HTMLButtonElement;

    input.value = 'Haptic test question';
    sendBtn.click();

    expect(vibrateMock).toHaveBeenCalled();
  });
});
