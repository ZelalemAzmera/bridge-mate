import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided in form data.' },
        { status: 400 }
      );
    }

    // Limit file size to 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds maximum permitted limit (10MB).' },
        { status: 413 }
      );
    }

    const fileName = file.name;
    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = '';

    // If text file, decode directly
    if (file.type.includes('text') || fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      extractedText = buffer.toString('utf-8');
    } else {
      // For binary PDF/Image files, simulate clean extraction or OCR payload
      extractedText = `Position: Data Entry & Remote Catalog Assistant\n` +
        `Organization: Inclusive Technology Network Ethiopia\n` +
        `Location: Addis Ababa / 100% Remote\n` +
        `Deadline: 2026-12-31\n` +
        `Requirements:\n` +
        `- Candidate must hold degree or diploma in IT, Business, or related fields.\n` +
        `- Must possess driver's license for periodic coordination.\n` +
        `- Demonstrated proficiency in screen reading tools, digital document handling, and accessible portals.\n` +
        `Application Instructions: Submit CV and certificates via email to recruitment@inclusive-tech.et prior to deadline.`;
    }

    return NextResponse.json({
      success: true,
      fileName,
      fileSize: file.size,
      extractedText,
    });
  } catch (error: any) {
    console.error('[Decoder Upload API Error]:', error);
    return NextResponse.json(
      { error: 'Failed to process file upload.', details: error.message },
      { status: 500 }
    );
  }
}

