#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  CallToolResult,
  TextContent,
  ImageContent,
} from '@modelcontextprotocol/sdk/types.js';
import { Resend } from 'resend';
import { z } from 'zod';
import dotenv from 'dotenv';
import {
  createEmailWrapper,
  createStatusBadge,
  createDataCard,
  createStatsGrid,
  createCodeBlock,
  createInfoBox,
  EmailWrapperProps
} from './email-components.js';

// Load environment variables
dotenv.config();

// Validation schemas
const EndpointNotificationSchema = z.object({
  userEmail: z.string().email(),
  username: z.string(),
  endpointName: z.string(),
  actionType: z.enum(['success', 'failure', 'warning', 'info']),
  actionDetails: z.string(),
  payload: z.record(z.any()).optional(),
  timestamp: z.string().optional(),
  sourceIp: z.string().optional(),
  userAgent: z.string().optional(),
});

const CustomEmailSchema = z.object({
  to: z.array(z.string().email()),
  subject: z.string(),
  html: z.string().optional(),
  text: z.string().optional(),
  from: z.string().email().optional(),
  replyTo: z.string().email().optional(),
});

const WelcomeEmailSchema = z.object({
  userEmail: z.string().email(),
  username: z.string(),
  endpointUrl: z.string(),
});

const EndpointSummarySchema = z.object({
  userEmail: z.string().email(),
  username: z.string(),
  period: z.enum(['daily', 'weekly', 'monthly']),
  stats: z.object({
    totalRequests: z.number(),
    successfulRequests: z.number(),
    failedRequests: z.number(),
    topSources: z.array(z.string()),
    dataVolume: z.string(),
  }),
});

// Initialize Resend client with provided credentials
const resend = new Resend(process.env.RESEND_API_KEY || 're_VrqtoiKr_M3BxFrj5sLPJ7XYEq8RnEvf1');
const DEFAULT_FROM = process.env.RESEND_FROM_EMAIL || 'team@enostics.com';
const DOMAIN = process.env.RESEND_DOMAIN || 'enostics.com';

// Email templates using the new wrapper components
class EmailTemplates {
  static getEndpointNotificationTemplate(data: z.infer<typeof EndpointNotificationSchema>) {
    const { username, endpointName, actionType, actionDetails, timestamp, sourceIp, payload, userAgent } = data;
    
    const statusEmoji = {
      success: '✅',
      failure: '❌', 
      warning: '⚠️',
      info: 'ℹ️'
    }[actionType];

    const statusText = {
      success: 'SUCCESS',
      failure: 'FAILURE',
      warning: 'WARNING',
      info: 'INFO'
    }[actionType];

    // Build the main content
    const statusBadge = createStatusBadge({
      type: actionType,
      text: `${statusText}: ${endpointName}`
    });

    const detailsCard = createDataCard({
      title: '📋 Action Details',
      icon: '🔍',
      children: `
        <p><strong>Description:</strong> ${actionDetails}</p>
        ${timestamp ? `<p><strong>Time:</strong> ${new Date(timestamp).toLocaleString()}</p>` : ''}
        ${sourceIp ? `<p><strong>Source IP:</strong> <code>${sourceIp}</code></p>` : ''}
        ${userAgent ? `<p><strong>User Agent:</strong> ${userAgent}</p>` : ''}
      `
    });

    const payloadSection = payload ? createDataCard({
      title: '📦 Payload Data',
      icon: '💾',
      children: createCodeBlock(JSON.stringify(payload, null, 2))
    }) : '';

    const tipBox = createInfoBox(
      'You can manage your notification preferences and endpoint settings in your dashboard.',
      'tip'
    );

    const content = `
      ${statusBadge}
      
      <p style="font-size: 16px; color: #4b5563; margin: 24px 0;">
        Your endpoint <strong>${endpointName}</strong> received activity that requires your attention.
      </p>
      
      ${detailsCard}
      ${payloadSection}
      ${tipBox}
    `;

    return createEmailWrapper({
      title: `${statusEmoji} Endpoint Activity Alert`,
      preheader: `${statusText}: ${actionDetails}`,
      username,
      children: content,
      ctaButton: {
        text: 'View Dashboard',
        url: 'https://enostics.com/dashboard',
        style: 'primary'
      },
      footerMessage: 'Stay connected with real-time endpoint notifications'
    });
  }

