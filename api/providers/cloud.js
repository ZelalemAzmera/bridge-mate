/**
 * BridgeMate — Cloud LLM Provider (optional)
 * Uses OPENAI_API_KEY / GEMINI_API_KEY if set.
 * Returns null if no cloud key configured, so the caller falls back to BM25.
 */

'use strict';

const https = require('https');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const TIMEOUT_MS = 20000;

function httpsPost(hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname,
      path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers }
    };
    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', c => { raw += c; });
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { resolve({ error: raw }); }
      });
    });
    req.setTimeout(TIMEOUT_MS, () => { req.destroy(); reject(new Error('Cloud LLM timeout')); });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function callOpenAI(question, sections, language) {
  const context = sections.slice(0, 3).map(s => `${s.heading}: ${s.content}`).join('\n');
  const result = await httpsPost(
    'api.openai.com',
    '/v1/chat/completions',
    { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
    {
      model: 'gpt-3.5-turbo',
      max_tokens: 200,
      temperature: 0.3,
      messages: [
        { role: 'system', content: `Answer in language code: ${language}. Be concise and plain-language. Use only the provided context.` },
        { role: 'user', content: `Context:\n${context}\n\nQuestion: ${question}` }
      ]
    }
  );
  if (result.choices && result.choices[0]) {
    return result.choices[0].message.content.trim();
  }
  return null;
}

async function callGemini(question, sections, language) {
  const context = sections.slice(0, 3).map(s => `${s.heading}: ${s.content}`).join('\n');
  const result = await httpsPost(
    'generativelanguage.googleapis.com',
    `/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
    {},
    {
      contents: [{
        parts: [{
          text: `Answer in language code: ${language}. Use only this context:\n${context}\n\nQuestion: ${question}\n\nAnswer (max 3 sentences):`
        }]
      }],
      generationConfig: { maxOutputTokens: 200, temperature: 0.3 }
    }
  );
  const candidate = result.candidates && result.candidates[0];
  if (candidate && candidate.content && candidate.content.parts) {
    return candidate.content.parts.map(p => p.text).join('').trim();
  }
  return null;
}

/**
 * Answer using cloud LLM. Returns null if no key configured.
 */
async function answer(question, sections, language) {
  if (!sections || sections.length === 0) return null;

  let text = null;

  try {
    if (OPENAI_API_KEY) {
      text = await callOpenAI(question, sections, language);
    } else if (GEMINI_API_KEY) {
      text = await callGemini(question, sections, language);
    } else {
      return null; // No cloud key
    }
  } catch (err) {
    console.warn('[cloud] Error:', err.message);
    return null;
  }

  if (!text) return null;

  const sources = sections.slice(0, 2).map(s => ({
    title: s.heading,
    url: s.url || `#${s.id}`
  }));

  return { text, sources };
}

module.exports = { answer };
