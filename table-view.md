# 📊 Enostics Platform - Table View Documentation

## Overview
This document maps all page routes in the Enostics platform to their corresponding database tables, providing a clear understanding of which tables are actively used on each page.

---

## 🏠 **Main Platform Pages**

### **Root Pages**
- **Route:** `/`
- **Description:** Homepage/Landing page
- **Tables:** 
  - 🟢 `profiles` - User profile data for personalization
  - 🟢 `endpoints` - Endpoint count/stats display
  - 🟡 `usage_events` - Analytics for homepage metrics

### **Route:** `/login`
- **Description:** User authentication page
- **Tables:**
  - 🟢 `profiles` - User profile creation/retrieval
  - 🟢 `user_settings` - Default settings initialization

### **Route:** `/register`
- **Description:** User registration page
- **Tables:**
  - 🟢 `profiles` - New user profile creation
  - 🟢 `user_settings` - Initial settings setup
  - 🟢 `endpoints` - Default endpoint creation

### **Route:** `/onboarding`
- **Description:** User onboarding flow
- **Tables:**
  - 🟢 `profiles` - User profile setup
  - 🟢 `onboarding` - Onboarding progress tracking
  - 🟢 `endpoints` - First endpoint creation
  - 🟢 `user_settings` - Initial preferences

---

## 🎛️ **Dashboard Pages**

### **Route:** `/dashboard` (Main Dashboard/Inbox)
- **Description:** Universal personal inbox for receiving data
- **Tables:**
  - 🟢 `inbox` - Inbox messages and data
  - 🟢 `inbox_config` - Inbox configuration settings
  - 🟢 `data` - Incoming data display
  - 🟢 `logs` - Request/activity logs
  - 🟢 `endpoints` - Endpoint status and metrics
  - 🟢 `profiles` - User profile data

### **Route:** `/dashboard/chat`
- **Description:** Chat with local AI models
- **Tables:**
  - 🟢 `chat_conversations` - Chat session management
  - 🟢 `chat_messages` - Individual chat messages
  - 🟢 `profiles` - User context for AI
  - 🟡 `data` - Data context for AI responses

### **Route:** `/dashboard/business`
- **Description:** Multi-endpoint management and business features
- **Tables:**
  - 🟢 `organizations` - Business organization data
  - 🟢 `organization_members` - Team member management
  - 🟢 `organization_invitations` - Pending invitations
  - 🟢 `endpoints` - Business endpoint management
  - 🟢 `subscriptions` - Business plan subscriptions
  - 🟢 `profiles` - User/member profiles

### **Route:** `/dashboard/analytics`
- **Description:** Real-time monitoring and performance metrics
- **Tables:**
  - 🟢 `data` - Data metrics and analytics
  - 🟢 `logs` - Request logs for analytics
  - 🟢 `usage_events` - Usage tracking
  - 🟢 `endpoints` - Endpoint performance metrics
  - 🟢 `activity_logs` - Activity tracking
  - 🟡 `workflows` - Workflow execution metrics

### **Route:** `/dashboard/webhooks`
- **Description:** Forward requests to external URLs
- **Tables:**
  - 🟢 `webhooks` - Webhook configurations
  - 🟢 `webhook_logs` - Webhook execution logs
  - 🟢 `endpoints` - Associated endpoints
  - 🟢 `logs` - General request logs

### **Route:** `/dashboard/keys`
- **Description:** Manage authentication keys
- **Tables:**
  - 🟢 `keys` - API key management
  - 🟢 `endpoints` - Key-endpoint associations
  - 🟢 `profiles` - User key ownership
  - 🟡 `usage_events` - Key usage tracking

### **Route:** `/dashboard/data`
- **Description:** View and manage your data
- **Tables:**
  - 🟢 `data` - Primary data storage
  - 🟢 `endpoints` - Data source endpoints
  - 🟢 `logs` - Data access logs
  - 🟡 `workflows` - Data processing workflows
  - 🟡 `integrations` - Data integration sources

### **Route:** `/dashboard/playground`
- **Description:** Test endpoints with custom payloads
- **Tables:**
  - 🟢 `endpoints` - Endpoint testing
  - 🟢 `logs` - Test request logs
  - 🟢 `data` - Test data storage
  - 🟡 `profiles` - User test history

### **Route:** `/dashboard/agents`
- **Description:** AI agent management and configuration
- **Tables:**
  - 🟡 `agents` - Agent configurations
  - 🟡 `workflows` - Agent workflows
  - 🟢 `endpoints` - Agent-endpoint associations
  - 🟢 `logs` - Agent execution logs

### **Route:** `/dashboard/ai-tools`
- **Description:** AI tools and utilities
- **Tables:**
  - 🟡 `agents` - AI tool configurations
  - 🟢 `data` - AI processing data
  - 🟢 `chat_conversations` - AI interactions
  - 🟢 `profiles` - User AI preferences

### **Route:** `/dashboard/integrations`
- **Description:** External service integrations
- **Tables:**
  - 🟡 `integrations` - Integration configurations
  - 🟢 `endpoints` - Integration endpoints
  - 🟢 `logs` - Integration logs
  - 🟡 `webhooks` - Integration webhooks

### **Route:** `/dashboard/workflows`
- **Description:** Automation workflows
- **Tables:**
  - 🟢 `workflows` - Workflow definitions
  - 🟢 `endpoints` - Workflow triggers
  - 🟢 `logs` - Workflow execution logs
  - 🟡 `agents` - AI workflow components

