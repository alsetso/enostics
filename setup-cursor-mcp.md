# 🚀 Enostics Resend MCP Server Setup Guide

## Overview
This MCP server provides beautiful, branded email notifications for your Enostics platform with consistent design components and flexible content areas.

## ✨ Features
- **🎨 Consistent Email Branding**: Unified header/footer with Enostics gradient design
- **📧 6 Email Tools**: Endpoint notifications, welcome emails, summaries, custom emails, status checks, and email history
- **🧩 Modular Components**: Reusable status badges, data cards, stats grids, code blocks, and info boxes
- **📱 Mobile Responsive**: Beautiful emails that work on all devices
- **⚡ Real-time Integration**: Connect directly to your endpoint actions

## 🔧 Installation

### Step 1: Install Dependencies
```bash
cd mcp-resend-server
npm install
```

### Step 2: Configure Environment
Create `.env` file with your Resend credentials:
```bash
# 🔑 Resend API Configuration
RESEND_API_KEY=re_VrqtoiKr_M3BxFrj5sLPJ7XYEq8RnEvf1
RESEND_FROM_EMAIL=team@enostics.com
RESEND_DOMAIN=enostics.com

# 📧 Default email settings
DEFAULT_REPLY_TO=support@enostics.com

# 🌐 Enostics Platform URLs
ENOSTICS_DASHBOARD_URL=https://enostics.com/dashboard
ENOSTICS_DOCS_URL=https://enostics.com/docs
ENOSTICS_API_URL=https://api.enostics.com
```

### Step 3: Test the Server
```bash
npm test
```

### Step 4: Configure Cursor MCP
Add to your Cursor MCP settings (`~/Library/Application Support/Cursor/User/globalStorage/rooveterinaryinc.cursor-small/settings/cline_mcp_settings.json`):

```json
{
  "mcpServers": {
    "enostics-resend": {
      "command": "node",
      "args": ["/path/to/your/mcp-resend-server/src/index.ts"],
      "env": {
        "RESEND_API_KEY": "re_VrqtoiKr_M3BxFrj5sLPJ7XYEq8RnEvf1",
        "RESEND_FROM_EMAIL": "team@enostics.com",
        "RESEND_DOMAIN": "enostics.com"
      }
    }
  }
}
```

## 🎨 Email Components

### Email Wrapper
The main `createEmailWrapper()` function provides:
- **Consistent Header**: Enostics gradient with logo and title
- **Flexible Content Area**: Your custom content goes here
- **CTA Buttons**: Primary/secondary action buttons
- **Professional Footer**: Links, branding, and contact info

### Available Components
- `createStatusBadge()` - Success/failure/warning/info badges
- `createDataCard()` - Bordered content cards with icons
- `createStatsGrid()` - Metrics display with icons and colors
- `createCodeBlock()` - Syntax-highlighted code examples
- `createInfoBox()` - Tips, warnings, and notes

### Example Usage
```typescript
const { html, text } = createEmailWrapper({
  title: '🚀 Endpoint Success',
  preheader: 'Your API received data successfully',
  username: 'johndoe',
  children: `
    ${createStatusBadge({ type: 'success', text: 'SUCCESS: /api/health' })}
    ${createDataCard({
      title: 'Request Details',
      icon: '📊',
      children: '<p>POST request processed successfully</p>'
    })}
  `,
  ctaButton: {
    text: 'View Dashboard',
    url: 'https://enostics.com/dashboard',
    style: 'primary'
  }
});
```

## 🛠️ Available Tools

### 1. `send_endpoint_notification`
Real-time alerts for endpoint activity:
```json
{
  "userEmail": "user@example.com",
  "username": "johndoe",
  "endpointName": "/api/health",
  "actionType": "success",
  "actionDetails": "Health check completed successfully",
  "payload": { "status": "healthy", "timestamp": "2024-01-01T12:00:00Z" },
  "timestamp": "2024-01-01T12:00:00Z",
  "sourceIp": "192.168.1.1",
  "userAgent": "MyApp/1.0"
}
```

### 2. `send_welcome_email`
Professional onboarding for new users:
```json
{
  "userEmail": "newuser@example.com",
  "username": "newuser",
  "endpointUrl": "https://api.enostics.com/v1/newuser"
}
```

