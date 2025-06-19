# 🚀 Enostics Production Deployment Guide

## Overview

This guide walks you through deploying Enostics to production with proper URLs, security, and performance optimizations.

## 📋 Pre-Deployment Checklist

### 1. **Domain Setup**
- [ ] Purchase domain: `enostics.com`
- [ ] Configure DNS records:
  - `A` record: `enostics.com` → Vercel IP
  - `CNAME` record: `api.enostics.com` → Vercel deployment URL
  - `CNAME` record: `www.enostics.com` → `enostics.com`

### 2. **Supabase Production Setup**
- [ ] Create production Supabase project
- [ ] Run database migrations
- [ ] Configure RLS policies
- [ ] Set up production API keys
- [ ] Configure database backups

### 3. **Environment Variables**
- [ ] Copy `env.production.example` to `.env.production.local`
- [ ] Fill in all production values
- [ ] Configure Vercel environment variables

## 🏗️ **Step 1: Supabase Production Setup**

### Create Production Project
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Create new production project (or use existing)
# Go to https://supabase.com/dashboard and create new project
```

### Database Setup
```sql
-- Run these in your production Supabase SQL editor

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE data ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (example for endpoints table)
CREATE POLICY "Users can view own endpoints" ON endpoints
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own endpoints" ON endpoints
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own endpoints" ON endpoints
  FOR UPDATE USING (auth.uid() = user_id);
```

## 🌐 **Step 2: Vercel Deployment**

### Install Vercel CLI
```bash
npm install -g vercel
```

### Configure Environment Variables
```bash
# Set production environment variables in Vercel
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add OPENAI_API_KEY production
vercel env add NODE_ENV production
```

### Deploy to Production
```bash
# Build and deploy
npm run build:production
npm run deploy

# Or deploy with preview first
npm run deploy:preview
```

## 🔧 **Step 3: Domain Configuration**

### Configure Custom Domains in Vercel
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add domains:
   - `enostics.com` (main app)
   - `api.enostics.com` (API subdomain)
   - `www.enostics.com` (redirect to main)

### DNS Configuration
```
# DNS Records for your domain provider
Type    Name    Value                           TTL
A       @       76.76.19.61                     300
CNAME   api     your-project.vercel.app         300
CNAME   www     enostics.com                    300
```

## 🔒 **Step 4: Security Configuration**

### SSL/TLS
- Vercel automatically provides SSL certificates
- Verify HTTPS is working on all domains

### API Security
- Rate limiting is configured in the API routes
- CORS headers are set in `next.config.js`
- API key validation is implemented

### Environment Security
```bash
# Verify no sensitive data in public environment variables
vercel env ls
```

## 📊 **Step 5: Production URLs**

### Main Application URLs
- **Main App**: `https://enostics.com`
- **Dashboard**: `https://enostics.com/dashboard`
- **Documentation**: `https://enostics.com/docs`

### API Endpoints
- **Base API**: `https://api.enostics.com`
- **User Endpoints**: `https://api.enostics.com/v1/{username}`
- **Health Check**: `https://api.enostics.com/api/health`

### Clean URL Routing
The Next.js configuration provides clean URLs:
- `https://api.enostics.com/v1/username` → `/api/v1/username`
- Direct API access without `/api/` prefix

## 🧪 **Step 6: Production Testing**

### Test API Endpoints
```bash
# Test health endpoint
curl https://api.enostics.com/api/health

# Test user endpoint (replace with actual username)
curl -X POST https://api.enostics.com/v1/remedytestingllc \
  -H "Content-Type: application/json" \
  -d '{"test": "production_test", "timestamp": "2025-01-19T17:00:00Z"}'
```

### Test Web Application
- [ ] Homepage loads correctly
- [ ] Dashboard authentication works
- [ ] Chat functionality works with OpenAI
- [ ] All navigation links work
- [ ] Mobile responsive design

## 📈 **Step 7: Monitoring & Analytics**

### Performance Monitoring
- Vercel Analytics automatically enabled
- Monitor Core Web Vitals
- Set up alerts for downtime

### Error Tracking
```bash
# Optional: Add Sentry for error tracking
npm install @sentry/nextjs
```

### API Monitoring
- Monitor endpoint response times
- Track API usage patterns
- Set up rate limit alerts

## 🔄 **Step 8: CI/CD Pipeline**

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🚨 **Step 9: Backup & Recovery**

### Database Backups
- Supabase automatically backs up your database
- Consider additional backup strategies for critical data

### Code Backups
- Ensure all code is committed to Git
- Tag production releases
- Keep deployment history in Vercel

## 📋 **Post-Deployment Checklist**

- [ ] All URLs resolve correctly
- [ ] SSL certificates are active
- [ ] API endpoints respond correctly
- [ ] Authentication works
- [ ] Database connections are stable
- [ ] Environment variables are set
- [ ] Monitoring is active
- [ ] Error tracking is configured
- [ ] Performance is optimized

## 🛠️ **Production Commands**

```bash
# Build for production
npm run build:production

# Start production server locally
npm run start:production

# Deploy to production
npm run deploy

# Deploy preview
npm run deploy:preview

# Check deployment status
vercel ls

# View deployment logs
vercel logs your-deployment-url
```

## 🎯 **Production Features Enabled**

### API Features
- ✅ User endpoint creation (`/v1/username`)
- ✅ Real-time data ingestion
- ✅ AI-powered classification
- ✅ Rate limiting and security
- ✅ OpenAI integration
- ✅ Data enrichment and storage

### Web Application Features
- ✅ User authentication
- ✅ Dashboard interface
- ✅ AI chat functionality
- ✅ Analytics and monitoring
- ✅ Responsive design
- ✅ Coming soon features with lock overlays

### Infrastructure
- ✅ Vercel deployment
- ✅ Supabase database
- ✅ Custom domain configuration
- ✅ SSL/TLS encryption
- ✅ CDN optimization
- ✅ Automatic scaling

## 🆘 **Troubleshooting**

### Common Issues
1. **Domain not resolving**: Check DNS propagation (24-48 hours)
2. **API 500 errors**: Check environment variables in Vercel
3. **Database connection failed**: Verify Supabase credentials
4. **Build failures**: Check for TypeScript errors and dependencies

### Support Resources
- Vercel Documentation: https://vercel.com/docs
- Supabase Documentation: https://supabase.com/docs
- Next.js Documentation: https://nextjs.org/docs

---

🎉 **Congratulations!** Your Enostics platform is now live in production with enterprise-grade infrastructure, security, and performance! 