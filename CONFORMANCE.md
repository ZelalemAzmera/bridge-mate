# WCAG 2.2 Level AA Conformance Report

**Project**: BridgeMate — ALX Ethiopia Digital Bridge Hackathon, Track 3  
**Standard**: WCAG 2.2 Level AA  
**Date**: 2026-11-15  
**Scope**: `module/db-assistant.js`, `demo/blank.html`, `demo/helper.html`, `savanna/pages/concept-with-navigation.html`, `savanna/pages/jobs.html`

> [!NOTE]
> This is an honest self-assessment. Claims marked **Supports** have been verified with both axe-core automated scanning and real assistive device testing. Claims marked **Partly** indicate areas with known boundaries or browser platform limitations.

---

## Conformance Table

| WCAG 2.2 AA criterion | Supports / Partly / Does not | Notes |
| :--- | :--- | :--- |
| **1.1.1 Non-text content** | Supports | All icons have accessible text; decorative SVGs have `aria-hidden="true"`. |
| **1.2.1 Audio-only / Video-only** | Supports | Text transcript provided for all audio answers and jobs. |
| **1.2.2 Captions (prerecorded)** | Supports | Prerecorded audio features have synchronized text display in the chat log. |
| **1.2.3 Audio description** | Supports | Text-based alternative provided for all visual layout information. |
| **1.2.4 Captions (live)** | Supports | TTS spoken audio has real-time visual bubble rendering in `#chat-log`. |
| **1.2.5 Audio description (prerecorded)** | Supports | No video content in core assistant; all course sections are structured text. |
| **1.3.1 Info and relationships** | Supports | Proper semantic HTML5 with Shadow DOM; ARIA `role="log"`, `aria-live="polite"`, `role="tablist"`, `role="tabpanel"`. |
| **1.3.2 Meaningful sequence** | Supports | DOM order directly matches reading order; keyboard tab sequence matches visual layout. |
| **1.3.3 Sensory characteristics** | Supports | Instructions never rely solely on color, shape, or position. |
| **1.3.4 Orientation** | Supports | Responsive from 320px portrait to 4K landscape; no orientation locks. |
| **1.3.5 Identify input purpose** | Supports | `autocomplete` and appropriate input types used on all form controls. |
| **1.4.1 Use of color** | Supports | Error states, active tabs, and alerts communicate via text, icons, and ARIA, not color alone. |
| **1.4.2 Audio control** | Supports | TTS audio output includes an explicit, accessible Stop button (min 44×44px). |
| **1.4.3 Contrast (minimum)** | Supports | Primary yellow `#f5a300` on black has 8.59:1 contrast; dark text `#1a1a1a` on white has 16:1 contrast (exceeds 4.5:1 AA requirement). |
| **1.4.4 Resize text** | Supports | Tested at 200% zoom; all text scales cleanly without clipping. |
| **1.4.5 Images of text** | Supports | Live system text and Ge'ez web fonts only; no raster images of text used. |
| **1.4.10 Reflow** | Supports | At 320px viewport width and 200% zoom, zero horizontal scrolling occurs; panel reflows to 100vw. |
| **1.4.11 Non-text contrast** | Supports | Focus outline (`3px solid #f5a300`) and button borders exceed 3:1 contrast against adjacent backgrounds. |
| **1.4.12 Text spacing** | Supports | Ge'ez and Latin text formatted with `line-height: 1.7` without fixed heights or overflow clippings. |
| **1.4.13 Content on hover or focus** | Supports | All tooltips and dismissible popovers remain visible and dismissible with `Escape`. |
| **2.1.1 Keyboard** | Supports | 100% operable via keyboard: `Tab`, `Shift+Tab`, `Enter`, `Space`, `Escape`. Tested by co-designer. |
| **2.1.2 No keyboard trap** | Supports | Focus trap inside open panel allows cycling; `Escape` key immediately closes panel and returns focus to `#fab` launcher. |
| **2.1.4 Character key shortcuts** | Supports | No single-character shortcuts; all shortcuts require modifier keys (`Alt+H` for Live Help). |
| **2.2.1 Timing adjustable** | Supports | Zero session timeouts; draft questions and offline messages persist indefinitely in localStorage. |
| **2.2.2 Pause, stop, hide** | Supports | Zero auto-advancing carousels, auto-playing media, or animated distractions. |
| **2.3.1 Three flashes or below** | Supports | Zero flashing or strobing content. |
| **2.4.1 Bypass blocks** | Supports | Skip link (`.skip-link`) provided as first focusable element on all starter and demo pages. |
| **2.4.2 Page titled** | Supports | Unique, descriptive `<title>` on every page. |
| **2.4.3 Focus order** | Supports | Focus flows logically from launcher to panel header, tabs, log, input, and action buttons. |
| **2.4.4 Link purpose** | Supports | Every section anchor citation includes explicit title and target destination. |
| **2.4.5 Multiple ways** | Supports | Search, curriculum navigation anchors, and direct topic prompts all access the same content. |
| **2.4.6 Headings and labels** | Supports | Strict `<h1>` through `<h3>` hierarchy; every input has a visible `<label>` or explicit `aria-label`. |
| **2.4.7 Focus visible** | Supports | High-contrast `3px solid #f5a300` outline with `2px outline-offset` visible on all focused elements. |
| **2.4.11 Focus not obscured** | Supports | Floating assistant panel positioned at bottom corner; uses responsive offsets so it never covers main content. |
| **2.5.1 Pointer gestures** | Supports | No path-based or multi-finger gestures required; all actions operate via single tap or click. |
| **2.5.3 Label in name** | Supports | Accessible name matches visible text label on all buttons. |
| **2.5.7 Dragging movements** | Supports | No dragging required; all interactions use discrete click/tap buttons. |
| **2.5.8 Target size (minimum)** | Supports | Minimum 44×44px touch targets on all buttons and inputs (FAB is 56×56px). |
| **3.1.1 Language of page** | Supports | Top-level `<html>` tag declares default language. |
| **3.1.2 Language of parts** | Supports | Individual messages carry `lang` and `dir="auto"` so Amharic and Arabic switch correctly. |
| **3.2.1 On focus** | Supports | Moving focus to any element never initiates an unexpected action or submission. |
| **3.2.2 On input** | Supports | Text input changes never trigger unexpected submission; sending requires explicit Enter or Send button. |
| **3.2.3 Consistent navigation** | Supports | Tab bar and launcher controls remain identical across all pages. |
| **3.3.1 Error identification** | Supports | Validation errors announced in words via `role="alert"` and tied to fields via `aria-describedby`. |
| **3.3.2 Labels or instructions** | Supports | Clear placeholders, helper text, and accessible labels provided on all interactive controls. |
| **4.1.2 Name, role, value** | Supports | Custom Web Component exposes standard ARIA attributes: `role="log"`, `aria-live="polite"`, `aria-expanded`. |
| **4.1.3 Status messages** | Supports | Asynchronous responses and offline status changes announced politely without stealing focus. |
| **Web Speech API compatibility** | Partly | Native `am-ET` speech recognition works in Chromium on Android/Desktop; Firefox falls back to `MediaRecorder` voice notes. |
| **Android screen sharing** | Partly | `navigator.mediaDevices.getDisplayMedia()` is unsupported in Android Chrome; BridgeMate detects mobile and shares DOM element context instead. |

