# BridgeMate — ALX Ethiopia Digital Bridge Hackathon, Track 3

> **Multilingual Assistant, Platform Scraper & Accessible Career Gateway**  
> WCAG 2.2 Level AA · Zero paid-API lock-in · `docker compose up` to start

---

## 1. Project Overview

BridgeMate is a fully accessible, multilingual digital assistant that helps Ethiopian learners navigate ALX Savanna course content, find tech jobs with accommodation support, and connect with human tutors — all via a lightweight Shadow DOM Web Component (`<db-assistant>`).

**Languages**: አማርኛ · ትግርኛ · Afaan Oromoo · Soomaali · العربية · English  
**Legal basis**: Ethiopian Proclamation No. 1156/2019 Art. 29 · Proclamation No. 568/2008  
**Hackathon**: ALX Ethiopia Digital Bridge Accessibility Hackathon — Track 3

---

## 2. Architecture — "One Core, Three Doors"

```
┌─────────────────────────────────────────────────────────┐
│  PORT 8080 (nginx)  │  PORT 3000 (Express API)          │
├─────────────────────┼─────────────────────────────────────
│  /savanna/          │  POST /api/v1/ask                  │
│  /module/           │  POST /api/v1/content              │
│  /demo/             │  POST /api/v1/escalations          │
│  /data/             │  POST /sms/inbound (≤160 chars)    │
│                     │  GET  /api/v1/jobs                 │
│                     │  POST /api/v1/webhooks             │
│                     │  GET  /docs (Swagger UI)           │
└─────────────────────┴─────────────────────────────────────

AI Provider chain (AI_PROVIDER env):
  none  → BM25 offline (default, zero API, works on 2G)
  local → Ollama http://localhost:11434
  cloud → OpenAI / Gemini (optional key)

Scraper tier chain:
  crawl4ai → Jina Reader → @mozilla/readability → offline corpus
```

---

## 3. Quick Start

```bash
# 1. Clone
git clone https://github.com/alx-africa/bridgemate track3 && cd track3

# 2. Configure (optional — defaults work offline)
cp .env.example .env

# 3. Start everything
docker compose up

# 4. Open
open http://localhost:8080/demo/blank.html   # Level 1 demo
open http://localhost:8080/demo/helper.html  # Human queue dashboard
open http://localhost:8080/savanna/pages/jobs.html  # Career gateway
open http://localhost:3000/docs             # Swagger API docs
```

---

## 4. Repository Layout

```
./
├── README.md
├── docker-compose.yml        # docker compose up → web:8080 + api:3000
├── nginx.conf                # Reverse proxy config
├── CONFORMANCE.md            # WCAG 2.2 AA honest audit table
├── openapi.yaml              # OpenAPI 3.0 spec (at repo root)
├── .env.example              # AI_PROVIDER=none|local|cloud
│
├── module/
│   ├── db-assistant.js       # <db-assistant> Shadow DOM Web Component (<500KB)
│   └── i18n/                 # Zero hardcoded UI strings
│       ├── en.json  am.json  ti.json  om.json  so.json  ar.json
│
├── api/
│   ├── server.js             # Express API + Swagger UI
│   ├── scraper.js            # 4-tier scraper
│   ├── telegram-bot.js       # Long-poll Telegram bot
│   ├── Dockerfile
│   ├── package.json
│   └── providers/
│       ├── none.js           # BM25 offline (default)
│       ├── local.js          # Ollama adapter
│       └── cloud.js          # OpenAI / Gemini adapter
│
├── savanna/                  # Cloned ALX Savanna (NEVER edit its CSS/JS)
│   └── pages/
│       ├── concept-with-navigation.html
│       ├── homepage-v1-paced.html
│       ├── homepage-v1-self-paced.html
│       └── jobs.html         # NEW: accessible job board
│
├── demo/
│   ├── blank.html            # Zero-dependency portability proof
│   └── helper.html           # Human tutor queue dashboard
│
├── data/
│   ├── content.json          # Savanna section extracts for RAG
│   └── jobs.json             # 6 Ethiopian tech jobs (schema.org/JobPosting)
│
└── tests/
    └── pass-fail-gate.spec.js  # Playwright + axe-core WCAG 2.2 AA suite
```

---

## 5. The Web Component (`<db-assistant>`)

```html
<!-- One script tag, one custom element — works on ANY website -->
<script src="/module/db-assistant.js" defer></script>
<db-assistant
  lang="am"
  api="http://localhost:3000/api"
  content="/data/content.json"
  theme="light">
</db-assistant>
```

**Attributes**: `lang` · `api` · `content` · `theme`  
**Events dispatched**: `db-assistant:question` · `db-assistant:escalated`  
**Bundle size**: < 80KB (zero external dependencies)  
**Offline**: BM25 search + localStorage queue

---

## 6. API Quick Reference

### Ask a question (AI_PROVIDER=none → BM25 offline)
```bash
curl -X POST http://localhost:3000/api/v1/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"What skills do VA clients value?","language":"am"}'
```
Response: `{"answer":"...","sources":[{"title":"...","url":"..."}],"provider":"none","language":"am"}`

### Index a new URL
```bash
curl -X POST http://localhost:3000/api/v1/content \
  -H "Content-Type: application/json" \
  -d '{"url":"https://alxafrica.com/courses/virtual-assistant"}'
```

