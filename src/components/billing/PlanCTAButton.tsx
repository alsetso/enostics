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
    return plan.ctaText
  }

  const getButtonClassName = () => {
    const baseClass = 'w-full font-semibold transition-all duration-200'
    
    if (isCurrentPlan) {
      return `${baseClass} border-enostics-blue text-enostics-blue cursor-default`
    }
    
    if (plan.ctaVariant === 'primary') {
      return `${baseClass} bg-enostics-blue hover:bg-enostics-blue/90 text-white border-enostics-blue`
    }
    
    return `${baseClass} border-enostics-gray-600 text-white hover:bg-enostics-gray-800 hover:border-enostics-gray-500`
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