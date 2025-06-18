'use client'

import { Plan } from './BillingTable'
import { PlanCTAButton } from './PlanCTAButton'

interface BillingPlanCardProps {
  plan: Plan
  isCurrentPlan: boolean
  onPlanChange: (planId: string) => void
}

export function BillingPlanCard({ plan, isCurrentPlan, onPlanChange }: BillingPlanCardProps) {
  const formatPrice = (price: number, period: string) => {
    if (price === 0) return 'Free'
    return `$${price}/${period}`
  }

  return (
    <div className={`relative bg-enostics-gray-900/50 rounded-lg border p-6 transition-all duration-200 ${
      isCurrentPlan 
        ? 'border-enostics-blue ring-2 ring-enostics-blue/50' 
        : plan.popular
        ? 'border-enostics-green ring-1 ring-enostics-green/30'
        : 'border-enostics-gray-700 hover:border-enostics-gray-600'
    }`}>
      {/* Plan Badges */}
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 flex gap-2">
        {isCurrentPlan && (
          <span className="px-3 py-1 bg-enostics-blue text-white text-xs font-medium rounded-full">
            Current Plan
          </span>
        )}
        {plan.popular && !isCurrentPlan && (
          <span className="px-3 py-1 bg-enostics-green text-white text-xs font-medium rounded-full">
            Most Popular
          </span>
        )}
      </div>

      {/* Plan Header */}
      <div className="text-center mb-6 pt-4">
        <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
        <div className="mb-3">
          <span className="text-3xl font-bold text-white">
            {formatPrice(plan.price, plan.period)}
          </span>
          {plan.price > 0 && (
            <span className="text-enostics-gray-400 text-sm ml-1">
              per {plan.period}
            </span>
          )}
        </div>
        <p className="text-sm text-enostics-gray-400 leading-relaxed">
          {plan.description}
        </p>
      </div>

      {/* CTA Button */}
      <div className="mb-6">
        <PlanCTAButton
          plan={plan}
          isCurrentPlan={isCurrentPlan}
          onPlanChange={onPlanChange}
        />
      </div>

      {/* Features List */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-white mb-3">What's included:</h4>
        <ul className="space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-enostics-gray-300">
              <svg 
                className="h-4 w-4 text-enostics-green flex-shrink-0 mt-0.5" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path 
                  fillRule="evenodd" 
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                  clipRule="evenodd" 
                />
              </svg>
              <span className="leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Usage Metrics for Current Plan */}
      {isCurrentPlan && (
        <div className="mt-6 pt-6 border-t border-enostics-gray-700">
          <h4 className="text-sm font-semibold text-white mb-3">Current Usage</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-enostics-gray-400">Endpoints</span>
              <span className="text-white">1 of {plan.id === 'citizen' ? '1' : plan.id === 'developer' ? '5' : '∞'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-enostics-gray-400">Requests this month</span>
              <span className="text-white">0 of {plan.id === 'citizen' ? '1K' : plan.id === 'developer' ? '50K' : '500K'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 