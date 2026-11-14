'use client';

import React, { useState } from 'react';
import { useAccessibility } from '@/hooks/use-accessibility';
import { useLiveAnnouncer } from '@/hooks/use-live-announcer';
import { FileSearch, Sparkles, RefreshCcw } from 'lucide-react';
import { FileUploadDropzone } from '@/components/decoder/file-upload-dropzone';
import { AnalysisView } from '@/components/decoder/analysis-view';
import type { OpportunityAnalysisData } from '@/lib/validators/decoder.schema';

export default function DecoderPage() {
  const { language } = useAccessibility();
  const { announce } = useLiveAnnouncer();
  const [analysis, setAnalysis] = useState<OpportunityAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAnalyzeText = async (text: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    announce(
      language === 'am'
        ? 'የሥራ ማስታወቂያ ትንተና ተጀምሯል...'
        : 'Analyzing job announcement requirements...'
    );

    if (text.trim().length < 10) {
      setErrorMessage(
        language === 'am'
          ? 'እባክዎ ቢያንስ 10 ፊደላት ያለው የሥራ ማስታወቂያ ጽሑፍ ያስገቡ ወይም "የናሙና ማስታወቂያ ሙላ" የሚለውን ይጫኑ።'
          : 'Please enter at least 10 characters of job description or click "Use Sample Vacancy".'
      );
      announce(
        language === 'am' ? 'እባክዎ ረዘም ያለ የሥራ ማስታወቂያ ያስገቡ' : 'Please provide a longer job notice',
        'assertive'
      );
      return;
    }

    try {
      const response = await fetch('/api/decoder/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: text,
          language,
        }),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        const specificError =
          errorJson.details?.fieldErrors?.rawText?.[0] ||
          errorJson.error ||
          'Failed to analyze job vacancy notice.';
        throw new Error(specificError);
      }

      const res = await response.json();
      setAnalysis(res.data);
      announce(
        language === 'am'
          ? 'የሥራ ዕድሉ ተተንትኖ ዝግጁ ሆኗል'
          : 'Opportunity decoded successfully'
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during analysis.');
      announce(
        language === 'am' ? 'የትንተና ስህተት አጋጥሟል' : 'Error decoding opportunity',
        'assertive'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
            <FileSearch className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              {language === 'am' ? 'የሥራ ዕድል መፍቻ (Opportunity Decoder)' : 'Opportunity Decoder'}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {language === 'am'
                ? 'የሥራ ማስታወቂያዎችን ወደ ግልፅ አማርኛ፣ የክህሎት መመዘኛዎችና የተደራሽነት ማነቆ ትንተና ይፍቱ'
                : 'Decode job notices into plain-language requirements and disability barrier analyses'}
            </p>
          </div>
        </div>

        {analysis && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-xs font-bold bg-background hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs"
          >
            <RefreshCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{language === 'am' ? 'አዲስ ማስታወቂያ ፍታ' : 'Decode Another Notice'}</span>
          </button>
        )}
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-100 text-red-900 border border-red-300 text-sm font-semibold"
        >
          {errorMessage}
        </div>
      )}

      {/* Main Content Area */}
      {!analysis ? (
        <div className="space-y-4">
          <FileUploadDropzone
            onTextExtracted={handleAnalyzeText}
            isLoading={isLoading}
          />
        </div>
      ) : (
        <AnalysisView data={analysis} />
      )}
    </div>
  );
}
