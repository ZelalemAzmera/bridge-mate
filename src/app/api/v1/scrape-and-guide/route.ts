import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore — CJS module
import { processScrapeAndGuide } from '../../../../api/scraper-guide-engine.js';

/** Anonymised in-memory question log: query stem → { count, langs } */
const questionLog = new Map<string, { count: number; langs: Set<string> }>();

function trackQuestion(query: string, lang = 'en') {
  const key = String(query).toLowerCase().trim().slice(0, 200);
  if (!key) return;
  if (!questionLog.has(key)) questionLog.set(key, { count: 0, langs: new Set() });
  const entry = questionLog.get(key)!;
  entry.count += 1;
  entry.langs.add(lang);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query = '', lang = 'en' } = body ?? {};
    trackQuestion(query, lang);
    const result = await processScrapeAndGuide(body);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', message: err?.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}
