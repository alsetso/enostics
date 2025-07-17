import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// Simple test endpoint to verify organization data structure
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Test basic organization_members query
    const { data: memberData, error: memberError } = await supabase
      .from('organization_members')
      .select('*')
      .eq('profile_id', user.id)
      .limit(5)

    // Test organizations table
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .limit(5)

    return NextResponse.json({
      user_id: user.id,
      member_records: memberData || [],
      member_error: memberError?.message,
      organization_records: orgData || [],
      organization_error: orgError?.message,
      tables_exist: {
        organization_members: !memberError,
        organizations: !orgError
      }
    })

  } catch (error) {
    console.error('Test Organizations API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 