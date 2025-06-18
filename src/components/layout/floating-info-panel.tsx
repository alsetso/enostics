'use client'

export function FloatingInfoPanel() {
  return (
    <div className="fixed bottom-6 right-6 z-30 text-right">
      <div className="text-white/60 space-y-2">
        <div className="text-sm font-semibold text-white/80">enostics</div>
        <div className="text-xs text-white/60">v.1.0.0.1</div>
        <div className="text-xs max-w-xs text-white/50 leading-relaxed">
          The system by which a person receives, processes, and store intelligent data through a personal interface.
        </div>
      </div>
    </div>
  )
} 