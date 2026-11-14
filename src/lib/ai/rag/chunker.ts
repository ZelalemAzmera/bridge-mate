export interface ChunkOptions {
  chunkSize?: number;
  chunkOverlap?: number;
}

export function chunkText(
  text: string,
  options: ChunkOptions = {}
): string[] {
  const { chunkSize = 500, chunkOverlap = 100 } = options;

  if (!text || text.trim().length === 0) {
    return [];
  }

  // Normalize line breaks
  const cleanText = text.replace(/\r\n/g, '\n').trim();

  // If text is shorter than chunkSize, return single chunk
  if (cleanText.length <= chunkSize) {
    return [cleanText];
  }

  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < cleanText.length) {
    let endIndex = startIndex + chunkSize;

    if (endIndex >= cleanText.length) {
      chunks.push(cleanText.slice(startIndex).trim());
      break;
    }

    // Try to find a natural boundary (paragraph or sentence) before endIndex
    const slice = cleanText.slice(startIndex, endIndex);
    const lastParagraph = slice.lastIndexOf('\n\n');
    const lastSentence = Math.max(
      slice.lastIndexOf('. '),
      slice.lastIndexOf('። '), // Ethiopic full stop
      slice.lastIndexOf('?\n'),
      slice.lastIndexOf('!\n')
    );

    let boundary = -1;
    if (lastParagraph > chunkSize * 0.5) {
      boundary = lastParagraph + 2;
    } else if (lastSentence > chunkSize * 0.5) {
      boundary = lastSentence + 2;
    }

    if (boundary !== -1) {
      endIndex = startIndex + boundary;
    }

    const chunk = cleanText.slice(startIndex, endIndex).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    startIndex = Math.max(startIndex + 1, endIndex - chunkOverlap);
  }

  return chunks;
}

