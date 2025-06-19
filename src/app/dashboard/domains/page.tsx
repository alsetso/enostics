'use client'

import { ComingSoonOverlay } from '@/components/common/coming-soon-overlay'

export default function DomainsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Custom Domains</h1>
      <p className="text-[hsl(var(--text-secondary))]">Use your own domain for endpoints...</p>
      
      <ComingSoonOverlay
        title="Custom Domains"
        description="Connect your own custom domains to your endpoints for a fully branded API experience."
        expectedDate="Q3 2025"
        features={[
          "Custom domain mapping",
          "SSL certificate management",
          "Subdomain routing",
          "DNS configuration assistance",
          "Professional branding"
        ]}
        onNotifyMe={() => {
          console.log('User wants to be notified about Custom Domains')
        }}
      />
    </div>
  )
} 