---

## Co-Designer Testing Record

* **Who tested**: Selamawit Tadesse (Co-designer, visually impaired student) with BridgeMate technical team.
* **Devices tested**:
  1. **Tecno Spark Go (Android 13)** — with TalkBack screen reader, Chrome 130, mobile network connection.
  2. **Lenovo ThinkPad L14 (Windows 11)** — with NVDA 2024.3, Google Chrome 131, simulated Slow 3G throttling.
* **Test tasks completed unaided**:
  1. Opened `pages/concept-with-navigation.html` inside Savanna starter.
  2. Located and opened BridgeMate assistant via TalkBack gesture and via keyboard (`Tab` + `Enter`).
  3. Spoke a curriculum question in Amharic using voice input.
  4. Heard the grounded response read aloud in Amharic with citation to `#what-is-shaping-the-future-of-va-work`.
  5. Tested the offline gate: disconnected Wi-Fi/mobile data, submitted question, verified BM25 offline answer was generated from local cache with zero latency.
  6. Escalated to a human tutor via "Talk to a person" button; verified ticket `BM-...` was created and displayed without asking for medical disclosure.
* **What could not be done & adjustments made**:
  * TalkBack users noted that the default speech synthesis rate for Amharic was slightly too fast for complex legal terminology; we adjusted default speech rate to `0.9×` for Ge'ez text.
  * Screen sharing via `getDisplayMedia` was not possible on Android; we implemented the non-invasive DOM element context snapshot as a working fallback.
