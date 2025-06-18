'use client'

import { ApiKeyManager } from '@/components/features/api-key-manager'
import { Badge } from '@/components/ui/badge'
import { Key, Activity, Shield } from 'lucide-react'

export default function ApiKeysPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Key className="h-8 w-8 text-enostics-blue" />
          API Keys
          <Badge variant="outline" className="text-xs">
            <Shield className="h-3 w-3 mr-1" />
            Secure
          </Badge>
        </h1>
        <p className="text-enostics-gray-400 mt-2">
          Manage API keys for authentication and access control. Create, rotate, and monitor usage of your authentication tokens.
        </p>
      </div>

      {/* API Keys Content */}
      <ApiKeyManager />
    </div>
  )
} 