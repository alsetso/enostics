'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  X, 
  Brain, 
  Zap, 
  Clock, 
  DollarSign,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useIntelligenceSelectorActions } from '@/hooks/useIntelligenceSelector'
import { toast } from 'sonner'

interface SelectorToolbarProps {
  visible: boolean
  selectedCount: number
  onAddToQueue: (processingPlan: string) => Promise<void>
  onExit: () => void
}

export default function SelectorToolbar({ 
  visible, 
  selectedCount, 
  onAddToQueue, 
  onExit 
}: SelectorToolbarProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPlanSelector, setShowPlanSelector] = useState(false)
  const { batchError } = useIntelligenceSelectorActions()

  const processingPlans = [
    {
      id: 'auto_basic',
      name: 'Auto Basic',
      description: 'Standard processing with basic AI analysis',
      cost: 0.02,
      icon: <Zap className="h-4 w-4" />,
      color: 'bg-blue-500'
    },
    {
      id: 'auto_advanced',
      name: 'Auto Advanced',
      description: 'Enhanced processing with advanced AI models',
      cost: 0.05,
      icon: <Brain className="h-4 w-4" />,
      color: 'bg-purple-500'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Full enterprise processing with custom models',
      cost: 0.10,
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'bg-orange-500'
    }
  ]

  const handleAddToQueue = async (processingPlan: string = 'auto_basic') => {
    if (selectedCount === 0) {
      toast.error('No records selected')
      return
    }

    setIsProcessing(true)
    
    try {
      await onAddToQueue(processingPlan)
      // Don't show success toast yet - this just opens the batch review modal
      setShowPlanSelector(false)
    } catch (error) {
      console.error('Error opening batch review:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to open batch review')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleQuickAdd = () => {
    if (selectedCount <= 10) {
      // For small batches, use auto_basic directly
      handleAddToQueue('auto_basic')
    } else {
      // For larger batches, show plan selector
      setShowPlanSelector(true)
    }
  }

  const calculateEstimatedCost = (plan: string) => {
    const planConfig = processingPlans.find(p => p.id === plan)
    if (!planConfig) return 0
    return selectedCount * planConfig.cost
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-300">
      {/* Main toolbar */}
      <div className="flex items-center gap-3 bg-purple-600/90 backdrop-blur-sm border border-purple-500/20 text-white px-4 py-3 rounded-full shadow-lg">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            {selectedCount} Selected
          </Badge>
          
          {batchError && (
            <AlertCircle className="h-4 w-4 text-red-300" />
          )}
        </div>

        <div className="flex items-center gap-2">
          {!showPlanSelector ? (
            <Button
              size="sm"
              onClick={handleQuickAdd}
              disabled={isProcessing || selectedCount === 0}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add
            </Button>
          ) : (
            <div className="flex items-center gap-1">
              {processingPlans.map((plan) => (
                <Button
                  key={plan.id}
                  size="sm"
                  onClick={() => handleAddToQueue(plan.id)}
                  disabled={isProcessing}
                  className={`${plan.color} hover:${plan.color}/80 text-white text-xs px-2 py-1 h-7`}
                  title={`${plan.name} - $${calculateEstimatedCost(plan.id).toFixed(2)}`}
                >
                  {plan.icon}
                </Button>
              ))}
            </div>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={onExit}
            className="text-white hover:bg-white/20 p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Extended plan selector */}
      {showPlanSelector && (
        <div className="mt-2 bg-[hsl(var(--primary-bg))] border border-[hsl(var(--border-color))] rounded-lg shadow-lg p-4 min-w-[300px]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-[hsl(var(--text-primary))]">
                Choose Processing Plan
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPlanSelector(false)}
                className="p-1 h-6 w-6"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            
            {processingPlans.map((plan) => (
              <div
                key={plan.id}
                className="flex items-center justify-between p-2 rounded-md hover:bg-[hsl(var(--hover-bg))] cursor-pointer"
                onClick={() => handleAddToQueue(plan.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1 rounded ${plan.color} text-white`}>
                    {plan.icon}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[hsl(var(--text-primary))]">
                      {plan.name}
                    </div>
                    <div className="text-xs text-[hsl(var(--text-muted))]">
                      {plan.description}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-[hsl(var(--text-primary))]">
                    ${calculateEstimatedCost(plan.id).toFixed(2)}
                  </div>
                  <div className="text-xs text-[hsl(var(--text-muted))]">
                    ${plan.cost.toFixed(2)} per record
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error message */}
      {batchError && (
        <div className="mt-2 bg-red-500/90 backdrop-blur-sm border border-red-400/20 text-white px-3 py-2 rounded-lg shadow-lg text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{batchError}</span>
          </div>
        </div>
      )}
    </div>
  )
} 