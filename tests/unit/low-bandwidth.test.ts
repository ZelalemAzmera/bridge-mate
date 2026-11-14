import { describe, it, expect } from 'vitest';
import LowBandwidthPage from '@/app/low-bandwidth/page';

function extractText(node: any): string {
  if (!node) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join(' ');
  if (node.props?.children) return extractText(node.props.children);
  return '';
}

describe('Track 3: Low-Bandwidth 2G/3G Route (/low-bandwidth)', () => {
  it('renders default low-bandwidth page with accessible jobs table', async () => {
    const jsx = await LowBandwidthPage({
      searchParams: Promise.resolve({}),
    });

    expect(jsx).toBeDefined();
    const text = extractText(jsx);
    expect(text).toContain('ዝቅተኛ ባንድዊድዝ');
    expect(text).toContain('የሥራ መደብ');
  });

  it('handles text tutor query and returns grounded answer', async () => {
    const jsx = await LowBandwidthPage({
      searchParams: Promise.resolve({
        q: 'ለፈተና ተጨማሪ ጊዜ መጠየቅ እችላለሁ?',
      }),
    });

    expect(jsx).toBeDefined();
    const text = extractText(jsx);
    expect(text).toContain('568/2008');
  });

  it('handles notice decoding and outputs identified barrier items', async () => {
    const jsx = await LowBandwidthPage({
      searchParams: Promise.resolve({
        notice: 'Sales Associate needed with valid driving license and physical travel.',
      }),
    });

    expect(jsx).toBeDefined();
    const text = extractText(jsx);
    expect(text).toContain('የትንተና ውጤት');
  });

  it('enqueues emergency SMS callback request and displays confirmation', async () => {
    const jsx = await LowBandwidthPage({
      searchParams: Promise.resolve({
        phone: '0911223344',
        help_goal: 'Screen reader not reading online form',
      }),
    });

    expect(jsx).toBeDefined();
    const text = extractText(jsx);
    expect(text).toContain('የድጋፍ ጥሪዎ በተራ ቁጥር ተመዝግቧል');
  });
});
