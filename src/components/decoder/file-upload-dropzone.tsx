'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { useAccessibility } from '@/hooks/use-accessibility';
import { useLiveAnnouncer } from '@/hooks/use-live-announcer';

export interface FileUploadDropzoneProps {
  onTextExtracted: (text: string) => void;
  isLoading?: boolean;
}

export function FileUploadDropzone({
  onTextExtracted,
  isLoading = false,
}: FileUploadDropzoneProps) {
  const { language } = useAccessibility();
  const { announce } = useLiveAnnouncer();
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [rawText, setRawText] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleNotice =
    language === 'am'
      ? `የሥራ መደብ፡ የዳታ ኢንትሪና የደንበኞች ድጋፍ ባለሙያ
ድርጅት፡ አካታች ቴክኖሎጂ ኢትዮጵያ
ቦታ፡ አዲስ አበባ / የርቀት ሥራ (Remote)
የማመልከቻ ማብቂያ ቀን፡ 2026-12-31
መመዘኛዎች፡
- በመረጃ አያያዝ፣ በኮምፒውተር ወይም ተዛማጅ የዲፕሎማ/ዲግሪ ያለው/ያላት
- የመንጃ ፈቃድ ያለው (ለቢሮ ሥራ)
- ጥሩ የመግባባት ችሎታና በስክሪን አንባቢ መጠቀም መቻል
ማመልከቻ፡ ሲቪ እና የትምህርት ማስረጃ በኢሜይል recruitment@inclusive.et ይላኩ።`
      : `Position: Remote Data Entry & Catalog Specialist
Organization: Inclusive Technologies Ethiopia
Location: Addis Ababa / 100% Remote
Deadline: 2026-12-31
Requirements:
- Diploma or Degree in Computer Science, IT, or related fields.
- Must possess driver's license for periodic coordination.
- Demonstrated proficiency in screen reading tools, digital document handling, and accessible portals.
Application: Submit CV and credentials to recruitment@inclusive-tech.et before deadline.`;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    announce(language === 'am' ? 'ፋይል በመጫን ላይ ነው...' : 'Uploading file for analysis...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/decoder/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to extract text from file.');
      }

      const data = await res.json();
      announce(language === 'am' ? 'ፋይሉ ተነቧል' : 'File text extracted successfully');
      onTextExtracted(data.extractedText);
    } catch (err: any) {
      setUploadError(err.message || 'Error processing file.');
      announce(language === 'am' ? 'የፋይል ንባብ ስህተት' : 'File processing error', 'assertive');
    } finally {
      setIsUploading(false);
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;
    onTextExtracted(rawText.trim());
  };

  const loadSample = () => {
    setRawText(sampleNotice);
  };

  return (
    <div className="bg-card border-2 border-border rounded-2xl p-6 shadow-sm">
      {/* Mode Switch Tabs */}
      <div className="flex border-b border-border mb-6 gap-2" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'upload'}
          onClick={() => setActiveTab('upload')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            activeTab === 'upload'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          {language === 'am' ? 'ሰነድ መጫኛ (PDF / ምስል)' : 'Upload Document (PDF / Image)'}
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'paste'}
          onClick={() => setActiveTab('paste')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            activeTab === 'paste'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          {language === 'am' ? 'ጽሁፍ መለጠፊያ (ቀጥታ)' : 'Paste Text Directly (Low-Bandwidth)'}
        </button>
      </div>

      {uploadError && (
        <div
          role="alert"
          className="mb-4 p-3 rounded-lg bg-red-100 text-red-800 border border-red-300 text-sm flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" aria-hidden="true" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Tab 1: File Upload */}
      {activeTab === 'upload' && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-3 border-dashed rounded-xl p-8 text-center transition-colors flex flex-col items-center justify-center min-h-[220px] ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.txt,.md"
            className="sr-only"
            onChange={handleFileChange}
            id="file-upload-input"
          />

          <div className="w-14 h-14 rounded-full bg-blue-100 text-primary flex items-center justify-center mb-3">
            {isUploading || isLoading ? (
              <Loader2 className="w-7 h-7 animate-spin" aria-hidden="true" />
            ) : (
              <UploadCloud className="w-7 h-7" aria-hidden="true" />
            )}
          </div>

          <h2 className="text-base font-bold text-foreground mb-1">
            {language === 'am'
              ? 'የሥራ ማስታወቂያ ሰነድ እዚህ ይጎትቱ ወይም ይምረጡ'
              : 'Drag & drop your job announcement document here'}
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            PDF, PNG, JPG, or TXT (Max 10MB)
          </p>

          <button
            type="button"
            id="browse-file-btn"
            disabled={isUploading || isLoading}
            onClick={() => fileInputRef.current?.click()}
            aria-label={
              language === 'am'
                ? 'ፋይል ከኮምፒውተር ለመምረጥ እዚህ ይጫኑ (የመጎተት አማራጭ - WCAG 2.2)'
                : 'Browse and select file from computer (Single-click alternative to dragging - WCAG 2.2)'
            }
            className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary shadow-sm"
          >
            {language === 'am' ? 'ፋይል ከኮምፒውተር ይምረጡ' : 'Browse Local File'}
          </button>
          <span className="text-[11px] text-muted-foreground mt-2">
            {language === 'am'
              ? 'መጎተት ላልቻሉ ተጠቃሚዎች ነጠላ ጠቅታ (Single Click) አማራጭ'
              : 'Single-click alternative for users unable to perform dragging movements'}
          </span>
        </div>
      )}

      {/* Tab 2: Paste Raw Text */}
      {activeTab === 'paste' && (
        <form onSubmit={handlePasteSubmit} className="space-y-4">
          <div className="flex justify-between items-center">
            <label htmlFor="raw-job-text" className="text-xs font-bold text-foreground">
              {language === 'am' ? 'የሥራ ማስታወቂያውን ጽሁፍ እዚህ ይለጥፉ' : 'Job Vacancy Announcement Text'}
            </label>
            <button
              type="button"
              onClick={loadSample}
              className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{language === 'am' ? 'የሙከራ ማስታወቂያ ሙላ' : 'Load Sample Notice'}</span>
            </button>
          </div>

          <textarea
            id="raw-job-text"
            rows={7}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={
              language === 'am'
                ? 'የሥራውን መደብ፣ መመዘኛዎች፣ አድራሻና ማመልከቻ መመሪያዎችን እዚህ ይለጥፉ...'
                : 'Paste the entire vacancy announcement text including title, requirements, and deadlines...'
            }
            className="w-full rounded-xl border-2 border-border p-3 text-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary font-sans leading-relaxed text-foreground bg-background"
          />

          <button
            type="submit"
            disabled={!rawText.trim() || isLoading}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary shadow-sm flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>{language === 'am' ? 'ዕድሉ በመፈታት ላይ ነው...' : 'Decoding Opportunity...'}</span>
              </>
            ) : (
              <span>{language === 'am' ? 'ዕድሉን ፍታ (Decode Opportunity)' : 'Decode Opportunity'}</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

