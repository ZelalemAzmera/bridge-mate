import { generateObject } from 'ai';
import { getAIProvider, isLiveAIConfigured } from '@/lib/ai/providers';
import { TRANSLATOR_SYSTEM_PROMPT, buildTranslatorUserPrompt } from '@/lib/ai/prompts/translator-prompt';
import {
  GeneratedAccommodationLetterSchema,
  type GenerateAccommodationRequest,
  type GeneratedAccommodationLetter,
} from '@/lib/validators/translator.schema';
import { getRepository } from '@/lib/db';

export class AccommodationTranslatorService {
  /**
   * Generates a template-grounded bilingual letter when external AI keys are not available.
   */
  private static generateOfflineLetter(
    req: GenerateAccommodationRequest
  ): GeneratedAccommodationLetter {
    const employer = req.employerName || 'የቀጣሪ ድርጅት / Employer';
    const role = req.jobTitle ? `ለ${req.jobTitle} የሥራ መደብ` : 'ለተወዳደርኩበት የሥራ መደብ';
    const roleEn = req.jobTitle ? `for the position of ${req.jobTitle}` : 'for the applied position';

    const subjectAm = `ጉዳዩ፡ በኢትዮጵያ አዋጅ ቁጥር 568/2008 መሠረት ተገቢውን የማመቻቸት ድጋፍ (Reasonable Accommodation) ስለመጠየቅ`;
    const subjectEn = `Request for Reasonable Accommodation under Ethiopian Proclamation No. 568/2008 - ${req.candidateName}`;

    let specificAdjustmentAm = '';
    let specificAdjustmentEn = '';

    switch (req.functionalImpact) {
      case 'low_vision':
        specificAdjustmentAm = `የጽሁፍ ፈተናዎችና የቃለ-መጠይቅ ሰነዶች በትልቅ የፊደል መጠን (24pt) ወይም በዲጂታል ስክሪን-አንባቢ በሚያነበው ፎርማት (Accessible PDF/Word) 48 ሰዓት አስቀድሞ እንዲደርሰኝ።`;
        specificAdjustmentEn = `Provision of assessment materials and test documents in high-contrast large font (24pt) or accessible digital format (Word/PDF) 48 hours prior to the evaluation.`;
        break;
      case 'screen_reader':
        specificAdjustmentAm = `የፈተና ፖርታሉ ከNVDA ወይም JAWS ስክሪን አንባቢ ጋር ተኳሃኝ እንዲሆን እና በቁልፍ ሰሌዳ ብቻ (Keyboard-Only) እንዲሰራ ማመቻቸት።`;
        specificAdjustmentEn = `Ensuring online application platforms and assessment interfaces are 100% operable via keyboard and compatible with standard screen readers (NVDA / JAWS).`;
        break;
      case 'mobility':
        specificAdjustmentAm = `የፈተናው ወይም የቃለ-መጠይቁ አዳራሽ በምድር ወለል (Ground Floor) ወይም በአሳንሰር/ራምፕ ተደራሽ በሆነ ክፍል እንዲዘጋጅ።`;
        specificAdjustmentEn = `Scheduling in-person interviews and tests on accessible ground-floor premises equipped with step-free wheelchair ramp and elevator access.`;
        break;
      case 'deaf_hard_of_hearing':
        specificAdjustmentAm = `በቃለ-መጠይቁ ወቅት ብቁ የኢትዮጵያ የምልክት ቋንቋ አስተርጓሚ እንዲመደብ ወይም የጽሁፍ ቃለ-መጠይቅ አማራጭ እንዲዘጋጅ።`;
        specificAdjustmentEn = `Provision of a qualified Ethiopian Sign Language (EthSL) interpreter during the interview, or offering written real-time chat communication alternatives.`;
        break;
      default:
        specificAdjustmentAm = `የተገለጸውን ተደራሽነት ድጋፍ ማመቻቸት፡ "${req.specificNeed}"።`;
        specificAdjustmentEn = `Implementation of the requested functional workplace adjustment: "${req.specificNeed}".`;
    }

    const letterBodyAm = `ለ፡ ${employer} የሰው ኃይል አስተዳደር ክፍል\n` +
      `አዲስ አበባ፣ ኢትዮጵያ\n\n` +
      `${subjectAm}\n\n` +
      `ክቡራትና ክቡራን፣\n\n` +
      `እኔ አመልካች ${req.candidateName} ${role} ያመለከትኩ ስሆን፣ በምዘናውና በሥራ ሒደቱ ወቅት ያለብኝን ተጨባጭ የተደራሽነት ፍላጎት ከግምት ውስጥ በማስገባት የሚከተለው የማመቻቸት ድጋፍ እንዲደረግልኝ በአክብሮት እጠይቃለሁ፡\n\n` +
      `የተጠየቀው ማመቻቸት፡\n` +
      `• ${specificAdjustmentAm}\n` +
      `• ዝርዝር ፍላጎት፡ ${req.specificNeed}\n\n` +
      `ይህ ጥያቄ በኢትዮጵያ የአካል ጉዳተኞች የሥራ ስምሪት መብት አዋጅ ቁጥር 568/2008 አንቀጽ 6 እና በሠራተኛ ጉዳይ አዋጅ ቁጥር 1156/2019 በተደነገገው መሠረት እኩል የሥራ ዕድልንና ትክክለኛ የችሎታ ግምገማን ለማረጋገጥ የቀረበ ሕጋዊ ጥያቄ ነው።\n\n` +
      `ለቀና ትብብራችሁ አስቀድሜ እያመሰገንኩ፣ አስፈላጊውን ዝርዝር ለመወያየት ዝግጁ መሆኔን አረጋግጣለሁ።\n\n` +
      `ከአክብሮት ሰላምታ ጋር፣\n` +
      `${req.candidateName}\n` +
      `ስልክ / አድራሻ፡ [የእርስዎ ስልክ ቁጥር]`;

    const letterBodyEn = `To: Human Resources Department, ${employer}\n` +
      `Addis Ababa, Ethiopia\n\n` +
      `${subjectEn}\n\n` +
      `Dear Hiring Team,\n\n` +
      `I am writing to respectfully request reasonable workplace accommodations ${roleEn}. To ensure an equitable and accurate demonstration of my qualifications, I request the following functional adjustments:\n\n` +
      `Requested Accommodation:\n` +
      `• ${specificAdjustmentEn}\n` +
      `• Candidate Specification: "${req.specificNeed}"\n\n` +
      `This request is made in accordance with the Right to Employment of Persons with Disabilities Proclamation No. 568/2008 (Article 6) and the Ethiopian Labor Proclamation No. 1156/2019, which guarantee equal opportunity and affirmative accommodation measures for qualified individuals with disabilities.\n\n` +
      `I am available to collaborate with your team to coordinate these arrangements at your earliest convenience.\n\n` +
      `Sincerely,\n` +
      `${req.candidateName}\n` +
      `Contact Phone: [Your Phone Number]`;

    return {
      id: `draft-${Date.now()}`,
      subjectAm,
      subjectEn,
      letterBodyAm,
      letterBodyEn,
      statutoryCitations: [
        'Federal Democratic Republic of Ethiopia Proclamation No. 568/2008, Article 6 (Reasonable Accommodation)',
        'Ethiopian Labor Proclamation No. 1156/2019, Article 29 & 106 (Equal Opportunity & Protection)',
        'United Nations Convention on the Rights of Persons with Disabilities (UNCRPD), Article 27',
      ],
      practicalRecommendations: [
        'Send draft letter to employer HR at least 3 business days prior to scheduled interview/exam.',
        'Keep a signed copy or email delivery receipt for your application records.',
        'Be ready to describe practical software tools (e.g., NVDA, ZoomText, or EthSL interpreter preferences).',
      ],
      status: 'draft',
    };
  }

