'use client'

import { useEffect, useRef, useState } from 'react'

export default function SupportPage() {
  const mainRef = useRef<HTMLElement>(null)
  const [sharing, setSharing] = useState(false)
  const [streamRef, setStreamRef] = useState<MediaStream | null>(null)
  const [showShareBtn, setShowShareBtn] = useState(false)
  const [contextText, setContextText] = useState('')
  const [sendStatus, setSendStatus] = useState('')

  // Load last query from sessionStorage
  useEffect(() => {
    const last = sessionStorage.getItem('lastQuery') ?? ''
    setContextText(last ? `Recent question: ${last}` : 'Recent question: ')
    setShowShareBtn(true)
  }, [])

  // Alt+H global shortcut → focus main content
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'h') {
        e.preventDefault()
        mainRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  async function startSharing() {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
      setStreamRef(stream)
      setSharing(true)
      stream.getTracks().forEach((track) => {
        track.addEventListener('ended', stopSharing)
      })
    } catch {
      // user cancelled or denied — no action needed
    }
  }

  function stopSharing() {
    streamRef?.getTracks().forEach((t) => t.stop())
    setStreamRef(null)
    setSharing(false)
  }

  async function sendToTutor() {
    setSendStatus('Sending…')
    try {
      await fetch('/api/v1/scrape-and-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: contextText }),
      })
      setSendStatus('Context sent to tutor ✓')
    } catch {
      setSendStatus('Failed to send — please try again.')
    }
  }

  return (
    <>
      {/* Skip link — MUST be first element */}
      <a
        href="#main-content"
        style={{position:'absolute',top:'-40px',left:0,background:'#0F62FE',color:'#fff',padding:'8px 16px',zIndex:9999,textDecoration:'none',fontWeight:600}}
        onFocus={e => (e.currentTarget.style.top='0')}
        onBlur={e => (e.currentTarget.style.top='-40px')}
      >
        Skip to main content
      </a>

      <main
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
        aria-label="Live Human Help"
        className="max-w-3xl mx-auto px-4 py-10 focus:outline-none"
        style={{ color: 'var(--text-primary)' }}
      >
        {/* H1 */}
        <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          Live Human Help
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
          Press <kbd className="px-1 py-0.5 rounded border text-xs font-mono" style={{ borderColor: 'var(--border-default)' }}>Alt+H</kbd> to focus this page from anywhere.
        </p>

        {/* CTA Card */}
        <section aria-labelledby="cta-heading" className="rounded-xl p-6 mb-8 border-2" style={{ background: 'var(--accent-verified-bg)', borderColor: 'var(--accent-verified)' }}>
          <h2 id="cta-heading" className="text-xl font-semibold mb-2" style={{ color: 'var(--accent-verified)' }}>
            Transfer Your Full Context to a Human Tutor
          </h2>
          <p style={{ color: '#065F46' }}>
            You <strong>never repeat yourself</strong>. When you connect to a human tutor, your entire session context — your questions, the AI's responses, and any files you shared — is transferred automatically. Jump straight to the help you need.
          </p>
        </section>

        {/* WebRTC Screen Sharing */}
        <section aria-labelledby="screenshare-heading" className="rounded-xl p-6 mb-8 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
          <h2 id="screenshare-heading" className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Screen Sharing
          </h2>

          {/* Status badge */}
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4"
            style={
              sharing
                ? { background: '#DCFCE7', color: '#166534' }
                : { background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }
            }
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: sharing ? '#16A34A' : '#94A3B8' }}
              aria-hidden="true"
            />
            {sharing ? 'Sharing active' : 'Not sharing'}
          </div>

          {/* Informed consent */}
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            <strong>Informed consent:</strong> Your screen is shared only with your tutor. You control it. Click <em>Stop Sharing</em> to end anytime.
          </p>

          <div className="flex flex-wrap gap-2">
            {showShareBtn && !sharing && (
              <button
                onClick={startSharing}
                aria-label="Share your screen with your tutor"
                className="inline-flex items-center gap-2 px-5 font-medium rounded-lg transition-colors focus-visible:outline-none"
                style={{
                  minHeight: '44px',
                  background: 'var(--brand-primary)',
                  color: '#fff',
                  outlineOffset: '2px',
                }}
                onFocus={(e) => (e.currentTarget.style.outline = '3px solid var(--focus-ring)')}
                onBlur={(e) => (e.currentTarget.style.outline = '')}
              >
                Share Your Screen
              </button>
            )}
            {sharing && (
              <button
                onClick={stopSharing}
                aria-label="Stop sharing your screen"
                className="inline-flex items-center gap-2 px-5 font-medium rounded-lg transition-colors focus-visible:outline-none"
                style={{
                  minHeight: '44px',
                  background: '#DC2626',
                  color: '#fff',
                  outlineOffset: '2px',
                }}
                onFocus={(e) => (e.currentTarget.style.outline = '3px solid var(--focus-ring)')}
                onBlur={(e) => (e.currentTarget.style.outline = '')}
              >
                Stop Sharing Screen
              </button>
            )}
          </div>
        </section>

        {/* Transfer Context */}
        <section aria-labelledby="context-heading" className="rounded-xl p-6 mb-8 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
          <h2 id="context-heading" className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Transfer Context to Tutor
          </h2>
          <label htmlFor="context-textarea" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Context to send
          </label>
          <textarea
            id="context-textarea"
            value={contextText}
            onChange={(e) => setContextText(e.target.value)}
            rows={4}
            className="w-full rounded-lg p-3 text-sm mb-3 border resize-y focus-visible:outline-none"
            style={{
              borderColor: 'var(--border-input)',
              background: 'var(--bg-canvas)',
              color: 'var(--text-primary)',
              maxWidth: '68ch',
            }}
            aria-label="Context message to send to tutor"
            onFocus={(e) => (e.currentTarget.style.outline = '3px solid var(--focus-ring)')}
            onBlur={(e) => (e.currentTarget.style.outline = '')}
          />
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={sendToTutor}
              aria-label="Send your context to a human tutor"
              className="inline-flex items-center gap-2 px-5 font-medium rounded-lg transition-colors focus-visible:outline-none"
              style={{
                minHeight: '44px',
                background: 'var(--accent-verified)',
                color: '#fff',
                outlineOffset: '2px',
              }}
              onFocus={(e) => (e.currentTarget.style.outline = '3px solid var(--focus-ring)')}
              onBlur={(e) => (e.currentTarget.style.outline = '')}
            >
              Send to Tutor
            </button>
            {sendStatus && (
              <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                {sendStatus}
              </div>
            )}
          </div>
        </section>

        {/* Contact Options */}
        <section aria-labelledby="contact-heading" className="rounded-xl p-6 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
          <h2 id="contact-heading" className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Contact Options
          </h2>
          <ul className="space-y-3" role="list">
            <li>
              <h3 className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-secondary)' }}>Telegram</h3>
              <a
                href="https://t.me/bridgemate_support"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open Telegram support chat with @bridgemate_support"
                className="text-sm font-medium underline"
                style={{ color: 'var(--brand-primary)' }}
                onFocus={(e) => (e.currentTarget.style.outline = '3px solid var(--focus-ring)')}
                onBlur={(e) => (e.currentTarget.style.outline = '')}
              >
                @bridgemate_support
              </a>
            </li>
            <li>
              <h3 className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-secondary)' }}>Email</h3>
              <a
                href="mailto:support@digitalbridge.et"
                aria-label="Email BridgeMate support"
                className="text-sm font-medium underline"
                style={{ color: 'var(--brand-primary)' }}
                onFocus={(e) => (e.currentTarget.style.outline = '3px solid var(--focus-ring)')}
                onBlur={(e) => (e.currentTarget.style.outline = '')}
              >
                support@digitalbridge.et
              </a>
            </li>
            <li>
              <h3 className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-secondary)' }}>EthSL Interpretation</h3>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                Ethiopian Sign Language (EthSL) interpretation is available on request during live sessions.
              </p>
            </li>
          </ul>
        </section>
      </main>
    </>
  )
}
