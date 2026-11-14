'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  ArrowRight,
  ShieldCheck,
  MapPin,
} from 'lucide-react';
import type { OpportunityAnalysisData } from '@/lib/validators/decoder.schema';
import { ChecklistExport } from './checklist-export';
import { useAccessibility } from '@/hooks/use-accessibility';

export function AnalysisView({ data }: { data: OpportunityAnalysisData }) {
  const { language } = useAccessibility();
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'barriers' | 'roadmap'>('overview');

  const allDocuments = Array.from(
    new Set(data.applicationSteps.flatMap((s) => s.requiredDocuments))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Overview Header Banner */}
      <div className="bg-card border-2 border-primary/40 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-100 text-primary border border-blue-200">
                {language === 'am' ? 'የተተነተነ ዕድል' : 'Decoded Opportunity'}
              </span>
              {data.isAccessibleEmployer && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{language === 'am' ? 'አካታች ቀጣሪ' : 'Inclusive Employer'}</span>
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground">
              {data.roleTitle}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-2">
              <span className="flex items-center gap-1 font-semibold text-foreground">
                <Building2 className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                {data.organization}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                {data.location}
              </span>
              <span className="flex items-center gap-1 font-bold text-amber-700">
                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                {language === 'am' ? 'ማብቂያ ቀን፡' : 'Deadline:'} {data.deadline || 'Not Specified'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:items-end justify-center shrink-0">
            <span className="text-[11px] text-muted-foreground font-semibold">
              {language === 'am' ? 'የግምገማ እርግጠኝነት' : 'Analysis Confidence'}
            </span>
            <span className="text-lg font-black text-emerald-700">
              {Math.round(data.confidenceScore * 100)}%
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border gap-2 overflow-x-auto" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              activeTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {language === 'am' ? 'አጠቃላይ ማብራሪያ (Overview)' : 'Overview'}
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'skills'}
            onClick={() => setActiveTab('skills')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              activeTab === 'skills'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {language === 'am' ? 'የክህሎት መመዘኛዎች (Requirements)' : 'Requirements & Skills'}
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'barriers'}
            onClick={() => setActiveTab('barriers')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              activeTab === 'barriers'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {language === 'am' ? 'ተደራሽነትና ማነቆዎች (Barriers)' : 'Accessibility & Barriers'}
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'roadmap'}
            onClick={() => setActiveTab('roadmap')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              activeTab === 'roadmap'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {language === 'am' ? 'የማመልከቻ ቅደም-ተከተል (Roadmap)' : 'Application Roadmap'}
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="pt-4 space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                {language === 'am' ? 'ቀላልና ግልፅ ማብራሪያ (አማርኛ)' : 'Plain-Language Summary (Amharic)'}
              </h3>
              <p className="text-sm text-foreground leading-relaxed">
                {data.summaryPlainLanguageAm}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                {language === 'am' ? 'ቀላልና ግልፅ ማብራሪያ (English)' : 'Plain-Language Summary (English)'}
              </h3>
              <p className="text-sm text-foreground leading-relaxed">
                {data.summaryPlainLanguageEn}
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Skills & Requirements */}
        {activeTab === 'skills' && (
          <div className="pt-4 space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              {language === 'am' ? 'ዋና ዋና የክህሎት መመዘኛዎች' : 'Core Qualifications & Skill Breakdown'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.keyRequirements.map((req, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl border border-border bg-background shadow-xs flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-bold text-sm text-foreground">{req.skill}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        req.isMandatory
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {req.isMandatory
                        ? language === 'am' ? 'ግዴታ' : 'Mandatory'
                        : language === 'am' ? 'ተመራጭ' : 'Preferred'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                    {req.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Accessibility & Barriers */}
        {activeTab === 'barriers' && (
          <div className="pt-4 space-y-4">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {language === 'am' ? 'የተለዩ ማነቆዎችና መፍትሔዎች' : 'Identified Barriers & Mitigations'}
              </h3>
              {data.potentialBarriers.map((bar, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border-l-4 border-amber-500 bg-amber-50/60 border border-amber-200 text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-2 mb-1.5 font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
                    <span>{bar.barrier}</span>
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded bg-amber-200 font-extrabold uppercase">
                      {bar.category}
                    </span>
                  </div>
                  <p className="text-xs text-amber-950 font-medium leading-relaxed pl-6">
                    <span className="font-bold">{language === 'am' ? 'የመፍትሔ ምክር፡ ' : 'Mitigation Advice: '}</span>
                    {bar.mitigation}
                  </p>
                </div>
              ))}
            </div>

            {/* Accommodation Tips */}
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200">
              <h3 className="text-xs font-extrabold text-primary mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                <span>{language === 'am' ? 'የማመቻቸት ጥያቄ ምክሮች' : 'Recommended Accommodation Requests'}</span>
              </h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-800 leading-relaxed">
                {data.accommodationTips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>

              {/* Call-to-action button to draft letter */}
              <div className="mt-4 pt-3 border-t border-blue-200 flex justify-end">
                <Link
                  href="/translator"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary shadow-sm"
                >
                  <FileCheck2 className="w-4 h-4" aria-hidden="true" />
                  <span>{language === 'am' ? 'የማመቻቸት ጥያቄ ደብዳቤ አዘጋጅ' : 'Draft Accommodation Request Letter'}</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Roadmap & Checklist */}
        {activeTab === 'roadmap' && (
          <div className="pt-4 space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              {language === 'am' ? 'የማመልከቻ ቅደም-ተከተል ደረጃዎች' : 'Step-by-Step Application Steps'}
            </h3>
            <div className="space-y-3">
              {data.applicationSteps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-4 rounded-xl border border-border bg-background flex items-start gap-3 shadow-xs"
                >
                  <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-black shrink-0">
                    {step.stepNumber}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground leading-relaxed">
                      {step.instruction}
                    </p>
                    {step.requiredDocuments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {step.requiredDocuments.map((doc, docIdx) => (
                          <span
                            key={docIdx}
                            className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium border border-slate-200"
                          >
                            {doc}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Checklist */}
            <ChecklistExport items={allDocuments} roleTitle={data.roleTitle} />
          </div>
        )}
      </div>
    </div>
  );
}

