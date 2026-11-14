'use client';

import React, { useState } from 'react';
import {
  Bell,
  CheckCircle,
  MessageSquare,
  X,
  Loader2,
  AlertCircle,
  Phone,
} from 'lucide-react';
import { useAccessibility } from '@/hooks/use-accessibility';
import { useLiveAnnouncer } from '@/hooks/use-live-announcer';
import {
  ETHIOPIAN_PHONE_REGEX,
  type SubscribeAlertRequest,
} from '@/lib/validators/jobs.schema';

export interface SmsAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SmsAlertModal({ isOpen, onClose }: SmsAlertModalProps) {
  const { language } = useAccessibility();
  const { announce } = useLiveAnnouncer();

  const [phone, setPhone] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all']);
  const [channel, setChannel] = useState<'sms' | 'telegram' | 'web'>('sms');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', labelAm: 'ሁሉም የሥራ ዘርፎች', labelEn: 'All Categories' },
    { id: 'tech', labelAm: 'ቴክኖሎጂና ሶፍትዌር', labelEn: 'Technology & IT' },
    { id: 'customer_service', labelAm: 'የደንበኞች አገልግሎት', labelEn: 'Customer Support' },
    { id: 'data_entry', labelAm: 'መረጃ አያያዝ (Data Entry)', labelEn: 'Data Entry' },
    { id: 'administration', labelAm: 'አስተዳደርና ፋይናንስ', labelEn: 'Administration' },
  ];

  const toggleCategory = (id: string) => {
    if (id === 'all') {
      setSelectedCategories(['all']);
      return;
    }
    const filtered = selectedCategories.filter((c) => c !== 'all');
    if (filtered.includes(id)) {
      const next = filtered.filter((c) => c !== id);
      setSelectedCategories(next.length === 0 ? ['all'] : next);
    } else {
      setSelectedCategories([...filtered, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/[\s\-()]/g, '');

    if (!ETHIOPIAN_PHONE_REGEX.test(cleanPhone)) {
      setError(
        language === 'am'
          ? 'እባክዎ ትክክለኛ የኢትዮጵያ ስልክ ቁጥር ያስገቡ (ለምሳሌ 0911234567 ወይም +251911234567)'
          : 'Please enter a valid Ethiopian phone number (e.g., 0911234567 or +251911234567)'
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload: SubscribeAlertRequest = {
        phoneNumber: cleanPhone,
        channel,
        categories: selectedCategories,
        disabilityCategories: [],
        language: language === 'en' ? 'en' : 'am',
      };

      const res = await fetch('/api/jobs/alert/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || json.error || 'Failed to subscribe to alerts');
      }

      setIsSuccess(true);
      announce(
        language === 'am'
          ? 'ለሥራ ማሳወቂያ በተሳካ ሁኔታ ተመዝግበዋል'
          : 'Subscribed to job alerts successfully'
      );
    } catch (err: any) {
      console.error('[SmsAlertModal] Subscription error:', err);
      setError(err.message || 'Subscription failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
    >
      <div className="relative w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl p-6 sm:p-7 space-y-6">
        <button
          onClick={onClose}
          type="button"
          aria-label={language === 'am' ? 'ዝጋ' : 'Close'}
          className="absolute right-4 top-4 p-2 rounded-lg text-muted-foreground hover:bg-muted"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Bell className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h2 id="alert-modal-title" className="text-xl font-bold">
              {language === 'am'
                ? 'የሥራና የይዘት ማሳወቂያ (SMS & Telegram Alerts)'
                : 'Inclusive Job Alerts (SMS & Telegram)'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {language === 'am'
                ? 'ተደራሽና ተስማሚ የሥራ ዕድሎች ሲወጡ በSMS ወይም በቴሌግራም ወዲያውኑ ይድረስዎ'
                : 'Get instant alerts for accessible Ethiopian jobs via SMS or Telegram'}
            </p>
          </div>
        </div>

        {/* Channel Selection Toggle */}
        <div className="flex rounded-xl bg-muted p-1 gap-1" role="radiogroup" aria-label="Notification Channel">
          <button
            type="button"
            role="radio"
            aria-checked={channel === 'sms'}
            onClick={() => setChannel('sms')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition ${channel === 'sms'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            📱 SMS (የጽሑፍ መልእክት)
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={channel === 'telegram'}
            onClick={() => setChannel('telegram')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition ${channel === 'telegram'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            ✈️ Telegram (@BridgeMateAlertsBot)
          </button>
        </div>

        {isSuccess ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-emerald-950">
                {language === 'am' ? 'ምዝገባዎ ተጠናቋል!' : 'Subscription Activated!'}
              </h3>
              <p className="text-xs text-emerald-900 leading-relaxed max-w-sm mx-auto">
                {language === 'am'
                  ? `የማረጋገጫ መልእክት ወደ ${channel === 'telegram' ? 'ቴሌግራም' : phone} ተልኳል። አዳዲስ የሥራ ማስታወቂያዎች ሲወጡ ወዲያውኑ ይደርስዎታል።`
                  : `Confirmation alert dispatched to ${channel === 'telegram' ? 'Telegram' : phone}. You will receive new accessible opportunities matching your filters.`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-emerald-700 text-white font-semibold text-xs hover:bg-emerald-800 transition"
            >
              {language === 'am' ? 'ጨርስ' : 'Done'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div
                role="alert"
                className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-900 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Phone Input */}
            <div className="space-y-1.5">
              <label htmlFor="eth-phone" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {language === 'am' ? 'የኢትዮጵያ ስልክ ቁጥር (Mobile Number)' : 'Ethiopian Mobile Number'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="eth-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0911234567 or +251911234567"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {language === 'am'
                  ? 'የኢትዮ ቴሌኮም ወይም ሳፋሪኮም ስልክ ቁጥር ያስገቡ'
                  : 'Accepts Ethio Telecom or Safaricom 09... / 07... numbers'}
              </p>
            </div>

            {/* Categories */}
            <div className="space-y-1.5">
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {language === 'am' ? 'የሚፈልጓቸው የሥራ ዘርፎች' : 'Job Categories of Interest'}
              </span>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((c) => {
                  const isChecked = selectedCategories.includes(c.id);
                  return (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => toggleCategory(c.id)}
                      className={`p-2.5 rounded-xl text-left text-xs font-medium border transition flex items-center justify-between ${isChecked
                          ? 'border-primary bg-primary/5 text-primary font-bold'
                          : 'border-border bg-card text-muted-foreground hover:bg-slate-50'
                        }`}
                    >
                      <span>{language === 'am' ? c.labelAm : c.labelEn}</span>
                      {isChecked && <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-muted text-foreground transition"
              >
                {language === 'am' ? 'ሰርዝ' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isLoading || !phone.trim()}
                className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition shadow flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
                <span>{language === 'am' ? 'ይመዝገቡ (Subscribe)' : 'Subscribe via SMS'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

