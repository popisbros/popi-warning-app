#!/bin/bash

# GitHub Setup Script for Popi Warning App
echo "🚀 Setting up GitHub repository for Popi Warning App"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📋 Next steps:"
echo ""
echo "1. Go to https://github.com and create a new repository:"
echo "   - Name: popi-warning-app"
echo "   - Description: Community-driven warning and POI management PWA"
echo "   - Make it PUBLIC"
echo "   - Don't initialize with README, .gitignore, or license"
echo ""
echo "2. After creating the repository, run these commands:"
echo ""
echo "   git remote add origin https://github.com/YOUR_USERNAME/popi-warning-app.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Then go to https://vercel.com and deploy from GitHub"
echo ""
echo "📖 For detailed instructions, see VERCEL_DEPLOYMENT.md"
echo ""
echo "✅ Your code is ready to push to GitHub!"
