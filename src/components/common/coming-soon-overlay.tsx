import { Lock, Sparkles, Calendar, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ComingSoonOverlayProps {
  title: string
  description: string
  expectedDate?: string
  features?: string[]
  onNotifyMe?: () => void
}

export function ComingSoonOverlay({ 
  title, 
  description, 
  expectedDate, 
  features = [],
  onNotifyMe 
}: ComingSoonOverlayProps) {
  return (
    <div className="fixed inset-0 bg-[hsl(var(--primary-bg))]/50 backdrop-blur-[5px] z-50 flex items-center justify-center p-4">
      <div className="bg-[hsl(var(--primary-bg))] border border-[hsl(var(--border-color))] rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        {/* Lock Icon */}
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-6">
          <Lock className="h-8 w-8 text-blue-500" />
        </div>

        {/* Title and Badge */}
        <div className="mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))]">{title}</h2>
            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
              <Sparkles className="h-3 w-3 mr-1" />
              Coming Soon
            </Badge>
          </div>
          <p className="text-[hsl(var(--text-secondary))] leading-relaxed">
            {description}
          </p>
        </div>

        {/* Expected Date */}
        {expectedDate && (
          <div className="flex items-center justify-center gap-2 mb-6 text-sm text-[hsl(var(--text-muted))]">
            <Calendar className="h-4 w-4" />
            <span>Expected: {expectedDate}</span>
          </div>
        )}

        {/* Features Preview */}
        {features.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[hsl(var(--text-primary))] mb-3">What to expect:</h3>
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-[hsl(var(--text-secondary))]">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        {onNotifyMe && (
          <Button 
            onClick={onNotifyMe}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          >
            <Bell className="h-4 w-4 mr-2" />
            Notify me when available
          </Button>
        )}

        {/* Footer */}
        <p className="text-xs text-[hsl(var(--text-muted))] mt-4">
          We're working hard to bring you this feature. Stay tuned!
        </p>
      </div>
    </div>
  )
} 