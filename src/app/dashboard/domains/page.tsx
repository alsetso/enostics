'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Globe, Plus, Settings, Activity, Zap, ExternalLink, Shield, CheckCircle } from 'lucide-react'

export default function DomainsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Custom Domains</h1>
        <p className="text-[hsl(var(--text-secondary))]">
          Manage custom domains for your endpoints and create branded API experiences.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--text-secondary))]">Active Domains</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <Globe className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--text-secondary))]">SSL Certificates</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--text-secondary))]">Requests Today</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <Activity className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Domains List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Your Custom Domains
            </CardTitle>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Domain
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Globe className="h-12 w-12 text-[hsl(var(--text-secondary))] mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No custom domains configured</h3>
            <p className="text-[hsl(var(--text-secondary))] mb-4">
              Add a custom domain to create branded API endpoints
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Domain
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Default Domain Info */}
      <Card>
        <CardHeader>
          <CardTitle>Default Domain</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-[hsl(var(--hover-bg))] rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500/10 border-blue-500/20">
                <Globe className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium">api.enostics.com</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))]">
                  Your default Enostics domain
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-400 border-green-400">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                View
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Domain Setup Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Domain Setup Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h4 className="font-medium">Add Your Domain</h4>
                <p className="text-sm text-[hsl(var(--text-secondary))]">
                  Enter your custom domain name (e.g., api.yourcompany.com)
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h4 className="font-medium">Configure DNS</h4>
                <p className="text-sm text-[hsl(var(--text-secondary))]">
                  Point your domain to our servers using CNAME records
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h4 className="font-medium">SSL Certificate</h4>
                <p className="text-sm text-[hsl(var(--text-secondary))]">
                  We'll automatically provision and manage SSL certificates
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 