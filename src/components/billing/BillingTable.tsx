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
      {/* Plan Cards - Mobile/Tablet Stacked, Desktop Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
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
        <div className="bg-enostics-gray-900/50 rounded-lg border border-enostics-gray-700 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-4 gap-6 p-6 bg-enostics-gray-800/50 border-b border-enostics-gray-700">
            <div className="font-semibold text-white">Features</div>
            <div className="text-center font-semibold text-white">Citizen</div>
            <div className="text-center font-semibold text-white">Developer</div>
            <div className="text-center font-semibold text-white">Business</div>
          </div>

          {/* Feature Rows */}
          <div className="divide-y divide-enostics-gray-700">
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

      {/* Mobile Feature List */}
      <div className="lg:hidden space-y-6">
        <h3 className="text-xl font-semibold text-white">Compare Plans</h3>
        {plans.map((plan) => (
          <div key={plan.id} className="bg-enostics-gray-900/50 rounded-lg border border-enostics-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <h4 className="text-lg font-semibold text-white">{plan.name}</h4>
              {currentPlan === plan.id && (
                <span className="px-2 py-1 bg-enostics-blue/20 text-enostics-blue text-xs font-medium rounded-full">
                  Current Plan
                </span>
              )}
              {plan.popular && (
                <span className="px-2 py-1 bg-enostics-green/20 text-enostics-green text-xs font-medium rounded-full">
                  Popular
                </span>
              )}
            </div>
            <ul className="space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-enostics-gray-300">
                  <svg className="h-4 w-4 text-enostics-green flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
} 