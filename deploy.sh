#!/bin/bash

# Popi Warning App Deployment Script

echo "🚀 Deploying Popi Warning App..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create .env.local with your API keys before deploying."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run linting
echo "🔍 Running linting..."
npm run lint

# Build the application
echo "🏗️ Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🎉 Ready for deployment!"
    echo ""
    echo "Next steps:"
    echo "1. Push to GitHub repository"
    echo "2. Connect to Vercel"
    echo "3. Add environment variables in Vercel dashboard"
    echo "4. Deploy!"
    echo ""
    echo "Or run locally with: npm start"
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi
