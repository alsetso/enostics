'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, Settings, Zap, Brain, Bolt, Sparkles, Copy, Check, Cloud, Eye, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  model?: string
}

interface ModelOption {
  id: string
  name: string
  description: string
  size: string
  speed: 'ultra-fast' | 'fast' | 'medium' | 'slow'
  capabilities: string[]
  icon: any
}

const availableModels: ModelOption[] = [
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'OpenAI\'s most efficient model for JSON processing and analysis',
    size: 'Cloud',
    speed: 'ultra-fast',
    capabilities: ['json-filtering', 'data-tagging', 'summarization', 'structured-output'],
    icon: Sparkles
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and cost-effective for payload review and classification',
    size: 'Cloud',
    speed: 'fast',
    capabilities: ['payload-review', 'classification', 'filtering', 'batch-processing'],
    icon: Zap
  },
  {
    id: 'tinyllama',
    name: 'TinyLlama',
    description: 'Ultra-lightweight model for instant responses',
    size: '637MB',
    speed: 'ultra-fast',
    capabilities: ['quick-chat', 'basic-tasks', 'fast-response'],
    icon: Bolt
  },
  {
    id: 'llama3.2:1b',
    name: 'Llama 3.2 1B',
    description: 'Small but capable model for general tasks',
    size: '1.3GB',
    speed: 'fast',
    capabilities: ['chat', 'analysis', 'summarization'],
    icon: Zap
  },
  {
    id: 'llama3.2:3b',
    name: 'Llama 3.2 3B',
    description: 'Balanced model for complex conversations',
    size: '2.0GB',
    speed: 'medium',
    capabilities: ['advanced-chat', 'reasoning', 'analysis'],
    icon: Brain
  },
  {
    id: 'qwen2.5:7b',
    name: 'Qwen 2.5 7B',
    description: 'Advanced reasoning and complex analysis',
    size: '4.7GB',
    speed: 'slow',
    capabilities: ['advanced-reasoning', 'complex-analysis', 'insights'],
    icon: Brain
  }
]

