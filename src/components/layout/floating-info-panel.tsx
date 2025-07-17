'use client'

import { useState } from 'react'

export function FloatingInfoPanel() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-enostics-blue text-white flex items-center justify-center shadow-lg hover:bg-enostics-blue/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-enostics-blue/60"
        aria-label="Toggle info panel"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-4 w-80">
          <div className="bg-black/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/10">
            <h3 className="text-lg font-bold text-white mb-2">Need Help?</h3>
            <p className="text-white/80 text-sm mb-4">
              Our team is here to help you get started with Enostics. Schedule a demo or chat with us live.
            </p>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 rounded-xl bg-enostics-blue text-white font-medium hover:bg-enostics-blue/80 transition text-sm">
                Schedule Demo
              </button>
              <button className="w-full px-4 py-2 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition text-sm">
                Live Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 