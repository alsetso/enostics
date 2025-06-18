// 🎨 Enostics Email Components - Consistent branding with flexible content

export interface EmailWrapperProps {
  title: string;
  preheader?: string;
  children: string;
  username?: string;
  ctaButton?: {
    text: string;
    url: string;
    style?: 'primary' | 'secondary';
  };
  footerMessage?: string;
}

export interface StatusBadgeProps {
  type: 'success' | 'failure' | 'warning' | 'info';
  text: string;
}

export interface DataCardProps {
  title: string;
  children: string;
  icon?: string;
  color?: string;
}

export interface StatsGridProps {
  stats: Array<{
    label: string;
    value: string | number;
    color?: string;
    icon?: string;
  }>;
}

/**
 * Main email wrapper with consistent Enostics branding
 */
export function createEmailWrapper({
  title,
  preheader,
  children,
  username,
  ctaButton,
  footerMessage
}: EmailWrapperProps): { html: string; text: string } {
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  ${preheader ? `<meta name="description" content="${preheader}">` : ''}
  
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  
  <style>
    /* Reset and base styles */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    
    /* Enostics brand colors */
    :root {
      --enostics-primary: #667eea;
      --enostics-secondary: #764ba2;
      --enostics-success: #10b981;
      --enostics-warning: #f59e0b;
      --enostics-error: #ef4444;
      --enostics-info: #3b82f6;
      --enostics-gray-50: #f9fafb;
      --enostics-gray-100: #f3f4f6;
      --enostics-gray-200: #e5e7eb;
      --enostics-gray-300: #d1d5db;
      --enostics-gray-400: #9ca3af;
      --enostics-gray-500: #6b7280;
      --enostics-gray-600: #4b5563;
      --enostics-gray-700: #374151;
      --enostics-gray-800: #1f2937;
      --enostics-gray-900: #111827;
    }
    
    /* Main container */
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #1f2937;
    }
    
    /* Header styles */
    .email-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 30px;
      border-radius: 12px 12px 0 0;
      text-align: center;
    }
    
    .email-header h1 {
      color: white;
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.025em;
    }
    
    .email-header .subtitle {
      color: rgba(255, 255, 255, 0.9);
      margin: 0;
      font-size: 16px;
      font-weight: 400;
    }
    
    .email-header .username {
      color: rgba(255, 255, 255, 0.8);
      margin: 16px 0 0 0;
      font-size: 14px;
      font-weight: 500;
    }
    
    /* Content area */
    .email-content {
      background: white;
      padding: 32px 30px;
    }
    
    /* CTA Button */
    .cta-button {
      display: inline-block;
      padding: 16px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      margin: 24px 0;
      transition: all 0.2s ease;
    }
    
    .cta-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    
    .cta-secondary {
      background: #f3f4f6;
      color: #374151;
      border: 2px solid #e5e7eb;
    }
    
    /* Footer styles */
    .email-footer {
      background: #f9fafb;
      padding: 32px 30px;
      border-radius: 0 0 12px 12px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
    }
    
    .footer-logo {
      margin-bottom: 16px;
    }
    
    .footer-text {
      color: #6b7280;
      font-size: 14px;
      margin: 8px 0;
    }
    
    .footer-links {
      color: #9ca3af;
      font-size: 12px;
      margin: 16px 0 0 0;
    }
    
    .footer-links a {
      color: #667eea;
      text-decoration: none;
    }
    
    /* Responsive */
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        margin: 0 !important;
      }
      
      .email-header,
      .email-content,
      .email-footer {
        padding: 24px 20px !important;
      }
      
      .email-header h1 {
        font-size: 24px !important;
      }
      
      .cta-button {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }
    }
  </style>
</head>

<body style="margin: 0; padding: 20px; background-color: #f3f4f6;">
  ${preheader ? `
  <!-- Preheader text -->
  <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: 'Inter', sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${preheader}
  </div>
  ` : ''}
  
  <div class="email-container">
    <!-- Header -->
    <div class="email-header">
      <div class="footer-logo">
        <svg width="120" height="32" viewBox="0 0 120 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="8" fill="white" fill-opacity="0.2"/>
          <path d="M8 12h16v2H8v-2zm0 4h16v2H8v-2zm0 4h12v2H8v-2z" fill="white"/>
          <text x="40" y="20" fill="white" font-family="Inter, sans-serif" font-size="18" font-weight="700">Enostics</text>
        </svg>
      </div>
      <h1>${title}</h1>
      ${preheader ? `<p class="subtitle">${preheader}</p>` : ''}
      ${username ? `<p class="username">Hi @${username}! 👋</p>` : ''}
    </div>
    
    <!-- Main Content -->
    <div class="email-content">
      ${children}
      
      ${ctaButton ? `
      <div style="text-align: center; margin: 32px 0;">
        <a href="${ctaButton.url}" class="cta-button cta-${ctaButton.style || 'primary'}">${ctaButton.text}</a>
      </div>
      ` : ''}
    </div>
    
    <!-- Footer -->
    <div class="email-footer">
      <div class="footer-logo">
        <svg width="80" height="20" viewBox="0 0 80 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="20" height="20" rx="4" fill="#667eea" fill-opacity="0.1"/>
          <path d="M5 7.5h10v1.25H5V7.5zm0 2.5h10v1.25H5V10zm0 2.5h7.5v1.25H5V12.5z" fill="#667eea"/>
          <text x="25" y="12.5" fill="#667eea" font-family="Inter, sans-serif" font-size="11" font-weight="600">Enostics</text>
        </svg>
      </div>
      
      <p class="footer-text">
        ${footerMessage || 'Powered by Enostics - Your Universal Personal API'}
      </p>
      
      <p class="footer-links">
        <a href="https://enostics.com/dashboard">Dashboard</a> • 
        <a href="https://enostics.com/docs">Documentation</a> • 
        <a href="https://enostics.com/support">Support</a> • 
        <a href="https://enostics.com/dashboard/settings">Settings</a>
      </p>
      
      <p class="footer-links">
        © 2024 Enostics. The universal personal API layer for everyone.
      </p>
    </div>
  </div>
