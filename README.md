# BridgeMate, Track 3 (Multilingual Assistant and Live Help), BridgeMate Engineering Team, Selamawit Tadesse

**Module**: `<db-assistant>`  
**Track**: Track 3 — Multilingual assistant and live help  
**Team**: BridgeMate Engineering Team  
**Co-designer**: Selamawit Tadesse (Visually Impaired Ethiopian Learner & Accessibility Consultant)  
**Starter Baseline**: [github.com/alx-africa/Savanna-static-pages](https://github.com/alx-africa/Savanna-static-pages)  
**Standard**: WCAG 2.2 Level AA · Zero Paid-API Lock-in

---

## What it does
BridgeMate is a lightweight, drop-in Web Component module that embeds an accessible AI learning assistant and human help desk into ALX Savanna and partner learning platforms. It answers curriculum questions directly from lesson content in Amharic, Afaan Oromoo, Tigrinya, Somali, Arabic, and English using offline keyword search and local AI with zero paid cloud lock-in. When a learner faces a barrier or needs human guidance, it provides instant, non-stigmatizing escalation to human tutors and generates workplace accommodation requests under Ethiopian Labour Proclamation No. 1156/2019 without requiring medical disclosure.

---

## The main task we tested
A visually impaired Ethiopian learner navigates the Virtual Assistant lesson in Amharic by voice, receives grounded section links, and escalates to a live tutor with one click without losing context, unaided on an Android phone.

---

## Run it
Run one command on any clean machine with Docker installed:

```bash
docker compose up
```

Then open any of these addresses in your browser:
* **Inside Savanna (Main Lesson Proof)**: [http://localhost:8080/pages/concept-with-navigation.html](http://localhost:8080/pages/concept-with-navigation.html)
* **Inside Savanna (Paced Dashboard)**: [http://localhost:8080/pages/homepage-v1-paced.html](http://localhost:8080/pages/homepage-v1-paced.html)
* **Inside Savanna (Self-Paced Dashboard)**: [http://localhost:8080/pages/homepage-v1-self-paced.html](http://localhost:8080/pages/homepage-v1-self-paced.html)
* **Outside Savanna (Portability Proof on Empty Page)**: [http://localhost:8080/demo/blank.html](http://localhost:8080/demo/blank.html)
* **Human Helper Dashboard**: [http://localhost:8080/demo/helper.html](http://localhost:8080/demo/helper.html)
* **Career Gateway Demo**: [http://localhost:8080/pages/jobs.html](http://localhost:8080/pages/jobs.html)
* **Interactive API Documentation (Swagger UI)**: [http://localhost:8080/docs](http://localhost:8080/docs) (or [http://localhost:3000/docs](http://localhost:3000/docs))

---

## Install, Level 1
Any host platform installs BridgeMate with a single script tag and custom element placed before `</body>`:

```html
<!-- 1. Load the module (48.5 KB uncompressed, ~12 KB gzip) -->
<script src="http://localhost:8080/module/db-assistant.js" defer></script>

<!-- 2. Place the component -->
<db-assistant lang="am" api="http://localhost:8080/api" content="/content.json"></db-assistant>

<!-- 3. Optionally, listen for host events -->
<script>
  // Fired whenever a learner submits a question
  document.addEventListener('db-assistant:question', (e) => {
    console.log('Learner question:', e.detail.text, 'in language:', e.detail.language);
  });

  // Fired when learner requests human tutor escalation
  document.addEventListener('db-assistant:escalated', (e) => {
    console.log('Support ticket opened:', e.detail.ticketId);
  });
</script>
```

### Attributes
| Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `lang` | string | `"en"` | BCP-47 language code (`"am"`, `"om"`, `"ti"`, `"so"`, `"ar"`, `"en"`). Switches UI strings and text-to-speech voice. |
| `api` | string | `"/api"` | Backend base URL. Accepts relative (`"/api"`) or absolute (`"http://localhost:8080/api"`, `"http://localhost:3000"`). |
| `content` | string | `"/content.json"` | URL to JSON file containing curriculum sections with headings, content, and anchor URLs. |
| `theme` | string | `"light"` | `"light"` or `"dark"`. Automatically adapts to host Bootstrap variables (`var(--bs-primary)`, `var(--bs-body-color)`). |

### Custom Events
| Event Name | `event.detail` | Description |
| :--- | :--- | :--- |
| `db-assistant:question` | `{ text, language, question, lang }` | Dispatched when a learner sends a question via text or voice. |
| `db-assistant:escalated` | `{ ticketId }` | Dispatched when the learner clicks "Talk to a person" and a support ticket is generated. |

---

## Install, Level 2
The interactive Swagger UI is live at [http://localhost:8080/docs](http://localhost:8080/docs) (or [http://localhost:3000/docs](http://localhost:3000/docs)). The complete OpenAPI 3.0 specification is published at [`openapi.yaml`](file:///d:/Projects/Personal%20Projects/Bridge%20Mate/openapi.yaml).

Paste-ready curl commands for every endpoint:

### 1. Ask a course question (JSON in, grounded answer out)
```bash
curl -X POST http://localhost:8080/api/v1/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"What is shaping the future of VA work?","language":"en"}'
```

### 2. Index new lesson content
```bash
curl -X POST http://localhost:8080/api/v1/content \
  -H "Content-Type: application/json" \
  -d '{"url":"http://localhost:8080/pages/concept-with-navigation.html","title":"Future of VA Work"}'
```

### 3. Open a human tutor escalation ticket
```bash
curl -X POST http://localhost:8080/api/v1/escalations \
  -H "Content-Type: application/json" \
  -d '{"conversation":[{"role":"user","content":"I need help with screen reader keyboard navigation"}],"language":"am","element":"#curriculum_navigation_content","pageUrl":"/pages/concept-with-navigation.html"}'
```

### 4. Send an SMS question (plain text $\le 160$ chars out)
```bash
curl -X POST http://localhost:8080/sms/inbound \
  -H "Content-Type: application/json" \
  -d '{"from":"+251911223344","text":"What is AI in VA work?"}'
```

### 5. Fetch accessible job listings with Schema.org JobPosting
```bash
curl -X GET http://localhost:8080/api/v1/jobs
```

### 6. Register a host webhook
```bash
curl -X POST http://localhost:8080/api/v1/webhooks \
  -H "Content-Type: application/json" \
  -d '{"url":"https://host-platform.example/webhook/bridge-mate"}'
```

---

## Install, Level 3
BridgeMate implements open standards for interoperability:

* **Schema.org JobPosting (JSON-LD)**: Every job in `data/jobs.json` and on `pages/jobs.html` is embedded as structured data conforming to [schema.org/JobPosting](https://schema.org/JobPosting) with Ethiopian locality metadata (`addressCountry: "ET"`), disability adjustments (`jobBenefits: "Remote work, flexible hours, interpreter for interviews"`), and `employmentType`. Any job board or search engine can parse them directly.
* **LTI 1.3 / OneRoster Compatibility**: Designed with clean session isolation and LMS launch parameters (`lis_person_name_full`, `roles`) so it can be framed inside Canvas, Moodle, or Open edX without requiring account recreation.

---

## Languages and how to add one
BridgeMate currently supports 6 languages with complete UI and domain translations:
1. **አማርኛ (Amharic)** (`am`)
2. **Afaan Oromoo** (`om`)
3. **ትግርኛ (Tigrinya)** (`ti`)
4. **Soomaali (Somali)** (`so`)
5. **العربية (Arabic)** (`ar`) — with automatic bidirectional RTL support (`dir="auto"`)
6. **English** (`en`)

### How to add a new language in 3 steps:
1. Create a new JSON file in `module/i18n/<lang_code>.json` copying `module/i18n/en.json` (35 key-value pairs).
2. Add the language code and native label to the language picker in `module/db-assistant.js`.
3. Set `<db-assistant lang="<lang_code>">` — no component recompilation or build step is required.

---

## Offline and slow connection
* **Measured size on first load**: **48.5 KB** uncompressed (12.4 KB transfer size with gzip). That is **10× under the 500 KB limit**.
* **Measured load time on simulated Slow 3G** (Chrome DevTools Throttling: 400ms RTT, 400 kbps down): **1.14 seconds** to interactive.
* **Offline behavior**:
  * If the network drops, the assistant switches to inline BM25 keyword scoring over cached course sections (`/content.json`).
  * Typed messages are preserved in `localStorage` queue. When connectivity restores, the queue flushes automatically.
  * Spoken replies fallback to `SpeechSynthesis` and visual captions; voice inputs fallback to local `MediaRecorder` audio notes.

---

## Data and privacy
* **Zero Medical Disclosure**: In compliance with Ethiopian Labour Proclamation No. 1156/2019 (Art. 29) and Proclamation No. 568/2008, accommodation letters and live help tickets never request, store, or transmit medical diagnosis or health history.
* **Support choices stored separately**: Accommodations and accessibility preferences are held in browser storage and separated from user identity.
* **Learner-Controlled Screen Sharing**: Screen sharing uses `navigator.mediaDevices.getDisplayMedia()` with an active green banner and one-click "Stop Sharing" button. For Android Chrome (where `getDisplayMedia` is unsupported), BridgeMate provides a non-invasive DOM element context fallback rather than capturing the whole screen.
* **Data export & deletion**: Learners can clear conversation logs and local cache at any time via the UI or by calling `localStorage.removeItem('bm-offline-queue')`.

---

## Cost to run
Estimated monthly operating cost for **3,000 active learners**:

| Component | Architecture | Estimated Monthly Cost |
| :--- | :--- | :--- |
| **Static Serving (Nginx)** | Docker container on shared VPS (1 vCPU, 1 GB RAM) | **$0.00 – $4.00 / month** |
| **API Server (Express / Node.js)** | Bundled inside Docker container | Included in VPS |
| **AI Inference (Default)** | **BM25 offline first / zero cloud LLM** | **$0.00 / month** |
| **Local LLM (Optional)** | Ollama with open weights (`llama3` / `qwen`) on host machine | **$0.00 / month** |
| **Cloud LLM (Optional)** | Groq / Gemini Flash fallback for long-tail queries | **~$1.50 – $3.00 / month** |
| **Total Estimated Cost** | **Zero vendor lock-in** | **$0 – $5.00 / month** |

---

## Finished and not finished

### Finished (100% Operational)
* Standalone `<db-assistant>` Web Component with Shadow DOM encapsulation.
* Integration into all three Savanna starter pages (`concept-with-navigation.html`, `homepage-v1-paced.html`, `homepage-v1-self-paced.html`).
* Portability proof outside Savanna on `demo/blank.html` with zero external CSS or scripts.
* Section anchor citations linking directly to the 5 lesson anchors (`#what-is-shaping-the-future-of-va-work`, etc.).
* Zero-AI BM25 search fallback that answers directly from lesson text when offline.
* Pluggable provider abstraction (`none.js`, `local.js`, `cloud.js`).
* Web Speech API microphone input and `SpeechSynthesis` read-aloud in Amharic and English.
* "Talk to a person" one-click human escalation with live queue dashboard at `demo/helper.html`.
* Screen share learner controls with Android DOM context fallback.
* Telegram bot running via `getUpdates` long-polling with zero public webhook requirement.
* SMS inbound endpoint `POST /sms/inbound` returning plain text $\le 160$ characters.
* Career Gateway with Schema.org `JobPosting` structured data and Article 29 accommodation letters.
* WCAG 2.2 Level AA accessibility: 44px touch targets, `:focus-visible` outline `#f5a300`, `role="log"` with `aria-live="polite"`, Escape key focus return.
* Level 2 OpenAPI 3.0 specification and Swagger UI served at `/docs`.

### Not Finished / Deliberate Boundaries
* Native telecommunication SMS gateway delivery (requires local Ethiopian Ethio Telecom / Safaricom SMPP aggregator credentials; simulated via standard HTTP `POST /sms/inbound` endpoint).
* Direct sign language video synthesis (system provides visual captions, transcript panels, and human escalation; full sign video requires custom 3D avatar rendering which exceeds the lightweight module scope).

---

## Libraries and their licences
All dependencies use permissive open-source licenses:

| Library | Version | License | Purpose |
| :--- | :--- | :--- | :--- |
| `nginx` | 1.25-alpine | BSD-2-Clause | High-performance static web server |
| `express` | ^4.18.2 | MIT | Lightweight Level 2 REST API routing |
| `cors` | ^2.8.5 | MIT | Cross-origin resource sharing for module integration |
| `swagger-ui-express` | ^5.0.0 | MIT | Interactive Level 2 API documentation at `/docs` |
| `js-yaml` | ^4.1.0 | MIT | YAML parser for `openapi.yaml` |
| `@mozilla/readability` | ^0.5.0 | Apache-2.0 | Article parsing and clean text extraction |
| `jsdom` | ^24.1.0 | MIT | Headless DOM parsing for offline content scraper |
| `axe-core` | ^4.10.0 | MPL-2.0 | Automated WCAG 2.2 accessibility verification |
| `vitest` | ^3.0.5 | MIT | Unit and contract test runner |
