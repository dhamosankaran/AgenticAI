import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { ResearchResult, ResearchResponse } from '@/types/research';

export class ResearchManager {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async analyze({ product_name, context }: { product_name: string; context?: string }): Promise<ResearchResponse> {
    try {
      const marketPromise = this.analyzeMarket(product_name, context);
      const consumerPromise = this.analyzeConsumer(product_name, context);
      const industryPromise = this.analyzeIndustry(product_name, context);

      const [marketResult, consumerResult, industryResult] = await Promise.all([
        marketPromise,
        consumerPromise,
        industryPromise
      ]);

      // Synthesize results
      const synthesis = await this.synthesizeResults({
        product_name,
        context,
        market: marketResult,
        consumer: consumerResult,
        industry: industryResult
      });

      return {
        metadata: {
          timestamp: new Date().toISOString(),
          version: '2.0',
          status: 'success'
        },
        results: {
          manager: synthesis,
          market: marketResult,
          consumer: consumerResult,
          industry: industryResult
        },
        errors: {}
      };
    } catch (error) {
      console.error('Analysis error:', error);
      throw error;
    }
  }

  private async analyzeMarket(product_name: string, context?: string): Promise<ResearchResult> {
    const prompt = `Analyze the market for ${product_name}.
    ${context ? `Additional context: ${context}` : ''}
    Focus on:
    1. Market size and growth
    2. Key competitors
    3. Market trends
    4. Growth opportunities`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return {
      content: response.text(),
      status: 'success',
      timestamp: new Date().toISOString()
    };
  }

  private async analyzeConsumer(product_name: string, context?: string): Promise<ResearchResult> {
    const prompt = `Analyze consumer behavior for ${product_name}.
    ${context ? `Additional context: ${context}` : ''}
    Focus on:
    1. Target demographics
    2. Consumer preferences
    3. Buying patterns
    4. Pain points`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return {
      content: response.text(),
      status: 'success',
      timestamp: new Date().toISOString()
    };
  }

  private async analyzeIndustry(product_name: string, context?: string): Promise<ResearchResult> {
    const prompt = `Analyze the industry landscape for ${product_name}.
    ${context ? `Additional context: ${context}` : ''}
    Focus on:
    1. Industry regulations
    2. Technological trends
    3. Supply chain
    4. Entry barriers`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return {
      content: response.text(),
      status: 'success',
      timestamp: new Date().toISOString()
    };
  }

  private async synthesizeResults({ 
    product_name, 
    context,
    market,
    consumer,
    industry
  }: {
    product_name: string;
    context?: string;
    market: ResearchResult;
    consumer: ResearchResult;
    industry: ResearchResult;
  }): Promise<ResearchResult> {
    const prompt = `Synthesize the following research findings for ${product_name}:
    
    Market Analysis:
    ${market.content}
    
    Consumer Analysis:
    ${consumer.content}
    
    Industry Analysis:
    ${industry.content}
    
    ${context ? `Additional context: ${context}` : ''}
    
    Provide:
    1. Key insights synthesis
    2. Strategic opportunities
    3. Risk assessment
    4. Implementation recommendations
    5. Success metrics`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return {
      content: response.text(),
      status: 'success',
      timestamp: new Date().toISOString()
    };
  }
} 