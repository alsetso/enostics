#!/bin/bash

# 🚀 Enostics Platform - Immediate Publication Script
# This script will publish the platform to https://github.com/alsetso/enostics

set -e  # Exit on any error

echo "🔥 PUBLISHING ENOSTICS PLATFORM TO GITHUB..."
echo "================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in the project root directory"
    echo "Please run this script from the Enostics project root"
    exit 1
fi

# Verify build works
echo "🔍 Verifying build..."
npm run build

# Check git status
echo "📋 Checking git status..."
if [ ! -d ".git" ]; then
    echo "🔧 Initializing git repository..."
    git init
fi

# Add remote origin (remove if exists)
echo "🔗 Setting up GitHub remote..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/alsetso/enostics.git

# Set up main branch
git branch -M main

# Check for sensitive data
echo "🔒 Checking for sensitive data..."
if grep -r "sk-" --exclude-dir=node_modules --exclude-dir=.git . 2>/dev/null; then
    echo "⚠️  WARNING: Found potential API keys in code"
    echo "Please review and remove them before publishing"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Add all files
echo "📦 Adding all files to git..."
git add .

# Commit with comprehensive message
echo "💾 Committing changes..."
git commit -m "feat: Initial Enostics platform publication

🧍 Complete universal personal API platform for every individual

✅ Core Features:
- Next.js 14 + TypeScript + Tailwind CSS
- Authentication system (email/password, OAuth ready)
- Personal API endpoints (/v1/username)
- Real-time dashboard with analytics
- Data ingestion and processing
- AI-powered features (chat, classification)
- Legal pages (Terms of Use, Privacy Policy)
- Responsive design with dark theme
- Production-ready build configuration

🔧 Technical Stack:
- Frontend: Next.js 14, TypeScript, Tailwind CSS
- Backend: API routes, middleware, rate limiting
- Database: Supabase with RLS
- Authentication: Supabase Auth
- AI: OpenAI, Anthropic integration
- Deployment: Vercel-ready

📊 Build Status:
- ✅ Build successful (89 pages generated)
- ✅ TypeScript configured
- ✅ ESLint configured
- ✅ Production optimized
- ✅ 278kB base bundle size

🎯 User Value:
Every user gets their own programmable endpoint at /v1/username
- Persistent, intelligent API layer
- Real-time data processing
- AI-powered insights
- Complete control over personal data

🚀 Ready for immediate deployment to production!"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push -u origin main

# Success message
echo ""
echo "🎉 SUCCESS! Platform published to GitHub!"
echo "=========================================="
echo ""
echo "📍 Repository: https://github.com/alsetso/enostics"
echo "🌐 View Code: https://github.com/alsetso/enostics/tree/main"
echo "📖 Documentation: View README.md and FINAL_PUBLICATION_GUIDE.md"
echo ""
echo "🔄 Next Steps:"
echo "1. Visit your repository on GitHub"
echo "2. Set up environment variables for deployment"
echo "3. Deploy to Vercel/Netlify for live access"
echo "4. Enable user registration when ready"
echo ""
echo "✨ The universal personal API platform is now live on GitHub!" 