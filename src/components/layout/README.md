# Layout Components

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