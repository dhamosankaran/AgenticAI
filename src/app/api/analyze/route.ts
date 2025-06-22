import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ResearchRequest, ResearchResponse } from "@/types/research";
import { GEMINI_CONFIG } from "@/config/ai";
import { searchWithSerper } from "@/lib/search";

// Initialize the API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    // Check API key
    const apiKey = request.headers.get('x-api-key');
    const expectedKey = process.env.INTERNAL_API_KEY || 'default-dev-key';
    
    if (!apiKey || apiKey !== expectedKey) {
      console.error('Invalid or missing API key');
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get and validate the request body
    const requestData: ResearchRequest = await request.json();
    console.log("Analyze Route - Received request:", requestData);
    
    if (!requestData.product_name) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    // Debug logging for environment variables
    console.log("Environment Variables Check:", {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      hasSerperKey: !!process.env.SERPER_API_KEY,
      geminiKeyLength: process.env.GEMINI_API_KEY?.length,
      serperKeyLength: process.env.SERPER_API_KEY?.length
    });

    if (!process.env.GEMINI_API_KEY) {
      console.error("Gemini API key missing");
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 503 }
      );
    }

    // Get search results for the product
    console.log("Analyze Route - Starting SerperDEV search...");
    const searchQuery = `${requestData.product_name} ${requestData.context || ''} latest news analysis market research`;
    console.log("Analyze Route - Search query:", searchQuery);
    
    const searchResults = await searchWithSerper(searchQuery);
    console.log("Analyze Route - Search results:", JSON.stringify(searchResults, null, 2));
    
    const searchContext = searchResults
      .map(result => `${result.title}\n${result.snippet}`)
      .join('\n\n');
    console.log("Analyze Route - Search context length:", searchContext.length);

    // Get the generative model with shared configuration
    const model = genAI.getGenerativeModel(GEMINI_CONFIG);
    console.log("Analyze Route - Model initialized with:", GEMINI_CONFIG.model);

    // Create prompts for different aspects with search context
    const prompts = {
      manager: `Based on the following recent information and search results about ${requestData.product_name}:

${searchContext}

Provide a strategic overview and executive summary. Focus on:
1. Key market position and competitive advantages
2. Recent developments and their impact
3. Strategic opportunities and challenges
4. Key recommendations

Context: ${requestData.context || 'General market analysis'}`,

      market: `Based on the following recent information and search results about ${requestData.product_name}:

${searchContext}

Analyze market trends and competition. Focus on:
1. Market size and growth potential
2. Key competitors and their strategies
3. Market dynamics and trends
4. Competitive advantages and challenges

Context: ${requestData.context || 'General market analysis'}`,

      consumer: `Based on the following recent information and search results about ${requestData.product_name}:

${searchContext}

Analyze consumer behavior and market segments. Focus on:
1. Target customer segments
2. Customer needs and preferences
3. Buying patterns and decision factors
4. Customer feedback and satisfaction

Context: ${requestData.context || 'General market analysis'}`,

      industry: `Based on the following recent information and search results about ${requestData.product_name}:

${searchContext}

Provide technical and industry analysis. Focus on:
1. Industry trends and innovations
2. Technical capabilities and differentiators
3. Regulatory environment
4. Future outlook and potential disruptions

Context: ${requestData.context || 'General market analysis'}`
    };

    console.log("Analyze Route - Starting parallel content generation...");

    // Generate all analyses in parallel
    const results = await Promise.all(
      Object.entries(prompts).map(async ([key, prompt]) => {
        console.log(`Analyze Route - Generating ${key} analysis...`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        console.log(`Analyze Route - Completed ${key} analysis`);
        return [key, {
          content: response.text(),
          status: 'success',
          timestamp: new Date().toISOString()
        }];
      })
    );

    console.log("Analyze Route - All analyses completed");

    const response: ResearchResponse = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: '2.0',
        status: 'success'
      },
      results: Object.fromEntries(results),
      errors: {}
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("API route error:", error);
    return new NextResponse(JSON.stringify({ 
      error: 'Internal Server Error',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 