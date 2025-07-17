'use client'

import { Button } from '@/components/ui/button'
import { Plan } from './BillingTable'

interface PlanCTAButtonProps {
  plan: Plan
  isCurrentPlan: boolean
  onPlanChange: (planId: string) => void
}

export function PlanCTAButton({ plan, isCurrentPlan, onPlanChange }: PlanCTAButtonProps) {
  const handleClick = () => {
    if (!isCurrentPlan) {
      onPlanChange(plan.id)
    }
  }

  const getButtonVariant = () => {
    if (isCurrentPlan) return 'outline'
    if (plan.ctaVariant === 'primary') return 'primary'
    return 'outline'
  }

  const getButtonText = () => {
    if (isCurrentPlan) return 'Current Plan'
    
    if (plan.popular && !isCurrentPlan) {
      return `${plan.ctaText} • Most Popular`
    }
    
    return plan.ctaText
  }

  const getButtonClassName = () => {
    const baseClass = 'w-full font-semibold transition-all duration-200 h-11'
    
    if (isCurrentPlan) {
      return `${baseClass} border-blue-500 dark:border-blue-400 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 cursor-default`
    }
    
    if (plan.ctaVariant === 'primary') {
      if (plan.popular) {
        return `${baseClass} bg-emerald-500 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-700 text-white border-emerald-500 dark:border-emerald-600`
      }
      return `${baseClass} bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white border-blue-500 dark:border-blue-600`
    }
    
    return `${baseClass} border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-400 dark:hover:border-gray-500`
  }

  return (
    <Button
      variant={getButtonVariant()}
      className={getButtonClassName()}
      onClick={handleClick}
      disabled={isCurrentPlan}
      aria-label={isCurrentPlan ? `Currently on ${plan.name} plan` : `Upgrade to ${plan.name} plan`}
    >
      {getButtonText()}
    </Button>
  )
} 