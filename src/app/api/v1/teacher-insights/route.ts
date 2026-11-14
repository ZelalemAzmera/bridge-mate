import { NextResponse } from 'next/server';

/** Shared in-memory question log (module-level, same instance within a Next.js process) */
export const questionLog = new Map<string, { count: number; langs: Set<string> }>();

export function trackQuestion(query: string, lang = 'en') {
  const key = String(query).toLowerCase().trim().slice(0, 200);
  if (!key) return;
  if (!questionLog.has(key)) questionLog.set(key, { count: 0, langs: new Set() });
  const entry = questionLog.get(key)!;
  entry.count += 1;
  entry.langs.add(lang);
}

export async function GET() {
  const sorted = Array.from(questionLog.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);

  const top_questions = sorted.map(([question_stem, { count, langs }]) => ({
    question_stem,
    count,
    langs_asked: Array.from(langs),
  }));

  return NextResponse.json({
    total_sessions: Array.from(questionLog.values()).reduce((s, e) => s + e.count, 0),
    top_questions,
    disclaimer:
      'Zero PII stored. Question stems are anonymised (lowercased, truncated to 200 chars, no IP/user identifiers).',
  });
}
