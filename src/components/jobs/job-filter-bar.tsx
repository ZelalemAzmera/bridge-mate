'use client';

import React from 'react';
import { Search, Filter, Laptop, ShieldCheck, X } from 'lucide-react';
import { useAccessibility } from '@/hooks/use-accessibility';

export interface JobFilterState {
  query: string;
  isRemote: boolean;
  disabilityFriendly: boolean;
  category: string;
}

export interface JobFilterBarProps {
  filters: JobFilterState;
  onFilterChange: (filters: JobFilterState) => void;
  onReset: () => void;
}

export function JobFilterBar({
  filters,
  onFilterChange,
  onReset,
}: JobFilterBarProps) {
  const { language } = useAccessibility();

  const categories = [
    { id: 'all', labelAm: 'ሁሉም ዘርፎች', labelEn: 'All Categories' },
    { id: 'tech', labelAm: 'ቴክኖሎጂና ሶፍትዌር', labelEn: 'Technology & IT' },
    { id: 'customer_service', labelAm: 'የደንበኞች አገልግሎት', labelEn: 'Customer Support' },
    { id: 'data_entry', labelAm: 'መረጃ አያያዝ (Data Entry)', labelEn: 'Data Entry' },
    { id: 'administration', labelAm: 'አስተዳደርና ፋይናንስ', labelEn: 'Administration' },
  ];

  return (
    <div
      role="search"
      aria-label={language === 'am' ? 'የሥራ መፈለጊያ ማጣሪያ' : 'Job search filters'}
      className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4"
    >
      {/* Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={filters.query}
          onChange={(e) => onFilterChange({ ...filters, query: e.target.value })}
          placeholder={
            language === 'am'
              ? 'የሥራ መደብ፣ ተቋም ወይም ቁልፍ ቃል ፈልግ...'
              : 'Search job title, employer, or keyword...'
          }
          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {filters.query && (
          <button
            onClick={() => onFilterChange({ ...filters, query: '' })}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Toggles & Categories */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Checkbox Toggles */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.isRemote}
              onChange={(e) =>
                onFilterChange({ ...filters, isRemote: e.target.checked })
              }
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="flex items-center gap-1.5 text-foreground">
              <Laptop className="w-3.5 h-3.5 text-emerald-600" />
              {language === 'am' ? 'የርቀት ሥራ ብቻ (Remote Only)' : 'Remote Only'}
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.disabilityFriendly}
              onChange={(e) =>
                onFilterChange({ ...filters, disabilityFriendly: e.target.checked })
              }
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="flex items-center gap-1.5 text-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              {language === 'am'
                ? 'ተደራሽነታቸው የተረጋገጠ (A11y Verified)'
                : 'A11y Verified Only'}
            </span>
          </label>
        </div>

        {/* Categories Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => {
            const isSelected = filters.category === cat.id;
            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => onFilterChange({ ...filters, category: cat.id })}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted text-muted-foreground border-border hover:bg-slate-100'
                }`}
              >
                {language === 'am' ? cat.labelAm : cat.labelEn}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

