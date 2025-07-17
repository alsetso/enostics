/**
 * AI Test Endpoint
 * 
 * Test the AI framework with sample data
 */

import { NextRequest, NextResponse } from 'next/server'
import { initializeAI, processEndpointData, getAIHealthStatus } from '../../../../ai'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'AI Test API is running',
    timestamp: new Date().toISOString(),
    message: 'Test endpoint for AI functionality'
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    return NextResponse.json({
      status: 'success',
      echo: body,
      timestamp: new Date().toISOString(),
      message: 'Test endpoint received your data'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }
} 