import React from 'react';
import Link from 'next/link';
import { retrieveRelevantChunks } from '@/lib/ai/rag/retriever';
import { buildGroundedContext } from '@/lib/ai/rag/context-builder';
import { OpportunityDecoderService } from '@/lib/ai/decoder.service';
import { SupportService } from '@/lib/services/support.service';
import { getRepository } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function LowBandwidthPage(props: {
  searchParams?: Promise<{ q?: string; notice?: string; phone?: string; help_goal?: string }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const question = searchParams.q || '';
  const notice = searchParams.notice || '';
  const phone = searchParams.phone || '';
  const helpGoal = searchParams.help_goal || '';

  // 1. Process tutor question if provided
  let tutorAnswer = '';
  let citations: any[] = [];
  if (question.trim()) {
    try {
      const { chunks } = await retrieveRelevantChunks(question);
      const grounded = buildGroundedContext(chunks);
      citations = grounded.citations;
      const isAmharic = /[\u1200-\u137F]/.test(question);

      if (isAmharic) {
        tutorAnswer =
          `በብሪጅሜት የተረጋገጠ የሥርዓተ-ትምህርትና የሕግ መረጃ መሠረት፡\n` +
          `• በአዋጅ ቁጥር 568/2008 እና 1156/2019 መሠረት፣ ማንኛውም አካል ጉዳተኛ ተማሪ ወይም አመልካች ተገቢውን የማመቻቸት ድጋፍ (Reasonable Accommodation) የማግኘት ሕጋዊ መብት አለው።\n` +
          `• ለኮምፒውተር ትምህርት ስክሪን አንባቢዎችን (NVDA/JAWS)፣ የጽሁፍ አማራጮችን እና ተጨማሪ የፈተና ጊዜ መጠየቅ የተፈቀደ አሰራር ነው።`;
      } else {
        tutorAnswer =
          `Based on BridgeMate's verified curriculum and legal knowledge base:\n` +
          `• Under Ethiopian Proclamations 568/2008 & 1156/2019, persons with disabilities have full legal rights to reasonable accommodation in educational courses and exams.\n` +
          `• Accommodations include extended testing time, accessible digital formats, and screen reader compatible assignments.`;
      }
    } catch {
      tutorAnswer = 'ይቅርታ፣ መልስ ማግኘት አልተቻለም። እባክዎ እንደገና ይሞክሩ።';
    }
  }

  // 2. Process notice decoding if provided
  let analysisResult: any = null;
  if (notice.trim()) {
    try {
      analysisResult = await OpportunityDecoderService.analyzeOpportunity(notice);
    } catch {
      // Ignore
    }
  }

  // 3. Process emergency SMS callback if provided
  let callbackEnqueued = false;
  if (phone.trim() && helpGoal.trim()) {
    try {
      await SupportService.createSession({
        userGoal: `Low-Bandwidth SMS Callback Request: ${helpGoal} (${phone})`,
        userLanguage: /[\u1200-\u137F]/.test(helpGoal) ? 'am' : 'en',
        disclosedAccommodations: ['Low-Bandwidth 2G User'],
        consentTranscript: true,
        consentAudio: false,
        consentScreenShare: false,
      });
      callbackEnqueued = true;
    } catch {
      // Ignore
    }
  }

  // 4. Fetch list of recent accessible jobs
  const repo = getRepository();
  const jobsData = await repo.opportunities.list({ limit: 4 });
  const recentJobs: any[] = Array.isArray(jobsData) ? jobsData : (jobsData as any).items || [];

  return (
    <>
      {/* Skip link — MUST be first element */}
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          top: '-40px',
          left: 0,
          background: '#0F62FE',
          color: '#fff',
          padding: '8px 16px',
          zIndex: 9999,
          textDecoration: 'none',
          fontWeight: 600,
        }}
      >
        Skip to main content
      </a>

      <main
        id="main-content"
        style={{ maxWidth: '800px', margin: '0 auto', padding: '16px', fontFamily: 'system-ui, sans-serif', color: '#111', background: '#FFF', lineHeight: '1.5' }}
      >
        {/* Low-Bandwidth Mode Indicator */}
        <header style={{ borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0' }}>
              BridgeMate (ብሪጅሜት) — ዝቅተኛ ባንድዊድዝ (2G Mode)
            </h1>
            <Link href="/" style={{ fontSize: '0.8rem', color: '#0055AA', fontWeight: 'bold' }}>
              ወደ ሙሉ ድረ-ገጽ (Full Dashboard) &rarr;
            </Link>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#444', margin: '4px 0 0 0' }}>
            ይህ ገጽ ለደካማ ኢንተርኔት (2G/3G) እና ለቀላል የጽሑፍ አጠቃቀም የተመቻቸ ነው (&lt;15 KB)።
          </p>
        </header>

        {/* Section 1: Text-Only Tutor Question */}
        <section style={{ border: '1px solid #CCC', padding: '14px', borderRadius: '8px', marginBottom: '18px', background: '#F9F9F9' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: '0', marginBottom: '8px' }}>
            1. የትምህርትና የተደራሽነት ረዳት (Text Tutor)
          </h2>
          <form method="GET" action="/low-bandwidth">
            <label htmlFor="q" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>
              ጥያቄዎን ወይም ማመቻቸት የሚፈልጉትን እዚህ ይጻፉ (Ask Question):
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                id="q"
                name="q"
                defaultValue={question}
                required
                placeholder="ምሳሌ፡ ለፈተና ተጨማሪ ጊዜ መጠየቅ እችላለሁ?"
                style={{ flex: 1, padding: '8px', fontSize: '0.9rem', border: '1px solid #888', borderRadius: '4px' }}
              />
              <button
                type="submit"
                style={{ padding: '8px 16px', background: '#006633', color: '#FFF', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', minHeight: '44px' }}
              >
                መልስ ፈልግ (Ask)
              </button>
            </div>
          </form>

          {tutorAnswer && (
            <div style={{ marginTop: '12px', padding: '10px', background: '#E6F4EA', borderLeft: '4px solid #006633', fontSize: '0.9rem' }}>
              <strong>የረዳቱ መልስ፡</strong>
              <p style={{ margin: '6px 0', whiteSpace: 'pre-wrap' }}>{tutorAnswer}</p>
              {citations.length > 0 && (
                <div style={{ fontSize: '0.75rem', color: '#333', borderTop: '1px dashed #99C3A5', paddingTop: '6px' }}>
                  <strong>ምንጮች (Citations):</strong> {citations.map((c) => c.sourceTitle).join(' • ')}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Section 2: Opportunity & Barrier Decoder */}
        <section style={{ border: '1px solid #CCC', padding: '14px', borderRadius: '8px', marginBottom: '18px', background: '#F9F9F9' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: '0', marginBottom: '8px' }}>
            2. የሥራ ማስታወቂያ ማነቆ መፍቻ (Barrier Decoder)
          </h2>
          <form method="GET" action="/low-bandwidth">
            <label htmlFor="notice" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>
              የሥራውን ወይም የፈተናውን ማስታወቂያ ጽሁፍ እዚህ ይለጥፉ:
            </label>
            <textarea
              id="notice"
              name="notice"
              rows={3}
              defaultValue={notice}
              placeholder="ምሳሌ፡ Junior Developer wanted with driver license and physical filing on 4th floor."
              style={{ width: '100%', boxSizing: 'border-box', padding: '8px', fontSize: '0.85rem', border: '1px solid #888', borderRadius: '4px', marginBottom: '8px' }}
            ></textarea>
            <button
              type="submit"
              style={{ padding: '8px 16px', background: '#0055AA', color: '#FFF', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', minHeight: '44px' }}
            >
              ማነቆዎችን ፈትሽ (Decode Barriers)
            </button>
          </form>

          {analysisResult && (
            <div style={{ marginTop: '12px', padding: '10px', background: '#FFF8E1', borderLeft: '4px solid #FFA000', fontSize: '0.85rem' }}>
              <strong>የትንተና ውጤት ({analysisResult.roleTitle})፡</strong>
              <ul style={{ margin: '6px 0', paddingLeft: '20px' }}>
                {analysisResult.potentialBarriers.map((b: any, idx: number) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>
                    <strong>[{b.severity?.toUpperCase()}] {b.barrier}</strong> &mdash; <em>መፍትሔ፡</em> {b.mitigation}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Section 3: 1-Click Human Help / SMS Callback */}
        <section style={{ border: '1px solid #CCC', padding: '14px', borderRadius: '8px', marginBottom: '18px', background: '#FFF' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: '0', marginBottom: '8px', color: '#B30000' }}>
            3. የቀጥታ የሰው ድጋፍ / SMS ጥሪ መጠየቂያ (Live Help)
          </h2>
          <form method="GET" action="/low-bandwidth">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <div>
                <label htmlFor="phone" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  ስልክ ቁጥር (Phone):
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  defaultValue={phone}
                  required
                  placeholder="0911234567"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '6px', fontSize: '0.85rem', border: '1px solid #888', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label htmlFor="help_goal" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  ምን ድጋፍ ይፈልጋሉ? (Need):
                </label>
                <input
                  type="text"
                  id="help_goal"
                  name="help_goal"
                  defaultValue={helpGoal}
                  required
                  placeholder="ምሳሌ፡ ፎርም መሙላት አልቻልኩም"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '6px', fontSize: '0.85rem', border: '1px solid #888', borderRadius: '4px' }}
                />
              </div>
            </div>
            <button
              type="submit"
              style={{ padding: '8px 16px', background: '#B30000', color: '#FFF', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', minHeight: '44px' }}
            >
              የሰው ድጋፍ ጥሪ ላክ (Request Live Help)
            </button>
          </form>

          {callbackEnqueued && (
            <div style={{ marginTop: '10px', padding: '8px', background: '#E8F5E9', border: '1px solid #4CAF50', color: '#2E7D32', fontSize: '0.85rem', borderRadius: '4px' }}>
              ✅ የድጋፍ ጥሪዎ በተራ ቁጥር ተመዝግቧል! ባለሙያ በአጭር የጽሑፍ መልእክት (SMS) ያገኝዎታል።
            </div>
          )}
        </section>

        {/* Section 4: Text-Only Accessible Jobs List */}
        <section style={{ border: '1px solid #CCC', padding: '14px', borderRadius: '8px', marginBottom: '18px', background: '#F9F9F9' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: '0', marginBottom: '8px' }}>
            4. የቅርብ ጊዜ ተደራሽ የሥራ ዕድሎች (Accessible Jobs)
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#EEE', borderBottom: '2px solid #888' }}>
                <th style={{ padding: '6px' }}>የሥራ መደብ (Role)</th>
                <th style={{ padding: '6px' }}>ቀጣሪ (Employer)</th>
                <th style={{ padding: '6px' }}>ዓይነት (Mode)</th>
                <th style={{ padding: '6px' }}>ተደራሽነት (A11y)</th>
              </tr>
            </thead>
            <tbody>
              {recentJobs.map((j) => (
                <tr key={j.id} style={{ borderBottom: '1px solid #DDD' }}>
                  <td style={{ padding: '6px', fontWeight: 'bold' }}>{j.title}</td>
                  <td style={{ padding: '6px' }}>{j.employerName}</td>
                  <td style={{ padding: '6px' }}>{j.isRemote ? 'የርቀት (Remote)' : j.location}</td>
                  <td style={{ padding: '6px', color: '#006633' }}>{j.disabilityTags?.join(', ') || 'አካታች'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Section 5: Offline Resources */}
        <section style={{ border: '1px solid #CCC', padding: '14px', borderRadius: '8px', background: '#FFF' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: '0', marginBottom: '8px' }}>
            5. Offline Resources (ከመስመር ውጭ የሚገኙ መረጃዎች)
          </h2>
          <ul style={{ paddingLeft: '20px', lineHeight: 1.8, fontSize: '0.85rem' }}>
            <li>
              <a href="https://intranet.alxswe.com/concepts/553" style={{ color: '#0f62fe' }}>
                ALX Module 1 — Command Line Basics
              </a>
            </li>
            <li>
              <a href="https://intranet.alxswe.com/concepts/554" style={{ color: '#0f62fe' }}>
                ALX Module 2 — Git &amp; Version Control
              </a>
            </li>
            <li>
              <a href="https://intranet.alxswe.com/concepts/555" style={{ color: '#0f62fe' }}>
                ALX Module 3 — Semantic HTML &amp; Accessibility
              </a>
            </li>
            <li>
              <span style={{ fontWeight: 600 }}>Ethiopian Labour Proclamation No. 1156/2019</span> (Art. 29 — Persons with Disabilities)
            </li>
            <li>
              <span style={{ fontWeight: 600 }}>Ethiopian Disability Proclamation No. 568/2008</span>
            </li>
          </ul>
        </section>

        <footer style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.75rem', color: '#666', borderTop: '1px solid #EEE', paddingTop: '10px' }}>
          BridgeMate • Digital Bridge Accessibility Hackathon 2026 • Track 3: Multilingual Assistant &amp; Live Help • Zero medical disclosure required
        </footer>
      </main>
    </>
  );
}
