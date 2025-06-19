'use client'

import { ComingSoonOverlay } from '@/components/common/coming-soon-overlay'

export default function IntegrationsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Integrations</h1>
      <p className="text-[hsl(var(--text-secondary))]">Connect with external services and platforms...</p>
      
      <ComingSoonOverlay
        title="Integrations"
        description="Connect your endpoints with popular services, health devices, and third-party platforms for seamless data flow."
        expectedDate="Q1 2025"
        features={[
          "Health device integrations (Apple Health, Fitbit, etc.)",
          "Social platform connectors",
          "Cloud service integrations",
          "Custom webhook configurations",
          "OAuth and API key management"
        ]}
        onNotifyMe={() => {
          console.log('User wants to be notified about Integrations')
        }}
      />
    </div>
  )
} 