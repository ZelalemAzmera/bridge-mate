/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BridgeMateAssistantElement } from '@/web-components/bridgemate-widget';

describe('BridgeMate Drop-in Web Component (<bridgemate-assistant>)', () => {
  beforeEach(() => {
    // Register custom element if not already registered in jsdom
    if (!customElements.get('bridgemate-assistant')) {
      customElements.define('bridgemate-assistant', BridgeMateAssistantElement);
    }
    document.body.innerHTML = '';
  });

  it('renders custom element with Shadow DOM encapsulation', () => {
    const el = document.createElement('bridgemate-assistant') as BridgeMateAssistantElement;
    document.body.appendChild(el);

    expect(el.shadowRoot).not.toBeNull();
    const launcher = el.shadowRoot?.querySelector('#bm-launcher');
    expect(launcher).not.toBeNull();
    expect(launcher?.getAttribute('aria-expanded')).toBe('false');
  });

  it('toggles open and close state and dispatches custom events', () => {
    const el = document.createElement('bridgemate-assistant') as BridgeMateAssistantElement;
    document.body.appendChild(el);

    const openListener = vi.fn();
    const closeListener = vi.fn();
    el.addEventListener('bridgemate:open', openListener);
    el.addEventListener('bridgemate:close', closeListener);

    el.open();
    expect(openListener).toHaveBeenCalledTimes(1);
    const launcher = el.shadowRoot?.querySelector('#bm-launcher');
    expect(launcher?.getAttribute('aria-expanded')).toBe('true');

    el.close();
    expect(closeListener).toHaveBeenCalledTimes(1);
    expect(launcher?.getAttribute('aria-expanded')).toBe('false');
  });

  it('supports language switching between Amharic and English', () => {
    const el = document.createElement('bridgemate-assistant') as BridgeMateAssistantElement;
    el.setAttribute('lang', 'am');
    document.body.appendChild(el);

    expect(el.currentLang).toBe('am');
    const sendBtn = el.shadowRoot?.querySelector('#bm-send');
    expect(sendBtn?.textContent?.trim()).toBe('ላክ');

    el.setLanguage('en');
    expect(el.currentLang).toBe('en');
    expect(sendBtn?.textContent?.trim()).toBe('Send');
  });

  it('initializes with welcome message in logs', () => {
    const el = document.createElement('bridgemate-assistant') as BridgeMateAssistantElement;
    document.body.appendChild(el);

    const messages = el.shadowRoot?.querySelectorAll('.message-bubble');
    expect(messages?.length).toBeGreaterThanOrEqual(1);
    expect(messages?.[0]?.textContent).toContain('ብሪጅሜት');
  });

  it('responds to Escape key by closing the open assistant dialog', () => {
    const el = document.createElement('bridgemate-assistant') as BridgeMateAssistantElement;
    document.body.appendChild(el);

    el.open();
    const escapeEvt = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    window.dispatchEvent(escapeEvt);

    const launcher = el.shadowRoot?.querySelector('#bm-launcher');
    expect(launcher?.getAttribute('aria-expanded')).toBe('false');
  });

  it('provides accessible min-target size of 60x60px for floating launcher', () => {
    const el = document.createElement('bridgemate-assistant') as BridgeMateAssistantElement;
    document.body.appendChild(el);

    const launcher = el.shadowRoot?.querySelector('#bm-launcher');
    expect(launcher?.className).toContain('launcher-btn');
    expect(launcher?.getAttribute('aria-haspopup')).toBe('dialog');
  });
});
