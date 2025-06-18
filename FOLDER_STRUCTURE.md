# 🏗️ Enostics Frontend Folder Structure

## 📁 Project Organization

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with 100vh structure
│   ├── page.tsx                 # Homepage with hero section
│   ├── globals.css              # Global styles and Tailwind
│   ├── dashboard/               # Dashboard pages
│   │   └── page.tsx            # Main dashboard with stats & activity
│   ├── login/                   # Authentication pages
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   └── auth/
│       └── callback/
│           └── route.ts         # Supabase auth callback
│
├── components/                   # Reusable UI components
│   ├── ui/                      # Base UI components (shadcn-style)
│   │   ├── button.tsx          # Button with variants
│   │   ├── input.tsx           # Form input component
│   │   ├── card.tsx            # Card with glass variant
│   │   └── badge.tsx           # Status badges
│   │
│   ├── layout/                  # Layout-specific components
│   │   ├── dashboard-layout.tsx # Dashboard wrapper with sidebar
│   │   └── sidebar.tsx         # Navigation sidebar
│   │
│   ├── features/                # Feature-specific components
│   │   ├── stats-grid.tsx      # Dashboard metrics grid
│   │   ├── endpoints-list.tsx  # API endpoints management
│   │   ├── recent-activity.tsx # Activity feed
│   │   └── index.ts            # Feature exports
│   │
│   ├── common/                  # Shared utility components
│   │   ├── loading-spinner.tsx # Loading states
│   │   └── empty-state.tsx     # Empty data states
│   │
│   ├── forms/                   # Form-specific components
│   │   └── (future form components)
│   │
│   └── data/                    # Data display components
│       └── (future data components)
│
├── lib/                         # Utility libraries
│   └── supabase.ts             # Supabase client configuration
│
└── middleware.ts                # Route protection middleware
```

## 🎨 Design System

### Color Palette
- **Primary Blue**: `enostics-blue` - Main brand color
- **Success Green**: `enostics-green` - Success states
- **Warning Amber**: `enostics-amber` - Warning states  
- **Error Red**: `enostics-red` - Error states
- **Gray Scale**: `enostics-gray-[100-900]` - Text and backgrounds

### Component Variants
- **Glass**: Translucent cards with backdrop blur
- **Outline**: Border-only styling
- **Ghost**: Minimal styling for secondary actions

## 🧩 Component Architecture

### UI Components (`/ui`)
Base-level components following shadcn/ui patterns:
- Consistent API with variants using `class-variance-authority`
- TypeScript interfaces for all props
- Forwarded refs for proper composition

### Feature Components (`/features`)
Business logic components specific to Enostics functionality:
- Dashboard statistics and metrics
- Endpoint management interfaces
- Activity feeds and monitoring

### Layout Components (`/layout`)
Structural components for page organization:
- Fixed navbar with 100vh layout
- Responsive sidebar navigation
- Scrollable content areas

### Common Components (`/common`)
Reusable utility components:
- Loading states and spinners
- Empty state illustrations
- Error boundaries (future)

## 📱 Responsive Design

### Breakpoints
- **Mobile**: `< 768px` - Single column layouts
- **Tablet**: `768px - 1024px` - Two column grids
- **Desktop**: `> 1024px` - Full multi-column layouts

### Layout Strategy
- **100vh Structure**: Fixed height with scrollable content
- **Flex Layouts**: Consistent spacing and alignment
- **Grid Systems**: Responsive card layouts

## 🔄 State Management

### Current Approach
- **Client Components**: React state for UI interactions
- **Server Components**: Direct database queries
- **Mock Data**: Realistic sample data for development

### Future Considerations
- **Zustand**: For complex client state
- **React Query**: For server state management
- **Context**: For theme and user preferences

## 🚀 Development Workflow

### Adding New Components
1. **Determine Category**: UI, Feature, Layout, or Common
2. **Create Component**: Follow TypeScript + Tailwind patterns
3. **Export**: Add to appropriate index.ts file
4. **Document**: Update this structure guide

### Component Guidelines
- **TypeScript First**: All components fully typed
- **Tailwind Classes**: Use design system colors
- **Client Directive**: Add 'use client' for interactive components
- **Accessibility**: Include proper ARIA attributes

## 🔧 Technical Stack

- **Framework**: Next.js 14.2.5 with App Router
- **Styling**: Tailwind CSS with custom Enostics theme
- **Icons**: Lucide React for consistent iconography
- **Components**: Custom components with shadcn/ui patterns
- **Authentication**: Supabase Auth with middleware protection
- **TypeScript**: Strict mode for type safety

## 📈 Performance Optimizations

- **Server Components**: Default for static content
- **Client Components**: Only when interactivity needed
- **Lazy Loading**: Dynamic imports for heavy components
- **Image Optimization**: Next.js Image component
- **Bundle Splitting**: Automatic code splitting

## 🔐 Security Considerations

- **Route Protection**: Middleware-based auth checks
- **Type Safety**: TypeScript prevents runtime errors
- **Input Validation**: Form validation on client and server
- **Environment Variables**: Secure API key management

---

This structure provides a scalable foundation for the Enostics consumer platform while maintaining consistency with the broader Alset monorepo architecture. 