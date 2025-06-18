import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { 
  getUserPlanLimits, 
  getUserUsageStats, 
  checkPermissions,
  canCreateEndpoint,
  canMakeRequest 
} from '@/lib/permissions'

// GET - Get user's permissions and plan information
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const checks = searchParams.get('checks')?.split(',') || []

    // Get plan limits
    const planLimits = await getUserPlanLimits(user.id)
    if (!planLimits) {
      return NextResponse.json({ error: 'Unable to fetch plan limits' }, { status: 500 })
    }

    // Get usage stats
    const usageStats = await getUserUsageStats(user.id)

    // Get specific permission checks if requested
    let permissions = {}
    if (checks.length > 0) {
      permissions = await checkPermissions(user.id, checks)
    }

    // Get basic permission checks
    const canCreate = await canCreateEndpoint(user.id)
    const canRequest = await canMakeRequest(user.id)

    return NextResponse.json({
      plan_limits: planLimits,
      usage_stats: usageStats,
      permissions: {
        can_create_endpoint: canCreate,
        can_make_request: canRequest,
        ...permissions
      }
    })
  } catch (error) {
    console.error('Permissions API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Check specific permissions
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { checks } = await request.json()

    if (!checks || !Array.isArray(checks)) {
      return NextResponse.json({ error: 'checks array is required' }, { status: 400 })
    }

    const permissions = await checkPermissions(user.id, checks)

    return NextResponse.json({ permissions })
  } catch (error) {
    console.error('Permissions Check API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 