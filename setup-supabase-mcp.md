# 🚀 Supabase MCP Setup for Enostics

## 📋 Current Database State Analysis

### ✅ **Existing Tables (Keep):**
- `enostics_endpoints` - Core endpoint system ✅
- `enostics_data` - Data storage ✅  
- `enostics_api_keys` - API management ✅

### ⚠️ **Conflicting Tables:**
- `profiles` vs `enostics_user_profiles` (Supabase default vs our custom)
- `roles`, `role_permissions`, `user_details` (generic RBAC vs Enostics-specific)

### 🎯 **Recommendation: Clean Enostics Database**

We should create a **focused, Enostics-only database** with these benefits:

**✅ Pros:**
- Clean, consistent naming (`enostics_*` prefix)
- Optimized for our exact use cases
- No conflicts with generic systems
- Better performance and maintainability
- Subscription-first architecture

**❌ Cons:**
- Requires migration of existing data
- May affect other projects using the same Supabase

## 🛠️ Implementation Strategy

### **Option 1: Clean Slate (Recommended)**
1. **Backup existing data**
2. **Drop conflicting tables** (`profiles`, `roles`, etc.)
3. **Run our clean schema** (`enostics-clean-database-schema.sql`)
4. **Migrate essential data**

### **Option 2: Coexistence**
1. **Keep existing tables**
2. **Add our Enostics tables alongside**
3. **Handle naming conflicts**

## 🔧 MCP Setup Instructions

### **1. Install Supabase MCP Server**

```bash
# Install the Supabase MCP server
npm install -g @supabase/mcp-server

# Or add to your project
npm install @supabase/mcp-server
```

### **2. Configure MCP Settings**

Create/update your MCP settings file:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["@supabase/mcp-server"],
      "env": {
        "SUPABASE_URL": "your-supabase-url",
        "SUPABASE_ANON_KEY": "your-anon-key",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key"
      }
    }
  }
}
```

### **3. Environment Variables**

Add to your `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# For MCP
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
```

## 📊 Core Tables Overview

### **🏗️ Essential Enostics Tables:**

1. **`enostics_user_profiles`** - User management with subscription tiers
2. **`enostics_endpoints`** - Universal endpoint system ✅
3. **`enostics_inbox_data`** - Universal inbox for all incoming data
4. **`enostics_api_keys`** - API key management ✅
5. **`enostics_contacts`** - Inter-user contact system
6. **`enostics_messages`** - User-to-user messaging
7. **`enostics_subscription_plans`** - Subscription tiers (Free/Developer/Business)
8. **`enostics_user_subscriptions`** - User subscription tracking
9. **`enostics_request_logs`** - Analytics and monitoring
10. **`enostics_activity_logs`** - User activity dashboard

### **🔧 Features Included:**

- **Universal Inbox** - Single endpoint per user (`/v1/username`)
- **Tier-based Permissions** - Free/Developer/Business restrictions
- **Inter-user Messaging** - Contact management and data sharing
- **Real-time Analytics** - Request tracking and performance metrics
- **Subscription Management** - Stripe integration ready
- **Row Level Security** - Proper data isolation
- **Auto-classification** - Smart data type detection

## 🚀 Migration Plan

### **Phase 1: Backup & Assessment**
```sql
-- Backup existing data
CREATE TABLE backup_enostics_endpoints AS SELECT * FROM enostics_endpoints;
CREATE TABLE backup_enostics_data AS SELECT * FROM enostics_data;
CREATE TABLE backup_enostics_api_keys AS SELECT * FROM enostics_api_keys;
```

### **Phase 2: Clean Schema Deployment**
```sql
-- Run the clean schema
\i enostics-clean-database-schema.sql
```

### **Phase 3: Data Migration**
```sql
-- Migrate existing data to new schema
INSERT INTO enostics_inbox_data (user_id, endpoint_id, payload, ...)
SELECT user_id, endpoint_id, data, ... FROM backup_enostics_data;
```

### **Phase 4: Application Updates**
- Update TypeScript types in `src/lib/supabase.ts`
- Update API routes to use new table names
- Update components to handle new schema

## 🎯 Next Steps

1. **Review the clean schema** (`enostics-clean-database-schema.sql`)
2. **Decide on migration strategy** (clean slate vs coexistence)
3. **Set up MCP connection**
4. **Run database migration**
5. **Update application code**

## ⚡ Quick Start Commands

```bash
# 1. Check current tables
node check-current-tables.js

# 2. Run clean schema (if approved)
# Execute enostics-clean-database-schema.sql in Supabase SQL Editor

# 3. Update TypeScript types
npm run generate-types

# 4. Test the application
npm run dev
```

Would you like me to proceed with the clean database migration? 