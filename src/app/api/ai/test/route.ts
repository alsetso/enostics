/**
 * AI Test Endpoint
 * 
 * Test the AI framework with sample data
 */

import { NextRequest, NextResponse } from 'next/server'
import { initializeAI, processEndpointData, getAIHealthStatus } from '../../../../ai'

export async function GET() {
  try {
    // Test AI health
    const healthStatus = await getAIHealthStatus()
    
    return NextResponse.json({
      status: 'success',
      message: 'AI Framework Test Endpoint',
      health: healthStatus,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'AI framework not initialized',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Initialize AI if not already done
    try {
      await initializeAI('development')
    } catch (error) {
      // AI might already be initialized
      console.log('AI already initialized or initialization failed:', error)
    }
    
    // Process the data through AI
    const result = await processEndpointData(body.data || body, body.context)
    
    return NextResponse.json({
      status: 'success',
      message: 'AI processing completed',
      input: body,
      result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('AI test error:', error)
    
    return NextResponse.json({
      status: 'error',
      message: 'AI processing failed',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 