import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_CONFIG } from "@/config/ai";

// Initialize Gemini client only if API key is available
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export async function POST(req: Request) {
  console.log("API Key:", process.env.GEMINI_API_KEY ? "Present" : "Missing");
  console.log("Using model configuration:", JSON.stringify(GEMINI_CONFIG, null, 2));
  
  // Check if Gemini client is available
  if (!genAI) {
    return NextResponse.json(
      { error: "Gemini API key not configured" },
      { status: 503 }
    );
  }

  try {
    const { text } = await req.json();
    console.log("Received text:", text);

    if (!text) {
      return NextResponse.json(
        { error: "Missing text parameter" },
        { status: 400 }
      );
    }

    // Get the generative model with shared configuration
    const model = genAI.getGenerativeModel(GEMINI_CONFIG);
    console.log("Model initialized with:", model.model);

    console.log("Generating content...");

    // Generate content
    const result = await model.generateContent(text);
    console.log("Content generated successfully");
    const response = await result.response;
    
    return NextResponse.json({ 
      text: response.text(),
      model: GEMINI_CONFIG.model
    });
  } catch (error: unknown) {
    console.error("Error processing request:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { 
        error: "Error processing request",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 