'use client';

import React, { useState } from 'react';
import { useAccessibility } from '@/hooks/use-accessibility';
import { useLiveAnnouncer } from '@/hooks/use-live-announcer';
import { FileCheck, AlertCircle } from 'lucide-react';
import { AccommodationWizard } from '@/components/translator/accommodation-wizard';
import { DraftEditor } from '@/components/translator/draft-editor';
import type {
  GenerateAccommodationRequest,
  GeneratedAccommodationLetter,
} from '@/lib/validators/translator.schema';

export default function TranslatorPage() {
  const { language } = useAccessibility();
  const { announce } = useLiveAnnouncer();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [letter, setLetter] = useState<GeneratedAccommodationLetter | null>(null);

  const handleGenerate = async (data: GenerateAccommodationRequest) => {
    setIsLoading(true);
    setError(null);
    announce(
      language === 'am'
        ? 'የማመቻቸት ደብዳቤ በማመንጨት ላይ ነው። እባክዎ ይጠብቁ...'
        : 'Generating accommodation letter. Please wait...'
    );

    try {
      const res = await fetch('/api/translator/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || json.error || 'Failed to generate accommodation letter');
      }

      setLetter(json.data);
      announce(
        language === 'am'
          ? 'የማመቻቸት ደብዳቤው በተሳካ ሁኔታ ተዘጋጅቷል'
          : 'Accommodation letter generated successfully'
      );
    } catch (err: any) {
      console.error('[TranslatorPage Error]:', err);
      setError(err.message || 'Something went wrong while generating the request');
      announce(
        language === 'am'
          ? 'የማመቻቸት ደብዳቤውን ማመንጨት አልተቻለም'
          : 'Failed to generate accommodation letter'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setLetter(null);
    setError(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="p-2.5 rounded-lg bg-amber-100 text-amber-800">
          <FileCheck className="w-6 h-6" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {language === 'am'
              ? 'የማመቻቸት ጥያቄ አርቃቂ (Accommodation Translator)'
              : 'Accommodation Translator'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {language === 'am'
              ? 'የሥራና የፈተና ማመቻቸት ፍላጎቶችዎን በኢትዮጵያ አዋጅ ቁጥር 568/2008 እና 1156/2019 መሠረት ወደ ሕጋዊ ደብዳቤ ይቀይሩ'
              : 'Translate everyday accommodation needs into professional requests grounded in Ethiopian Proclamations 568/2008 & 1156/2019'}
          </p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-900 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-sm font-semibold">
              {language === 'am' ? 'ስህተት ተከስቷል' : 'Generation Error'}
            </p>
            <p className="text-sm text-rose-800">{error}</p>
          </div>
        </div>
      )}

      {/* Main Content: Wizard or Draft Editor */}
      {!letter ? (
        <AccommodationWizard onGenerate={handleGenerate} isLoading={isLoading} />
      ) : (
        <DraftEditor letter={letter} onReset={handleReset} />
      )}
    </div>
  );
}
