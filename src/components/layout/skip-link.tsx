'use client';

import React from 'react';

export function SkipLink() {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.setAttribute('tabIndex', '-1');
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href="#main-content"
      onClick={handleClick}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-3 focus:bg-primary focus:text-white focus:font-bold focus:rounded-md focus:shadow-2xl focus:outline-none focus:ring-4 focus:ring-amber-400"
    >
      Skip to main content / ወደ ዋናው ይዘት ይለፉ
    </a>
  );
}

