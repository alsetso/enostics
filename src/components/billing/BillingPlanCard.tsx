'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Plan } from './BillingTable'
import { PlanCTAButton } from './PlanCTAButton'

interface BillingPlanCardProps {
  plan: Plan
  isCurrentPlan: boolean
  onPlanChange: (planId: string) => void
}

export function BillingPlanCard({ plan, isCurrentPlan, onPlanChange }: BillingPlanCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatPrice = (price: number, period: string) => {
    if (price === 0) return 'Free'
    return `$${price}/${period}`
  }

  // Define border styles for seamless grid
  const getBorderClasses = () => {
    const baseClasses = 'border-t border-b border-gray-200 dark:border-gray-700'
    
    if (plan.id === 'citizen') {
      return `${baseClasses} border-l md:border-r-0`
    } else if (plan.id === 'developer') {
      return `${baseClasses} border-l md:border-l-0 md:border-r-0`
    } else {
      return `${baseClasses} border-l md:border-l-0 border-r`
    }
  }

  // Enhanced border for current/popular plans without background
  const getEnhancedBorderClasses = () => {
    if (isCurrentPlan) {
      return 'border-blue-500 dark:border-blue-400'
    } else if (plan.popular) {
      return 'border-emerald-500 dark:border-emerald-400'
    }
    return 'border-gray-200 dark:border-gray-700'
  }

  return (
    <div className={`relative min-h-[400px] p-8 transition-all duration-200 ${getBorderClasses()} ${getEnhancedBorderClasses()}`}>
      {/* Current Plan Badge Only */}
      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="px-3 py-1 bg-blue-500 dark:bg-blue-600 text-white text-xs font-medium rounded-full">
            Current Plan
          </span>
        </div>
      )}

      {/* Plan Header */}
      <div className="text-center mb-8 pt-2">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{plan.name}</h3>
        <div className="mb-4">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">
            {formatPrice(plan.price, plan.period)}
          </span>
          {plan.price > 0 && (
            <span className="text-gray-500 dark:text-gray-400 text-base ml-2">
              per {plan.period}
            </span>
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          {plan.description}
        </p>
      </div>

      {/* CTA Button */}
      <div className="mb-8">
        <PlanCTAButton
          plan={plan}
          isCurrentPlan={isCurrentPlan}
          onPlanChange={onPlanChange}
        />
      </div>

      {/* Expandable Features Section */}
      <div className="space-y-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">What's included</h4>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          )}
        </button>
        
        {isExpanded && (
          <ul className="space-y-3 animate-in slide-in-from-top-2 duration-200">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                <svg 
                  className="h-4 w-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-0.5" 
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
        )}
      </div>

      {/* Usage Metrics for Current Plan */}
      {isCurrentPlan && (
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Current Usage</h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Endpoints</span>
              <span className="text-gray-900 dark:text-white font-medium">1 of {plan.id === 'citizen' ? '1' : plan.id === 'developer' ? '5' : '∞'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Requests this month</span>
              <span className="text-gray-900 dark:text-white font-medium">0 of {plan.id === 'citizen' ? '1K' : plan.id === 'developer' ? '50K' : '500K'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 