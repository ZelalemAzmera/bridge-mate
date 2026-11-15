import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

interface Section {
  id: string;
  heading: string;
  content: string;
  url: string;
  keywords?: string[];
}

function loadContentSections(): Section[] {
  try {
    const filePath = path.join(process.cwd(), 'data', 'content.json');
    if (fs.existsSync(filePath)) {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return parsed.sections || [];
    }
  } catch (e) {
    console.warn('[ask/route] Failed to read data/content.json:', e);
  }
  return [
    {
      id: 'what-is-shaping-the-future-of-va-work',
      heading: 'What is Shaping the Future of VA Work?',
      content: 'The virtual assistant (VA) industry is undergoing rapid transformation driven by artificial intelligence, shifting client expectations, and new remote-work norms.',
      url: '/savanna/pages/concept-with-navigation.html#what-is-shaping-the-future-of-va-work'
    },
    {
      id: 'artificial-intelligence-and-the-future-of-va-work',
      heading: 'Artificial Intelligence and the Future of VA Work',
      content: 'AI tools like ChatGPT, Gemini, and Copilot are automating routine VA tasks such as scheduling, email drafting, and data entry.',
      url: '/savanna/pages/concept-with-navigation.html#artificial-intelligence-and-the-future-of-va-work'
    }
  ];
}

const STOPWORDS = new Set(['a','an','the','is','are','was','were','be','of','in','to','for','on','with','and','or','not','it','i','you','we','they','ነው','ወይም','እና','ስለ','ከ','ወደ']);

function tokenize(text: string): string[] {
  return (text || '')
    .toLowerCase()
    .replace(/[^\w\s\u1200-\u137F]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1 && !STOPWORDS.has(t));
}

function scoreSections(question: string, sections: Section[]): Array<{ section: Section; score: number }> {
  const qTokens = tokenize(question);
  if (!qTokens.length) return [];

  return sections.map(section => {
    const text = `${section.heading} ${section.content} ${(section.keywords || []).join(' ')}`.toLowerCase();
    let score = 0;
    for (const token of qTokens) {
      if (text.includes(token)) score += 1;
    }
    return { section, score };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/v1/ask',
    description: 'Track 3 Grounded Lesson Assistant API',
    contract: 'POST { question: string, language?: string } -> { answer: string, sources: Array<{ title, url }> }'
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const question = (body.question || body.text || body.prompt || '').trim();
    const language = body.language || body.lang || 'en';

    if (!question) {
      return NextResponse.json({ error: 'question is required' }, { status: 400 });
    }

    const sections = loadContentSections();
    const matches = scoreSections(question, sections);

    if (matches.length === 0) {
      const text = language === 'am'
        ? 'በትምህርቱ ውስጥ ይህንን ማግኘት አልቻልኩም። ከአጋዥ ወይም አስተማሪ ጋር መነጋገር ይፈልጋሉ?'
        : 'I could not find this in the course. Would you like to talk to a person?';
      return NextResponse.json({
        answer: text,
        sources: [],
        provider: 'none',
        language
      });
    }

    const top = matches.slice(0, 2);
    const answer = top.map(m => `**${m.section.heading}**\n${m.section.content}`).join('\n\n');
    const sources = top.map(m => ({
      title: m.section.heading,
      url: m.section.url || `#${m.section.id}`
    }));

    return NextResponse.json({
      answer,
      sources,
      provider: 'none',
      language
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to process question' }, { status: 500 });
  }
}
