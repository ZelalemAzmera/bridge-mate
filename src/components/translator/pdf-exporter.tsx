'use client';

import React from 'react';
import { Printer, Download } from 'lucide-react';
import { useAccessibility } from '@/hooks/use-accessibility';

export function PdfExporter({
  content,
  subject,
}: {
  content: string;
  subject: string;
}) {
  const { language } = useAccessibility();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([`${subject}\n\n${content}`], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Accommodation_Request_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handlePrint}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={language === 'am' ? 'ደብዳቤውን አትም' : 'Print letter'}
      >
        <Printer className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
        <span>{language === 'am' ? 'አትም (Print)' : 'Print'}</span>
      </button>

      <button
        type="button"
        onClick={handleDownloadTxt}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={language === 'am' ? 'በፋይል አውርድ' : 'Download text file'}
      >
        <Download className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
        <span>{language === 'am' ? 'አውርድ (.txt)' : 'Download (.txt)'}</span>
      </button>
    </div>
  );
}

