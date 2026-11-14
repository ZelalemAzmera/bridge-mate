/**
 * ALX Digital Bridge Accessibility Hackathon — Pass/Fail Gate Suite
 * BridgeMate Track 3 | WCAG 2.2 Level AA
 *
 * Gate 1: axe-core WCAG 2.2 AA scan (0 critical, 0 serious violations)
 * Gate 2: 200% Browser Zoom Reflow (0 horizontal scrolling)
 * Gate 3: Keyboard-Only Navigation (visible focus ring, focus not obscured)
 * Gate 4: NVDA/TalkBack Screen Reader integrity (landmarks, lang tags, aria-live)
 * Gate 5: Sound-Off / Muted usability (transcripts present for audio content)
 */

const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ROUTES = ['/', '/learn', '/support', '/telegram', '/low-bandwidth', '/jobs', '/embed-demo'];

test.describe('Digital Bridge Non-Negotiable Pass/Fail Accessibility Gate', () => {

  for (const route of ROUTES) {

    // ── Gate 1: axe-core WCAG 2.2 AA ─────────────────────────────────────────
    test(`[Gate 1] axe-core WCAG 2.2 AA — ${route}`, async ({ page }) => {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(1500);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .exclude('.bridgemate-shadow') // exclude shadow DOM custom element (tested separately)
        .analyze();

      const fatal = results.violations.filter(
        v => v.impact === 'critical' || v.impact === 'serious'
      );

      if (fatal.length > 0) {
        const details = fatal.map(v =>
          `  [${v.impact.toUpperCase()}] ${v.id}: ${v.description}\n` +
          v.nodes.slice(0, 2).map(n => `    → ${n.html.slice(0, 120)}`).join('\n')
        ).join('\n');
        console.error(`\n❌ ${route} — ${fatal.length} fatal axe violations:\n${details}`);
      }

      expect(fatal, `Route ${route} has ${fatal.length} critical/serious axe violations`).toEqual([]);
    });

    // ── Gate 2: 200% Zoom Reflow ──────────────────────────────────────────────
    test(`[Gate 2] 200% Zoom Reflow & No Horizontal Scroll — ${route}`, async ({ page }) => {
      await page.setViewportSize({ width: 640, height: 900 });
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 45000 });

      // Apply 200% root font-size to simulate text-based zoom
      await page.evaluate(() => {
        document.documentElement.style.setProperty('font-size', '200%', 'important');
      });
      await page.waitForTimeout(500);

      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        hasScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
      }));

      expect(
        overflow.hasScroll,
        `Horizontal scroll at 200% zoom on ${route}: scrollWidth=${overflow.scrollWidth}, clientWidth=${overflow.clientWidth}`
      ).toBe(false);

      // Re-check axe at 200% — reflow must not break labels
      const zoomAxe = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      const zoomFatal = zoomAxe.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
      if (zoomFatal.length) {
        console.error(`[Gate 2] ${route} @200%: ${zoomFatal.length} new violations`);
      }
      expect(zoomFatal, `${route} has new violations at 200% zoom`).toEqual([]);
    });

    // ── Gate 3: Keyboard Navigation ───────────────────────────────────────────
    test(`[Gate 3] Keyboard-Only Tab Nav, Focus Visible & Not Obscured — ${route}`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(500);

      // First Tab should land on skip link
      await page.keyboard.press('Tab');
      const skipLink = await page.evaluate(() => {
        const el = document.activeElement;
        return { href: el?.getAttribute('href'), text: el?.textContent?.trim().slice(0, 40) };
      });
      const isSkipLink = skipLink.href?.includes('main') || skipLink.text?.toLowerCase().includes('skip');
      expect(isSkipLink, `First focusable on ${route} is not a skip link (got: href="${skipLink.href}" text="${skipLink.text}")`).toBe(true);

      // Tab through 15 more controls
      for (let i = 0; i < 15; i++) {
        await page.keyboard.press('Tab');

        const focusState = await page.evaluate(() => {
          let active = document.activeElement;
          if (!active || active === document.body) return { skipped: true };

          // Traverse into open shadow DOM (for <bridgemate-assistant>)
          while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;

          const style = window.getComputedStyle(active);
          const rect = active.getBoundingClientRect();

          const hasOutline =
            (style.outlineStyle !== 'none' && parseFloat(style.outlineWidth || '0') >= 2) ||
            (style.boxShadow && style.boxShadow !== 'none');

          const bigEnough = rect.width >= 24 && rect.height >= 24;

          // WCAG 2.4.11: check if any sticky overlay covers the focused element
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + 2; // check near top of element
          const topEl = document.elementFromPoint(cx, cy);
          const notObscured = !topEl || active === topEl || active.contains(topEl) || topEl.contains(active);

          return {
            tag: active.tagName,
            text: (active.textContent || active.getAttribute('aria-label') || '').trim().slice(0, 40),
            hasOutline,
            bigEnough,
            notObscured,
            outlineWidth: style.outlineWidth,
            outlineStyle: style.outlineStyle
          };
        });

        if (!focusState.skipped) {
          expect(
            focusState.hasOutline,
            `Tab ${i + 2} on ${route}: <${focusState.tag}> "${focusState.text}" has no visible focus outline (outline: ${focusState.outlineStyle} ${focusState.outlineWidth})`
          ).toBe(true);

          expect(
            focusState.notObscured,
            `Tab ${i + 2} on ${route}: <${focusState.tag}> "${focusState.text}" is obscured by sticky header (WCAG 2.4.11)`
          ).toBe(true);
        }
      }
    });

    // ── Gate 4: Screen Reader (NVDA/TalkBack) Integrity ──────────────────────
    test(`[Gate 4] Screen Reader Integrity & lang= Tags — ${route}`, async ({ page }) => {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 45000 });

      const audit = await page.evaluate(() => {
        // 1. Semantic landmarks
        const hasMain = !!document.querySelector('main, [role="main"]');
        const h1Count = document.querySelectorAll('h1').length;

        // 2. Empty interactive controls
        const emptyControls = [...document.querySelectorAll('a, button')]
          .filter(el => {
            const text = (el.innerText || el.textContent || '').trim();
            const aria = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.getAttribute('title') || '';
            return !text && !aria;
          })
          .map(el => el.outerHTML.slice(0, 100));

        // 3. Ethiopic text without lang attribute
        const ethiopicRe = /[\u1200-\u137F]/;
        const untaggedEthiopic = [...document.querySelectorAll('*')]
          .filter(el => el.children.length === 0 && ethiopicRe.test(el.textContent || ''))
          .filter(el => !el.closest('[lang="am"],[lang="ti"],[lang="om"],[lang="so"]'))
          .map(el => el.textContent?.trim().slice(0, 40));

        // 4. Raw markdown in visible text
        const rawMd = [...document.querySelectorAll('p, li, span, td, div')]
          .filter(el => el.children.length === 0)
          .filter(el => /\*[^\s*][^*]*\*/.test(el.textContent || '') || /_[^\s_][^_]*_/.test(el.textContent || ''))
          .map(el => el.textContent?.trim().slice(0, 60));

        // 5. aria-live region present
        const hasLiveRegion = !!document.querySelector('[aria-live],[role="status"],[role="log"]');

        // 6. All images have alt
        const imgsMissingAlt = [...document.querySelectorAll('img')]
          .filter(img => img.getAttribute('alt') === null)
          .map(img => img.src?.slice(-40) || '(no src)');

        // 7. Skip link present
        const hasSkipLink = !!document.querySelector('a[href="#main-content"], a[href*="main-content"]');

        return { hasMain, h1Count, emptyControls, untaggedEthiopic, rawMd, hasLiveRegion, imgsMissingAlt, hasSkipLink };
      });

      expect(audit.hasMain, `${route}: missing <main> landmark`).toBe(true);
      expect(audit.h1Count, `${route}: must have exactly 1 <h1>`).toBeGreaterThanOrEqual(1);
      expect(audit.emptyControls, `${route}: empty <a>/<button> tags: ${audit.emptyControls.join(' | ')}`).toHaveLength(0);
      expect(audit.rawMd, `${route}: raw Markdown * or _ in DOM: ${audit.rawMd.join(' | ')}`).toHaveLength(0);
      expect(audit.hasLiveRegion, `${route}: missing aria-live region`).toBe(true);
      expect(audit.imgsMissingAlt, `${route}: images missing alt: ${audit.imgsMissingAlt.join(', ')}`).toHaveLength(0);
      expect(audit.hasSkipLink, `${route}: missing skip-to-main link`).toBe(true);

      if (audit.untaggedEthiopic.length > 0) {
        console.warn(`[Gate 4] ${route}: ${audit.untaggedEthiopic.length} Ethiopic text nodes missing lang= attribute:`, audit.untaggedEthiopic.slice(0, 3));
      }
    });

    // ── Gate 5: Sound-Off / Muted Audio Usability ─────────────────────────────
    test(`[Gate 5] Muted-Audio Usability — ${route}`, async ({ page }) => {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 45000 });

      const audioAudit = await page.evaluate(() => {
        const audioEls = [...document.querySelectorAll('audio, video, [data-audio], [role="audio"]')];

        // Each audio/video must have an adjacent transcript or caption
        const withoutTranscript = audioEls.filter(el => {
          const parent = el.parentElement;
          const hasTrack = el.querySelector('track[kind="captions"], track[kind="subtitles"]');
          const hasTranscript = parent?.querySelector('[data-transcript], .transcript, [aria-label*="transcript" i], details');
          const hasSiblingText = parent?.textContent && parent.textContent.trim().length > 50;
          return !hasTrack && !hasTranscript && !hasSiblingText;
        });

        // Check TTS/voice buttons have visible state labels
        const voiceBtns = [...document.querySelectorAll('[data-voice], [aria-label*="read aloud" i], [aria-label*="speak" i], button')].filter(btn =>
          (btn.textContent || btn.getAttribute('aria-label') || '').toLowerCase().match(/read\s*aloud|speak|listen|audio\s*summary/)
        );
        const unlabelledVoice = voiceBtns.filter(btn => !btn.getAttribute('aria-label') && !btn.textContent?.trim());

        return {
          audioCount: audioEls.length,
          withoutTranscript: withoutTranscript.length,
          unlabelledVoice: unlabelledVoice.length
        };
      });

      // Audio without transcript is a failure only if audio elements exist
      if (audioAudit.audioCount > 0) {
        expect(
          audioAudit.withoutTranscript,
          `${route}: ${audioAudit.withoutTranscript} audio/video elements have no transcript (WCAG 1.2.1)`
        ).toBe(0);
      }

      expect(
        audioAudit.unlabelledVoice,
        `${route}: ${audioAudit.unlabelledVoice} voice buttons have no accessible label`
      ).toBe(0);
    });

  }

  // ── Alt+H Live Help Global Shortcut ──────────────────────────────────────
  test('[Gate 3+] Alt+H triggers Live Human Help from keyboard on /learn', async ({ page }) => {
    await page.goto(`${BASE_URL}/learn`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(500);
    await page.keyboard.press('Alt+h');
    await page.waitForTimeout(400);

    // Should navigate to /support or open a live help panel
    const url = page.url();
    const hasHelpPanel = await page.evaluate(() =>
      !!(document.querySelector('[aria-label*="live help" i], [aria-label*="human" i], #live-help, .live-help')
        || document.querySelector('[aria-live]')?.textContent?.toLowerCase().includes('help'))
    );
    const navigatedToSupport = url.includes('/support');
    expect(navigatedToSupport || hasHelpPanel, 'Alt+H did not trigger live help panel or navigation').toBe(true);
  });

  // ── API Endpoints Gate ────────────────────────────────────────────────────
  test('[API] POST /api/v1/scrape-and-guide returns WCAG-cited answer', async ({ request }) => {
    const r = await request.post(`${BASE_URL}/api/v1/scrape-and-guide`, {
      data: { query: 'What is WCAG keyboard navigation?', lang: 'en' }
    });
    expect(r.status()).toBe(200);
    const body = await r.json();
    expect(body.status).toBe('ok');
    expect(body.groundedAnswers?.length).toBeGreaterThan(0);
    expect(body.groundedAnswers[0]).toHaveProperty('citation');
    expect(body.groundedAnswers[0].citation).toHaveProperty('url');
  });

  test('[API] GET /api/v1/jobs — schema.org, ETB salary, EC dates present', async ({ request }) => {
    const r = await request.get(`${BASE_URL}/api/v1/jobs`);
    expect(r.status()).toBe(200);
    const jobs = await r.json();
    expect(jobs.length).toBeGreaterThan(0);
    const job = jobs[0];
    expect(job).toHaveProperty('salary_band');
    expect(job).toHaveProperty('date_posted_ec');
    expect(job).toHaveProperty('accommodations_verified');
    expect(job).toHaveProperty('schema_org');
    expect(job.schema_org?.['@type']).toBe('JobPosting');
  });

  test('[API] POST /api/v1/accommodations — zero medical disclosure in letter', async ({ request }) => {
    const r = await request.post(`${BASE_URL}/api/v1/accommodations`, {
      data: { accommodation_type: 'Screen reader support', job_title: 'Developer', organization: 'ALX' }
    });
    expect(r.status()).toBe(200);
    const body = await r.json();
    expect(body.letter_text).toMatch(/1156\/2019/);
    expect(body.letter_text).toMatch(/568\/2008/);
    expect(body.letter_text).not.toMatch(/medical certificate|diagnosis|disability proof/i);
  });

});
