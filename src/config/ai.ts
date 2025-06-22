// Gemini model configuration matching Python agent settings
export const GEMINI_CONFIG = {
  model: "gemini-2.0-flash-exp",
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 1200,
    topP: 1,
    topK: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  }
} as const;

// Note: The experimental model "gemini/gemini-2.0-flash-exp" is only available
// through specific API endpoints or custom configurations. For public API access,
// we use the standard "gemini-pro" model with similar parameters. 