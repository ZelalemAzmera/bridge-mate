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
});
