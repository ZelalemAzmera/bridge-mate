'use client';

import React, { useState } from 'react';
import { BookOpen, ExternalLink, X } from 'lucide-react';

export interface Citation {
  id: string;
  sourceTitle: string;
  excerpt: string;
  similarity: number;
}

export function CitationPopover({ citation }: { citation: Citation }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className="inline-block relative ml-1 mr-1 align-baseline">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`ምንጭ መረጃ፡ ${citation.sourceTitle}`}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-300 hover:bg-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <BookOpen className="w-3 h-3 text-primary" aria-hidden="true" />
        <span className="truncate max-w-[140px]">{citation.sourceTitle}</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label={`የተረጋገጠ ማስረጃ ዝርዝር፡ ${citation.sourceTitle}`}
          className="absolute z-50 bottom-full left-0 mb-2 w-72 sm:w-80 p-3 bg-white text-slate-900 rounded-lg shadow-2xl border-2 border-primary text-xs animate-in fade-in zoom-in-95"
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
            <span className="font-extrabold text-primary flex items-center gap-1">
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              {citation.sourceTitle}
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded"
              aria-label="ዝጋ (Close)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="mt-2 text-slate-700 leading-relaxed italic bg-slate-50 p-2 rounded border border-slate-200">
            "{citation.excerpt}"
          </p>
          <div className="mt-2 text-[10px] text-slate-500 flex justify-between items-center">
            <span>የተረጋገጠ የሥርዓተ-ትምህርት ማስረጃ</span>
            <span className="font-bold text-emerald-700">
              {Math.round(citation.similarity * 100)}% ተዛማጅነት
            </span>
          </div>
        </div>
      )}
    </span>
  );
}

