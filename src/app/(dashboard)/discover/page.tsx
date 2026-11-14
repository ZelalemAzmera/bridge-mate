'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Bell,
  Sparkles,
  Loader2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { useAccessibility } from '@/hooks/use-accessibility';
import { useLiveAnnouncer } from '@/hooks/use-live-announcer';
import { JobCard } from '@/components/jobs/job-card';
import { JobFilterBar, type JobFilterState } from '@/components/jobs/job-filter-bar';
import { SmsAlertModal } from '@/components/jobs/sms-alert-modal';
import type { JobOpportunity } from '@/lib/db/schema';

export default function DiscoverPage() {
  const { language } = useAccessibility();
  const { announce } = useLiveAnnouncer();

  const [jobs, setJobs] = useState<JobOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const [filters, setFilters] = useState<JobFilterState>({
    query: '',
    isRemote: false,
    disabilityFriendly: false,
    category: 'all',
  });

  const fetchJobs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.query.trim()) params.set('query', filters.query.trim());
      if (filters.isRemote) params.set('isRemote', 'true');
      if (filters.disabilityFriendly) params.set('disabilityFriendly', 'true');
      if (filters.category && filters.category !== 'all') {
        params.set('category', filters.category);
      }

      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to load opportunities');
      }

      const json = await res.json();
      setJobs(json.data?.jobs || []);
    } catch (err: any) {
      console.error('[DiscoverPage Error]:', err);
      setError(err.message || 'Error fetching jobs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      query: '',
      isRemote: false,
      disabilityFriendly: false,
      category: 'all',
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100 text-primary">
            <Briefcase className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {language === 'am'
                ? 'የሥራ ዕድሎችና ማሳወቂያዎች (Accessible Opportunities)'
                : 'Accessible Opportunities & Job Alerts'}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {language === 'am'
                ? 'በኢትዮጵያ ውስጥ ያሉ ተደራሽ የሥራ ዕድሎችን ያስሱ፤ አዳዲስ ሲወጡ በSMS ማሳወቂያ ያግኙ'
                : 'Explore inclusive Ethiopian employment opportunities verified for accessibility'}
            </p>
          </div>
        </div>

        {/* Subscribe Trigger */}
        <button
          onClick={() => setIsAlertModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition shadow"
        >
          <Bell className="w-4 h-4" />
          <span>
            {language === 'am' ? 'የSMS ማሳወቂያ ክፈት' : 'Subscribe to SMS Alerts'}
          </span>
        </button>
      </div>

      {/* Filter Bar */}
      <JobFilterBar
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleResetFilters}
      />

      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-900 flex items-center justify-between text-xs"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchJobs}
            className="font-bold underline hover:no-underline"
          >
            {language === 'am' ? 'እንደገና ሞክር' : 'Retry'}
          </button>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          {language === 'am'
            ? `${jobs.length} የሥራ ዕድሎች ተገኝተዋል`
            : `Showing ${jobs.length} opportunities`}
        </span>

        {isLoading && (
          <span className="flex items-center gap-1.5 text-primary">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            {language === 'am' ? 'በመጫን ላይ...' : 'Updating...'}
          </span>
        )}
      </div>

      {/* Job Cards Grid */}
      {isLoading && jobs.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">
            {language === 'am'
              ? 'ተደራሽ የሥራ ዕድሎችን በመፈለግ ላይ...'
              : 'Fetching verified inclusive jobs...'}
          </p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-slate-50/50 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-muted-foreground flex items-center justify-center mx-auto">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-foreground">
            {language === 'am' ? 'ምንም የሥራ ዕድል አልተገኘም' : 'No matching opportunities found'}
          </h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {language === 'am'
              ? 'የመረጧቸውን ማጣሪያዎች ይቀይሩ ወይም ሁሉንም የሥራ ዓይነቶች ይመልከቱ'
              : 'Try clearing your search query or removing the remote-only filter'}
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-lg bg-card border border-border text-xs font-semibold hover:bg-slate-100 transition"
          >
            {language === 'am' ? 'ማጣሪያዎችን አጥፋ' : 'Reset Filters'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {/* SMS Alert Modal */}
      <SmsAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
      />
    </div>
  );
}