  static getWelcomeTemplate(data: z.infer<typeof WelcomeEmailSchema>) {
    const { username, endpointUrl } = data;
    
    const welcomeCard = createDataCard({
      title: '🎯 Your Personal API Endpoint',
      icon: '🚀',
      color: '#10b981',
      children: `
        <div style="background: white; padding: 16px; border-radius: 6px; border: 1px solid #d1d5db; margin: 12px 0;">
          <code style="color: #0c4a6e; font-family: 'Monaco', monospace; font-size: 14px; word-break: break-all;">
            ${endpointUrl}
          </code>
        </div>
        <p style="margin: 12px 0 0 0; color: #065f46; font-size: 14px;">
          💡 This endpoint can receive POST requests with any JSON or text data
        </p>
      `
    });

    const examplesCard = createDataCard({
      title: '🛠️ Quick Start Examples',
      icon: '⚡',
      children: `
        <h4 style="color: #374151; margin: 0 0 8px 0; font-size: 14px;">📡 cURL Example</h4>
        ${createCodeBlock(`curl -X POST ${endpointUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Hello from my app!", "timestamp": "${new Date().toISOString()}"}'`)}
        
        <h4 style="color: #374151; margin: 16px 0 8px 0; font-size: 14px;">🌐 JavaScript/Fetch</h4>
        ${createCodeBlock(`fetch('${endpointUrl}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Data from my web app',
    user: 'current_user_id',
    timestamp: new Date().toISOString()
  })
})`)}
      `
    });

    const nextStepsBox = createInfoBox(`
      <ul style="margin: 0; padding-left: 20px;">
        <li>Send test data to your endpoint</li>
        <li>Connect your apps, devices, or webhooks</li>
        <li>View real-time data in your dashboard</li>
        <li>Set up automated actions and alerts</li>
      </ul>
    `, 'tip');

    const content = `
      <p style="font-size: 18px; color: #1f2937; margin: 0 0 24px 0;">
        Congratulations! You now have your own universal personal API endpoint. 
        This is your gateway to collect, process, and automate data from any source.
      </p>
      
      ${welcomeCard}
      ${examplesCard}
      ${nextStepsBox}
    `;

    return createEmailWrapper({
      title: '🚀 Welcome to Enostics!',
      preheader: 'Your personal API endpoint is live and ready to receive data',
      username,
      children: content,
      ctaButton: {
        text: 'Open Your Dashboard →',
        url: 'https://enostics.com/dashboard',
        style: 'primary'
      },
      footerMessage: 'Questions? Reply to this email or check our documentation'
    });
  }

  static getEndpointSummaryTemplate(data: z.infer<typeof EndpointSummarySchema>) {
    const { username, period, stats } = data;
    const { totalRequests, successfulRequests, failedRequests, topSources, dataVolume } = stats;
    const successRate = totalRequests > 0 ? Math.round((successfulRequests / totalRequests) * 100) : 0;

    const statsGrid = createStatsGrid({
      stats: [
        {
          label: 'Total Requests',
          value: totalRequests,
          icon: '📊',
          color: '#3b82f6'
        },
        {
          label: 'Success Rate',
          value: `${successRate}%`,
          icon: '✅',
          color: '#10b981'
        },
        {
          label: 'Data Volume',
          value: dataVolume,
          icon: '💾',
          color: '#8b5cf6'
        }
      ]
    });

    const detailsCard = createDataCard({
      title: '📈 Detailed Breakdown',
      icon: '📋',
      children: `
        <div style="display: grid; gap: 12px;">
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            <span style="font-weight: 500; color: #6b7280;">✅ Successful:</span>
            <span style="color: #10b981; font-weight: 600;">${successfulRequests}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            <span style="font-weight: 500; color: #6b7280;">❌ Failed:</span>
            <span style="color: #ef4444; font-weight: 600;">${failedRequests}</span>
          </div>
        </div>
      `
    });

    const topSourcesCard = topSources.length > 0 ? createDataCard({
      title: '🔝 Top Sources',
      icon: '📍',
      children: `
        <ul style="margin: 0; padding: 0; list-style: none;">
          ${topSources.map((source, index) => `
            <li style="display: flex; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="background: #667eea; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; margin-right: 12px;">
                ${index + 1}
              </span>
              <span style="color: #1f2937; font-family: 'Monaco', monospace; font-size: 14px;">${source}</span>
            </li>
          `).join('')}
        </ul>
      `
    }) : '';

    const content = `
      <p style="font-size: 16px; color: #4b5563; margin: 0 0 24px 0;">
        Here's your ${period} endpoint activity summary. Your API is staying busy!
      </p>
      
      ${statsGrid}
      ${detailsCard}
      ${topSourcesCard}
    `;

    return createEmailWrapper({
      title: `📊 ${period.charAt(0).toUpperCase() + period.slice(1)} Summary`,
      preheader: `${totalRequests} requests with ${successRate}% success rate`,
      username,
      children: content,
      ctaButton: {
        text: 'View Full Analytics →',
        url: 'https://enostics.com/dashboard/data',
        style: 'primary'
      },
      footerMessage: 'Want to change your notification preferences? Update settings in your dashboard'
    });
  }
}

// MCP Server implementation
class ResendMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'enostics-resend-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'send_endpoint_notification',
            description: 'Send email notification for endpoint actions (success, failure, etc.)',
            inputSchema: {
              type: 'object',
              properties: {
                userEmail: { type: 'string', format: 'email', description: 'Recipient email address' },
                username: { type: 'string', description: 'Username of the endpoint owner' },
                endpointName: { type: 'string', description: 'Name of the endpoint that received the action' },
                actionType: { 
                  type: 'string', 
                  enum: ['success', 'failure', 'warning', 'info'],
                  description: 'Type of action that occurred'
                },
                actionDetails: { type: 'string', description: 'Detailed description of what happened' },
                payload: { 
                  type: 'object', 
                  description: 'Optional payload data that was sent to the endpoint',
                  additionalProperties: true
                },
                timestamp: { type: 'string', description: 'ISO timestamp of when the action occurred' },
                sourceIp: { type: 'string', description: 'IP address of the request source' },
                userAgent: { type: 'string', description: 'User agent of the request' },
              },
              required: ['userEmail', 'username', 'endpointName', 'actionType', 'actionDetails'],
            },
          },
          {
            name: 'send_welcome_email',
            description: 'Send welcome email to new Enostics users',
            inputSchema: {
              type: 'object',
              properties: {
                userEmail: { type: 'string', format: 'email', description: 'New user email address' },
                username: { type: 'string', description: 'New user username' },
                endpointUrl: { type: 'string', description: 'User\'s personal API endpoint URL' },
              },
              required: ['userEmail', 'username', 'endpointUrl'],
            },
          },
          {
            name: 'send_endpoint_summary',
            description: 'Send periodic summary of endpoint activity',
            inputSchema: {
              type: 'object',
              properties: {
                userEmail: { type: 'string', format: 'email', description: 'User email address' },
                username: { type: 'string', description: 'Username' },
                period: { 
                  type: 'string', 
                  enum: ['daily', 'weekly', 'monthly'],
                  description: 'Summary period'
                },
                stats: {
                  type: 'object',
                  properties: {
                    totalRequests: { type: 'number', description: 'Total number of requests' },
                    successfulRequests: { type: 'number', description: 'Number of successful requests' },
                    failedRequests: { type: 'number', description: 'Number of failed requests' },
                    topSources: { 
                      type: 'array', 
                      items: { type: 'string' },
                      description: 'Top sources of requests'
                    },
                    dataVolume: { type: 'string', description: 'Human-readable data volume (e.g., "2.5 MB")' },
                  },
                  required: ['totalRequests', 'successfulRequests', 'failedRequests', 'topSources', 'dataVolume'],
                },
              },
              required: ['userEmail', 'username', 'period', 'stats'],
            },
          },
          {
            name: 'send_custom_email',
            description: 'Send custom email with full control over content',
            inputSchema: {
              type: 'object',
              properties: {
                to: { 
                  type: 'array', 
                  items: { type: 'string', format: 'email' },
                  description: 'Array of recipient email addresses'
                },
                subject: { type: 'string', description: 'Email subject line' },
                html: { type: 'string', description: 'HTML email content' },
                text: { type: 'string', description: 'Plain text email content' },
                from: { 
                  type: 'string', 
                  format: 'email', 
                  description: 'Sender email (defaults to configured sender)'
                },
                replyTo: { type: 'string', format: 'email', description: 'Reply-to email address' },
              },
              required: ['to', 'subject'],
            },
          },
          {
            name: 'get_email_status',
            description: 'Check the delivery status of a sent email',
            inputSchema: {
              type: 'object',
              properties: {
                emailId: { type: 'string', description: 'Resend email ID to check status for' },
              },
              required: ['emailId'],
            },
          },
          {
            name: 'list_recent_emails',
            description: 'List recently sent emails',
            inputSchema: {
              type: 'object',
              properties: {
                limit: { 
                  type: 'number', 
                  minimum: 1, 
                  maximum: 100, 
                  default: 10,
                  description: 'Number of emails to retrieve'
                },
              },
            },
          },
        ] as Tool[],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'send_endpoint_notification':
            return await this.sendEndpointNotification(args);
          case 'send_welcome_email':
            return await this.sendWelcomeEmail(args);
          case 'send_endpoint_summary':
            return await this.sendEndpointSummary(args);
          case 'send_custom_email':
            return await this.sendCustomEmail(args);
          case 'get_email_status':
            return await this.getEmailStatus(args);
          case 'list_recent_emails':
            return await this.listRecentEmails(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            } as TextContent,
          ],
          isError: true,
        };
      }
    });
  }

  private async sendEndpointNotification(args: any): Promise<CallToolResult> {
    const validatedArgs = EndpointNotificationSchema.parse(args);
    const template = EmailTemplates.getEndpointNotificationTemplate(validatedArgs);

    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [validatedArgs.userEmail],
      subject: `${validatedArgs.actionType === 'success' ? '✅' : validatedArgs.actionType === 'failure' ? '❌' : validatedArgs.actionType === 'warning' ? '⚠️' : 'ℹ️'} Endpoint ${validatedArgs.actionType.toUpperCase()}: ${validatedArgs.endpointName}`,
      html: template.html,
      text: template.text,
    });

    if (error) {
      throw new Error(`Failed to send endpoint notification: ${error.message}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: `✅ Endpoint notification sent successfully!\n\nEmail ID: ${data?.id}\nRecipient: ${validatedArgs.userEmail}\nAction: ${validatedArgs.actionType.toUpperCase()}\nEndpoint: ${validatedArgs.endpointName}`,
        } as TextContent,
      ],
    };
  }