### 3. `send_endpoint_summary`
Periodic analytics reports:
```json
{
  "userEmail": "user@example.com",
  "username": "johndoe",
  "period": "weekly",
  "stats": {
    "totalRequests": 1250,
    "successfulRequests": 1200,
    "failedRequests": 50,
    "topSources": ["192.168.1.1", "10.0.0.1", "example.com"],
    "dataVolume": "2.5 MB"
  }
}
```

### 4. `send_custom_email`
Full control over email content:
```json
{
  "to": ["user@example.com"],
  "subject": "Custom Notification",
  "html": "<h1>Custom HTML content</h1>",
  "text": "Custom plain text content"
}
```

### 5. `get_email_status`
Check delivery status:
```json
{
  "emailId": "resend_email_id_here"
}
```

### 6. `list_recent_emails`
View email history:
```json
{
  "limit": 10
}
```

## 🔗 Integration with Enostics

### Automatic Endpoint Notifications
Add to your endpoint handlers (`/api/v1/[username]/route.ts`):

```typescript
// On successful endpoint action
await mcpClient.callTool('send_endpoint_notification', {
  userEmail: user.email,
  username: user.username,
  endpointName: request.url,
  actionType: 'success',
  actionDetails: 'Data received and processed successfully',
  payload: requestData,
  timestamp: new Date().toISOString(),
  sourceIp: request.ip,
  userAgent: request.headers['user-agent']
});

// On endpoint failure
await mcpClient.callTool('send_endpoint_notification', {
  userEmail: user.email,
  username: user.username,
  endpointName: request.url,
  actionType: 'failure',
  actionDetails: 'Failed to process request: Invalid JSON',
  timestamp: new Date().toISOString(),
  sourceIp: request.ip
});
```

### Welcome Email on Registration
Add to your user registration flow:

```typescript
// After successful user registration
await mcpClient.callTool('send_welcome_email', {
  userEmail: newUser.email,
  username: newUser.username,
  endpointUrl: `https://api.enostics.com/v1/${newUser.username}`
});
```

### Scheduled Summary Emails
Set up cron jobs for periodic summaries:

```typescript
// Daily/weekly/monthly summaries
await mcpClient.callTool('send_endpoint_summary', {
  userEmail: user.email,
  username: user.username,
  period: 'daily',
  stats: await getEndpointStats(user.id, 'daily')
});
```

## 🎯 Email Templates

All emails feature:
- **🎨 Enostics Branding**: Gradient headers, consistent colors, professional typography
- **📱 Mobile Responsive**: Optimized for all device sizes
- **🔗 Dashboard Integration**: Direct links to relevant dashboard sections
- **💾 Real-time Data**: Live payload display, source tracking, timestamps
- **🎯 Clear Actions**: Prominent CTA buttons for next steps

## 🐛 Troubleshooting

### Common Issues
1. **"Module not found" errors**: Run `npm install` to install dependencies
2. **"Not authorized to send emails"**: Verify your Resend API key and domain setup
3. **"Template rendering failed"**: Check that all required parameters are provided
4. **MCP connection issues**: Ensure the correct path in Cursor settings

### Debug Mode
Enable debug logging:
```bash
DEBUG=resend:* npm test
```

### Test Email Sending
```bash
node -e "
const { createEmailWrapper } = require('./src/email-components.js');
const template = createEmailWrapper({
  title: 'Test Email',
  children: '<p>This is a test email</p>'
});
console.log('HTML:', template.html.length, 'chars');
console.log('Text:', template.text.length, 'chars');
"
```

## 📚 Next Steps

1. **Integrate with Endpoints**: Add notification calls to your API routes
2. **Customize Templates**: Modify email components for your specific needs
3. **Set Up Monitoring**: Use email status checks to monitor delivery
4. **Schedule Summaries**: Implement periodic reporting for users
5. **A/B Test**: Try different email designs and measure engagement

## 🤝 Support

- **Documentation**: [https://enostics.com/docs](https://enostics.com/docs)
- **Dashboard**: [https://enostics.com/dashboard](https://enostics.com/dashboard)
- **Issues**: Create issues in your repository
- **Email**: team@enostics.com

---

**🚀 Ready to send beautiful, contextual emails for every endpoint action!** 