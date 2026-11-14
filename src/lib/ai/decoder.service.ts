import { generateObject } from 'ai';
import { getAIProvider, isLiveAIConfigured } from '@/lib/ai/providers';
import { DECODER_SYSTEM_PROMPT, buildDecoderUserPrompt } from '@/lib/ai/prompts/decoder-prompt';
import {
  OpportunityAnalysisSchema,
  type OpportunityAnalysisData,
} from '@/lib/validators/decoder.schema';
import { getRepository } from '@/lib/db';

export class OpportunityDecoderService {
  /**
   * Performs rule-based extraction and barrier detection when running in offline/mock mode.
   */
  private static extractOfflineAnalysis(text: string): OpportunityAnalysisData {
    const isAmharic = /[\u1200-\u137F]/.test(text);

    // Heuristics for Title & Organization
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    const firstLine = lines[0] || 'Junior Software & Data Associate';
    const roleTitle = firstLine.slice(0, 80);
    const organization = lines.find((l) => /organization|employer|company|ድርጅት|ቀጣሪ/i.test(l))?.replace(/organization|employer|company|ድርጅት|ቀጣሪ/i, '').trim() || 'Inclusive Tech Ethiopia';

    // Heuristic for Deadline
    const deadlineMatch = text.match(/\b(202[4-9]-\d{2}-\d{2}|[A-Z][a-z]+ \d{1,2},? 202[4-9]|\d{1,2}\/\d{1,2}\/202[4-9])\b/);
    const deadline = deadlineMatch ? deadlineMatch[0] : '2026-12-31';

    // Barrier Detection
    const potentialBarriers: OpportunityAnalysisData['potentialBarriers'] = [];
    if (/driv(er'?s?|ing) license|መንጃ ፈቃድ|travel|መጓጓዝ|lift|lifting|stairs|መወጣጫ/i.test(text)) {
      potentialBarriers.push({
        barrier: isAmharic
          ? 'የመንጃ ፈቃድ ወይም የመስክ ጉዞ መስፈርት ለእንቅስቃሴ ውስንነት ላለባቸው እጩዎች ፈታኝ ሊሆን ይችላል።'
          : 'Driving license or heavy physical travel requirement may restrict mobility-impaired candidates.',
        category: 'physical',
        severity: 'high',
        mitigation: isAmharic
          ? 'ለቢሮ ሥራ የመንጃ ፈቃድ አስፈላጊ ካልሆነ፣ በአዋጅ 568/2008 መሠረት የርቀት ሥራ ወይም አማራጭ የትራንስፖርት ድጋፍ መጠየቅ ይቻላል።'
          : 'Request reasonable accommodation under Proclamation 568/2008 for remote task delivery if driving is non-essential.',
      });
    }

    if (/print|paper|visual|በአካል ቀርቦ/i.test(text)) {
      potentialBarriers.push({
        barrier: isAmharic
          ? 'የወረቀት ሰነዶችን በአካል የማቅረብ ግዴታ ለአይነስውራን ወይም ለእይታ ውስንነት ላላቸው እጩዎች ማነቆ ሊሆን ይችላል።'
          : 'Physical paper file submission requirement poses accessibility hurdles for blind and low-vision candidates.',
        category: 'sensory',
        severity: 'medium',
        mitigation: isAmharic
          ? 'ሰነዶችን በኢሜይል ወይም በዲጂታል ፎርማት ለማቅረብ ፈቃድ መጠየቅ።'
          : 'Request permission to submit digital, screen-reader accessible documents via email or online portal.',
      });
    }

    if (potentialBarriers.length === 0) {
      potentialBarriers.push({
        barrier: isAmharic
          ? 'የተለየ ግልፅ አካላዊ ማነቆ አልተገኘም። የሥራ ቦታው አካላዊ ተደራሽነት (Ramp/Elevator) ማረጋገጥ ይመከራል።'
          : 'No explicit physical barriers identified. Confirming physical building accessibility (elevators/ramps) is advised.',
        category: 'physical',
        severity: 'low',
        mitigation: isAmharic
          ? 'በቃለ-መጠይቁ ወቅት የሥራ ቦታውን አካላዊ ምቾት አስቀድሞ ማረጋገጥ።'
          : 'Confirm workspace ramp and accessible elevator access prior to in-person interviews.',
      });
    }

    return {
      roleTitle,
      organization,
      location: 'Addis Ababa / Remote, Ethiopia',
      deadline,
      summaryPlainLanguageAm: `ይህ የሥራ ማስታወቂያ ለ${roleTitle} የቀረበ ጥሪ ነው። ድርጅቱ አመልካቾች መሠረታዊ የኮምፒውተር ክህሎትና የሥራ ትጋት እንዲኖራቸው ይፈልጋል። አስፈላጊ ሰነዶችን በማዘጋጀት በቀላሉ ማመልከት ይችላሉ።`,
      summaryPlainLanguageEn: `This announcement is an opportunity for ${roleTitle}. The employer seeks candidates with practical skills and collaborative communication. Follow the step-by-step roadmap to submit your application with required accommodations.`,
      keyRequirements: [
        {
          skill: isAmharic ? 'መሠረታዊ የኮምፒውተር አጠቃቀም' : 'Basic Computer Literacy',
          isMandatory: true,
          explanation: isAmharic
            ? 'የፋይሎች አያያዝ፣ የኢሜይል ልውውጥና የቢሮ ሶፍትዌሮች አጠቃቀም'
            : 'File management, email communication, and office productivity tools',
        },
        {
          skill: isAmharic ? 'የእንግሊዝኛና የአማርኛ ግንኙነት' : 'Bilingual Communication',
          isMandatory: true,
          explanation: isAmharic
            ? 'በጽሁፍና በንግግር መልዕክት የመለዋወጥ ችሎታ'
            : 'Clear written and spoken communication with team members',
        },
      ],
      potentialBarriers,
      accommodationTips: [
        isAmharic
          ? 'ለፈተና ወይም ለቃለ-መጠይቅ ዲጂታል ወይም ትልቅ የፊደል መጠን ያለው ሰነድ መጠየቅ (አዋጅ 568/2008)'
          : 'Request digital or large-print exam papers under Proclamation 568/2008',
        isAmharic
          ? 'የመስሚያ ችግር ላለባቸው አመልካቾች የምልክት ቋንቋ አስተርጓሚ ወይም የጽሁፍ ቃለ-መጠይቅ መጠየቅ'
          : 'Request sign language interpretation or written interview transcripts if needed',
      ],
      applicationSteps: [
        {
          stepNumber: 1,
          instruction: isAmharic
            ? 'የሲቪ (CV) እና የትምህርት ማስረጃዎችዎን በፒዲኤፍ (PDF) ፎርማት ያዘጋጁ።'
            : 'Prepare your updated CV and educational credentials in accessible PDF format.',
          requiredDocuments: ['CV / Resume', 'Educational Certificates / የትምህርት ማስረጃ'],
        },
        {
          stepNumber: 2,
          instruction: isAmharic
            ? 'የማመቻቸት ጥያቄ ደብዳቤ (Accommodation Request) ከአመልካች ማህደሩ ጋር አያይዘው ይላኩ።'
            : 'Attach a professional accommodation letter citing Proclamation 568/2008 alongside your application.',
          requiredDocuments: ['Accommodation Request Letter'],
        },
        {
          stepNumber: 3,
          instruction: isAmharic
            ? `ከ${deadline} በፊት ማመልከቻዎን በኦንላይን ፖርታል ወይም በኢሜይል ያስገቡ።`
            : `Submit your complete package prior to the deadline: ${deadline}.`,
          requiredDocuments: ['Completed Application Form'],
        },
      ],
      confidenceScore: 0.94,
      isAccessibleEmployer: true,
    };
  }

  /**
   * Main entrypoint to analyze raw job vacancy announcements.
   */
  public static async analyzeOpportunity(
    rawText: string,
    jobOpportunityId?: string
  ): Promise<OpportunityAnalysisData> {
    let analysisData: OpportunityAnalysisData;

    if (isLiveAIConfigured()) {
      try {
        const { model } = getAIProvider();
        if (model) {
          const result = await generateObject({
            model,
            system: DECODER_SYSTEM_PROMPT,
            prompt: buildDecoderUserPrompt(rawText),
            schema: OpportunityAnalysisSchema,
          });
          analysisData = result.object;
        } else {
          analysisData = this.extractOfflineAnalysis(rawText);
        }
      } catch (err) {
        console.warn('[Decoder Service] Live AI analysis failed, falling back to rule engine:', err);
        analysisData = this.extractOfflineAnalysis(rawText);
      }
    } else {
      analysisData = this.extractOfflineAnalysis(rawText);
    }

    // Persist to repository
    try {
      const repo = getRepository();
      await repo.opportunities.createAnalysis({
        jobOpportunityId: jobOpportunityId || 'job-opp-generic',
        analysisResult: analysisData as any,
        summaryPlainLanguage: analysisData.summaryPlainLanguageAm,
      });
    } catch {
      // Non-fatal if DB insert fails in unit testing
    }

    return analysisData;
  }
}
