'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  Calendar,
  Sparkles,
  FileCheck,
  CheckCircle,
  Laptop,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAccessibility } from '@/hooks/use-accessibility';
import type { JobOpportunity } from '@/lib/db/schema';

export interface JobCardProps {
  job: JobOpportunity;
}

export function JobCard({ job }: JobCardProps) {
  const { language } = useAccessibility();

  const title = job.parsedData?.title || job.title || 'Job Opportunity';
  const org = job.parsedData?.organization || job.employerName || 'Inclusive Organization';
  const location = job.parsedData?.location || job.location || 'Addis Ababa, Ethiopia';
  const isRemote = job.parsedData?.isRemote || false;
  const a11yFeatures = job.parsedData?.accessibilityFeatures || job.disabilityTags || [];

  return (
    <article
      aria-label={title}
      className="group rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-primary/40 transition flex flex-col justify-between space-y-4"
    >
      <div className="space-y-3">
        {/* Badges Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {isRemote && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <Laptop className="w-3 h-3" />
              {language === 'am' ? 'የርቀት ሥራ (Remote)' : 'Remote Available'}
            </span>
          )}

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            <Building2 className="w-3 h-3" />
            {org}
          </span>

          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground ml-auto">
            <MapPin className="w-3.5 h-3.5" />
            {location}
          </span>
        </div>

        {/* Title & Description */}
        <div>
          <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            {job.description || job.rawContent?.slice(0, 160)}
          </p>
        </div>

        {/* Accessibility Features Verified Badges */}
        {a11yFeatures.length > 0 && (
          <div className="pt-1 space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              {language === 'am'
                ? 'የተረጋገጡ የተደራሽነት ምቾቶች (Inclusive Features)'
                : 'Verified Inclusive Workplace Features'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {a11yFeatures.map((feat, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-200"
                >
                  {feat}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
        <Link
          href={`/decoder`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded p-1"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{language === 'am' ? 'መስፈርቱን ፍታ (Decode)' : 'Decode Requirements'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <Link
          href={`/translator`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-slate-50 hover:bg-slate-100 text-foreground transition"
        >
          <FileCheck className="w-3.5 h-3.5 text-amber-600" />
          <span>
            {language === 'am' ? 'የማመቻቸት ጥያቄ አዘጋጅ' : 'Draft Accommodation'}
          </span>
        </Link>
      </div>
    </article>
  );
}