  private async sendWelcomeEmail(args: any): Promise<CallToolResult> {
    const validatedArgs = WelcomeEmailSchema.parse(args);
    const template = EmailTemplates.getWelcomeTemplate(validatedArgs);

    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [validatedArgs.userEmail],
      subject: '🚀 Welcome to Enostics - Your Personal API is Ready!',
      html: template.html,
      text: template.text,
    });

    if (error) {
      throw new Error(`Failed to send welcome email: ${error.message}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: `🚀 Welcome email sent successfully!\n\nEmail ID: ${data?.id}\nRecipient: ${validatedArgs.userEmail}\nUsername: @${validatedArgs.username}\nEndpoint: ${validatedArgs.endpointUrl}`,
        } as TextContent,
      ],
    };
  }

  private async sendEndpointSummary(args: any): Promise<CallToolResult> {
    const validatedArgs = EndpointSummarySchema.parse(args);
    const template = EmailTemplates.getEndpointSummaryTemplate(validatedArgs);

    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [validatedArgs.userEmail],
      subject: `📊 Your ${validatedArgs.period} endpoint summary - ${validatedArgs.stats.totalRequests} requests`,
      html: template.html,
      text: template.text,
    });

    if (error) {
      throw new Error(`Failed to send endpoint summary: ${error.message}`);
    }

    const { stats } = validatedArgs;
    return {
      content: [
        {
          type: 'text',
          text: `📊 Endpoint summary sent successfully!\n\nEmail ID: ${data?.id}\nRecipient: ${validatedArgs.userEmail}\nPeriod: ${validatedArgs.period}\nTotal Requests: ${stats.totalRequests}\nSuccess Rate: ${stats.totalRequests > 0 ? Math.round((stats.successfulRequests / stats.totalRequests) * 100) : 0}%`,
        } as TextContent,
      ],
    };
  }

  private async sendCustomEmail(args: any): Promise<CallToolResult> {
    const validatedArgs = CustomEmailSchema.parse(args);

    const emailData: any = {
      from: validatedArgs.from || DEFAULT_FROM,
      to: validatedArgs.to,
      subject: validatedArgs.subject,
    };

    if (validatedArgs.html) emailData.html = validatedArgs.html;
    if (validatedArgs.text) emailData.text = validatedArgs.text;
    if (validatedArgs.replyTo) emailData.replyTo = validatedArgs.replyTo;

    // Ensure at least one content type is provided
    if (!validatedArgs.html && !validatedArgs.text) {
      throw new Error('Either html or text content must be provided');
    }

    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      throw new Error(`Failed to send custom email: ${error.message}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: `📧 Custom email sent successfully!\n\nEmail ID: ${data?.id}\nRecipients: ${validatedArgs.to.join(', ')}\nSubject: ${validatedArgs.subject}`,
        } as TextContent,
      ],
    };
  }

  private async getEmailStatus(args: any): Promise<CallToolResult> {
    const { emailId } = args;

    if (!emailId) {
      throw new Error('Email ID is required');
    }

    try {
      const { data, error } = await resend.emails.get(emailId);

      if (error) {
        throw new Error(`Failed to get email status: ${error.message}`);
      }

      return {
        content: [
          {
            type: 'text',
            text: `📧 Email Status\n\nID: ${data.id}\nStatus: ${data.last_event}\nTo: ${data.to.join(', ')}\nSubject: ${data.subject}\nCreated: ${data.created_at}\n${data.last_event === 'delivered' ? '✅ Successfully delivered' : data.last_event === 'bounced' ? '❌ Bounced' : '🔄 In progress'}`,
          } as TextContent,
        ],
      };
    } catch (error) {
      throw new Error(`Failed to retrieve email status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async listRecentEmails(args: any): Promise<CallToolResult> {
    const limit = args?.limit || 10;

    try {
      const { data, error } = await resend.emails.list({ limit });

      if (error) {
        throw new Error(`Failed to list emails: ${error.message}`);
      }

      const emailList = data.data.map((email: any) => 
        `📧 ${email.subject}\n   To: ${email.to.join(', ')}\n   Status: ${email.last_event}\n   Sent: ${email.created_at}\n   ID: ${email.id}`
      ).join('\n\n');

      return {
        content: [
          {
            type: 'text',
            text: `📬 Recent Emails (${data.data.length}/${limit})\n\n${emailList}`,
          } as TextContent,
        ],
      };
    } catch (error) {
      throw new Error(`Failed to list recent emails: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Enostics Resend MCP Server running on stdio');
  }
}

// Start the server
const server = new ResendMCPServer();
server.start().catch(console.error); 