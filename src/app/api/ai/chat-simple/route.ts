import { NextRequest, NextResponse } from 'next/server'

// Model routing configuration
const isOpenAIModel = (model: string) => {
  return model.startsWith('gpt-')
}

const isOllamaModel = (model: string) => {
  return ['tinyllama', 'llama3.2:1b', 'llama3.2:3b', 'qwen2.5:7b'].includes(model)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, model = 'gpt-4o-mini', conversation = [] } = body

    if (!message) {
      return NextResponse.json({
        error: 'Message is required'
      }, { status: 400 })
    }

    console.log('Generating response for:', message, 'using model:', model)

    let response, data

    if (isOpenAIModel(model)) {
      // Handle OpenAI models
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured')
      }

      // Build conversation history for OpenAI
      const messages = [
        {
          role: 'system',
          content: 'You are a helpful AI assistant specialized in processing JSON payloads, filtering data, tagging content, and providing summaries. You can also handle general conversations.'
        },
        ...conversation.slice(-5).map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        {
          role: 'user',
          content: message
        }
      ]

      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 500,
          stream: false
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`)
      }

      data = await response.json()

      return NextResponse.json({
        response: data.choices[0].message.content,
        model: data.model,
        metadata: {
          timestamp: new Date().toISOString(),
          provider: 'openai',
          tokensUsed: data.usage?.total_tokens,
          cost: calculateOpenAICost(model, data.usage?.total_tokens || 0)
        }
      })

    } else if (isOllamaModel(model)) {
      // Handle Ollama local models
      response = await fetch('http://127.0.0.1:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt: message,
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: 200
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
      }

      data = await response.json()

      return NextResponse.json({
        response: data.response,
        model: data.model,
        metadata: {
          timestamp: new Date().toISOString(),
          provider: 'ollama',
          processingTime: data.total_duration ? Math.round(data.total_duration / 1000000) : null
        }
      })

    } else {
      throw new Error(`Unsupported model: ${model}`)
    }

  } catch (error) {
    console.error('Chat error:', error)
    
    return NextResponse.json({
      error: 'Failed to process chat request',
      response: 'Sorry, I encountered an error. Please try again.',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// Simple cost calculation for OpenAI models (approximate)
function calculateOpenAICost(model: string, tokens: number): string {
  const costs = {
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 }, // per 1K tokens
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 }
  }
  
  const modelCost = costs[model as keyof typeof costs]
  if (!modelCost) return '$0.00'
  
  // Rough estimate assuming 50/50 input/output split
  const cost = (tokens / 1000) * ((modelCost.input + modelCost.output) / 2)
  return `$${cost.toFixed(6)}`
} 