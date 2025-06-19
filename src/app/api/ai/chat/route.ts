/**
 * AI Chat Endpoint
 * 
 * Handles chat requests with local AI models
 */

import { NextRequest, NextResponse } from 'next/server'
import { OllamaClient } from '../../../../ai/models/local/ollama-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, model = 'llama3.2:3b', conversation = [] } = body

    if (!message) {
      return NextResponse.json({
        error: 'Message is required'
      }, { status: 400 })
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
    
    return NextResponse.json({
      error: 'Failed to process chat request',
      response: 'I encountered an error while processing your message. Please try again.',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 