### **Route:** `/dashboard/endpoints`
- **Description:** Endpoint management and configuration
- **Tables:**
  - 🟢 `endpoints` - Endpoint configurations
  - 🟢 `keys` - Endpoint authentication
  - 🟢 `logs` - Endpoint request logs
  - 🟢 `data` - Endpoint data
  - 🟡 `webhooks` - Endpoint webhooks

### **Route:** `/dashboard/domains`
- **Description:** Custom domain management
- **Tables:**
  - 🟡 `domains` - Domain configurations
  - 🟢 `endpoints` - Domain-endpoint mapping
  - 🟢 `profiles` - Domain ownership

---

## ⚙️ **Settings Pages**

### **Route:** `/dashboard/settings`
- **Description:** General user settings
- **Tables:**
  - 🟢 `user_settings` - User preferences
  - 🟢 `profiles` - User profile settings
  - 🟢 `notifications` - Notification preferences

### **Route:** `/dashboard/settings/billing`
- **Description:** Billing and subscription management
- **Tables:**
  - 🟢 `subscriptions` - Subscription data
  - 🟢 `usage_events` - Usage tracking for billing
  - 🟢 `profiles` - Billing profile info
  - 🟡 `organizations` - Business billing

### **Route:** `/dashboard/settings/email`
- **Description:** Email settings and preferences
- **Tables:**
  - 🟢 `emails` - Email configurations
  - 🟢 `notifications` - Email notification settings
  - 🟢 `profiles` - User email preferences

### **Route:** `/dashboard/settings/usage`
- **Description:** Usage statistics and limits
- **Tables:**
  - 🟢 `usage_events` - Usage tracking
  - 🟢 `subscriptions` - Usage limits
  - 🟢 `endpoints` - Endpoint usage stats

---

## 📚 **Documentation & Support Pages**

### **Route:** `/docs`
- **Description:** Platform documentation
- **Tables:**
  - 🟢 `profiles` - User-specific docs
  - 🟢 `endpoints` - Endpoint documentation
  - 🟡 `suggestions` - Documentation feedback

### **Route:** `/logs`
- **Description:** System logs and monitoring
- **Tables:**
  - 🟢 `logs` - System logs
  - 🟢 `activity_logs` - Activity tracking
  - 🟢 `endpoints` - Endpoint logs

---

## 🔧 **API Routes**

### **Route:** `/api/[username]`
- **Description:** User endpoint API
- **Tables:**
  - 🟢 `endpoints` - Endpoint configuration
  - 🟢 `data` - Data storage
  - 🟢 `logs` - Request logging
  - 🟢 `keys` - Authentication

### **Route:** `/api/ai/*`
- **Description:** AI processing endpoints
- **Tables:**
  - 🟢 `chat_conversations` - AI chat sessions
  - 🟢 `chat_messages` - AI messages
  - 🟡 `agents` - AI agent processing
  - 🟢 `data` - AI context data

### **Route:** `/api/analytics/*`
- **Description:** Analytics API endpoints
- **Tables:**
  - 🟢 `usage_events` - Usage analytics
  - 🟢 `logs` - Request analytics
  - 🟢 `data` - Data analytics
  - 🟢 `endpoints` - Endpoint metrics

---

## 🎯 **Coming Soon/Beta Pages**

### **Route:** `/beta`
- **Description:** Beta features testing
- **Tables:**
  - 🟡 `profiles` - Beta user tracking
  - 🟡 `suggestions` - Beta feedback

### **Route:** `/research`
- **Description:** Research and development features
- **Tables:**
  - 🟡 `data` - Research data
  - 🟡 `profiles` - Research participants

### **Route:** `/news`
- **Description:** Platform news and updates
- **Tables:**
  - 🟡 `notifications` - News notifications
  - 🟡 `profiles` - User news preferences

---

## 📊 **Table Status Legend**

- 🟢 **GREEN:** Live/Active - Currently used in production
- 🟡 **YELLOW:** Planned/Partial - In development or partially implemented
- 🔴 **RED:** Inactive/Deprecated - Should be removed or replaced

---

## 🔍 **Table Descriptions**

### **Core Active Tables**
- **`data`** - Main data storage for all incoming endpoint data
- **`endpoints`** - Endpoint configurations and metadata
- **`profiles`** - User profile information and settings
- **`logs`** - Request and activity logging
- **`keys`** - API key management and authentication
- **`user_settings`** - User preferences and configurations

### **Communication Tables**
- **`chat_conversations`** - AI chat session management
- **`chat_messages`** - Individual chat messages
- **`emails`** - Email configurations and templates
- **`notifications`** - User notification preferences

### **Business Tables**
- **`organizations`** - Business organization management
- **`organization_members`** - Team member management
- **`organization_invitations`** - Pending team invitations
- **`subscriptions`** - Billing and subscription data

### **Integration Tables**
- **`webhooks`** - Webhook configurations
- **`webhook_logs`** - Webhook execution logs
- **`integrations`** - External service integrations
- **`workflows`** - Automation workflow definitions

### **Analytics Tables**
- **`usage_events`** - Usage tracking and analytics
- **`activity_logs`** - User activity tracking

### **Utility Tables**
- **`inbox`** - Inbox message management
- **`inbox_config`** - Inbox configuration settings
- **`onboarding`** - User onboarding progress
- **`suggestions`** - User feedback and suggestions

---

## 🚀 **Next Steps**

1. **Validate Active Tables:** Ensure all 🟢 tables are properly indexed and optimized
2. **Implement Yellow Tables:** Complete development of 🟡 planned features
3. **Clean Up Red Tables:** Remove any 🔴 deprecated tables
4. **Add Missing Tables:** Identify any gaps in the current table structure
5. **Optimize Relationships:** Ensure proper foreign key relationships between related tables

---

*Last Updated: [Current Date]*
*Version: 1.0* 