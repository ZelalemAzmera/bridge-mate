'use client';

import React from 'react';
import { useAccessibility } from '@/hooks/use-accessibility';
import { BookOpen } from 'lucide-react';
import { ChatContainer } from '@/components/chat/chat-container';

export default function LearnPage() {
  const { language } = useAccessibility();

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100 text-primary border border-blue-200">
            <BookOpen className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {language === 'am' ? 'የትምህርት ረዳት (Learning Assistant)' : 'Learning Assistant'}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {language === 'am'
                ? 'በሥርዓተ-ትምህርትና ሕጎች የተደገፉ ትምህርታዊ ማብራሪያዎችን ያግኙ'
                : 'Grounded learning support for digital skills and disability employment rights'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Chat Area */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <ChatContainer />
      </div>
    </div>
  );
}
