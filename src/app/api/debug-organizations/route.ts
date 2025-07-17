import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized', authError: authError?.message }, { status: 401 })
    }

    // Step 1: Check if user exists in organization_members
    const { data: memberCheck, error: memberCheckError } = await supabase
      .from('organization_members')
      .select('*')
      .eq('profile_id', user.id)

    // Step 2: Check organizations table
    const { data: allOrgs, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, plan')
      .limit(3)

    // Step 3: Try the join query
    const { data: joinData, error: joinError } = await supabase
      .from('organization_members')
      .select(`
        role,
        invitation_status,
        organizations!inner (
          id,
          name,
          plan
        )
      `)
      .eq('profile_id', user.id)

    // Step 4: Try with accepted status filter
    const { data: acceptedData, error: acceptedError } = await supabase
      .from('organization_members')
      .select(`
        role,
        invitation_status,
        organizations!inner (
          id,
          name,
          plan
        )
      `)
      .eq('profile_id', user.id)
      .eq('invitation_status', 'accepted')

    return NextResponse.json({
      user_id: user.id,
      user_email: user.email,
      step1_member_records: {
        data: memberCheck,
        error: memberCheckError?.message,
        count: memberCheck?.length || 0
      },
      step2_all_organizations: {
        data: allOrgs,
        error: orgError?.message,
        count: allOrgs?.length || 0
      },
      step3_join_query: {
        data: joinData,
        error: joinError?.message,
        count: joinData?.length || 0
      },
      step4_accepted_only: {
        data: acceptedData,
        error: acceptedError?.message,
        count: acceptedData?.length || 0
      }
    })

  } catch (error) {
    console.error('Debug Organizations API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 