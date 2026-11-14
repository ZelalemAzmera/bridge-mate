// Server Component — no 'use client', no JavaScript imports beyond React
// Target: <15KB total for 2G/SMS connections

export default function LowBandwidthPage() {
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
        style={{ background: '#f8fafc', color: '#0f172a', fontFamily: 'sans-serif', margin: 0, padding: '16px' }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>
          BridgeMate — 2G Mode
        </h1>
        <p style={{ marginBottom: '24px', maxWidth: '60ch' }}>
          Works on slow connections. No images loaded.
        </p>

        {/* Query form */}
        <section>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>Ask a Question</h2>
          <form method="POST" action="/api/v1/scrape-and-guide" style={{ marginBottom: '32px' }}>
            <label htmlFor="query-input" style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>
              Your question or command:
            </label>
            <input
              id="query-input"
              type="text"
              name="query"
              placeholder="e.g. /ask How do I request accommodation?"
              required
              style={{
                display: 'block',
                width: '100%',
                maxWidth: '480px',
                padding: '10px 12px',
                marginBottom: '10px',
                fontSize: '1rem',
                border: '1px solid #94a3b8',
                borderRadius: '4px',
                background: '#ffffff',
                color: '#0f172a',
                boxSizing: 'border-box',
              }}
            />
            <input type="hidden" name="lang" value="en" />
            <button
              type="submit"
              style={{
                padding: '10px 24px',
                fontSize: '1rem',
                fontWeight: 600,
                background: '#0f62fe',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                minHeight: '44px',
              }}
            >
              Get Answer
            </button>
          </form>
        </section>

        {/* Offline resources */}
        <section>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>Offline Resources</h2>
          <ul style={{ paddingLeft: '20px', lineHeight: 1.8 }}>
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
              <a
                href="https://www.ilo.org/dyn/natlex/natlex4.detail?p_lang=en&p_isn=100755"
                style={{ color: '#0f62fe' }}
              >
                Ethiopian Labour Proclamation No. 1156/2019 (Art. 29 — Persons with Disabilities)
              </a>
            </li>
            <li>
              <a
                href="https://www.ilo.org/dyn/natlex/natlex4.detail?p_lang=en&p_isn=78633"
                style={{ color: '#0f62fe' }}
              >
                Ethiopian Disability Proclamation No. 568/2008
              </a>
            </li>
          </ul>
        </section>

        <footer style={{ marginTop: '48px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#475569' }}>
          ALX Digital Bridge Hackathon Track 3 • Zero medical disclosure required • Proclamation 568/2008
        </footer>
      </main>
    </>
  )
}
