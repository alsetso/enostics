import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const recordId = searchParams.get('record_id')
    const limit = parseInt(searchParams.get('limit') || '5')

    if (!recordId) {
      return NextResponse.json({ error: 'record_id is required' }, { status: 400 })
    }

    // First, get the target record
    const { data: targetRecord, error: targetError } = await supabase
      .from('enostics_data')
      .select('*')
      .eq('id', recordId)
      .eq('user_id', user.id)
      .single()

    if (targetError || !targetRecord) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 })
    }

    // Find related records based on multiple criteria
    const { data: allRecords, error: allError } = await supabase
      .from('enostics_data')
      .select('id, processed_at, data_quality_score, business_context, sender_info, key_fields, auto_tags')
      .eq('user_id', user.id)
      .neq('id', recordId)
      .order('processed_at', { ascending: false })
      .limit(50) // Get more records to calculate similarity

    if (allError) {
      console.error('Error fetching records for similarity:', allError)
      return NextResponse.json({ error: 'Failed to fetch related records' }, { status: 500 })
    }

    // Calculate similarity scores
    const relatedRecords = allRecords
      .map(record => ({
        ...record,
        similarity_score: calculateSimilarity(targetRecord, record)
      }))
      .filter(record => record.similarity_score > 20) // Only include records with > 20% similarity
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, limit)

    return NextResponse.json({
      related_records: relatedRecords,
      target_record: {
        id: targetRecord.id,
        business_context: targetRecord.business_context,
        sender_name: targetRecord.sender_info?.explicit_name
      }
    })

  } catch (error) {
    console.error('Error in relationships API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function calculateSimilarity(record1: any, record2: any): number {
  let score = 0
  let factors = 0

  // Business context similarity (40% weight)
  if (record1.business_context && record2.business_context) {
    factors++
    if (record1.business_context === record2.business_context) {
      score += 40
    }
  }

  // Sender similarity (30% weight)
  if (record1.sender_info?.explicit_name && record2.sender_info?.explicit_name) {
    factors++
    if (record1.sender_info.explicit_name === record2.sender_info.explicit_name) {
      score += 30
    } else if (record1.sender_info.explicit_name.toLowerCase().includes(
      record2.sender_info.explicit_name.toLowerCase()
    ) || record2.sender_info.explicit_name.toLowerCase().includes(
      record1.sender_info.explicit_name.toLowerCase()
    )) {
      score += 15 // Partial match
    }
  }

  // Quality score similarity (20% weight)
  if (record1.data_quality_score && record2.data_quality_score) {
    factors++
    const qualityDiff = Math.abs(record1.data_quality_score - record2.data_quality_score)
    if (qualityDiff <= 10) {
      score += 20
    } else if (qualityDiff <= 20) {
      score += 10
    }
  }

  // Auto-tags similarity (10% weight)
  if (record1.auto_tags && record2.auto_tags && 
      Array.isArray(record1.auto_tags) && Array.isArray(record2.auto_tags)) {
    factors++
    const commonTags = record1.auto_tags.filter((tag: string) => 
      record2.auto_tags.includes(tag)
    )
    if (commonTags.length > 0) {
      const tagSimilarity = (commonTags.length / Math.max(record1.auto_tags.length, record2.auto_tags.length)) * 10
      score += tagSimilarity
    }
  }

  // Return average score if we have factors, otherwise 0
  return factors > 0 ? Math.round(score / factors) : 0
} 