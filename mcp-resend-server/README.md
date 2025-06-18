# 🚀 Enostics Resend MCP Server

A powerful **Model Context Protocol (MCP) server** that integrates **Resend email service** with your **Enostics endpoint system**. This enables intelligent email notifications for endpoint activities, user onboarding, and automated reporting.

## ✨ Features

### 📧 **Smart Email Templates**
- **Endpoint Notifications**: Beautiful HTML emails for success/failure/warning actions
- **Welcome Emails**: Professional onboarding for new users
- **Activity Summaries**: Daily/weekly/monthly endpoint analytics
- **Custom Emails**: Full control over content and styling

### 🎯 **Enostics Integration**
- **Real-time Notifications**: Email alerts for every endpoint action
- **User Context**: Automatic username, endpoint name, and payload integration
- **Action Classification**: Success, failure, warning, and info notifications
- **Analytics Reporting**: Automated summary emails with stats and insights

### 🛠️ **MCP Tools Available**

| Tool | Description | Use Case |
|------|-------------|----------|
| `send_endpoint_notification` | Send action-based notifications | POST success/failure alerts |
| `send_welcome_email` | Onboard new users | Account creation |
| `send_endpoint_summary` | Send periodic analytics | Daily/weekly reports |
| `send_custom_email` | Send custom emails | Marketing, announcements |
| `get_email_status` | Check delivery status | Monitor email health |
| `list_recent_emails` | View email history | Debugging, analytics |

## 🏗️ Installation & Setup

### **Step 1: Install Dependencies**
```bash
cd mcp-resend-server
npm install
```

### **Step 2: Configure Environment**
Create `.env` file:
```bash
# Copy from template
cp env.example .env

# Edit with your values
RESEND_API_KEY=re_your_actual_api_key_here
RESEND_FROM_EMAIL=team@enostics.com
RESEND_DOMAIN=enostics.com
RESEND_REPLY_TO=support@enostics.com
```

### **Step 3: Build the Server**
```bash
npm run build
```

### **Step 4: Add to Cursor MCP Config**
Add to your `~/Library/Application Support/Cursor/User/globalStorage/rooveterinaryinc.cursor-small/settings/cline_mcp_settings.json`:

```json
{
  "mcpServers": {
    "enostics-resend": {
      "command": "node",
      "args": ["/path/to/mcp-resend-server/dist/index.js"],
      "env": {
        "RESEND_API_KEY": "re_your_api_key",
        "RESEND_FROM_EMAIL": "team@enostics.com",
        "RESEND_DOMAIN": "enostics.com"
      }
    }
  }
}
```

## 🎯 Usage Examples

### **1. Send Endpoint Success Notification**
```typescript
// In Cursor, use MCP tool:
send_endpoint_notification({
  userEmail: "user@example.com",
  username: "johndoe",
  endpointName: "Universal Inbox",
  actionType: "success",
  actionDetails: "Successfully received health data from Fitbit",
  payload: {
    steps: 8247,
    heartRate: 72,
    timestamp: "2024-01-15T10:30:00Z"
  },
  timestamp: "2024-01-15T10:30:00Z",
  sourceIp: "192.168.1.100"
})
```

### **2. Send Welcome Email to New User**
```typescript
send_welcome_email({
  userEmail: "newuser@example.com",
  username: "newuser",
  endpointUrl: "https://api.enostics.com/v1/newuser"
})
```

### **3. Send Weekly Summary**
```typescript
send_endpoint_summary({
  userEmail: "user@example.com",
  username: "johndoe",
  period: "weekly",
  stats: {
    totalRequests: 247,
    successfulRequests: 235,
    failedRequests: 12,
    topSources: ["Fitbit", "iPhone Health", "Manual Entry"],
    dataVolume: "1.2 MB"
  }
})
```

## 🎨 Email Templates Preview

### **Endpoint Notification Email**
- **Subject**: `✅ Endpoint SUCCESS: Universal Inbox`
- **Features**: Status indicators, payload viewer, source tracking
- **Styling**: Modern gradient header, responsive design, dark code blocks

### **Welcome Email**
- **Subject**: `🚀 Welcome to Enostics - Your Personal API is Ready!`
- **Features**: Endpoint URL display, code examples, quick start guide
- **Styling**: Professional branding, clear CTAs, helpful examples

### **Summary Email**
- **Subject**: `📊 Your weekly endpoint summary - 247 requests`
- **Features**: Success rate charts, top sources, data volume metrics
- **Styling**: Stats cards, progress indicators, analytics dashboard

## 🔧 Integration with Enostics

### **Automatic Notifications**
Integrate with your endpoint routes to send automatic notifications:

