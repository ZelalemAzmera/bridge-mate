import { NextRequest, NextResponse } from 'next/server';

function generateAccommodationLetter(params: {
  accommodation_type: string;
  job_title?: string;
  organization?: string;
  learner_name?: string;
}) {
  const { accommodation_type, job_title, organization, learner_name } = params;
  const name = learner_name || 'The Applicant';
  const date = new Date().toLocaleDateString('en-ET', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const letter_text = `
${date}

To: Human Resources Department
${organization || 'Hiring Organisation'}
Re: Reasonable Accommodation Request — ${job_title || 'Applied Position'}

Dear Hiring Manager,

I am writing to formally request a reasonable accommodation in connection with my application and/or employment for the position of ${job_title || 'the advertised role'} at ${organization || 'your organisation'}.

Specifically, I am requesting: ${accommodation_type}.

This request is made pursuant to the following applicable Ethiopian legal instruments:

1. Ethiopian Labour Proclamation No. 1156/2019, Article 29 — which obliges employers to provide reasonable accommodation to employees and applicants with disabilities without imposing disproportionate burden, and expressly prohibits discrimination in recruitment, selection, and terms of employment.

2. Persons with Disabilities Right to Employment Proclamation No. 568/2008 — which guarantees the right of persons with disabilities to work on an equal basis with others, and mandates that employers take positive steps to remove structural, attitudinal, and communicational barriers to equal participation.

No medical history, diagnosis, or clinical documentation is required to support this request under either proclamation. This accommodation request is functional and job-related. I remain fully committed to meeting all core performance expectations of the role.

I kindly request written confirmation of this accommodation within 10 business days.

Yours sincerely,
${name}

---
ZERO MEDICAL DISCLOSURE NOTICE: This letter intentionally omits any reference to medical records, diagnosis, or clinical details, consistent with the privacy protections embedded in Proclamation No. 568/2008 and the UN CRPD (ratified by Ethiopia).
`.trim();

  const letter_html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Accommodation Request Letter</title></head>
<body style="font-family:Arial,sans-serif;max-width:700px;margin:2rem auto;line-height:1.6;color:#111;">
  <p><strong>${date}</strong></p>
  <p><strong>To:</strong> Human Resources Department<br>${organization || 'Hiring Organisation'}<br>
     <strong>Re:</strong> Reasonable Accommodation Request — ${job_title || 'Applied Position'}</p>
  <p>Dear Hiring Manager,</p>
  <p>I am writing to formally request a reasonable accommodation for the position of <strong>${job_title || 'the advertised role'}</strong> at <strong>${organization || 'your organisation'}</strong>.</p>
  <p>Specifically, I am requesting: <strong>${accommodation_type}</strong>.</p>
  <p>This request is made pursuant to:</p>
  <ol>
    <li><strong>Ethiopian Labour Proclamation No. 1156/2019, Article 29</strong></li>
    <li><strong>Persons with Disabilities Right to Employment Proclamation No. 568/2008</strong></li>
  </ol>
  <p><strong>No medical disclosure required or included.</strong></p>
  <p>Yours sincerely,<br><strong>${name}</strong></p>
  <hr>
  <p style="font-size:0.85em;color:#555;"><strong>ZERO MEDICAL DISCLOSURE NOTICE</strong></p>
</body>
</html>`;

  return {
    letter_text,
    letter_html,
    citations: [
      {
        law: 'Ethiopian Labour Proclamation No. 1156/2019',
        article: 'Article 29',
        summary: 'Obliges employers to provide reasonable accommodation; prohibits disability-based discrimination.',
      },
      {
        law: 'Persons with Disabilities Right to Employment Proclamation No. 568/2008',
        article: 'Arts. 4, 5, 6',
        summary: 'Guarantees equal employment rights; zero medical disclosure requirement.',
      },
      {
        law: 'UN Convention on the Rights of Persons with Disabilities (CRPD)',
        article: 'Article 27',
        summary: 'Ratified by Ethiopia; affirms the right to work on equal basis.',
      },
    ],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accommodation_type, job_title, organization, learner_name } = body ?? {};

    if (!accommodation_type) {
      return NextResponse.json(
        { status: 'error', message: 'accommodation_type is required' },
        { status: 400 }
      );
    }

    const result = generateAccommodationLetter({ accommodation_type, job_title, organization, learner_name });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', message: err?.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}
