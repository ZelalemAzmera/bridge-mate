'use client'

import { useState } from 'react'
import { BridgeMateEmbed } from '@/components/embed/bridgemate-embed'

export default function EmbedDemoPage() {
  const [copyStatus, setCopyStatus] = useState('')

  const embedCode = `<script src="http://localhost:3000/bridgemate-plugin.js"></script>\n<bridgemate-assistant api-url="/api/v1" lang="am"></bridgemate-assistant>`

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(embedCode)
      setCopyStatus('Copied!')
    } catch {
      setCopyStatus('Copy failed — please select and copy manually.')
    }
    setTimeout(() => setCopyStatus(''), 3000)
  }

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

      <main id="main-content" className="max-w-4xl mx-auto px-4 py-10" style={{ color: 'var(--text-primary)' }}>
        {/* Demo Header */}
        <h1 className="text-3xl font-bold mb-2">BridgeMate Embed Demo</h1>
        <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
          ALX Savanna Integration — See how BridgeMate embeds into any LMS with one line of code.
        </p>

        {/* ── SIMULATED ALX SAVANNA LMS ── */}
        <section aria-labelledby="lms-heading" className="rounded-xl border-2 p-6 mb-8" style={{ background: '#fff', borderColor: '#047857' }}>
          <h2 id="lms-heading" className="text-xl font-bold mb-4" style={{ color: '#047857' }}>
            Simulated ALX Savanna Lesson Page
          </h2>

          {/* Course title */}
          <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#6B7280' }}>
            Module 3
          </p>
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#111827' }}>
            Semantic HTML &amp; Accessibility
          </h3>

          {/* Lesson text */}
          <p className="text-sm mb-6 leading-relaxed" style={{ color: '#374151', maxWidth: '68ch' }}>
            The Web Content Accessibility Guidelines (WCAG) 2.2 define how to make web content more accessible to people with disabilities. Level AA conformance is the standard required by most international accessibility laws. Using semantic HTML elements such as <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, and <code>&lt;article&gt;</code> gives assistive technologies the structural information they need to navigate content effectively.
          </p>

          {/* Fake assignment form */}
          <form
            onSubmit={(e) => e.preventDefault()}
            aria-labelledby="assignment-form-heading"
            className="border rounded-lg p-4 mb-6"
            style={{ borderColor: '#E5E7EB', background: '#F9FAFB' }}
          >
            <h4 id="assignment-form-heading" className="text-sm font-semibold mb-4" style={{ color: '#111827' }}>
              Submit Assignment
            </h4>
            <div className="mb-3">
              <label htmlFor="student-name" className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                Your Name
              </label>
              <input
                id="student-name"
                type="text"
                placeholder="e.g. Abebe Bikila"
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: '#D1D5DB', minHeight: '44px' }}
                onFocus={(e) => (e.currentTarget.style.outline = '3px solid var(--focus-ring)')}
                onBlur={(e) => (e.currentTarget.style.outline = '')}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="assignment-type" className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                Assignment Type
              </label>
              <select
                id="assignment-type"
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: '#D1D5DB', minHeight: '44px' }}
                onFocus={(e) => (e.currentTarget.style.outline = '3px solid var(--focus-ring)')}
                onBlur={(e) => (e.currentTarget.style.outline = '')}
              >
                <option value="">Select type…</option>
                <option value="quiz">Quiz</option>
                <option value="project">Project</option>
                <option value="reflection">Reflection</option>
              </select>
            </div>
            <button
              type="submit"
              aria-label="Submit assignment"
              className="rounded-lg px-5 text-sm font-semibold text-white"
              style={{ minHeight: '44px', background: '#047857' }}
              onFocus={(e) => (e.currentTarget.style.outline = '3px solid var(--focus-ring)')}
              onBlur={(e) => (e.currentTarget.style.outline = '')}
            >
              Submit Assignment
            </button>
          </form>

          {/* Fake nav links */}
          <nav aria-label="Lesson navigation" className="flex flex-wrap gap-2">
            {['Previous Lesson', 'Next Lesson', 'Back to Course'].map((label) => (
              <a
                key={label}
                href="#"
                onClick={(e) => e.preventDefault()}
                aria-label={label}
                className="inline-flex items-center px-4 text-sm font-medium rounded-lg border"
                style={{
                  minHeight: '44px',
                  borderColor: '#047857',
                  color: '#047857',
                  background: '#fff',
                }}
                onFocus={(e) => (e.currentTarget.style.outline = '3px solid var(--focus-ring)')}
                onBlur={(e) => (e.currentTarget.style.outline = '')}
              >
                {label}
              </a>
            ))}
          </nav>
        </section>

        {/* ── SIMULATED JOB APPLICATION ── */}
        <section aria-labelledby="job-form-heading" className="rounded-xl border p-6 mb-8" style={{ background: '#fff', borderColor: 'var(--border-default)' }}>
          <h2 id="job-form-heading" className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Simulated Job Application Form
          </h2>
          <form onSubmit={(e) => e.preventDefault()} aria-label="Job application form">
            <div className="mb-3">
              <label htmlFor="applicant-name" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Full Name
              </label>
              <input
                id="applicant-name"
                type="text"
                placeholder="Your full name"
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: 'var(--border-input)', minHeight: '44px' }}
                onFocus={(e) => (e.currentTarget.style.outline = '3px solid var(--focus-ring)')}
                onBlur={(e) => (e.currentTarget.style.outline = '')}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="applicant-email" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Email
              </label>
              <input
                id="applicant-email"
                type="email"
                placeholder="you@example.com"
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: 'var(--border-input)', minHeight: '44px' }}
                onFocus={(e) => (e.currentTarget.style.outline = '3px solid var(--focus-ring)')}
                onBlur={(e) => (e.currentTarget.style.outline = '')}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="cover-letter" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Cover Letter
              </label>
              <textarea
                id="cover-letter"
                rows={4}
                placeholder="Tell us about yourself…"
                className="w-full border rounded px-3 py-2 text-sm resize-y focus:outline-none"
                style={{ borderColor: 'var(--border-input)', maxWidth: '68ch' }}
                onFocus={(e) => (e.currentTarget.style.outline = '3px solid var(--focus-ring)')}
                onBlur={(e) => (e.currentTarget.style.outline = '')}
              />
            </div>
            <button
              type="submit"
              aria-label="Apply now"
              className="rounded-lg px-5 text-sm font-semibold text-white"
              style={{ minHeight: '44px', background: 'var(--brand-primary)' }}
              onFocus={(e) => (e.currentTarget.style.outline = '3px solid var(--focus-ring)')}
              onBlur={(e) => (e.currentTarget.style.outline = '')}
            >
              Apply Now
            </button>
          </form>
        </section>

        {/* ── EMBED CODE ── */}
        <section aria-labelledby="embed-code-heading" className="rounded-xl border p-6 mb-8" style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border-default)' }}>
          <h2 id="embed-code-heading" className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            1-Line Embed Code
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            Paste this into any HTML page to embed BridgeMate:
          </p>
          <pre
            className="rounded-lg p-4 text-xs overflow-x-auto mb-4"
            style={{ background: '#0F172A', color: '#E2E8F0' }}
          >
            <code>{embedCode}</code>
          </pre>
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={copyCode}
              aria-label="Copy embed code to clipboard"
              className="inline-flex items-center gap-2 px-5 text-sm font-semibold text-white rounded-lg"
              style={{ minHeight: '44px', background: 'var(--brand-primary)' }}
              onFocus={(e) => (e.currentTarget.style.outline = '3px solid var(--focus-ring)')}
              onBlur={(e) => (e.currentTarget.style.outline = '')}
            >
              Copy Code
            </button>
            {copyStatus && (
              <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="text-sm"
                style={{ color: 'var(--accent-verified)' }}
              >
                {copyStatus}
              </div>
            )}
          </div>
        </section>

        {/* ── LIVE WEB COMPONENT ── */}
        <section aria-labelledby="live-embed-heading" className="rounded-xl border p-6" style={{ background: '#fff', borderColor: 'var(--border-default)' }}>
          <h2 id="live-embed-heading" className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Live Embedded Widget
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            The widget below is the actual BridgeMate web component running on this page:
          </p>
          <BridgeMateEmbed apiUrl="/api/v1" lang="am" />
        </section>
      </main>
    </>
  )
}
