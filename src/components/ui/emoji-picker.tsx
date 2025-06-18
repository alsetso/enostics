import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface EmojiPickerProps {
  value: string
  onChange: (emoji: string) => void
  placeholder?: string
}

const EMOJIS = [
  '😊', '😎', '🤔', '😴', '🥳', '😇',
  '🤓', '😋', '🙃', '😌', '🤗', '😏',
  '🚀', '💡', '⚡', '🔥', '💎', '🎯',
  '🌟', '🎨', '🎵', '📚', '💻', '🏆'
]

export default function EmojiPicker({ value, onChange, placeholder = "😊" }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleEmojiSelect = (emoji: string) => {
    onChange(emoji)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-enostics-gray-800/50 border border-enostics-gray-600 rounded-md text-white hover:border-enostics-purple focus:border-enostics-purple focus:ring-enostics-purple/20 focus:ring-2 focus:outline-none transition-colors"
      >
        <span className="text-lg">
          {value || placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-enostics-gray-400 transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-enostics-gray-800 border border-enostics-gray-600 rounded-lg shadow-lg p-3">
            <div className="grid grid-cols-6 gap-2">
              {EMOJIS.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleEmojiSelect(emoji)}
                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-enostics-gray-700 rounded transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
            
            {/* Clear button */}
            <div className="mt-3 pt-3 border-t border-enostics-gray-700">
              <button
                type="button"
                onClick={() => handleEmojiSelect('')}
                className="w-full text-xs text-enostics-gray-400 hover:text-white transition-colors"
              >
                Clear emoji
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
} 