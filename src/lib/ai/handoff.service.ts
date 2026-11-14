import { generateObject } from 'ai';
import { getAIProvider, isLiveAIConfigured } from '@/lib/ai/providers';
import { HANDOFF_SYSTEM_PROMPT, buildHandoffUserPrompt } from '@/lib/ai/prompts/handoff-prompt';
import {
  HandoffPacketSchema,
  type HandoffPacket,
  type CreateSupportRequest,
} from '@/lib/validators/support.schema';

export class HandoffService {
  /**
   * Generates a deterministic fallback handoff packet when AI is offline.
   */
  private static generateOfflinePacket(req: CreateSupportRequest): HandoffPacket {
    const isAmharic = req.userLanguage === 'am';

    return {
      userGoal: req.userGoal,
      disclosedAccommodations: req.disclosedAccommodations && req.disclosedAccommodations.length > 0
        ? req.disclosedAccommodations
        : [isAmharic ? 'የተለየ የተገለጸ ማመቻቸት የለም' : 'Standard accessible communication'],
      painPoints: [
        isAmharic
          ? 'ተጠቃሚው በራስ-ሰር የሚሰጠውን ድጋፍ አልፎ የሰው ድጋፍ አግልግሎት አሻግሯል'
          : 'User escalated from automated assistance to direct human navigator',
      ],
      attemptedActions: [
        isAmharic
          ? 'በብሪጅሜት በኩል መረጃ ተፈልጎ ነበር'
          : 'Reviewed opportunity & platform assistance tools',
      ],
      recommendedAgentAction: isAmharic
        ? `የተጠቃሚውን ጥያቄ፡ "${req.userGoal}" መሠረት በማድረግ ቀጥታ በ${req.userLanguage === 'am' ? 'አማርኛ' : 'እንግሊዝኛ'} መወያየት ይጀምሩ።`
        : `Greet the user directly regarding "${req.userGoal}" in ${req.userLanguage === 'am' ? 'Amharic' : 'English'} without asking them to repeat their problem.`,
    };
  }

  /**
   * Generates a structured handoff packet for a human agent.
   */
  public static async generatePacket(
    req: CreateSupportRequest,
    conversationSnippet: string = ''
  ): Promise<HandoffPacket> {
    if (isLiveAIConfigured()) {
      try {
        const { model } = getAIProvider();
        if (model) {
          const prompt = buildHandoffUserPrompt(conversationSnippet, req.userGoal, req.userLanguage);

          const result = await generateObject({
            model,
            system: HANDOFF_SYSTEM_PROMPT,
            prompt,
            schema: HandoffPacketSchema,
            temperature: 0.1,
          });

          return result.object;
        }
      } catch (err) {
        console.warn('[HandoffService] Live AI summarization failed, using deterministic packet:', err);
        return this.generateOfflinePacket(req);
      }
    }

    return this.generateOfflinePacket(req);
  }
}
