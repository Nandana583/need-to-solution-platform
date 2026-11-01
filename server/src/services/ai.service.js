import { aiConfig } from '../config/ai.config.js';

// Zod-like schema validation using plain JS for structured output
const NEED_EXTRACTION_SCHEMA = {
  required: ['normalizedDescription', 'category', 'requiredService', 'detectedLanguage', 'missingInfo', 'confidence'],
};

/**
 * System prompt for need extraction.
 * Instructs GPT-4o to parse multilingual user requests into structured JSON.
 */
const EXTRACTION_SYSTEM_PROMPT = `You are an expert assistant for the Solvenera platform — a need-to-solution marketplace.
Your job is to extract structured information from a user's natural language request.

The user may write in:
- English
- Telugu (e.g., "మా ఇంట్లో ఫ్యాన్ రిపేర్ చేయాలి")
- Telugu-English code-switching (e.g., "Maa intlo fan repair cheyyali")
- Hindi or Tamil

You MUST respond with ONLY valid JSON. No markdown, no code blocks, no explanations.

JSON Schema:
{
  "originalText": "exact user input",
  "detectedLanguage": "English|Telugu|Telugu-English|Hindi|Tamil|Unknown",
  "normalizedDescription": "clear English description of what the user needs",
  "category": "one of: Home Repair, Electrical, Plumbing, Education, Technology, Health, Transportation, Food, Other",
  "requiredService": "specific service needed (e.g., 'fan repair', 'AC servicing', 'math tutoring') or null",
  "requiredSkill": "profession/role needed (e.g., 'electrician', 'plumber', 'tutor') or null",
  "location": "location mentioned by user or null",
  "preferredTime": "time preference mentioned or null",
  "budget": "budget mentioned or null",
  "urgency": "LOW|MEDIUM|HIGH|CRITICAL based on language cues",
  "missingInfo": ["list", "of", "missing", "critical", "fields"],
  "followUpQuestion": "ONE short follow-up question to ask if critical info is missing, or null",
  "confidence": "HIGH|MEDIUM|LOW"
}

Rules:
- NEVER invent location, budget, time, or provider details not stated by the user.
- If the user says "at home" or "at my place", set location to null (unspecified).
- Keep normalizedDescription in English even if the input is in Telugu.
- urgency=HIGH if words like "urgent", "today", "immediately", "abhi" appear.
- missingInfo should list fields that are necessary to match a provider.`;

/**
 * System prompt for the AI assistant.
 */
const ASSISTANT_SYSTEM_PROMPT = `You are Solvenera's helpful AI assistant. 
You help users of a need-to-solution platform understand their options and navigate the platform.

You can:
- Explain how to submit a need
- Clarify interpreted requests
- Explain request status
- Help draft messages (but NEVER send messages without user confirmation)
- Explain why a provider was or wasn't matched

You CANNOT:
- Invent provider availability, ratings, or contact details
- Perform actions (booking, messaging, cancellation) without explicit user confirmation
- Access data not provided to you in this conversation
- Bypass authentication or authorization

Keep answers concise, friendly, and practical. If unsure, say so honestly.
Respond in the same language the user writes in (English/Telugu/mixed).`;

export class AIService {
  /**
   * Extract structured need information from natural language input.
   * Returns null if AI is disabled. Returns partial data with low confidence on error.
   */
  static async extractNeed(userText) {
    if (!aiConfig.enabled) {
      return null; // Graceful degradation
    }

    const trimmed = (userText || '').trim();
    if (!trimmed) {
      return null;
    }

    try {
      const completion = await Promise.race([
        aiConfig.client.chat.completions.create({
          model: aiConfig.models.chat,
          messages: [
            { role: 'system', content: EXTRACTION_SYSTEM_PROMPT },
            { role: 'user', content: trimmed },
          ],
          max_tokens: aiConfig.maxTokens,
          temperature: 0.2, // Low temperature for consistent structured output
          response_format: { type: 'json_object' },
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AI request timeout')), aiConfig.timeoutMs)
        ),
      ]);

      const rawContent = completion.choices?.[0]?.message?.content || '{}';

      let parsed;
      try {
        parsed = JSON.parse(rawContent);
      } catch {
        console.warn('[AI Service] Failed to parse extraction JSON:', rawContent.slice(0, 200));
        return { confidence: 'LOW', normalizedDescription: trimmed, originalText: trimmed, error: 'Parse error' };
      }

      // Validate required fields
      const valid = NEED_EXTRACTION_SCHEMA.required.every((field) => field in parsed);
      if (!valid) {
        return { ...parsed, confidence: 'LOW', originalText: trimmed };
      }

      return { ...parsed, originalText: trimmed };
    } catch (err) {
      const isTimeout = err.message?.includes('timeout');
      console.error(`[AI Service] extractNeed ${isTimeout ? 'timeout' : 'error'}:`, err.message);
      return {
        originalText: trimmed,
        normalizedDescription: trimmed,
        confidence: 'LOW',
        error: isTimeout ? 'AI service timeout' : 'AI service error',
        detectedLanguage: 'Unknown',
        missingInfo: [],
      };
    }
  }

  /**
   * Conversational AI assistant endpoint.
   * messages: Array of { role: 'user'|'assistant', content: string }
   * context: Optional object with current request/booking/need data the AI may reference.
   */
  static async assist(messages, context = {}) {
    if (!aiConfig.enabled) {
      return {
        reply: 'AI assistant is not configured. Please contact support.',
        enabled: false,
      };
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return { reply: 'Please send a message.', enabled: true };
    }

    try {
      const systemMessages = [
        { role: 'system', content: ASSISTANT_SYSTEM_PROMPT },
      ];

      // Inject sanitized context if provided (no sensitive data)
      if (context && Object.keys(context).length > 0) {
        const safeContext = JSON.stringify(context, null, 2).slice(0, 2000); // Cap size
        systemMessages.push({
          role: 'system',
          content: `Current context for this user:\n${safeContext}`,
        });
      }

      const completion = await Promise.race([
        aiConfig.client.chat.completions.create({
          model: aiConfig.models.chat,
          messages: [
            ...systemMessages,
            // Take last 10 messages to stay within context limits
            ...messages.slice(-10).map((m) => ({
              role: m.role === 'assistant' ? 'assistant' : 'user',
              content: String(m.content).slice(0, 2000), // Sanitize length
            })),
          ],
          max_tokens: 512,
          temperature: 0.7,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AI request timeout')), aiConfig.timeoutMs)
        ),
      ]);

      const reply = completion.choices?.[0]?.message?.content || 'I could not generate a response. Please try again.';
      return { reply, enabled: true };
    } catch (err) {
      console.error('[AI Service] assist error:', err.message);
      return {
        reply: 'I am temporarily unavailable. Please try again in a moment.',
        enabled: true,
        error: true,
      };
    }
  }
}
