import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { username } = params
    const data = await request.json()
    
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
    
    // Store the incoming data
    const { error: insertError } = await supabase
      .from('enostics_data')
      .insert({
        endpoint_id: user.user_id, // Use user_id as endpoint_id for now
        data: data,
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
    
    return NextResponse.json({
      success: true,
      message: 'Data received successfully',
      timestamp: new Date().toISOString()
    })
    
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