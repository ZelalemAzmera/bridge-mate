'use client';

import React, { useState } from 'react';
import { CheckSquare, Copy, Check, Printer } from 'lucide-react';
import { useAccessibility } from '@/hooks/use-accessibility';
import { useLiveAnnouncer } from '@/hooks/use-live-announcer';

export function ChecklistExport({
  items,
  roleTitle,
}: {
  items: string[];
  roleTitle: string;
}) {
  const { language } = useAccessibility();
  const { announce } = useLiveAnnouncer();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const toggleCheck = (item: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const handleCopy = () => {
    const text = `BridgeMate Application Checklist for: ${roleTitle}\n\n` +
      items.map((it) => `[${checkedItems[it] ? 'X' : ' '}] ${it}`).join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    announce(
      language === 'am'
        ? 'የሰነዶች ዝርዝር ወደ ቅንጥብ ሰሌዳ ተገልብጧል'
        : 'Checklist copied to clipboard'
    );
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-card border-2 border-border rounded-xl p-5 shadow-sm mt-4">
      <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
        <h4 className="text-sm font-extrabold flex items-center gap-2 text-foreground">
          <CheckSquare className="w-4 h-4 text-primary" aria-hidden="true" />
          <span>{language === 'am' ? 'የማመልከቻ ሰነዶች ዝርዝር (Checklist)' : 'Required Documents Checklist'}</span>
        </h4>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs font-semibold hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={language === 'am' ? 'ዝርዝሩን ገልብጥ' : 'Copy checklist'}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                <span className="text-emerald-700 font-bold">{language === 'am' ? 'ተገልብጧል' : 'Copied'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
                <span>{language === 'am' ? 'ገልብጥ' : 'Copy'}</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs font-semibold hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={language === 'am' ? 'አትም' : 'Print checklist'}
          >
            <Printer className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
            <span>{language === 'am' ? 'አትም' : 'Print'}</span>
          </button>
        </div>
      </div>

      <ul className="space-y-2.5" role="list">
        {items.map((item, index) => {
          const isChecked = Boolean(checkedItems[item]);
          return (
            <li
              key={index}
              className={`flex items-start gap-3 p-2.5 rounded-lg border transition-colors ${
                isChecked
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-background border-border text-foreground'
              }`}
            >
              <input
                type="checkbox"
                id={`check-${index}`}
                checked={isChecked}
                onChange={() => toggleCheck(item)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label
                htmlFor={`check-${index}`}
                className={`text-xs font-medium cursor-pointer ${
                  isChecked ? 'line-through text-slate-500' : ''
                }`}
              >
                {item}
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

