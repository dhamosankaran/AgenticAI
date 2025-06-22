import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Only apply to /api routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key'
      }
    });
  }

  // Get API key from header
  const apiKey = request.headers.get('x-api-key');
  const expectedKey = process.env.INTERNAL_API_KEY;
  
  // Debug logging
  console.log('Middleware - Auth Debug:', {
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey?.length,
    hasExpectedKey: !!expectedKey,
    expectedKeyLength: expectedKey?.length,
    keysMatch: apiKey === expectedKey,
    method: request.method,
    url: request.url
  });

  // Verify API key
  if (!apiKey || !expectedKey || apiKey !== expectedKey) {
    return new NextResponse(
      JSON.stringify({ 
        error: 'Unauthorized',
        message: 'Invalid API key'
      }),
      { 
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key'
        }
      }
    );
  }

  // Continue with valid API key
  const response = NextResponse.next();
  
  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
  
  return response;
}

export const config = {
  matcher: '/api/:path*',
} 