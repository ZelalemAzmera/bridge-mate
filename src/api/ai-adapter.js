/**
 * BridgeMate — Pluggable AI Adapter
 * Zero paid-API lock-in. Supports:
 *  1. Local Ollama  (http://localhost:11434) — free, runs on CPU
 *  2. Cloud LLM     (optional env key: OPENAI_API_KEY / GOOGLE_AI_API_KEY)
 *  3. Offline BM25  (deterministic citation matching, no AI required)
 *
 * Jina-reader insight: their LLM manager (src/services/lm.ts) uses an
 * adapter pattern where the same interface works across local/cloud models.
 * We replicate that pattern here in plain Node.js.
 *
 * Usage:
 *   const ai = require('./ai-adapter');
 *   const answer = await ai.answer({ question, context, lang, simpleMode });
 */

'use strict';

// ── BM25 Offline Search (ChromaDB-equivalent in pure JS) ─────────────────────
// Inspired by chroma-core/chroma's BM25 retrieval approach but zero-dependency.
// BM25 formula: score(D,Q) = Σ IDF(qi) * (f(qi,D)*(k1+1)) / (f(qi,D)+k1*(1-b+b*|D|/avgdl))

class BM25Index {
  constructor({ k1 = 1.5, b = 0.75 } = {}) {
    this.k1 = k1;
    this.b = b;
    this.docs = [];        // { id, text, metadata }
    this.tf = [];          // term frequencies per doc
    this.df = new Map();   // document frequency per term
    this.avgdl = 0;
  }

  /** Tokenise text into lowercase word tokens (no external dependencies) */
  _tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s\u1200-\u137f\u0600-\u06ff]/g, ' ') // keep Ethiopic + Arabic chars
      .split(/\s+/)
      .filter(t => t.length > 1);
  }

  /** Add a document to the index */
  add(id, text, metadata = {}) {
    const tokens = this._tokenize(text);
    const freq = new Map();
    for (const t of tokens) freq.set(t, (freq.get(t) || 0) + 1);

    this.docs.push({ id, text, metadata, len: tokens.length });
    this.tf.push(freq);

    for (const term of freq.keys()) {
      this.df.set(term, (this.df.get(term) || 0) + 1);
    }

    // Recompute avgdl
    const totalLen = this.docs.reduce((s, d) => s + d.len, 0);
    this.avgdl = totalLen / this.docs.length;
  }

  /** Query the index, returns top-k docs sorted by BM25 score */
  query(queryText, k = 5) {
    if (!this.docs.length) return [];
    const qTokens = this._tokenize(queryText);
    const N = this.docs.length;
    const scores = this.docs.map((doc, i) => {
      let score = 0;
      for (const term of qTokens) {
        const df = this.df.get(term) || 0;
        if (!df) continue;
        const idf = Math.log((N - df + 0.5) / (df + 0.5) + 1);
        const f = this.tf[i].get(term) || 0;
        const tf = (f * (this.k1 + 1)) / (f + this.k1 * (1 - this.b + this.b * doc.len / this.avgdl));
        score += idf * tf;
      }
      return { ...doc, score };
    });

    return scores
      .filter(d => d.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
  }
}

// Global in-memory BM25 index (populated from OFFLINE_KNOWLEDGE_BASE at startup)
const globalIndex = new BM25Index();
let indexReady = false;

/**
 * Build BM25 index from the offline corpus.
 * Called once at module load — zero blocking cost (synchronous, tiny corpus).
 */
function buildOfflineIndex(knowledgeBase) {
  if (indexReady) return;
  for (const doc of knowledgeBase) {
    for (const section of doc.sections) {
      globalIndex.add(
        `${doc.id}::${section.heading}`,
        `${section.heading} ${section.content}`,
        { sourceTitle: doc.title, sourceUrl: doc.url, section: section.heading }
      );
    }
  }
  indexReady = true;
}

// ── Ollama Local LLM Adapter (ollama/ollama pattern) ─────────────────────────

/**
 * Call a local Ollama model for grounded answer generation.
 * Falls back gracefully if Ollama isn't running (3s timeout).
 *
 * @param {string} prompt
 * @param {string} model - e.g. 'llama3', 'mistral', 'phi3'
 * @returns {Promise<string|null>}
 */
async function callOllama(prompt, model = null) {
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  const ollamaModel = model || process.env.OLLAMA_MODEL || 'llama3';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModel,
        prompt,
        stream: false,
        options: { temperature: 0.1, num_predict: 300 }
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    return data.response?.trim() || null;
  } catch (_) {
    return null; // Ollama not running — fall through to offline BM25
  }
}