// Fallback response generator for when AI is not available
const generateFallbackResponse = (input: string): string => {
  const lowerInput = input.toLowerCase()
  
  if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
    return "Hello! I'm currently running in fallback mode. The AI models are not available right now, but I can still help with basic responses. Please check that Ollama is running and try again later."
  }
  
  if (lowerInput.includes('help') || lowerInput.includes('what can you do')) {
    return "I'm an AI assistant that can help with various tasks like analysis, classification, and conversation. Currently, I'm running in fallback mode because the local AI models aren't available. Please ensure Ollama is running with models like TinyLlama or Llama 3.2."
  }
  
  if (lowerInput.includes('error') || lowerInput.includes('not working')) {
    return "It looks like there's an issue with the AI backend. Here are some troubleshooting steps:\n\n1. Check if Ollama is running: `brew services list | grep ollama`\n2. Restart Ollama: `brew services restart ollama`\n3. Verify models are available: `ollama list`\n4. Test Ollama directly: `ollama run tinyllama`"
  }
  
  return `I received your message: "${input}". I'm currently in fallback mode because the AI models aren't available. This is a basic response system. To get full AI capabilities, please ensure Ollama is running with the required models.`
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant powered by both local and cloud models. I can help you filter, review, tag, and summarize JSON payloads, as well as handle general conversations. How can I help you today?',
      timestamp: new Date(),
      model: 'gpt-4o-mini'
    }
  ])
  const [input, setInput] = useState('')
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini')
  const [isLoading, setIsLoading] = useState(false)
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [modelSelectorView, setModelSelectorView] = useState<'main' | 'cloud' | 'local'>('main')
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000) // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Call our AI chat endpoint
      const response = await fetch('/api/ai/chat-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          model: selectedModel,
          conversation: messages.slice(-5) // Send last 5 messages for context
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Sorry, I encountered an error processing your request.',
        timestamp: new Date(),
        model: selectedModel
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      
      // Provide a helpful fallback response
      const fallbackResponse = generateFallbackResponse(userMessage.content)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallbackResponse,
        timestamp: new Date(),
        model: 'fallback'
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const selectedModelInfo = availableModels.find(m => m.id === selectedModel)
  const ModelIcon = selectedModelInfo?.icon || Brain

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case 'ultra-fast': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'fast': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'slow': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[hsl(var(--secondary-bg))] relative">
      {/* Chat Messages Container - Responsive and Centered */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 pb-32 sm:pb-40">
        <div className="w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Top spacer to push first message down */}
          <div className="h-[50px]"></div>
          
          {messages.map((message) => (
            <div key={message.id} className="group">
              <div className={`flex items-start space-x-2 sm:space-x-4 ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                {/* Avatar - Responsive sizing */}
                <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg' 
                    : 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg'
                }`}>
                  {message.role === 'user' ? (
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </div>
                
                {/* Message Content - Responsive */}
                <div className="flex-1 min-w-0 max-w-[85%] sm:max-w-none">
                  <div className={`prose prose-sm max-w-none ${
                    message.role === 'user' ? 'text-right' : ''
                  }`}>
                    <div className={`inline-block p-3 sm:p-4 rounded-xl sm:rounded-2xl backdrop-blur-sm text-sm sm:text-base ${
                  message.role === 'user'
                        ? 'bg-[hsl(var(--primary-bg))]/60 border border-[hsl(var(--border-color))]/30 text-[hsl(var(--text-primary))] shadow-sm'
                        : 'text-[hsl(var(--text-primary))]'
                    }`}>
                      <p className="whitespace-pre-wrap m-0 leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                  
                  {/* Message Metadata with Copy Button - Responsive */}
                  <div className={`flex items-center space-x-1 sm:space-x-2 mt-1 sm:mt-2 text-xs text-[hsl(var(--text-muted))] ${
                    message.role === 'user' ? 'justify-end' : ''
                  }`}>
                    <span className="text-xs">{message.timestamp.toLocaleTimeString()}</span>
                  {message.model && message.role === 'assistant' && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span className={`text-xs hidden sm:inline ${message.model === 'fallback' ? 'text-orange-500' : 'text-[hsl(var(--text-secondary))]'}`}>
                          {availableModels.find(m => m.id === message.model)?.name || message.model}
                    </span>
                        {message.model?.startsWith('gpt-') && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <span className="text-xs hidden sm:inline text-blue-500">Cloud</span>
                          </>
                        )}
                      </>
                    )}
                    <span>•</span>
                    <button
                      onClick={() => copyToClipboard(message.content, message.id)}
                      className="flex items-center space-x-1 text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-secondary))] transition-colors duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Copy message"
                    >
                      {copiedMessageId === message.id ? (
                        <>
                          <Check className="h-3 w-3 text-green-500" />
                          <span className="text-green-500 hidden sm:inline">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span className="hidden sm:inline">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="group">
              <div className="flex items-start space-x-2 sm:space-x-4">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg">
                  <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="flex-1">
                  <div className="bg-[hsl(var(--primary-bg))]/60 border border-[hsl(var(--border-color))]/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 backdrop-blur-sm shadow-sm">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-[hsl(var(--text-muted))]" />
                      <span className="text-xs sm:text-sm text-[hsl(var(--text-secondary))]">Thinking...</span>
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-[hsl(var(--text-muted))] rounded-full animate-pulse"></div>
                        <div className="w-1 h-1 bg-[hsl(var(--text-muted))] rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-1 h-1 bg-[hsl(var(--text-muted))] rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      </div>
                    </div>
              </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Centered Input Area - Aligned with Messages */}
      <div className="fixed bottom-3 sm:bottom-6 px-3 sm:px-6 left-0 lg:left-64 right-0 z-30">
        <div className="w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto">
          <div className="bg-[hsl(var(--primary-bg))]/80 backdrop-blur-xl border border-[hsl(var(--border-color))]/50 rounded-xl sm:rounded-2xl shadow-2xl p-3 sm:p-4 relative">
          
          {/* Model Selector Dropdown - Positioned as popup */}
          {showModelSelector && (
            <div className="absolute bottom-full right-0 mb-2 w-80 sm:w-96 bg-[hsl(var(--primary-bg))]/95 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border border-[hsl(var(--border-color))]/50 overflow-hidden max-h-80 overflow-y-auto">
              <div className="p-2 sm:p-3">
                {/* Main View - Cloud vs Local Selection */}
                {modelSelectorView === 'main' && (
                  <>
                    <h3 className="text-xs sm:text-sm font-semibold text-[hsl(var(--text-primary))] px-2 sm:px-3 py-2 border-b border-[hsl(var(--border-color))]/30 mb-3">
                      Select AI Provider
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Cloud Option */}
                      <button
                        onClick={() => setModelSelectorView('cloud')}
                        className="flex flex-col items-center space-y-3 p-4 rounded-lg hover:bg-[hsl(var(--hover-bg))]/60 transition-all duration-200 border border-[hsl(var(--border-color))]/30 hover:border-blue-500/50 group"
                      >
                        <div className="p-3 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-200">
                          <Cloud className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="text-center">
                          <h4 className="text-sm font-medium text-[hsl(var(--text-primary))] mb-1">Cloud Use</h4>
                          <p className="text-xs text-[hsl(var(--text-secondary))]">OpenAI Models</p>
                        </div>
                      </button>

                      {/* Local Option */}
                      <button
                        onClick={() => setModelSelectorView('local')}
                        className="flex flex-col items-center space-y-3 p-4 rounded-lg hover:bg-[hsl(var(--hover-bg))]/60 transition-all duration-200 border border-[hsl(var(--border-color))]/30 hover:border-green-500/50 group"
                      >
                        <div className="p-3 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-all duration-200">
                          <Eye className="h-6 w-6 text-green-500" />
                        </div>
                        <div className="text-center">
                          <h4 className="text-sm font-medium text-[hsl(var(--text-primary))] mb-1">Local Use</h4>
                          <p className="text-xs text-[hsl(var(--text-secondary))]">Ollama Models</p>
                        </div>
                      </button>
                    </div>
                  </>
                )}

                {/* Cloud Models View */}
                {modelSelectorView === 'cloud' && (
                  <>
                    <div className="flex items-center space-x-2 px-2 sm:px-3 py-2 border-b border-[hsl(var(--border-color))]/30 mb-2">
                      <button
                        onClick={() => setModelSelectorView('main')}
                        className="p-1 hover:bg-[hsl(var(--hover-bg))]/60 rounded-md transition-colors duration-200"
                      >
                        <ArrowLeft className="h-4 w-4 text-[hsl(var(--text-muted))]" />
                      </button>
                      <h3 className="text-xs sm:text-sm font-semibold text-[hsl(var(--text-primary))] flex items-center space-x-2">
                        <Cloud className="h-4 w-4 text-blue-500" />
                        <span>Cloud Models</span>
                      </h3>
                    </div>
                    <div className="space-y-1">
                      {availableModels.filter(model => model.id.startsWith('gpt-')).map((model) => {
                        const Icon = model.icon
                        const isSelected = selectedModel === model.id
                        return (
                          <button
                            key={model.id}
                            onClick={() => {
                              setSelectedModel(model.id)
                              setShowModelSelector(false)
                              setModelSelectorView('main')
                            }}
                            className={`w-full flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-[hsl(var(--hover-bg))]/60 transition-all duration-200 group ${
                              isSelected ? 'bg-blue-500/10 ring-1 ring-blue-500/30 border border-blue-500/20' : 'border border-transparent'
                            }`}
                          >
                            <div className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg ${isSelected ? 'bg-blue-500/20' : 'bg-[hsl(var(--hover-bg))]/40'}`}>
                              <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${isSelected ? 'text-blue-500' : 'text-[hsl(var(--text-secondary))]'}`} />
                            </div>
                            <div className="flex-1 text-left min-w-0">
                              <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                                <span className={`font-medium text-xs sm:text-sm truncate ${isSelected ? 'text-blue-500' : 'text-[hsl(var(--text-primary))]'}`}>
                                  {model.name}
                                </span>
                                <Badge className={`text-xs ${getSpeedColor(model.speed)} shrink-0`}>
                                  {model.speed}
                                </Badge>
                                <span className="text-xs text-blue-500 shrink-0 hidden sm:inline">{model.size}</span>
                              </div>
                              <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))] mb-1 sm:mb-2 line-clamp-2">{model.description}</p>
                              <div className="flex flex-wrap gap-1 overflow-hidden">
                                {model.capabilities.slice(0, 2).map((cap) => (
                                  <span 
                                    key={cap} 
                                    className="text-xs text-[hsl(var(--text-muted))] bg-[hsl(var(--hover-bg))]/40 px-1.5 sm:px-2 py-0.5 rounded-md truncate"
                                  >
                                    {cap}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}

                {/* Local Models View */}
                {modelSelectorView === 'local' && (
                  <>
                    <div className="flex items-center space-x-2 px-2 sm:px-3 py-2 border-b border-[hsl(var(--border-color))]/30 mb-2">
                      <button
                        onClick={() => setModelSelectorView('main')}
                        className="p-1 hover:bg-[hsl(var(--hover-bg))]/60 rounded-md transition-colors duration-200"
                      >
                        <ArrowLeft className="h-4 w-4 text-[hsl(var(--text-muted))]" />
                      </button>
                      <h3 className="text-xs sm:text-sm font-semibold text-[hsl(var(--text-primary))] flex items-center space-x-2">
                        <Eye className="h-4 w-4 text-green-500" />
                        <span>Local Models</span>
                      </h3>
                    </div>
                    <div className="space-y-1">
                      {availableModels.filter(model => !model.id.startsWith('gpt-')).map((model) => {
                        const Icon = model.icon
                        const isSelected = selectedModel === model.id
                        return (
                          <button
                            key={model.id}
                            onClick={() => {
                              setSelectedModel(model.id)
                              setShowModelSelector(false)
                              setModelSelectorView('main')
                            }}
                            className={`w-full flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-[hsl(var(--hover-bg))]/60 transition-all duration-200 group ${
                              isSelected ? 'bg-green-500/10 ring-1 ring-green-500/30 border border-green-500/20' : 'border border-transparent'
                            }`}
                          >
                            <div className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg ${isSelected ? 'bg-green-500/20' : 'bg-[hsl(var(--hover-bg))]/40'}`}>
                              <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${isSelected ? 'text-green-500' : 'text-[hsl(var(--text-secondary))]'}`} />
                            </div>
                            <div className="flex-1 text-left min-w-0">
                              <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                                <span className={`font-medium text-xs sm:text-sm truncate ${isSelected ? 'text-green-500' : 'text-[hsl(var(--text-primary))]'}`}>
                                  {model.name}
                                </span>
                                <Badge className={`text-xs ${getSpeedColor(model.speed)} shrink-0`}>
                                  {model.speed}
                                </Badge>
                                <span className="text-xs text-[hsl(var(--text-muted))] shrink-0 hidden sm:inline">{model.size}</span>
                              </div>
                              <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))] mb-1 sm:mb-2 line-clamp-2">{model.description}</p>
                              <div className="flex flex-wrap gap-1 overflow-hidden">
                                {model.capabilities.slice(0, 2).map((cap) => (
                                  <span 
                                    key={cap} 
                                    className="text-xs text-[hsl(var(--text-muted))] bg-[hsl(var(--hover-bg))]/40 px-1.5 sm:px-2 py-0.5 rounded-md truncate"
                                  >
                                    {cap}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Model Info Bar */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[hsl(var(--border-color))]/20">
            <div className="flex items-center space-x-2">
              <ModelIcon className="h-4 w-4 text-[hsl(var(--text-secondary))]" />
              <span className="text-sm font-medium text-[hsl(var(--text-primary))]">
                {selectedModelInfo?.name}
              </span>
              <Badge className={`text-xs ${getSpeedColor(selectedModelInfo?.speed || 'medium')}`}>
                {selectedModelInfo?.speed}
              </Badge>
            </div>
            <button
              onClick={() => {
                setShowModelSelector(!showModelSelector)
                setModelSelectorView('main')
              }}
              className="p-2 hover:bg-[hsl(var(--hover-bg))]/60 rounded-lg transition-colors duration-200"
              title="Change AI Model"
            >
              <Settings className="h-4 w-4 text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-secondary))]" />
            </button>
          </div>

        {/* Input Area */}
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                placeholder="Message AI..."
              disabled={isLoading}
                rows={1}
                className="w-full resize-none border-0 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 bg-[hsl(var(--secondary-bg))]/60 text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-[hsl(var(--secondary-bg))]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 backdrop-blur-sm text-sm sm:text-base"
                style={{
                  minHeight: '40px',
                  maxHeight: '100px',
                }}
              />
              <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
                className="absolute right-1.5 sm:right-2 bottom-1.5 sm:bottom-2 p-2 sm:p-2.5 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg sm:rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-sm group"
            >
              {isLoading ? (
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
              ) : (
                  <Send className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
              )}
              </button>
            </div>
          </div>
          
          {/* Input Footer - Responsive */}
          <div className="flex items-center justify-between mt-2 sm:mt-3 px-1">
            <div className="flex items-center space-x-2 text-xs text-[hsl(var(--text-muted))]">
              <span className="hidden sm:inline">Press Enter to send, Shift+Enter for new line</span>
              <span className="sm:hidden">Enter to send</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <span className="text-xs text-[hsl(var(--text-secondary))] hidden sm:inline">AI Model Active</span>
              <span className="text-xs text-[hsl(var(--text-secondary))] sm:hidden">AI Active</span>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 