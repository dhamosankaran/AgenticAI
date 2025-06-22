export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // browser should use relative path
    return '';
  }

  if (process.env.VERCEL_URL) {
    // reference for vercel.com
    return `https://${process.env.VERCEL_URL}`;
  }

  if (process.env.NEXT_PUBLIC_API_URL) {
    // reference for custom domain
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // assume localhost
  return 'http://localhost:3000';
};

export const getApiUrl = (path: string) => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}${path}`;
};

export const getWsUrl = () => {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  
  // In production, WebSocket should use secure protocol
  if (process.env.VERCEL_URL) {
    return `wss://${process.env.VERCEL_URL}`;
  }
  
  return 'ws://localhost:8000';
} 