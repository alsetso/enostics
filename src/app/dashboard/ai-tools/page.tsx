'use client'

import { ComingSoonOverlay } from '@/components/common/coming-soon-overlay'

export default function AIToolsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">AI Tools</h1>
      <p className="text-[hsl(var(--text-secondary))]">Advanced AI-powered tools for data analysis...</p>
      
      <ComingSoonOverlay
        title="AI Tools"
        description="Access a suite of AI-powered tools for advanced data analysis, pattern recognition, and intelligent insights."
        expectedDate="Q3 2025"
        features={[
          "Data pattern recognition",
          "Predictive analytics",
          "Natural language queries",
          "Custom model training",
          "AI-powered data visualization"
        ]}
        onNotifyMe={() => {
          console.log('User wants to be notified about AI Tools')
        }}
      />
    </div>
  )
} 