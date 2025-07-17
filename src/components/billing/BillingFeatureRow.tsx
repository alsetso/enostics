'use client'

import { Check, X } from 'lucide-react'

interface Feature {
  label: string
  citizen: string | boolean
  developer: string | boolean
  business: string | boolean
}

interface BillingFeatureRowProps {
  feature: Feature
  isEven: boolean
}

export function BillingFeatureRow({ feature, isEven }: BillingFeatureRowProps) {
  const renderFeatureValue = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      if (value) {
        return (
          <Check 
            className="h-5 w-5 text-emerald-500 dark:text-emerald-400 mx-auto" 
            aria-label="Included"
          />
        )
      } else {
        return (
          <X 
            className="h-5 w-5 text-gray-400 dark:text-gray-500 mx-auto" 
            aria-label="Not included"
          />
        )
      }
    }
    
    return (
      <span className="text-sm text-gray-900 dark:text-white font-medium">
        {value}
      </span>
    )
  }

  return (
    <div className="grid grid-cols-4 gap-6 p-6">
      <div className="text-sm font-medium text-gray-900 dark:text-white">
        {feature.label}
      </div>
      <div className="text-center">
        {renderFeatureValue(feature.citizen)}
      </div>
      <div className="text-center">
        {renderFeatureValue(feature.developer)}
      </div>
      <div className="text-center">
        {renderFeatureValue(feature.business)}
      </div>
    </div>
  )
} 