'use client'

import { useRef, useState } from 'react'

interface CommandResult {
  status: string
  answer?: string
  message?: string
  citations?: string[]
}

export default function TelegramPage() {
  const [command, setCommand] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<CommandResult[]>([])
  const logRef = useRef<HTMLDivElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!command.trim()) return
    setLoading(true)

    try {
      const res = await fetch('/api/v1/scrape-and-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: command }),
      })
      const data: CommandResult = await res.json()
      setResults((prev) => [...prev, data])
    } catch {
      setResults((prev) => [...prev, { status: 'error', message: 'Network error — please try again.' }])
    } finally {
      setLoading(false)
      setCommand('')
    }
  }

  const botCommands = [
    { cmd: '/ask <question>', desc: 'Get course guidance' },
    { cmd: '/scrape <url>', desc: 'Analyze any page' },
    { cmd: '/decode <job_text>', desc: 'Decode job requirements' },
    { cmd: '/livehelp', desc: 'Request human tutor' },
    { cmd: '/alerts', desc: 'Subscribe to job alerts' },
  ]

  const steps = [
    { n: '1', title: 'Send a command', desc: 'Type a /command into Telegram or use the simulator below.' },
    { n: '2', title: 'Engine processes', desc: 'BridgeMate retrieves and cites from Ethiopian law and ALX corpus.' },
    { n: '3', title: 'Get a cited answer', desc: 'Receive a structured answer with legal and course citations.' },
  ]

  return (
    <>
      <a
        href="#main-content"
        style={{position:'absolute',top:'-40px',left:0,background:'#0F62FE',color:'#fff',padding:'8px 16px',zIndex:9999,textDecoration:'none',fontWeight:600}}
        onFocus={e => (e.currentTarget.style.top='0')}
        onBlur={e => (e.currentTarget.style.top='-40px')}
      >
        Skip to main content
      </a>

      <main id="main-content" className="max-w-3xl mx-auto px-4 py-10" style={{ color: 'var(--text-primary)' }}>

        {/* Hero */}
        <section aria-labelledby="hero-heading" className="mb-10">
          <h1 id="hero-heading" className="text-3xl font-bold mb-3">Telegram &amp; 2G Assistant</h1>
          <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)', maxWidth: '68ch' }}>
            BridgeMate works fully offline on slow 2G connections via Telegram. No app required — just a basic SMS-capable phone. Access course guidance, job decoding, and live human help from anywhere in Ethiopia.
          </p>
        </section>

        {/* Bot info card */}
        <section aria-labelledby="bot-heading" className="rounded-xl border p-6 mb-8" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
          <h2 id="bot-heading" className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            @BridgeMateBot
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Available 24/7 on Telegram</p>
          <ul className="space-y-2" role="list">
            {botCommands.map(({ cmd, desc }) => (
              <li key={cmd} className="flex gap-3 text-sm">
                <code
                  className="font-mono px-2 py-1 rounded shrink-0"
                  style={{ background: 'var(--bg-subtle)', color: 'var(--brand-primary)' }}
                >
                  {cmd}
                </code>
                <span style={{ color: 'var(--text-secondary)' }}>{desc}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* QR Code placeholder */}
        <section aria-labelledby="qr-heading" className="rounded-xl border p-6 mb-8 text-center" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
          <h2 id="qr-heading" className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Open on Telegram
          </h2>
          <div
            role="img"
            aria-label="QR code — scan to open BridgeMateBot on Telegram"
            className="mx-auto w-40 h-40 rounded-xl flex items-center justify-center mb-4 border-2"
            style={{ borderColor: 'var(--border-default)', background: 'var(--bg-subtle)' }}
          >
            <span className="text-xs text-center px-3" style={{ color: 'var(--text-secondary)' }}>
              QR Code<br />Scan to open<br />Telegram Bot
            </span>
          </div>
          <a
            href="https://t.me/BridgeMateBot"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open BridgeMateBot on Telegram"
            className="inline-flex items-center gap-2 px-5 text-sm font-semibold text-white rounded-lg"
            style={{ minHeight: '44px', background: '#229ED9' }}
            onFocus={(e) => (e.currentTarget.style.outline = '3px solid var(--focus-ring)')}
            onBlur={(e) => (e.currentTarget.style.outline = '')}
          >
            Open @BridgeMateBot on Telegram
          </a>
        </section>

        {/* How it works */}
        <section aria-labelledby="how-heading" className="mb-8">
          <h2 id="how-heading" className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            How It Works
          </h2>
          <ol className="space-y-4" role="list">
            {steps.map(({ n, title, desc }) => (
              <li key={n} className="flex gap-4 items-start">
                <span
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  aria-hidden="true"
                  style={{ background: 'var(--brand-primary)' }}
                >
                  {n}
                </span>
                <div>
                  <strong className="block text-sm font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>{title}</strong>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{desc}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* 2G / Offline explanation */}
        <section aria-labelledby="offline-heading" className="rounded-xl border p-6 mb-8" style={{ background: 'var(--accent-verified-bg)', borderColor: 'var(--accent-verified)' }}>
          <h2 id="offline-heading" className="text-lg font-semibold mb-2" style={{ color: 'var(--accent-verified)' }}>
            2G &amp; Offline Mode
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: '#065F46', maxWidth: '68ch' }}>
            BridgeMate&apos;s Telegram bot works over <strong>2G connections</strong> and even with intermittent connectivity. The entire Ethiopian law corpus (Proclamation 1156/2019, Proclamation 568/2008) and ALX module index are <strong>cached locally</strong> on the bot server — no external API calls required for core guidance.
          </p>
        </section>

        {/* Try it Now simulator */}
        <section aria-labelledby="simulator-heading" className="rounded-xl border p-6" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
          <h2 id="simulator-heading" className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Try It Now — Command Simulator
          </h2>
          <form onSubmit={handleSubmit} aria-label="Telegram command simulator" className="flex gap-2 mb-4 flex-wrap">
            <label htmlFor="command-input" className="sr-only">Enter a Telegram command</label>
            <input
              id="command-input"
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="/ask How do I request an accommodation?"
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ borderColor: 'var(--border-input)', minHeight: '44px', minWidth: '200px' }}
              onFocus={(e) => (e.currentTarget.style.outline = '3px solid var(--focus-ring)')}
              onBlur={(e) => (e.currentTarget.style.outline = '')}
              aria-label="Telegram command input"
            />
            <button
              type="submit"
              disabled={loading}
              aria-label="Send command to simulator"
              className="px-5 text-sm font-semibold text-white rounded-lg disabled:opacity-60"
              style={{ minHeight: '44px', background: 'var(--brand-primary)' }}
              onFocus={(e) => (e.currentTarget.style.outline = '3px solid var(--focus-ring)')}
              onBlur={(e) => (e.currentTarget.style.outline = '')}
            >
              {loading ? 'Sending…' : 'Send'}
            </button>
          </form>

          {/* Response log */}
          <div
            ref={logRef}
            role="log"
            aria-live="polite"
            aria-label="Command responses"
            className="space-y-3 max-h-80 overflow-y-auto"
          >
            {results.length === 0 && (
              <p className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>
                Responses will appear here…
              </p>
            )}
            {results.map((r, i) => (
              <article
                key={i}
                className="rounded-lg p-4 border text-sm"
                style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border-default)' }}
              >
                {r.status === 'error' ? (
                  <p style={{ color: '#DC2626' }}><strong>Error:</strong> {r.message}</p>
                ) : (
                  <>
                    {r.answer && <p style={{ color: 'var(--text-primary)' }}>{r.answer}</p>}
                    {r.message && <p style={{ color: 'var(--text-secondary)' }}>{r.message}</p>}
                    {r.citations && r.citations.length > 0 && (
                      <ul className="mt-2 space-y-1" role="list">
                        {r.citations.map((c, j) => (
                          <li key={j} className="text-xs" style={{ color: 'var(--accent-verified)' }}>
                            📚 {c}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
