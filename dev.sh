#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting development environment..."

# Check if .env exists
if [ ! -f ".env" ]; then
  echo "❌ Error: .env file not found!"
  exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Run the development server with environment variables
echo "🔨 Starting development server..."
set -a # automatically export all variables
source .env
set +a
npm run dev 