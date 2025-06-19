import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { enhancedRateLimitMiddleware } from '@/middleware/enhanced-rate-limit'

export async function POST(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { username } = params
    
    // Get user by username/email
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('full_name', username)
      .single()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get user's endpoint
    const { data: endpoint, error: endpointError } = await supabase
      .from('enostics_endpoints')
      .select('id')
      .eq('user_id', user.user_id)
      .eq('is_active', true)
      .single()

    if (endpointError || !endpoint) {
      return NextResponse.json(
        { error: 'Active endpoint not found' },
        { status: 404 }
      )
    }

    // Apply enhanced rate limiting
    const rateLimitResult = await enhancedRateLimitMiddleware(
      request,
      user.user_id,
      endpoint.id
    )

    if (!rateLimitResult.success) {
      return rateLimitResult.response
    }
    
    const data = await request.json()
    
    // Store the incoming data
    const { error: insertError } = await supabase
      .from('enostics_data')
      .insert({
        endpoint_id: endpoint.id,
        user_id: user.user_id,
        payload: data,
        source_ip: request.ip || null,
        headers: Object.fromEntries(request.headers.entries()),
        status: 'received'
      })
    
    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to store data' },
        { status: 500 }
      )
    }
    
    // Create response with usage headers
    const response = NextResponse.json({
      success: true,
      message: 'Data received successfully',
      timestamp: new Date().toISOString(),
      endpoint_id: endpoint.id
    })

    // Add usage headers if available
    if (rateLimitResult.headers) {
      Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
    }

    return response
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  return NextResponse.json({
    message: `This is ${params.username}'s personal data endpoint`,
    usage: 'Send POST requests with JSON data to this endpoint',
    endpoint: `enostics.com/api/${params.username}`
  })
} 