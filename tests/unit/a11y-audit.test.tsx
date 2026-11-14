// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import axe from 'axe-core';
import { SkipLink } from '@/components/layout/skip-link';
import { AccessibilityBar } from '@/components/layout/accessibility-bar';
import { LiveAnnouncer } from '@/components/layout/live-announcer';
import { JobCard } from '@/components/jobs/job-card';
import { ConsentModal } from '@/components/support/consent-modal';
import type { JobOpportunity } from '@/lib/db/schema';

describe('WCAG 2.2 Level AA Automated Accessibility Audits (Milestone 8)', () => {
  beforeEach(() => {
    localStorage.clear();
    HTMLCanvasElement.prototype.getContext = () => null as any;
  });

  it('verifies SkipLink has zero critical accessibility violations', async () => {
    const { container } = render(
      <div>
        <SkipLink />
        <main id="main-content">
          <h1>Main Content Heading</h1>
        </main>
      </div>
    );

    const results = await axe.run(container, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa'],
      },
    });

    const criticalOrSerious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(criticalOrSerious).toEqual([]);
  });

  it('verifies AccessibilityBar has valid ARIA landmarks, roles and labels', async () => {
    const { container } = render(
      <main>
        <AccessibilityBar />
      </main>
    );

    const results = await axe.run(container, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa'],
      },
    });

    const criticalOrSerious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(criticalOrSerious).toEqual([]);
  });

  it('verifies LiveAnnouncer exposes polite and assertive aria-live regions', () => {
    const { container } = render(<LiveAnnouncer />);
    const politeRegion = container.querySelector('[aria-live="polite"]');
    const assertiveRegion = container.querySelector('[aria-live="assertive"]');

    expect(politeRegion).not.toBeNull();
    expect(assertiveRegion).not.toBeNull();
    expect(politeRegion?.getAttribute('aria-atomic')).toBe('true');
    expect(assertiveRegion?.getAttribute('aria-atomic')).toBe('true');
  });

  it('verifies JobCard renders valid semantic article and button roles', async () => {
    const sampleJob: JobOpportunity = {
      id: 'job-sample-1',
      title: 'Accessible Front-End Engineer',
      employerName: 'Inclusive Tech Hub',
      location: 'Addis Ababa',
      description: 'Building accessible software for jobseekers with disabilities.',
      disabilityTags: ['screen_reader', 'mobility'],
      sourceUrl: 'https://example.com/job',
      rawContent: 'Job description text',
      parsedData: {
        title: 'Accessible Front-End Engineer',
        organization: 'Inclusive Tech Hub',
        location: 'Addis Ababa',
        isRemote: true,
        accessibilityFeatures: ['100% Screen Reader Tested', 'Wheelchair Ramp'],
      },
      language: 'en',
      deadline: new Date('2026-12-31'),
      status: 'open',
      createdAt: new Date(),
    };

    const { container } = render(
      <main>
        <JobCard job={sampleJob} />
      </main>
    );

    const results = await axe.run(container, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa'],
      },
    });

    const criticalOrSerious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(criticalOrSerious).toEqual([]);
  });

  it('verifies ConsentModal conforms to accessible modal dialog pattern', async () => {
    const { container } = render(
      <ConsentModal
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    );

    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    expect(dialog?.getAttribute('aria-labelledby')).toBe('consent-title');

    const results = await axe.run(container, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa'],
      },
    });

    const criticalOrSerious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(criticalOrSerious).toEqual([]);
  });
});
