import { ResearchRequest, ResearchResponse } from '@/types/research'
import { API_ENDPOINTS } from '@/config/agents'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

const getAbsoluteUrl = (path: string) => {
  // Check if we're running on the server side
  if (typeof window === 'undefined') {
    // Server-side: use complete URL
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `${baseUrl}${path}`;
  }
  // Client-side: use relative path
  return path;
}

export async function analyzeMarket(request: ResearchRequest): Promise<ResearchResponse> {
  try {
    const url = getAbsoluteUrl(API_ENDPOINTS.analyze);
    const apiKey = process.env.NEXT_PUBLIC_INTERNAL_API_KEY;
    
    // Debug logging
    console.log('API Client - Request Debug:', {
      url,
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length,
      method: 'POST'
    });
    
    if (!apiKey) {
      throw new ApiError(401, 'API key not configured');
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify(request),
      cache: 'no-store'
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url
      });
      throw new ApiError(response.status, errorText)
    }

    return await response.json()
  } catch (error: unknown) {
    console.error('API Client Error:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(500, error instanceof Error ? error.message : String(error))
  }
}

export async function checkHealth(): Promise<{ status: string; timestamp: string }> {
  try {
    const response = await fetch(getAbsoluteUrl(API_ENDPOINTS.health), {
      cache: 'no-store'
    })
    if (!response.ok) {
      throw new ApiError(response.status, 'Health check failed')
    }
    return await response.json()
  } catch (error: unknown) {
    throw new ApiError(500, error instanceof Error ? error.message : String(error))
  }
}

export async function getCacheStats(): Promise<{
  total_entries: number;
  expired_entries: number;
  ttl_hours: number;
}> {
  try {
    const response = await fetch(getAbsoluteUrl(API_ENDPOINTS.cacheStats), {
      cache: 'no-store'
    })
    if (!response.ok) {
      throw new ApiError(response.status, 'Failed to get cache stats')
    }
    return await response.json()
  } catch (error: unknown) {
    throw new ApiError(500, error instanceof Error ? error.message : String(error))
  }
}

export async function clearCache(): Promise<{ status: string; message: string }> {
  try {
    const response = await fetch(getAbsoluteUrl(API_ENDPOINTS.cacheClear), {
      method: 'POST',
      cache: 'no-store'
    })
    if (!response.ok) {
      throw new ApiError(response.status, 'Failed to clear cache')
    }
    return await response.json()
  } catch (error: unknown) {
    throw new ApiError(500, error instanceof Error ? error.message : String(error))
  }
} 