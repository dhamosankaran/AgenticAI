import { SearchResult } from '@/types/research';

export async function searchWithSerper(query: string): Promise<SearchResult[]> {
  const serperApiKey = process.env.SERPER_API_KEY;
  if (!serperApiKey) {
    throw new Error('SERPER_API_KEY is not configured');
  }

  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': serperApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: query,
        num: 10
      })
    });

    if (!response.ok) {
      throw new Error(`SerperDEV API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.organic.map((result: any) => ({
      title: result.title,
      link: result.link,
      snippet: result.snippet,
      position: result.position
    }));
  } catch (error) {
    console.error('SerperDEV search error:', error);
    throw error;
  }
} 