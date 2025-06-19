'use client'

import { ComingSoonOverlay } from '@/components/common/coming-soon-overlay'

export default function AgentsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">AI Agents</h1>
      <p className="text-[hsl(var(--text-secondary))]">Deploy intelligent agents on your endpoints...</p>
      
      <ComingSoonOverlay
        title="AI Agents"
        description="Deploy custom AI agents that can process, analyze, and respond to data flowing through your endpoints automatically."
        expectedDate="Q2 2025"
        features={[
          "Custom agent deployment",
          "Real-time data processing",
          "Automated responses and actions",
          "Agent marketplace",
          "Performance monitoring"
        ]}
        onNotifyMe={() => {
          console.log('User wants to be notified about AI Agents')
        }}
      />
    </div>
  )
} 