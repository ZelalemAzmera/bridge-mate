'use client';

import React, { useEffect, useState } from 'react';

export function LiveAnnouncer() {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');

  useEffect(() => {
    function handleAnnouncement(e: Event) {
      const customEvent = e as CustomEvent<{ message: string; politeness: 'polite' | 'assertive' }>;
      if (!customEvent.detail) return;

      const { message, politeness } = customEvent.detail;
      if (politeness === 'assertive') {
        setAssertiveMessage('');
        setTimeout(() => setAssertiveMessage(message), 50);
      } else {
        setPoliteMessage('');
        setTimeout(() => setPoliteMessage(message), 50);
      }
    }

    window.addEventListener('bridgemate-announce', handleAnnouncement);
    return () => {
      window.removeEventListener('bridgemate-announce', handleAnnouncement);
    };
  }, []);

  return (
    <>
      <div
        id="a11y-live-polite"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        data-testid="live-polite"
      >
        {politeMessage}
      </div>
      <div
        id="a11y-live-assertive"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        data-testid="live-assertive"
      >
        {assertiveMessage}
      </div>
    </>
  );
}

