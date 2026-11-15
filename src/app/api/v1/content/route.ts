import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// In-memory runtime sections cache for Next.js API route
let runtimeSections: any[] = [];

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/v1/content',
    description: 'Track 3 Lesson Indexing Endpoint',
    indexed: runtimeSections.length
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { url, title, sections } = body;

    if (sections && Array.isArray(sections)) {
      runtimeSections = [...runtimeSections, ...sections];
      return NextResponse.json({ indexed: sections.length, total: runtimeSections.length }, { status: 201 });
    }

    if (url && typeof url === 'string') {
      const newSection = {
        id: `section-${Date.now()}`,
        heading: title || 'Indexed Content',
        content: `Content indexed from ${url}`,
        url
      };
      runtimeSections.push(newSection);
      return NextResponse.json({ indexed: 1, total: runtimeSections.length, url }, { status: 201 });
    }

    return NextResponse.json({ error: 'url or sections array required' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to index content' }, { status: 500 });
  }
}