</body>
</html>`;

  // Generate plain text version
  const text = `
${title}
${preheader ? preheader : ''}
${username ? `Hi @${username}!` : ''}

${stripHtml(children)}

${ctaButton ? `${ctaButton.text}: ${ctaButton.url}` : ''}

---
${footerMessage || 'Powered by Enostics - Your Universal Personal API'}

Dashboard: https://enostics.com/dashboard
Documentation: https://enostics.com/docs
Support: https://enostics.com/support
Settings: https://enostics.com/dashboard/settings

© 2024 Enostics. The universal personal API layer for everyone.
  `.trim();

  return { html, text };
}

/**
 * Create status badge component
 */
export function createStatusBadge({ type, text }: StatusBadgeProps): string {
  const styles = {
    success: { bg: '#ecfdf5', border: '#10b981', text: '#065f46', icon: '✅' },
    failure: { bg: '#fef2f2', border: '#ef4444', text: '#991b1b', icon: '❌' },
    warning: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e', icon: '⚠️' },
    info: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af', icon: 'ℹ️' }
  };
  
  const style = styles[type];
  
  return `
    <div style="
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: ${style.bg};
      border: 2px solid ${style.border};
      border-radius: 8px;
      color: ${style.text};
      font-weight: 600;
      font-size: 14px;
      margin: 8px 0;
    ">
      <span style="font-size: 16px;">${style.icon}</span>
      ${text}
    </div>
  `;
}

/**
 * Create data card component
 */
export function createDataCard({ title, children, icon, color = '#667eea' }: DataCardProps): string {
  return `
    <div style="
      background: #f9fafb;
      border: 2px solid #e5e7eb;
      border-left: 4px solid ${color};
      border-radius: 8px;
      padding: 20px;
      margin: 16px 0;
    ">
      <h3 style="
        margin: 0 0 12px 0;
        color: #1f2937;
        font-size: 16px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
      ">
        ${icon ? `<span style="font-size: 18px;">${icon}</span>` : ''}
        ${title}
      </h3>
      <div style="color: #4b5563; font-size: 14px; line-height: 1.5;">
        ${children}
      </div>
    </div>
  `;
}

/**
 * Create stats grid component
 */
export function createStatsGrid({ stats }: StatsGridProps): string {
  const gridItems = stats.map(stat => `
    <div style="
      background: ${stat.color ? `${stat.color}10` : '#f0f9ff'};
      border: 2px solid ${stat.color || '#0ea5e9'};
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      margin: 8px;
      flex: 1;
      min-width: 120px;
    ">
      ${stat.icon ? `<div style="font-size: 24px; margin-bottom: 8px;">${stat.icon}</div>` : ''}
      <div style="
        font-size: 28px;
        font-weight: 700;
        color: ${stat.color || '#0c4a6e'};
        margin-bottom: 4px;
      ">${stat.value}</div>
      <div style="
        color: ${stat.color ? `${stat.color}cc` : '#075985'};
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      ">${stat.label}</div>
    </div>
  `).join('');

  return `
    <div style="
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 24px 0;
      justify-content: center;
    ">
      ${gridItems}
    </div>
  `;
}

/**
 * Create code block component
 */
export function createCodeBlock(code: string, language = 'json'): string {
  return `
    <div style="
      background: #1f2937;
      color: #f9fafb;
      padding: 16px;
      border-radius: 8px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 12px;
      line-height: 1.5;
      overflow-x: auto;
      margin: 16px 0;
      border: 1px solid #374151;
    ">
      <pre style="margin: 0; white-space: pre-wrap; word-break: break-word;">${escapeHtml(code)}</pre>
    </div>
  `;
}

/**
 * Create info box component
 */
export function createInfoBox(content: string, type: 'tip' | 'warning' | 'note' = 'note'): string {
  const styles = {
    tip: { bg: '#ecfdf5', border: '#10b981', icon: '💡', title: 'Tip' },
    warning: { bg: '#fffbeb', border: '#f59e0b', icon: '⚠️', title: 'Warning' },
    note: { bg: '#eff6ff', border: '#3b82f6', icon: 'ℹ️', title: 'Note' }
  };
  
  const style = styles[type];
  
  return `
    <div style="
      background: ${style.bg};
      border: 2px solid ${style.border};
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
    ">
      <div style="
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        font-weight: 600;
        color: #1f2937;
      ">
        <span style="font-size: 16px;">${style.icon}</span>
        ${style.title}
      </div>
      <div style="color: #4b5563; font-size: 14px; line-height: 1.5;">
        ${content}
      </div>
    </div>
  `;
}

/**
 * Utility functions
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(text: string): string {
  const div = { innerHTML: '' } as any;
  div.textContent = text;
  return div.innerHTML;
} 