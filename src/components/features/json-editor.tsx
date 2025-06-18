'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { AlertCircle, Check, Copy, RotateCcw } from 'lucide-react'

interface JsonEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  readOnly?: boolean
  label?: string
  height?: string
}

export function JsonEditor({ 
  value, 
  onChange, 
  placeholder = '{}',
  error,
  readOnly = false,
  label,
  height = '200px'
}: JsonEditorProps) {
  const [isValid, setIsValid] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    validateJson(value)
  }, [value])

  const validateJson = (jsonString: string) => {
    if (!jsonString.trim()) {
      setIsValid(true)
      return
    }

    try {
      JSON.parse(jsonString)
      setIsValid(true)
    } catch {
      setIsValid(false)
    }
  }

  const formatJson = () => {
    try {
      const parsed = JSON.parse(value)
      const formatted = JSON.stringify(parsed, null, 2)
      onChange(formatted)
    } catch {
      // If invalid JSON, don't format
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const resetToDefault = () => {
    onChange('{\n  "message": "Hello Enostics!",\n  "timestamp": "' + new Date().toISOString() + '",\n  "data": {\n    "value": 123,\n    "type": "test"\n  }\n}')
  }

  const addLineNumbers = (text: string) => {
    return text.split('\n').map((line, index) => ({
      number: index + 1,
      content: line
    }))
  }

  const lines = addLineNumbers(value || placeholder)

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-enostics-gray-400">
              {isValid ? (
                <div className="flex items-center gap-1 text-green-400">
                  <Check className="h-3 w-3" />
                  Valid JSON
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-400">
                  <AlertCircle className="h-3 w-3" />
                  Invalid JSON
                </div>
              )}
            </span>
          </div>
          
          {!readOnly && (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={formatJson}
                disabled={!isValid}
                className="p-1 h-7 text-xs"
                title="Format JSON"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={copyToClipboard}
                className="p-1 h-7 text-xs"
                title="Copy to clipboard"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={resetToDefault}
                className="p-1 h-7 text-xs"
                title="Reset to example"
              >
                Example
              </Button>
            </div>
          )}
        </div>

        <div 
          className={`relative border rounded-lg overflow-hidden ${
            error || !isValid 
              ? 'border-red-500/50' 
              : 'border-enostics-gray-700'
          }`}
        >
          {/* Line numbers */}
          <div className="flex">
            <div className="bg-enostics-gray-900/50 px-2 py-3 border-r border-enostics-gray-700 select-none">
              {lines.map((line) => (
                <div
                  key={line.number}
                  className="text-xs text-enostics-gray-500 leading-5 text-right"
                  style={{ minWidth: '20px' }}
                >
                  {line.number}
                </div>
              ))}
            </div>

            {/* Editor */}
            <div className="flex-1 relative">
              <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                readOnly={readOnly}
                className={`w-full p-3 bg-transparent text-white font-mono text-sm leading-5 resize-none outline-none ${
                  readOnly ? 'cursor-default' : ''
                }`}
                style={{ 
                  height,
                  minHeight: height,
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
                }}
                spellCheck={false}
              />
              
              {/* Syntax highlighting overlay would go here in a more advanced implementation */}
            </div>
          </div>
        </div>

        {(error || !isValid) && (
          <div className="flex items-center gap-2 mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error || 'Invalid JSON syntax'}</span>
          </div>
        )}
      </div>
    </div>
  )
} 