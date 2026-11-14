/**
 * BridgeMate — Offline BM25 Provider (zero API key, zero internet required)
 * Implements the pluggable provider interface: answer(question, sections, language) -> { text, sources }
 */

'use strict';

// Stopwords for Amharic-aware tokenization (Latin + common Amharic particles)
const STOPWORDS = new Set([
  'a','an','the','is','are','was','were','be','been','being','have','has','had',
  'do','does','did','will','would','could','should','may','might','shall','can',
  'of','in','to','for','on','with','at','by','from','this','that','these','those',
  'and','or','but','not','no','it','its','i','you','we','they','what','how','why',
  'ነው','ነበር','ወይም','እና','ስለ','አለ','አለን','ሆኖ','ሆናለ','ይህ','ያ','ከ','ወደ','ላይ'
]);

/**
 * Simple tokenizer: lowercase, remove punctuation, split on whitespace.
 */
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u1200-\u137F]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1 && !STOPWORDS.has(t));
}

/**
 * Build an inverted index + IDF map from sections.
 */
function buildIndex(sections) {
  const N = sections.length;
  const tf = []; // term frequency per doc
  const df = {}; // document frequency per term
  const lengths = [];

  for (const section of sections) {
    const text = `${section.heading || ''} ${section.content || ''}`;
    const tokens = tokenize(text);
    lengths.push(tokens.length);
    const freq = {};
    for (const t of tokens) {
      freq[t] = (freq[t] || 0) + 1;
    }
    tf.push(freq);
    for (const t of Object.keys(freq)) {
      df[t] = (df[t] || 0) + 1;
    }
  }

  const avgLen = lengths.reduce((a, b) => a + b, 0) / (N || 1);

  // Precompute IDF
  const idf = {};
  for (const [term, freq] of Object.entries(df)) {
    idf[term] = Math.log((N - freq + 0.5) / (freq + 0.5) + 1);
  }

  return { tf, idf, lengths, avgLen, N };
}

/**
 * BM25 score for a query against a document.
 */
function bm25Score(queryTokens, docIndex, docIdx, { tf, idf, lengths, avgLen, k1 = 1.5, b = 0.75 }) {
  let score = 0;
  const docLen = lengths[docIdx];
  const docTf = tf[docIdx];
  for (const term of queryTokens) {
    if (!idf[term]) continue;
    const freq = docTf[term] || 0;
    const num = freq * (k1 + 1);
    const denom = freq + k1 * (1 - b + b * (docLen / avgLen));
    score += idf[term] * (num / denom);
  }
  return score;
}

/**
 * Generate a plain-language offline answer using best-matching sections.
 * @param {string} question
 * @param {Array<{id,heading,content,url}>} sections
 * @param {string} language - BCP-47 code e.g. 'am', 'en', 'ti'
 * @returns {Promise<{text: string, sources: Array<{title:string, url:string}>}>}
 */
async function answer(question, sections, language) {
  if (!sections || sections.length === 0) {
    return {
      text: 'No content available offline. Please check your connection.',
      sources: []
    };
  }

  const { tf, idf, lengths, avgLen } = buildIndex(sections);
  const queryTokens = tokenize(question);

  // Score all sections
  const scored = sections.map((section, i) => ({
    section,
    score: bm25Score(queryTokens, null, i, { tf, idf, lengths, avgLen })
  }));

  scored.sort((a, b) => b.score - a.score);

  // Take top 2 matching sections
  const topSections = scored.slice(0, 2).filter(s => s.score > 0);

  if (topSections.length === 0) {
    // Fallback: return first section
    const fallback = sections[0];
    return {
      text: fallback.content.slice(0, 400) + '…',
      sources: [{ title: fallback.heading, url: fallback.url || '#' }]
    };
  }

  // Build answer text: concatenate excerpts
  const excerpts = topSections.map(({ section }) => {
    const excerpt = section.content.slice(0, 300);
    return `**${section.heading}**\n${excerpt}${section.content.length > 300 ? '…' : ''}`;
  });

  const text = excerpts.join('\n\n');
  const sources = topSections.map(({ section }) => ({
    title: section.heading,
    url: section.url || `#${section.id}`
  }));

  return { text, sources };
}

module.exports = { answer };