```typescript
// In your /api/v1/[username]/route.ts
export async function POST(request: NextRequest, { params }: { params: { username: string } }) {
  try {
    // ... existing endpoint logic ...
    
    // Send success notification via MCP
    await mcpClient.callTool('send_endpoint_notification', {
      userEmail: user.email,
      username: params.username,
      endpointName: 'Universal Inbox',
      actionType: 'success',
      actionDetails: `Successfully processed ${contentType} data`,
      payload: sanitizedPayload,
      timestamp: new Date().toISOString(),
      sourceIp: headers.sourceIp
    });
    
  } catch (error) {
    // Send failure notification
    await mcpClient.callTool('send_endpoint_notification', {
      userEmail: user.email,
      username: params.username,
      endpointName: 'Universal Inbox',
      actionType: 'failure',
      actionDetails: `Failed to process request: ${error.message}`,
      timestamp: new Date().toISOString(),
      sourceIp: headers.sourceIp
    });
  }
}
```

### **User Registration Hook**
```typescript
// In your registration flow
export async function createNewUser(userData: UserData) {
  // ... create user logic ...
  
  // Send welcome email
  await mcpClient.callTool('send_welcome_email', {
    userEmail: userData.email,
    username: userData.username,
    endpointUrl: `https://api.enostics.com/v1/${userData.username}`
  });
}
```

## 📊 Monitoring & Analytics

### **Email Delivery Tracking**
```typescript
// Check email status
const status = await mcpClient.callTool('get_email_status', {
  emailId: 'email_id_from_previous_send'
});

// List recent emails
const recentEmails = await mcpClient.callTool('list_recent_emails', {
  limit: 20
});
```

### **Error Handling**
The server includes comprehensive error handling:
- **Validation errors**: Zod schema validation for all inputs
- **Resend API errors**: Proper error propagation and logging
- **Rate limiting**: Built-in protection against spam
- **Retry logic**: Automatic retries for transient failures

## 🔒 Security Features

- **Input validation** with Zod schemas
- **Environment variable** protection
- **Rate limiting** for email sending
- **Sanitized payload** display in emails
- **No sensitive data** in email content

## 🚀 Advanced Usage

### **Custom Email Templates**
Extend the `EmailTemplates` class for custom designs:

```typescript
class CustomEmailTemplates extends EmailTemplates {
  static getCustomTemplate(data: any) {
    return {
      subject: 'Custom Subject',
      html: '<h1>Custom HTML</h1>',
      text: 'Custom text content'
    };
  }
}
```

### **Webhook Integration**
Use with Resend webhooks for delivery tracking:

```typescript
// Webhook handler for email events
export async function POST(request: Request) {
  const event = await request.json();
  
  if (event.type === 'email.delivered') {
    console.log(`Email ${event.data.email_id} delivered successfully`);
  }
}
```

## 🛠️ Development

### **Local Development**
```bash
# Watch mode for development
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### **Testing**
Test individual tools:
```bash
# Test endpoint notification
echo '{"userEmail":"test@example.com","username":"test","endpointName":"test","actionType":"success","actionDetails":"Test message"}' | node dist/index.js
```

## 📚 API Reference

### **send_endpoint_notification**
Send notifications for endpoint actions.

**Parameters:**
- `userEmail` (string, required): Recipient email
- `username` (string, required): Endpoint owner username
- `endpointName` (string, required): Name of the endpoint
- `actionType` (enum, required): 'success' | 'failure' | 'warning' | 'info'
- `actionDetails` (string, required): Description of the action
- `payload` (object, optional): Request payload data
- `timestamp` (string, optional): ISO timestamp
- `sourceIp` (string, optional): Source IP address
- `userAgent` (string, optional): User agent string

**Returns:**
- Success message with email ID

### **send_welcome_email**
Send welcome email to new users.

**Parameters:**
- `userEmail` (string, required): New user email
- `username` (string, required): Username
- `endpointUrl` (string, required): Personal API endpoint URL

**Returns:**
- Success message with email ID

### **send_endpoint_summary**
Send periodic activity summaries.

**Parameters:**
- `userEmail` (string, required): User email
- `username` (string, required): Username
- `period` (enum, required): 'daily' | 'weekly' | 'monthly'
- `stats` (object, required):
  - `totalRequests` (number): Total request count
  - `successfulRequests` (number): Successful request count
  - `failedRequests` (number): Failed request count
  - `topSources` (array): Top request sources
  - `dataVolume` (string): Human-readable data volume

**Returns:**
- Success message with email ID and stats summary

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for the Enostics universal personal API platform** 