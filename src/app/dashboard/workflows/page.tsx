'use client'

import { ComingSoonOverlay } from '@/components/common/coming-soon-overlay'

export default function WorkflowsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Workflows</h1>
      <p className="text-[hsl(var(--text-secondary))]">Automate data processing with custom workflows...</p>
      
      <ComingSoonOverlay
        title="Workflows"
        description="Create automated workflows that trigger actions based on incoming data patterns, conditions, and schedules."
        expectedDate="Q2 2025"
        features={[
          "Visual workflow builder",
          "Trigger-based automation",
          "Conditional logic and branching",
          "Integration with external services",
          "Workflow templates and sharing"
        ]}
        onNotifyMe={() => {
          console.log('User wants to be notified about Workflows')
        }}
      />
    </div>
  )
} 