'use client'

import { Check, X, Minus } from 'lucide-react'

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
            className="h-5 w-5 text-enostics-green mx-auto" 
            aria-label="Included"
          />
        )
      } else {
        return (
          <X 
            className="h-5 w-5 text-enostics-gray-500 mx-auto" 
            aria-label="Not included"
          />
        )
      }
    }
    
    return (
      <span className="text-sm text-white font-medium">
        {value}
      </span>
    )
  }

  return (
    <div className={`grid grid-cols-4 gap-6 p-6 ${
      isEven ? 'bg-enostics-gray-900/30' : 'bg-enostics-gray-800/30'
    }`}>
      <div className="text-sm font-medium text-white">
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