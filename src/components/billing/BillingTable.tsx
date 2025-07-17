'use client'

import { BillingPlanCard } from './BillingPlanCard'
import { BillingFeatureRow } from './BillingFeatureRow'

export interface Plan {
  id: string
  name: string
  price: number
  period: string
  description: string
  features: string[]
  popular?: boolean
  ctaText: string
  ctaVariant: 'primary' | 'secondary' | 'current'
}

interface BillingTableProps {
  currentPlan?: string
  onPlanChange: (planId: string) => void
}

const plans: Plan[] = [
  {
    id: 'citizen',
    name: 'Citizen',
    price: 0,
    period: 'forever',
    description: 'Perfect for personal data management and basic endpoint needs',
    features: [
      '1 personal endpoint',
      '1,000 requests/month',
      'Basic data classification',
      'Standard support',
      'Data export (JSON/CSV)',
      'Basic analytics'
    ],
    ctaText: 'Get Started',
    ctaVariant: 'secondary'
  },
  {
    id: 'developer',
    name: 'Developer',
    price: 29,
    period: 'month',
    description: 'For developers building on the Enostics platform',
    features: [
      '5 endpoints',
      '50,000 requests/month',
      'Advanced data classification',
      'AI-powered insights',
      'Custom webhooks',
      'Priority support',
      'API access',
      'Advanced analytics',
      'Custom data types',
      'Webhook management'
    ],
    popular: true,
    ctaText: 'Upgrade to Developer',
    ctaVariant: 'primary'
  },
  {
    id: 'business',
    name: 'Business',
    price: 99,
    period: 'month',
    description: 'For teams and organizations with advanced data needs',
    features: [
      'Unlimited endpoints',
      '500,000 requests/month',
      'Enterprise data classification',
      'Advanced AI insights',
      'Custom integrations',
      'Dedicated support',
      'Team management',
      'Advanced security',
      'Custom branding',
      'SLA guarantee',
      'Priority processing',
      'Custom data sources'
    ],
    ctaText: 'Upgrade to Business',
    ctaVariant: 'primary'
  }
]

const features = [
  {
    label: 'Personal Endpoints',
    citizen: '1',
    developer: '5',
    business: 'Unlimited'
  },
  {
    label: 'Monthly Requests',
    citizen: '1,000',
    developer: '50,000',
    business: '500,000'
  },
  {
    label: 'Data Classification',
    citizen: 'Basic',
    developer: 'Advanced',
    business: 'Enterprise'
  },
  {
    label: 'AI-Powered Insights',
    citizen: false,
    developer: true,
    business: true
  },
  {
    label: 'Custom Webhooks',
    citizen: false,
    developer: true,
    business: true
  },
  {
    label: 'API Access',
    citizen: false,
    developer: true,
    business: true
  },
  {
    label: 'Advanced Analytics',
    citizen: false,
    developer: true,
    business: true
  },
  {
    label: 'Team Management',
    citizen: false,
    developer: false,
    business: true
  },
  {
    label: 'Custom Integrations',
    citizen: false,
    developer: false,
    business: true
  },
  {
    label: 'Dedicated Support',
    citizen: false,
    developer: false,
    business: true
  },
  {
    label: 'SLA Guarantee',
    citizen: false,
    developer: false,
    business: true
  },
  {
    label: 'Priority Processing',
    citizen: false,
    developer: false,
    business: true
  }
]

export function BillingTable({ currentPlan = 'citizen', onPlanChange }: BillingTableProps) {
  return (
    <div className="space-y-8">
      {/* Plan Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3">
        {plans.map((plan) => (
          <BillingPlanCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={currentPlan === plan.id}
            onPlanChange={onPlanChange}
          />
        ))}
      </div>

      {/* Feature Comparison Table - Desktop Only */}
      <div className="hidden lg:block">
        <div className="border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-4 gap-6 p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="font-semibold text-gray-900 dark:text-white">Features</div>
            <div className="text-center font-semibold text-gray-900 dark:text-white">Citizen</div>
            <div className="text-center font-semibold text-gray-900 dark:text-white">Developer</div>
            <div className="text-center font-semibold text-gray-900 dark:text-white">Business</div>
          </div>

          {/* Feature Rows */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {features.map((feature, index) => (
              <BillingFeatureRow
                key={feature.label}
                feature={feature}
                isEven={index % 2 === 0}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Feature Note */}
      <div className="lg:hidden">
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center italic">
          View detailed feature comparison on desktop
        </p>
      </div>
    </div>
  )
} 