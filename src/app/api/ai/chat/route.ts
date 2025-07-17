/**
 * AI Chat Endpoint
 * 
 * Handles chat requests with local AI models
 */

import { NextRequest, NextResponse } from 'next/server'
import { OllamaClient } from '../../../../ai/models/local/ollama-client'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, model = 'llama3.2:3b', conversation = [] } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Initialize Ollama client
    const ollamaClient = new OllamaClient()

    // Skip health check for now and try direct generation
    console.log('Attempting direct generation...')

    // Build context from conversation history
    let conversationContext = ''
    if (conversation.length > 0) {
      conversationContext = conversation
        .slice(-4) // Last 4 messages for context
        .map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n')
    }

    // Create the prompt with context
    const prompt = conversationContext 
      ? `Previous conversation:\n${conversationContext}\n\nUser: ${message}\nAssistant:`
      : `User: ${message}\nAssistant:`

    // Generate response using Ollama
    const response = await ollamaClient.generate({
      model,
      prompt,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        num_predict: 500
      }
    })

    return NextResponse.json({
      response: response.response,
      model: response.model,
      metadata: {
        timestamp: new Date().toISOString(),
        processingTime: response.total_duration ? Math.round(response.total_duration / 1000000) : null,
        tokenCount: response.eval_count || null
      }
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return chat history or status
    return NextResponse.json({
      status: 'Chat API is running',
      user_id: user.id,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 