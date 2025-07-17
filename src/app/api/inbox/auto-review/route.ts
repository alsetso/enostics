import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { inboxReviewerAgent } from '../../../../ai/agents/internal/inbox-reviewer'

/**
 * Auto-review endpoint for inbox payloads
 * This runs automatically when new data is received
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { data_id, payload, metadata = {} } = body

    if (!payload) {
      return NextResponse.json({ error: 'Payload is required' }, { status: 400 })
    }

    console.log(`🔍 Auto-reviewing payload for data_id: ${data_id}`)

    // Run the inbox reviewer agent
    const reviewResult = await inboxReviewerAgent.reviewPayload(payload, {
      ...metadata,
      user_id: user.id,
      data_id
    })

    // Store the review result in the database
    if (data_id) {
      const { error: updateError } = await supabase
        .from('data')
        .update({
          ai_analysis: reviewResult.analysis,
          ai_enrichments: reviewResult.enriched_data,
          ai_actions: reviewResult.actions_taken,
          ai_reviewed_at: new Date().toISOString()
        })
        .eq('id', data_id)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating data with AI analysis:', updateError)
      } else {
        console.log(`✅ Stored AI analysis for data_id: ${data_id}`)
      }
    }

    return NextResponse.json({
      success: true,
      review_id: reviewResult.id,
      analysis: reviewResult.analysis,
      actions_taken: reviewResult.actions_taken,
      confidence: reviewResult.analysis.confidence,
      timestamp: reviewResult.timestamp
    })

  } catch (error) {
    console.error('Auto-review error:', error)
    return NextResponse.json({
      error: 'Failed to auto-review payload',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

/**
 * Get auto-review status and configuration
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get agent status
    const agentStatus = inboxReviewerAgent.getStatus()

    // Get recent review statistics
    const { data: recentData, error: dataError } = await supabase
      .from('data')
      .select('ai_analysis, ai_reviewed_at, processed_at')
      .eq('user_id', user.id)
      .not('ai_analysis', 'is', null)
      .order('processed_at', { ascending: false })
      .limit(100)

    if (dataError) {
      console.error('Error fetching review stats:', dataError)
    }

    const reviewStats = {
      total_reviewed: recentData?.length || 0,
      last_24h: recentData?.filter(d => {
        const reviewTime = new Date(d.ai_reviewed_at)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        return reviewTime > oneDayAgo
      }).length || 0,
      classifications: {} as Record<string, number>,
      risk_levels: { low: 0, medium: 0, high: 0 }
    }

    // Analyze classification and risk distribution
    recentData?.forEach(d => {
      if (d.ai_analysis?.classification?.classifications) {
        d.ai_analysis.classification.classifications.forEach((c: any) => {
          reviewStats.classifications[c.type] = (reviewStats.classifications[c.type] || 0) + 1
        })
      }
      if (d.ai_analysis?.risk_assessment?.overall_risk) {
        const risk = d.ai_analysis.risk_assessment.overall_risk
        if (risk in reviewStats.risk_levels) {
          reviewStats.risk_levels[risk as keyof typeof reviewStats.risk_levels]++
        }
      }
    })

    return NextResponse.json({
      agent_status: agentStatus,
      review_stats: reviewStats,
      capabilities: [
        'Automatic data classification',
        'Security risk assessment',
        'Business context detection',
        'Data quality analysis',
        'External data enrichment',
        'Automated action execution'
      ]
    })

  } catch (error) {
    console.error('Auto-review status error:', error)
    return NextResponse.json({
      error: 'Failed to get auto-review status',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 