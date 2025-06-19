'use client'

import { ComingSoonOverlay } from '@/components/common/coming-soon-overlay'

export default function EndpointsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Endpoints</h1>
      <p className="text-[hsl(var(--text-secondary))]">Manage your personal API endpoints...</p>
      
      <ComingSoonOverlay
        title="Endpoints"
        description="Create and manage your personal API endpoints. Each endpoint will be your unique gateway for receiving data from any source."
        expectedDate="Q1 2025"
        features={[
          "Custom endpoint creation (/v1/username)",
          "Real-time data ingestion",
          "Auto-generated API documentation",
          "Public/private endpoint controls",
          "Rate limiting and security"
        ]}
        onNotifyMe={() => {
          // TODO: Implement notification signup
          console.log('User wants to be notified about Endpoints')
        }}
      />
    </div>
  )
} 