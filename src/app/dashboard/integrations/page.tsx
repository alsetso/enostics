'use client'

import { SmartWebhookManager } from '@/components/features/smart-webhook-manager'

export default function IntegrationsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Integrations</h1>
        <p className="text-[hsl(var(--text-secondary))]">
          Connect external services and automate data flow with intelligent webhooks.
        </p>
      </div>
      
      <SmartWebhookManager />
    </div>
  )
} 