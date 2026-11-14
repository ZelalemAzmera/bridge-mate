'use client';

import React from 'react';

/**
 * Parses markdown-formatted strings into clean, semantic React elements
 * without showing raw markdown symbols like *, _, or ` in the UI.
 * Strictly WCAG 2.2 AA compliant.
 */
export function renderSemanticContent(rawText: string, simpleMode: boolean = false): React.ReactNode {
  if (!rawText) return null;

  let text = rawText.trim();

  // If simple mode is enabled, streamline text into clear bullet points
  if (simpleMode) {
    const sentences = text
      .split(/(?<=[.!?፡])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    return (
      <ul className="space-y-2 text-sm leading-relaxed" role="list">
        {sentences.map((sentence, idx) => (
          <li key={idx} className="flex items-start gap-2 text-[var(--text-primary)]">
            <span
              className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] mt-2 shrink-0"
              aria-hidden="true"
            />
            <span>{parseInlineFormatting(sentence)}</span>
          </li>
        ))}
      </ul>
    );
  }

  // Standard semantic parsing
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentListItems: string[] = [];

  const flushList = (keyPrefix: string) => {
    if (currentListItems.length > 0) {
      elements.push(
        <ul key={`${keyPrefix}-list`} className="my-2 space-y-1.5 pl-1" role="list">
          {currentListItems.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-primary)] leading-relaxed">
              <span
                className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] mt-2 shrink-0"
                aria-hidden="true"
              />
              <span>{parseInlineFormatting(item)}</span>
            </li>
          ))}
        </ul>
      );
      currentListItems = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Bullet line
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) {
      const cleanContent = trimmed.replace(/^[-*]\s+|\d+\.\s+/, '');
      currentListItems.push(cleanContent);
    } else if (trimmed.length === 0) {
      flushList(`line-${index}`);
    } else {
      flushList(`line-${index}`);
      elements.push(
        <p key={`p-${index}`} className="my-2 text-sm leading-relaxed text-[var(--text-primary)]">
          {parseInlineFormatting(trimmed)}
        </p>
      );
    }
  });

  flushList('final');

  return <div className="space-y-1 chat-bubble-measure">{elements}</div>;
}

/**
 * Handles inline code, bold, and italic formatting safely without raw markers.
 */
function parseInlineFormatting(text: string): React.ReactNode {
  // Regex splitting by backticks and asterisks
  // Pattern: code `...`, bold **...**, italic *...* or _..._
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let counter = 0;

  while (remaining.length > 0) {
    // 1. Code blocks: `code`
    const codeMatch = remaining.match(/`([^`]+)`/);
    // 2. Bold text: **bold** or __bold__
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*|__([^_]+)__/);
    // 3. Italic text: *italic* or _italic_
    const italicMatch = remaining.match(/(?<!\*)\*([^*]+)\*(?!\*)|(?<!_)_([^_]+)_(?!_)/);

    // Find earliest match
    const matches = [
      codeMatch ? { type: 'code', index: codeMatch.index!, match: codeMatch } : null,
      boldMatch ? { type: 'bold', index: boldMatch.index!, match: boldMatch } : null,
      italicMatch ? { type: 'italic', index: italicMatch.index!, match: italicMatch } : null,
    ].filter(Boolean) as { type: string; index: number; match: RegExpMatchArray }[];

    if (matches.length === 0) {
      parts.push(remaining);
      break;
    }

    // Sort by earliest occurrence
    matches.sort((a, b) => a.index - b.index);
    const earliest = matches[0];

    // Push preceding plain text
    if (earliest.index > 0) {
      parts.push(remaining.substring(0, earliest.index));
    }

    const fullMatch = earliest.match[0];
    const innerContent = earliest.match[1] || earliest.match[2] || '';

    if (earliest.type === 'code') {
      parts.push(
        <code
          key={`code-${counter++}`}
          className="px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-default)] font-mono text-xs text-[var(--text-primary)] font-semibold"
        >
          {innerContent}
        </code>
      );
    } else if (earliest.type === 'bold') {
      parts.push(
        <strong key={`bold-${counter++}`} className="font-bold text-[var(--text-primary)]">
          {innerContent}
        </strong>
      );
    } else if (earliest.type === 'italic') {
      parts.push(
        <em key={`italic-${counter++}`} className="italic text-[var(--text-secondary)]">
          {innerContent}
        </em>
      );
    }

    remaining = remaining.substring(earliest.index + fullMatch.length);
  }

  return <>{parts}</>;
}
