# 🧍 Enostics – Universal Personal API Platform

**Enostics** is the universal personal API layer for every individual, in every industry. The platform gives every user a persistent, intelligent, programmable endpoint.

## 🌐 Overview

Enostics transforms every user into their own API. It's the simplest business ever — built on clarity, control, and connectivity.

### Core Workflow
1. **User creates endpoint** - One-click, branded, permanent (`/v1/username`)
2. **External services send data** - Health providers, devices, apps, AI agents
3. **User views, manages, and automates** - Real-time console, memory, agent traces

## 🚀 Current Features

### ✅ **Live & Working**
- **Homepage** - Modern landing page with hero section and features
- **Authentication** - Email/password login system (OAuth in development)
- **Registration** - Multi-step onboarding flow (currently disabled for launch prep)
- **Dashboard** - User dashboard with navigation and basic functionality
- **Legal Pages** - Terms of Use and Privacy Policy
- **Responsive Design** - Mobile-optimized with dark theme

### 🔧 **In Development**
- **Personal API Endpoints** - `/v1/username` routes (backend ready, frontend integration pending)
- **Real-time Data Flow** - Live console for incoming data
- **AI Integration** - Local (Ollama) and cloud (OpenAI) models
- **Universal Inbox** - Centralized data management
- **Analytics** - Usage tracking and insights

## 🛠 Tech Stack

- **Framework**: Next.js 14 + TypeScript + Tailwind CSS
- **Database**: Supabase with Row Level Security
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS with custom Enostics design system
- **Deployment**: Vercel (ready for production)

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+
- Supabase account

### Installation

```bash
# Clone the repository
git clone https://github.com/alsetso/enostics.git
cd enostics

# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

### Environment Variables

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI (Optional, for AI features)
OPENAI_API_KEY=your_openai_api_key

# Ollama (Optional, for local AI models)
OLLAMA_HOST=http://localhost:11434
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── login/             # Authentication pages
│   ├── register/          # Registration flow
│   ├── terms-of-use/      # Legal pages
│   └── privacy-policy/    # Privacy policy
├── components/            # React components
│   ├── features/         # Feature components
│   ├── layout/           # Layout components
│   ├── pages/            # Page components
│   ├── sections/         # Section components
│   └── ui/               # UI primitives
├── lib/                  # Utilities and config
├── hooks/                # Custom React hooks
└── middleware/           # API middleware
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/callback` - Auth callback handling
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/user/profile` - User profile data
- `POST /api/user/update` - Update user profile

### Health Check
- `GET /api/health` - Application health status

### Coming Soon
- `GET/POST /api/v1/[username]` - Personal API endpoints
- `GET /api/inbox/recent` - Recent data
- `GET /api/analytics/stats` - Usage statistics

## 🎯 Platform Status

### **Phase 1: Core Platform (Current)**
- ✅ Homepage with modern design
- ✅ Authentication system
- ✅ User registration flow
- ✅ Dashboard framework
- ✅ Legal compliance pages
- ✅ Responsive design

### **Phase 2: API Endpoints (Next)**
- 🔧 Personal endpoint creation
- 🔧 Data ingestion system
- 🔧 Real-time dashboard
- 🔧 Basic analytics

### **Phase 3: Advanced Features (Future)**
- 🔒 AI integration
- 🔒 Workflow automation
- 🔒 Third-party integrations
- 🔒 Advanced analytics

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Build for production
npm run build

# Test production build locally
npm start

# Deploy to Vercel
vercel --prod
```

### Production Environment Setup
1. Create Vercel project
2. Configure environment variables in Vercel dashboard
3. Set up custom domains (enostics.com, api.enostics.com)
4. Configure Supabase project with production settings

## 🔧 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type checking
npm run type-check
```

## 📚 Navigation

- **Homepage**: `/` - Landing page with platform overview
- **Dashboard**: `/dashboard` - User control panel
- **Authentication**: `/login`, `/register` - User authentication
- **Legal**: `/terms-of-use`, `/privacy-policy` - Legal compliance
- **API Health**: `/api/health` - System status

## 🔒 Current Limitations

- **Registration temporarily disabled** - Preparing for launch
- **API endpoints not yet public** - Backend ready, frontend integration pending
- **OAuth providers disabled** - Email/password only for now
- **Analytics not implemented** - Basic tracking ready

## 🤝 Contributing

This is a production application. For contributions or issues, please contact the development team.

## 📄 License

ISC License - Alset Platform

---

**Enostics** - Where every user becomes their own API.

*Current Status: Pre-launch preparation phase*
