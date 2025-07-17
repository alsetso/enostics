import { NextRequest, NextResponse } from 'next/server'
import { functionRegistry } from '../../../../ai/tools/function-calling/function-registry'

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
    const { message, model = 'gpt-4o-mini', conversation = [], enableFunctions = true } = body

    if (!message) {
      return NextResponse.json({
        error: 'Message is required'
      }, { status: 400 })
    }

    console.log('Generating response for:', message, 'using model:', model)

    let response, data

    if (isOpenAIModel(model)) {
      // Handle OpenAI models with function calling
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured')
      }

      // Build conversation history for OpenAI
      const messages = [
        {
          role: 'system',
          content: `You are a helpful AI assistant for Enostics, a universal personal API platform. You can:
- Process and analyze JSON payloads
- Browse websites for real-time information
- Classify and tag data with business context
- Assess security and quality risks
- Query databases for patterns and insights
- Call external APIs for data enrichment

Use the available functions when helpful to provide comprehensive answers. Always explain what you're doing when using functions.`
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

      // Prepare function calling if enabled
      const requestBody: any = {
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      }

      if (enableFunctions) {
        requestBody.functions = functionRegistry.getDefinitions()
        requestBody.function_call = 'auto'
      }

      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`)
      }

      data = await response.json()
      const choice = data.choices[0]

      // Handle function calling
      if (choice.message.function_call) {
        const functionCall = choice.message.function_call
        console.log(`🔧 Function called: ${functionCall.name}`)
        
        try {
          // Execute the function
          const functionArgs = JSON.parse(functionCall.arguments)
          const functionResult = await functionRegistry.execute(functionCall.name, functionArgs)
          
          // Send function result back to OpenAI for final response
          const followUpMessages = [
            ...messages,
            choice.message,
            {
              role: 'function',
              name: functionCall.name,
              content: JSON.stringify(functionResult)
            }
          ]

          const followUpResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
              model,
              messages: followUpMessages,
              temperature: 0.7,
              max_tokens: 1000,
              stream: false
            })
          })

          if (followUpResponse.ok) {
            const followUpData = await followUpResponse.json()
            return NextResponse.json({
              response: followUpData.choices[0].message.content,
              model: followUpData.model,
              metadata: {
                timestamp: new Date().toISOString(),
                provider: 'openai',
                tokensUsed: data.usage?.total_tokens + followUpData.usage?.total_tokens,
                cost: calculateOpenAICost(model, (data.usage?.total_tokens || 0) + (followUpData.usage?.total_tokens || 0)),
                functionCalled: functionCall.name,
                functionResult: functionResult
              }
            })
          }
        } catch (functionError) {
          console.error('Function execution error:', functionError)
          // Return the original response with error info
          return NextResponse.json({
            response: `I tried to use the ${functionCall.name} function but encountered an error: ${functionError instanceof Error ? functionError.message : String(functionError)}. Here's what I can tell you: ${choice.message.content || 'Let me help you with your question.'}`,
            model: data.model,
            metadata: {
              timestamp: new Date().toISOString(),
              provider: 'openai',
              tokensUsed: data.usage?.total_tokens,
              cost: calculateOpenAICost(model, data.usage?.total_tokens || 0),
              functionError: functionError instanceof Error ? functionError.message : String(functionError)
            }
          })
        }
      }

      // Regular response without function calling
      return NextResponse.json({
        response: choice.message.content,
        model: data.model,
        metadata: {
          timestamp: new Date().toISOString(),
          provider: 'openai',
          tokensUsed: data.usage?.total_tokens,
          cost: calculateOpenAICost(model, data.usage?.total_tokens || 0)
        }
      })

    } else if (isOllamaModel(model)) {
      // Handle Ollama local models (no function calling support)
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