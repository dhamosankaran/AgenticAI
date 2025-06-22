#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process..."

# Install Vercel CLI if not installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Build the application
echo "🔨 Building the application..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel deploy --prod \
  --build-env GEMINI_API_KEY=$GEMINI_API_KEY \
  --build-env SERPER_API_KEY=$SERPER_API_KEY \
  --build-env NEXT_PUBLIC_APP_ENV=production \
  --yes

echo "✅ Deployment completed!" 