### Create escalation ticket
```bash
curl -X POST http://localhost:3000/api/v1/escalations \
  -H "Content-Type: application/json" \
  -d '{"conversation":[{"role":"user","content":"I need help"}],"language":"am"}'
```
Response: `{"ticketId":"BM-M4G7K2","status":"open"}`

### SMS (≤160 chars plain text)
```bash
curl -X POST http://localhost:3000/sms/inbound \
  -H "Content-Type: application/json" \
  -d '{"from":"+251912345678","text":"WCAG keyboard?"}'
```
Response: `WCAG 2.2 requires all pages to be fully keyboard-accessible...` (≤160 chars)

### Register webhook
```bash
curl -X POST http://localhost:3000/api/v1/webhooks \
  -H "Content-Type: application/json" \
  -d '{"url":"https://myapp.example.com/hooks/bridgemate"}'
```

### Browse jobs
```bash
curl http://localhost:3000/api/v1/jobs
```
Response: JSON-LD `schema.org/ItemList` of `JobPosting` objects with ETB salary and Ethiopian calendar dates.

---

## 7. Accessibility (WCAG 2.2 Level AA)

| Criterion | Implementation |
|-----------|----------------|
| 1.1.1 Non-text | All icons have `aria-label`; images have alt text |
| 1.3.1 Info & Relationships | Semantic HTML5, ARIA roles |
| 1.4.3 Contrast | #f5a300 on #000 (8.59:1); #1a1a1a on #fff (16:1) |
| 1.4.4 Resize Text | Reflows at 200% zoom, no horizontal scroll |
| 1.4.10 Reflow | 320px viewport: single column, no overflow |
| 2.1.1 Keyboard | Tab, Enter, Escape, Arrow keys — 100% operable |
| 2.4.3 Focus Order | Logical DOM order; shadow DOM focus trap |
| 2.4.7 Focus Visible | `3px solid #f5a300` on all focused elements |
| 2.4.11 Focus Not Obscured | `scroll-margin-top: 72px` on all sections |
| 2.5.3 Label in Name | Button labels match visible text |
| 2.5.8 Target Size | 44×44px minimum on all interactive elements |
| 3.1.1 Language | `lang="am"` / `lang="ti"` etc. set dynamically |
| 4.1.2 Name, Role, Value | Full ARIA on dialog, log, tabs, live regions |

---

## 8. 3G Performance Metrics

| Asset | Size | 3G Load Time |
|-------|------|-------------|
| `module/db-assistant.js` | ~78 KB | ~1.4s |
| `data/content.json` | ~3 KB | ~0.1s |
| `data/jobs.json` | ~6 KB | ~0.1s |
| `demo/blank.html` | ~12 KB | ~0.2s |
| **Total (blank.html)** | **~99 KB** | **~1.8s** |

> At Slow 3G (750 kbps), `demo/blank.html` loads and is interactive in under 3 seconds.  
> Offline BM25 search responds in < 20ms after initial load.

---

## 9. Telegram Bot Commands

| Command | Description |
|---------|-------------|
| `/ask [question]` | Ask anything about ALX, careers, accessibility |
| `/jobs` | Browse latest Ethiopian tech jobs |
| `/scrape [url]` | Extract and summarize any webpage |
| `/livehelp` | Request a human support agent |
| `/lang [am\|en\|ti\|om\|so\|ar]` | Set response language |
| `/alerts` | Subscribe to new job alert notifications |
| `/help` | Show all commands |

Set `TELEGRAM_BOT_TOKEN` in `.env` to activate.

---

## 10. AI Provider Configuration

```bash
# Zero API keys needed (default)
AI_PROVIDER=none

# Use local Ollama (docker compose --profile full up)
AI_PROVIDER=local
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3

# Use cloud LLM (optional)
AI_PROVIDER=cloud
OPENAI_API_KEY=sk-...
# or
GEMINI_API_KEY=...
```

The provider chain always falls back gracefully:  
`cloud → local → BM25 offline` (zero failure modes)

---

## 11. Running Tests

```bash
# Install test deps
npm install -D @playwright/test @axe-core/playwright --legacy-peer-deps
npx playwright install chromium

# Start services first
docker compose up -d

# Run accessibility gate suite
BASE_URL=http://localhost:8080 npx playwright test tests/pass-fail-gate.spec.js

# API smoke tests (no browser needed)
Invoke-WebRequest -Uri "http://localhost:3000/health" | Select-Object Content
Invoke-WebRequest -Uri "http://localhost:3000/api/v1/ask" -Method POST -ContentType "application/json" -Body '{"question":"WCAG?","language":"en"}' | Select-Object Content
```

---

## 12. Legal & Compliance

| Requirement | Status |
|-------------|--------|
| WCAG 2.2 Level AA | ✅ Targeted (axe-core: 0 critical, 0 serious) |
| Ethiopian Proclamation No. 1156/2019 | ✅ Art. 29 cited in accommodation letters |
| Ethiopian Proclamation No. 568/2008 | ✅ Cited in accommodation letters |
| No medical disclosure required | ✅ Explicitly enforced by API |
| Zero PII in teacher insights | ✅ Only anonymized question counts |
| No paid-API lock-in | ✅ BM25 offline works without any API keys |
| Open source | ✅ MIT License |

---

**Team**: ALX Ethiopia Digital Bridge Hackathon Team — Track 3  
**Deadline**: Sunday 16:30 EAT  
**License**: MIT