/**
 * Call cloud LLM (OpenAI-compatible API).
 * Only used if OPENAI_API_KEY or GOOGLE_AI_API_KEY is set in environment.
 *
 * @param {string} prompt
 * @returns {Promise<string|null>}
 */
async function callCloudLLM(prompt) {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.1
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (_) {
    return null;
  }
}

// ── Prompt Builder ────────────────────────────────────────────────────────────

function buildGroundedPrompt(question, contextChunks, lang = 'en') {
  const langInstructions = {
    en: 'Answer in English.',
    am: 'ምላሽዎን በአማርኛ ይስጡ። Answer in Amharic.',
    ti: 'ብትግርኛ መልሲ ሃቡ። Answer in Tigrinya.',
    om: 'Afaan Oromootti deebii kenni. Answer in Afaan Oromo.',
    so: 'Somaaliga ku jawaab. Answer in Somali.',
    ar: 'أجب باللغة العربية. Answer in Arabic.'
  };

  const context = contextChunks.map((c, i) =>
    `[Source ${i + 1}: ${c.metadata?.sourceTitle || 'ALX Course'}, "${c.metadata?.section || 'Main'}"]:\n${c.text}`
  ).join('\n\n');

  return `You are BridgeMate, an accessible learning assistant for Ethiopian learners.
${langInstructions[lang] || langInstructions.en}
Answer ONLY based on the provided sources below. Cite the source number. Keep answers under 100 words.
If the answer is not in the sources, say so and suggest the learner asks their tutor.
Zero medical disclosure: never ask for medical proof.

SOURCES:
${context}

QUESTION: ${question}

ANSWER:`;
}

// ── Main AI Answer Function ───────────────────────────────────────────────────

/**
 * Generate a grounded answer using the best available AI adapter.
 * Priority: Ollama local → Cloud LLM → Offline BM25 citation matching.
 *
 * @param {object} opts
 * @param {string} opts.question
 * @param {Array}  opts.contextChunks  - chunks from BM25/scraper with metadata
 * @param {string} [opts.lang]         - language code
 * @param {boolean} [opts.simpleMode]  - return 2-sentence plain version
 * @param {object} [opts.knowledgeBase] - offline corpus to build index from
 * @returns {Promise<{ answer: string, source: 'ollama'|'cloud'|'offline-bm25', citations: Array }>}
 */
async function generateAnswer({ question, contextChunks = [], lang = 'en', simpleMode = false, knowledgeBase = null }) {
  // Build BM25 index if knowledge base provided and not yet built
  if (knowledgeBase && !indexReady) {
    buildOfflineIndex(knowledgeBase);
  }

  // If no context chunks provided, run BM25 search over offline corpus
  let chunks = contextChunks;
  if (!chunks.length && indexReady) {
    const bm25Results = globalIndex.query(question, 3);
    chunks = bm25Results.map(r => ({
      text: r.text,
      score: r.score,
      metadata: r.metadata
    }));
  }

  if (!chunks.length) {
    return {
      answer: 'No relevant content found in the knowledge base. Please try rephrasing your question or ask your tutor.',
      source: 'offline-bm25',
      citations: []
    };
  }

  const prompt = buildGroundedPrompt(question, chunks, lang);

  // Tier 1: Try Ollama local model (zero paid API, works offline on LAN)
  const ollamaAnswer = await callOllama(prompt);
  if (ollamaAnswer) {
    return {
      answer: simpleMode
        ? ollamaAnswer.split(/\.\s+/).slice(0, 2).join('. ') + '.'
        : ollamaAnswer,
      source: 'ollama',
      model: process.env.OLLAMA_MODEL || 'llama3',
      citations: chunks.map(c => c.metadata).filter(Boolean)
    };
  }

  // Tier 2: Cloud LLM (optional, requires API key)
  const cloudAnswer = await callCloudLLM(prompt);
  if (cloudAnswer) {
    return {
      answer: simpleMode
        ? cloudAnswer.split(/\.\s+/).slice(0, 2).join('. ') + '.'
        : cloudAnswer,
      source: 'cloud',
      citations: chunks.map(c => c.metadata).filter(Boolean)
    };
  }

  // Tier 3: Offline BM25 deterministic citation matching (zero AI, guaranteed)
  const topChunk = chunks[0];
  const rawAnswer = topChunk.text;
  return {
    answer: simpleMode
      ? rawAnswer.split(/\.\s+/).slice(0, 2).join('. ') + '.'
      : rawAnswer,
    source: 'offline-bm25',
    citations: chunks.map(c => c.metadata).filter(Boolean)
  };
}

module.exports = {
  generateAnswer,
  buildOfflineIndex,
  BM25Index,
  callOllama,
};
