'use client'

interface FloatingSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function FloatingSidebar({ isOpen, onClose }: FloatingSidebarProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        bg-black/20 backdrop-blur-md border-r border-white/10
      `}>
        <div className="p-6 pt-20">
          <nav className="space-y-6">
            <div className="text-xs text-white/50 uppercase tracking-wider font-medium">
              Navigation
            </div>
            <div className="space-y-3">
              <a 
                href="#research" 
                className="block text-white/70 hover:text-white transition-all duration-200 py-2 px-3 hover:bg-white/5 rounded-lg hover:translate-x-1"
                onClick={onClose}
              >
                Research
              </a>
              <a 
                href="#safety" 
                className="block text-white/70 hover:text-white transition-all duration-200 py-2 px-3 hover:bg-white/5 rounded-lg hover:translate-x-1"
                onClick={onClose}
              >
                Safety
              </a>
              <a 
                href="#integrations" 
                className="block text-white/70 hover:text-white transition-all duration-200 py-2 px-3 hover:bg-white/5 rounded-lg hover:translate-x-1"
                onClick={onClose}
              >
                Integrations
              </a>
              <a 
                href="#news" 
                className="block text-white/70 hover:text-white transition-all duration-200 py-2 px-3 hover:bg-white/5 rounded-lg hover:translate-x-1"
                onClick={onClose}
              >
                News
              </a>
            </div>
          </nav>
        </div>
      </aside>
    </>
  )
} 