  /**
   * Generates a formal accommodation request letter.
   */
  public static async generateLetter(
    req: GenerateAccommodationRequest,
    userId?: string
  ): Promise<GeneratedAccommodationLetter> {
    let letter: GeneratedAccommodationLetter;

    if (isLiveAIConfigured()) {
      try {
        const { model } = getAIProvider();
        if (model) {
          const result = await generateObject({
            model,
            system: TRANSLATOR_SYSTEM_PROMPT,
            prompt: buildTranslatorUserPrompt(req),
            schema: GeneratedAccommodationLetterSchema,
          });
          letter = result.object;
        } else {
          letter = this.generateOfflineLetter(req);
        }
      } catch (err) {
        console.warn('[Translator Service] Live AI generation failed, falling back to template engine:', err);
        letter = this.generateOfflineLetter(req);
      }
    } else {
      letter = this.generateOfflineLetter(req);
    }

    // Persist to repository
    try {
      const repo = getRepository();
      const mappedContext: 'job_interview' | 'workplace' | 'education' | 'exam' =
        req.context === 'interview'
          ? 'job_interview'
          : req.context === 'exam'
          ? 'exam'
          : 'workplace';

      const saved = await repo.accommodations.create({
        userId: userId || null,
        roleTitle: req.jobTitle || 'Applicant',
        employerName: req.employerName || 'Employer',
        requestType: mappedContext,
        barrierCategory: req.functionalImpact,
        rawDescription: req.specificNeed,
        letterSubject: req.language === 'am' ? letter.subjectAm : letter.subjectEn,
        letterBody: req.language === 'am' ? letter.letterBodyAm : letter.letterBodyEn,
        generatedRequest: letter.letterBodyAm,
        language: req.language || 'am',
        status: 'draft',
      });
      letter.id = saved.id;
    } catch {
      // Non-fatal if DB insert fails in mock unit testing
    }

    return letter;
  }

  /**
   * Approves a generated accommodation request.
   */
  public static async approveAccommodation(
    id: string,
    status: 'approved' | 'sent' = 'approved'
  ): Promise<boolean> {
    try {
      const repo = getRepository();
      await repo.accommodations.update(id, { status });
      return true;
    } catch {
      return false;
    }
  }
}
