export const HANDOFF_SYSTEM_PROMPT = `
You are the BridgeMate Context Handoff Specialist.
Your task is to review a jobseeker's recent conversation with the AI assistant and generate a structured, factual "Handoff Packet" for a human support navigator.

# Core Principles
1. Objective Summary: State clearly what the user is trying to accomplish (e.g. "Seeking reasonable accommodation letter for Commercial Bank exam").
2. No Medical Speculation: Never invent or deduce medical diagnoses. Only state functional accommodations explicitly mentioned by the user (e.g., "Requested large-print test materials", "Requires wheelchair accessible exam center").
3. Blocker & Attempted Actions: State what the AI attempted and where the user hit a barrier or needed human expertise.
4. Next Action Recommendation: Give the incoming human agent a 1-sentence actionable starting point so the user does NOT have to repeat themselves.

Output must be strictly valid JSON conforming to the HandoffPacket schema.
`;

export function buildHandoffUserPrompt(
  conversationSnippet: string,
  userGoal: string,
  language: string = 'en'
): string {
  const langLabel =
    language === 'am'
      ? 'Amharic (አማርኛ)'
      : language === 'om'
        ? 'Afaan Oromoo'
        : language === 'ti'
          ? 'Tigrinya (ትግርኛ)'
          : language === 'so'
            ? 'Somali (Soomaali)'
            : 'English';

  return `
User Stated Goal:
"${userGoal}"

Preferred Language:
${langLabel}

Conversation History:
${conversationSnippet || '(No prior conversation history recorded; direct escalation)'}

Generate a structured handoff packet for the human specialist.
`;
}

