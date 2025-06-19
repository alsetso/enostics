# Layout Components

This directory contains all layout-related components for the Enostics platform.

## Architecture Overview

The platform uses a **fixed frame layout** where the sidebar and top navigation create a cohesive frame around the main content area.

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐ ← 100vh Container
│ Sidebar (256px)    │ Top Navigation (64px)              │ ← Fixed Frame
│ ├─ Logo            │ ├─ Title/Subtitle                   │
│ ├─ Navigation      │ └─ Account Controls                 │
│ └─ User Info       │                                     │
├────────────────────┼─────────────────────────────────────┤
│                    │ Main Content Area                   │ ← Scrollable
│                    │ ├─ Hero Section (fixed)            │
│                    │ └─ Content (scrollable)            │
│                    │                                     │
└────────────────────┴─────────────────────────────────────┘
```

### Key Components

## DashboardTopNav
**Location**: `src/components/layout/dashboard-topnav.tsx`

Fixed top navigation that starts from the sidebar's right edge (left: 256px).

**Features**:
- Fixed positioning (`fixed top-0 left-64 right-0`)
- 64px height to match design system
- Account controls (notifications, help, billing, settings, user menu)
- Proper z-index layering (z-30)
- Integrated user context and sign-out functionality

**Props**:
- `title` (string): Main title text
- `subtitle` (string, optional): Subtitle text
- `className` (string, optional): Additional CSS classes

## DashboardSidebar
**Location**: `src/components/layout/dashboard-sidebar.tsx`

Fixed left sidebar that forms the left frame of the dashboard.

**Features**:
- Fixed positioning (256px width)
- Navigation items with transparent white highlights
- User context and authentication
- Upgrade prompts and feature management
- Mobile-responsive with overlay support

## PageWrapper
**Location**: `src/components/layout/page-wrapper.tsx`

Universal page wrapper that handles different layout variants.

**Dashboard Variant**:
- Uses `h-full` container (no min-height)
- Proper sidebar integration
- Content area offset by `lg:ml-64`
- No built-in padding (handled by individual pages)

## Layout Integration

### Dashboard Layout
**Location**: `src/app/dashboard/layout.tsx`

```tsx
<div className="h-screen overflow-hidden bg-black">
  <DashboardLayoutClient>
    {children}
  </DashboardLayoutClient>
</div>
```

### Page Implementation
**Location**: `src/app/dashboard/page.tsx`

```tsx
<div className="h-full flex flex-col pt-16">
  <DashboardTopNav title="Inbox" subtitle="..." />
  {/* Fixed hero section */}
  <div className="flex-shrink-0">...</div>
  {/* Scrollable content */}
  <div className="flex-1 overflow-hidden">...</div>
</div>
```

### CSS Classes Used

**Frame Structure**:
- `h-screen overflow-hidden`: Viewport container
- `fixed top-0 left-64 right-0`: Top nav positioning
- `pt-16`: Content offset for fixed top nav
- `flex-shrink-0`: Fixed sections
- `flex-1 overflow-hidden`: Scrollable areas

**Visual Design**:
- `bg-white/10`: Transparent white highlights
- `bg-gray-950/900`: Dark theme backgrounds
- `border-gray-800`: Subtle borders
- `z-30`: Proper layering

## Best Practices

1. **Fixed Frame**: Always maintain the 256px sidebar + 64px top nav frame
2. **Scrolling**: Only content areas should scroll, never the frame
3. **Spacing**: Use `pt-16` on main content to account for fixed top nav
4. **Z-Index**: Top nav (z-30), sidebar (z-40), modals (z-50)
5. **Responsive**: Sidebar collapses on mobile, top nav adjusts accordingly

## Mobile Considerations

- Sidebar becomes overlay on mobile (`lg:block hidden`)
- Top nav adjusts to full width when sidebar is hidden
- Touch-friendly button sizes and spacing
- Proper mobile menu integration

This architecture ensures a professional, cohesive frame that works across all screen sizes while maintaining proper scrolling behavior and visual hierarchy.

## OnboardingBanner

The `OnboardingBanner` component is a persistent top banner that appears for users who have verified their email but haven't completed the onboarding process.

### Features

- **Smart Detection**: Automatically checks onboarding status via Supabase
- **Progress Tracking**: Shows completion percentage and next step
- **Session Persistence**: Remembers if user dismissed banner
- **Time-Limited**: Only shows for accounts created within 7 days
- **Page Exclusions**: Hidden on registration, login, and onboarding pages

### Usage

```tsx
import { OnboardingBanner } from '@/components/layout/onboarding-banner'

// Automatically included in LayoutWrapper
<OnboardingBanner />
```

## GlobalNavbar

The `GlobalNavbar` component is a unified navigation solution that adapts to different pages and user states across the entire Enostics application.

### Features

- **Single Source of Truth**: One navbar component for all pages
- **Smart Authentication**: Automatically detects user login state via Supabase
- **Context-Aware**: Different navigation links and dropdown items based on page variant
- **Consistent Design**: Same visual design and interactions across all pages
- **Mobile Responsive**: Built-in mobile menu support

### Usage

```tsx
import { GlobalNavbar } from '@/components/layout/global-navbar'

// Homepage
<GlobalNavbar 
  variant="homepage"
  showMobileMenuButton={true}
  onMobileMenuClick={() => setIsModalOpen(true)}
/>

// Documentation page
<GlobalNavbar 
  variant="docs"
  showMobileMenuButton={true}
  onMobileMenuClick={() => setIsMobileSidebarOpen(true)}
/>

// Dashboard
<GlobalNavbar 
  variant="dashboard"
  showNotifications={true}
/>
```

### Props

- `variant`: Controls navigation links and dropdown items
  - `'homepage'` - Basic navigation (Playground, Documentation)
  - `'docs'` - Documentation-focused navigation
  - `'dashboard'` - Dashboard navigation with Data, Analytics links
  - `'default'` - Fallback variant

- `showNotifications`: Shows notification bell icon (dashboard only)
- `showMobileMenuButton`: Shows mobile menu button for sidebar toggles
- `onMobileMenuClick`: Callback for mobile menu button clicks

### Authentication States

**Logged Out Users:**
- Settings dropdown shows: Sign In, Sign Up

**Logged In Users:**
- Settings dropdown shows: Dashboard, Profile, Settings/Endpoints, Sign Out
- Logo links to dashboard instead of homepage
- Dashboard variant includes additional management links

### Benefits

1. **Consistency**: Same design, animations, and behavior everywhere
2. **Maintainability**: Single component to update for global changes
3. **Performance**: Shared authentication state and logic
4. **Flexibility**: Easy to add new variants or customize per page
5. **Mobile-First**: Built-in responsive design with mobile menu support

### Migration from Old System

Previously had three separate navbar implementations:
- Homepage: Inline navigation in `src/app/page.tsx`
- Docs: Inline navigation in `src/app/docs/page.tsx`  
- Dashboard: Separate component in `src/components/layout/navbar.tsx`

Now unified into single `GlobalNavbar` component with variant-based configuration. 