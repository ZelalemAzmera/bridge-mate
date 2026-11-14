/**
 * BridgeMate — Local Ollama Provider
 * Calls a locally running Ollama instance for LLM inference.
 * Zero paid-API lock-in. Falls back gracefully if Ollama unavailable.
 */

'use strict';

const http = require('http');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';
const TIMEOUT_MS = 30000;

/**
 * HTTP POST helper (no external deps — uses Node built-in http).
 */
function httpPost(url, body) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const data = JSON.stringify(body);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || 11434,
      path: parsed.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', chunk => { raw += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { resolve({ response: raw }); }
      });
    });

    req.setTimeout(TIMEOUT_MS, () => {
      req.destroy();
      reject(new Error('Ollama request timed out'));
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

/**
 * Build a multilingual RAG prompt for Ollama.
 */
function buildPrompt(question, sections, language) {
  const langNames = {
    am: 'Amharic (አማርኛ)',
    ti: 'Tigrinya (ትግርኛ)',
    om: 'Afaan Oromoo',
    so: 'Somali (Soomaali)',
    ar: 'Arabic (العربية)',
    en: 'English'
  };
  const langName = langNames[language] || 'English';

  const context = sections
    .slice(0, 3)
    .map(s => `### ${s.heading}\n${s.content}`)
    .join('\n\n');

  return `You are a helpful assistant for ALX Ethiopia learners. Answer in ${langName}.
Use ONLY the context below. If the answer is not in the context, say so clearly.
Cite the section heading you are drawing from.

CONTEXT:
${context}

QUESTION: ${question}

ANSWER (in ${langName}, plain language, max 3 sentences):`;
}

/**
 * Answer a question using the local Ollama instance.
 * @param {string} question
 * @param {Array<{id,heading,content,url}>} sections
 * @param {string} language - BCP-47 code
 * @returns {Promise<{text: string, sources: Array<{title:string, url:string}>} | null>}
 */
async function answer(question, sections, language) {
  if (!sections || sections.length === 0) return null;

  const prompt = buildPrompt(question, sections.slice(0, 3), language);

  try {
    const result = await httpPost(`${OLLAMA_URL}/api/generate`, {
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      options: { temperature: 0.3, num_predict: 200 }
    });

    const text = (result.response || '').trim();
    if (!text) return null;

    const sources = sections.slice(0, 2).map(s => ({
      title: s.heading,
      url: s.url || `#${s.id}`
    }));

    return { text, sources };
  } catch (err) {
    // Ollama unavailable — return null so caller falls back
    console.warn('[ollama] Unavailable:', err.message);
    return null;
  }
}

module.exports = { answer };
