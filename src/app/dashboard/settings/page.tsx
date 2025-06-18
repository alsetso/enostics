'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, CreditCard, Mail, ChevronRight } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Settings className="h-8 w-8 text-enostics-blue" />
          Settings
        </h1>
        <p className="text-enostics-gray-400 mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-enostics-gray-900/50 border-enostics-gray-700 hover:border-enostics-gray-600 transition-all duration-200">
          <Link href="/dashboard/settings/email">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-enostics-gray-800">
                    <Mail className="h-6 w-6 text-enostics-purple" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Email Notifications
                    </h3>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-enostics-gray-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-enostics-gray-400">
                Customize email templates and notification preferences
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="bg-enostics-gray-900/50 border-enostics-gray-700 hover:border-enostics-gray-600 transition-all duration-200">
          <Link href="/dashboard/settings/billing">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-enostics-gray-800">
                    <CreditCard className="h-6 w-6 text-enostics-blue" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Billing & Plans
                    </h3>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-enostics-gray-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-enostics-gray-400">
                Manage your subscription and view usage
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  )
} 