'use client'

import { EndpointManager } from '@/components/features/endpoint-manager'

export default function EndpointsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Endpoints</h1>
        <p className="text-[hsl(var(--text-secondary))]">
          Manage your personal API endpoints. Create custom endpoints to receive data from any source.
        </p>
      </div>
      
      <EndpointManager />
    </div>
  )
} 