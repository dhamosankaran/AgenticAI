import { NextResponse } from "next/server";
import { GoogleGenerativeAI, GenerateContentRequest } from "@google/generative-ai";

// Initialize Gemini client only if API key is available
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Configure model options similar to base_agent.py
const MODEL_CONFIG = {
  model: "gemini-2.0-flash-exp",
  temperature: 0.7,
  maxOutputTokens: 1200,
  topP: 1,
  topK: 1,
};

export async function POST(req: Request) {
  // Check if Gemini client is available
  if (!genAI) {
    return NextResponse.json(
      { error: "Gemini API key not configured" },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { text } = body;

    // Get the generative model with configuration
    const model = genAI.getGenerativeModel(MODEL_CONFIG);

    // Generate content with retry logic
    let attempts = 0;
    const maxAttempts = 3;
    let lastError = null;

    while (attempts < maxAttempts) {
      try {
        const result = await model.generateContent(text);
        const response = await result.response;
        return NextResponse.json({ text: response.text() });
      } catch (error) {
        lastError = error;
        attempts++;
        if (attempts === maxAttempts) break;
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 500));
      }
    }

    // If all retries failed
    console.error("Error processing request after retries:", lastError);
    return NextResponse.json(
      { error: "Error processing request after multiple attempts" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
}
